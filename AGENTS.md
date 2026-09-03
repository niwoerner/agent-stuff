# Repository guidance

- `lint/<language>/`: one publishable lint package per language. TypeScript rules go in `lint/typescript/src/rules/`, presets in `lint/typescript/src/configs/`, one test per rule beside it.
- `skills/<name>/SKILL.md`: one agent skill per directory.
- `.github/workflows/`: `ci.yml` checks everything; `publish-<thing>.yml` auto-publishes a patch on every `main` push touching that package, or the exact version of a pushed `<thing>-v*` tag. Never bump `version` in `package.json`; tags are the source.
- Root `README.md` is the user-facing index: rule table and usage. Package READMEs hold rule details only; do not repeat install or usage there.
- `lint/*/dist/` is build output, never committed. Package `exports` point at `dist`; run `bun run build` before testing consumption.
- Keep rules generic. No project-specific names, paths, or exceptions.
- Keep lint errors agent-friendly and token-efficient: state the violation and fix concisely.
- Enabling or introducing a lint rule does not authorize changing consumer or product code to clear findings; get explicit user approval before applying those fixes.
- Run the package's `bun run lint && bun run typecheck && bun run test` before committing.
- Keep READMEs, rule docs, and comments concise. State the what and the why, skip the rest.
