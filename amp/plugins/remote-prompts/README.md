# Prompt actions

This personal Amp plugin discovers regular Markdown files under [`prompts/`](https://github.com/niwoerner/agent-stuff/tree/main/prompts) on `main` when the plugin loads. It adds a **Prompts** category to Amp's command palette with one action per discovered prompt and a **Prompts: Choose prompt** fallback.

Open an Amp thread, open the command palette, and select either a named **Prompts** action or **Prompts: Choose prompt**. The plugin fetches the latest upstream prompt at invocation time, asks for optional task-specific context, then appends one user message with the upstream prompt first and that context last. Cancelling or a network/validation error appends nothing.

Upstream prompt edits are fetched immediately when an action runs. Added, removed, or renamed prompt files appear as direct actions after running **Plugins: Reload** (or restarting Amp); **Prompts: Choose prompt** refreshes the file listing every time it runs.

The plugin registers command-palette actions only. It does not register Agent Skills or write prompt files into a workspace.
