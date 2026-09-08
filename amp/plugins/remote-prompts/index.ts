import type { PluginAPI, PluginCommandContext } from '@ampcode/plugin'

export const description = 'Adds command-palette actions for Markdown prompts maintained in niwoerner/agent-stuff.'

const OWNER = 'niwoerner'
const REPOSITORY = 'agent-stuff'
const REF = 'main'
const PROMPTS_DIRECTORY = 'prompts'
const API_ORIGIN = 'https://api.github.com'
const RAW_ORIGIN = 'https://raw.githubusercontent.com'
const MAX_LISTING_BYTES = 512 * 1024
const MAX_TOTAL_LISTING_BYTES = 2 * 1024 * 1024
const MAX_PROMPT_BYTES = 256 * 1024
const MAX_PROMPTS = 200
const MAX_DIRECTORIES = 100

export interface PromptFile {
	path: string
	id: string
	title: string
}

type GitHubEntry = {
	type: string
	name: string
	path: string
	url: string
	download_url: string | null
	size: number
}

function validatePromptPath(path: string): void {
	if (
		!path.startsWith(`${PROMPTS_DIRECTORY}/`) ||
		path.includes('\\') ||
		path.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')
	) {
		throw new Error(`GitHub returned an unsafe prompt path: ${path}`)
	}
}

function encodedPath(path: string): string {
	return path.split('/').map(encodeURIComponent).join('/')
}

function contentsURL(path: string): URL {
	return new URL(
		`/repos/${OWNER}/${REPOSITORY}/contents/${encodedPath(path)}?ref=${REF}`,
		API_ORIGIN,
	)
}

function rawURL(path: string): URL {
	validatePromptPath(path)
	return new URL(`/${OWNER}/${REPOSITORY}/${REF}/${encodedPath(path)}`, RAW_ORIGIN)
}

function validateRemoteURL(value: string, expected: URL, label: string): void {
	let actual: URL
	try {
		actual = new URL(value)
	} catch {
		throw new Error(`GitHub returned a malformed ${label} URL`)
	}
	if (actual.protocol !== 'https:' || actual.href !== expected.href) {
		throw new Error(`GitHub returned an unexpected ${label} URL`)
	}
}

async function fetchBytes(url: URL, maximumBytes: number): Promise<{ bytes: Uint8Array; response: Response }> {
	if (
		url.protocol !== 'https:' ||
		(url.hostname !== 'api.github.com' && url.hostname !== 'raw.githubusercontent.com')
	) {
		throw new Error('Refusing to fetch an unexpected host')
	}

	const response = await fetch(url, {
		headers: {
			Accept: url.hostname === 'api.github.com' ? 'application/vnd.github+json' : 'text/plain',
			'X-GitHub-Api-Version': '2022-11-28',
		},
		redirect: 'follow',
	})
	if (!response.ok) {
		throw new Error(`GitHub request failed (${response.status})`)
	}
	validateRemoteURL(response.url, url, 'response')

	const declaredLength = response.headers.get('content-length')
	if (declaredLength !== null) {
		const length = Number(declaredLength)
		if (!Number.isSafeInteger(length) || length < 0 || length > maximumBytes) {
			throw new Error('GitHub response is too large')
		}
	}

	const bytes = new Uint8Array(await response.arrayBuffer())
	if (bytes.byteLength > maximumBytes) {
		throw new Error('GitHub response is too large')
	}
	return { bytes, response }
}

function parseListing(bytes: Uint8Array): GitHubEntry[] {
	let value: unknown
	try {
		value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))
	} catch {
		throw new Error('GitHub returned malformed listing data')
	}
	if (!Array.isArray(value)) {
		throw new Error('GitHub returned malformed listing data')
	}

	return value.map((item) => {
		if (
			typeof item !== 'object' || item === null ||
			!('type' in item) || typeof item.type !== 'string' ||
			!('name' in item) || typeof item.name !== 'string' ||
			!('path' in item) || typeof item.path !== 'string' ||
			!('url' in item) || typeof item.url !== 'string' ||
			!('download_url' in item) || (typeof item.download_url !== 'string' && item.download_url !== null) ||
			!('size' in item) || !Number.isSafeInteger(item.size) || (item.size as number) < 0
		) {
			throw new Error('GitHub returned malformed listing data')
		}
		return item as GitHubEntry
	})
}

