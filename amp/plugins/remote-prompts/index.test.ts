import { afterEach, describe, expect, mock, test } from 'bun:test'
import plugin, { assemblePrompt, discoverPrompts, fetchPrompt } from './index'

const originalFetch = globalThis.fetch

afterEach(() => {
	globalThis.fetch = originalFetch
})

function response(body: unknown, url: string, headers: Record<string, string> = {}): Response {
	const value = typeof body === 'string' ? body : JSON.stringify(body)
	const result = new Response(value, { status: 200, headers })
	Object.defineProperty(result, 'url', { value: url })
	return result
}

function file(path: string, size = 10) {
	const name = path.split('/').at(-1)!
	return {
		type: 'file',
		name,
		path,
		url: `https://api.github.com/repos/niwoerner/agent-stuff/contents/${path}?ref=main`,
		download_url: `https://raw.githubusercontent.com/niwoerner/agent-stuff/main/${path}`,
		size,
	}
}

describe('prompt discovery', () => {
	test('discovers Markdown files in deterministic order', async () => {
		globalThis.fetch = mock(async (url) => response([
			file('prompts/zeta.md'),
			file('prompts/notes.txt'),
			file('prompts/alpha.md'),
		], String(url))) as typeof fetch

		expect(await discoverPrompts()).toEqual([
			{ path: 'prompts/alpha.md', id: 'prompt-alpha', title: 'alpha' },
			{ path: 'prompts/zeta.md', id: 'prompt-zeta', title: 'zeta' },
		])
	})

	test('rejects traversal and duplicate command IDs', async () => {
		globalThis.fetch = mock(async (url) => response([
			file('prompts/a-b.md'),
			file('prompts/a_b.md'),
		], String(url))) as typeof fetch
		await expect(discoverPrompts()).rejects.toThrow('Duplicate prompt')

		globalThis.fetch = mock(async (url) => response([file('prompts/../secret.md')], String(url))) as typeof fetch
		await expect(discoverPrompts()).rejects.toThrow('unsafe prompt path')
	})
})

test('fetchPrompt rejects unexpected redirects and oversized bodies', async () => {
	globalThis.fetch = mock(async () => response('prompt', 'https://example.com/prompt.md')) as typeof fetch
	await expect(fetchPrompt('prompts/test.md')).rejects.toThrow('unexpected response URL')

	globalThis.fetch = mock(async (url) => response('x', String(url), { 'content-length': String(300 * 1024) })) as typeof fetch
	await expect(fetchPrompt('prompts/test.md')).rejects.toThrow('too large')
})

test('assembles the stable prompt first and user context last', () => {
	expect(assemblePrompt('REMOTE\n', '  local details  ')).toBe(
		'REMOTE\n\n\n---\n\nUser context:\nlocal details',
	)
	expect(assemblePrompt('REMOTE\n', '   ')).toBe('REMOTE\n')
})

test('registers fallback and discovered prompt commands', async () => {
	globalThis.fetch = mock(async (url) => {
		return String(url).includes('api.github.com')
			? response([file('prompts/deslop.md')], String(url))
			: response('REMOTE PROMPT', String(url))
	}) as typeof fetch
	const commands: Array<{
		id: string
		options: { category?: string }
		handler: (ctx: never) => Promise<void>
	}> = []
	const amp = {
		registerCommand(id: string, options: { category?: string }, handler: (ctx: never) => Promise<void>) {
			commands.push({ id, options, handler })
			return { unsubscribe() {}, setAvailability() {} }
		},
		logger: { log() {} },
	}

	await plugin(amp as never)
	expect(commands.map(({ id, options }) => ({ id, options }))).toEqual([
		{ id: 'choose-prompt', options: expect.objectContaining({ category: 'Prompts' }) },
		{ id: 'prompt-deslop', options: expect.objectContaining({ category: 'Prompts' }) },
	])

	const appended: string[] = []
	await commands[1].handler({
		ui: { input: async () => 'task details', notify: async () => {} },
		thread: {
			appendUserMessage: async (message: { content: string }) => { appended.push(message.content) },
		},
	} as never)
	expect(appended).toEqual(['REMOTE PROMPT\n\n---\n\nUser context:\ntask details'])

	await commands[1].handler({
		ui: { input: async () => undefined, notify: async () => {} },
		thread: {
			appendUserMessage: async (message: { content: string }) => { appended.push(message.content) },
		},
	} as never)
	expect(appended).toHaveLength(1)

	const notifications: string[] = []
	globalThis.fetch = mock(async () => { throw new Error('network unavailable') }) as typeof fetch
	await commands[1].handler({
		ui: {
			input: async () => 'must not be requested',
			notify: async (message: string) => { notifications.push(message) },
		},
		thread: {
			appendUserMessage: async (message: { content: string }) => { appended.push(message.content) },
		},
	} as never)
	expect(appended).toHaveLength(1)
	expect(notifications).toEqual(['Prompt was not submitted: network unavailable'])
})