function commandID(path: string): string {
	return `prompt-${path.slice(`${PROMPTS_DIRECTORY}/`.length, -3).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export async function discoverPrompts(): Promise<PromptFile[]> {
	const directories = [PROMPTS_DIRECTORY]
	const prompts: PromptFile[] = []
	const paths = new Set<string>()
	const ids = new Set<string>()
	let totalListingBytes = 0

	while (directories.length > 0) {
		if (directories.length + prompts.length > MAX_DIRECTORIES + MAX_PROMPTS) {
			throw new Error('GitHub prompt listing contains too many entries')
		}
		const directory = directories.shift()!
		const url = contentsURL(directory)
		const { bytes } = await fetchBytes(url, MAX_LISTING_BYTES)
		totalListingBytes += bytes.byteLength
		if (totalListingBytes > MAX_TOTAL_LISTING_BYTES) {
			throw new Error('GitHub prompt listings are too large')
		}

		const entries = parseListing(bytes).sort((a, b) => a.path.localeCompare(b.path, 'en'))
		for (const entry of entries) {
			validatePromptPath(entry.path)
			const segments = entry.path.split('/')
			if (segments.slice(0, -1).join('/') !== directory || segments.at(-1) !== entry.name) {
				throw new Error('GitHub returned an entry outside the requested directory')
			}
			validateRemoteURL(entry.url, contentsURL(entry.path), 'API')
			if (entry.type === 'dir') {
				if (entry.download_url !== null || entry.size !== 0) {
					throw new Error('GitHub returned malformed directory data')
				}
				directories.push(entry.path)
				if (directories.length > MAX_DIRECTORIES) {
					throw new Error('GitHub prompt listing contains too many directories')
				}
				continue
			}
			if (entry.type !== 'file' || !entry.name.toLowerCase().endsWith('.md')) {
				continue
			}
			if (entry.size > MAX_PROMPT_BYTES || entry.download_url === null) {
				throw new Error(`Prompt is missing or too large: ${entry.path}`)
			}
			validateRemoteURL(entry.download_url, rawURL(entry.path), 'raw')

			const id = commandID(entry.path)
			if (paths.has(entry.path) || ids.has(id)) {
				throw new Error(`Duplicate prompt path or command ID: ${entry.path}`)
			}
			paths.add(entry.path)
			ids.add(id)
			prompts.push({
				path: entry.path,
				id,
				title: entry.path.slice(`${PROMPTS_DIRECTORY}/`.length, -3),
			})
			if (prompts.length > MAX_PROMPTS) {
				throw new Error('GitHub prompt listing contains too many prompts')
			}
		}
		directories.sort((a, b) => a.localeCompare(b, 'en'))
	}

	return prompts.sort((a, b) => a.path.localeCompare(b.path, 'en'))
}

export async function fetchPrompt(path: string): Promise<string> {
	if (!path.toLowerCase().endsWith('.md')) {
		throw new Error('Refusing to fetch a non-Markdown prompt')
	}
	const { bytes } = await fetchBytes(rawURL(path), MAX_PROMPT_BYTES)
	let prompt: string
	try {
		prompt = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
	} catch {
		throw new Error('Prompt is not valid UTF-8')
	}
	if (prompt.trim().length === 0) {
		throw new Error('Prompt is empty')
	}
	return prompt
}

export function assemblePrompt(prompt: string, context: string): string {
	const trimmedContext = context.trim()
	return trimmedContext.length === 0
		? prompt
		: `${prompt}\n\n---\n\nUser context:\n${trimmedContext}`
}

async function invokePrompt(prompt: PromptFile, ctx: PluginCommandContext): Promise<void> {
	if (!ctx.thread) {
		await ctx.ui.notify('Open a thread before invoking a prompt.')
		return
	}

	try {
		const body = await fetchPrompt(prompt.path)
		const context = await ctx.ui.input({
			title: `Run prompt: ${prompt.title}`,
			helpText: 'Optional task-specific input or context. Leave empty to submit only the remote prompt.',
			submitButtonText: 'Run prompt',
		})
		if (context === undefined) return
		await ctx.thread.appendUserMessage({
			type: 'user-message',
			content: assemblePrompt(body, context),
		})
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error'
		await ctx.ui.notify(`Prompt was not submitted: ${message}`)
	}
}

export default async function (amp: PluginAPI): Promise<void> {
	let prompts: PromptFile[] = []

	amp.registerCommand(
		'choose-prompt',
		{
			title: 'Choose prompt',
			category: 'Prompts',
			description: 'Refresh the upstream listing, choose a prompt, and append it to the active thread.',
		},
		async (ctx) => {
			if (!ctx.thread) {
				await ctx.ui.notify('Open a thread before invoking a prompt.')
				return
			}
			try {
				const latestPrompts = await discoverPrompts()
				if (latestPrompts.length === 0) {
					await ctx.ui.notify('No Markdown prompts were found upstream.')
					return
				}
				const choices = latestPrompts.map((prompt) => prompt.path.slice(`${PROMPTS_DIRECTORY}/`.length))
				const selected = await ctx.ui.select({ title: 'Choose prompt', options: choices })
				if (selected === undefined) return
				const index = choices.indexOf(selected)
				if (index === -1) throw new Error('Invalid prompt selection')
				await invokePrompt(latestPrompts[index], ctx)
			} catch (error) {
				const message = error instanceof Error ? error.message : 'Unknown error'
				await ctx.ui.notify(`Prompt was not submitted: ${message}`)
			}
		},
	)

	try {
		prompts = await discoverPrompts()
	} catch (error) {
		amp.logger.log('Prompt discovery failed; only the fallback command was registered.', error)
		return
	}

	for (const prompt of prompts) {
		amp.registerCommand(
			prompt.id,
			{
				title: prompt.title,
				category: 'Prompts',
				description: `Fetch and run ${prompt.path} from ${OWNER}/${REPOSITORY}.`,
			},
			(ctx) => invokePrompt(prompt, ctx),
		)
	}
}
