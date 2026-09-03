# @niwoerner/oxlint-rules

Install and usage: see the [repository README](../../README.md#typescript).

## Presets

- `base` — always. Loads the plugin, enables `no-conditional-object-spread`, sets `correctness` to warn and `eslint/no-unused-vars` to error. No ignores: oxlint drops `ignorePatterns` from an extended object, so keep them in the project config.
- `backend` — server and CLI projects. Nothing beyond `base` yet.
- `frontend` — React and browser projects. Enables `no-use-effect`.
- `testing` — overrides for `*.test.ts(x)`. Nothing yet.
- `fmt` — oxfmt settings: tabs, Markdown ignored. Spread into `oxfmt.config.ts`.

## Rules

### no-conditional-object-spread

Preset: `base`. Source: [`src/rules/no-conditional-object-spread.ts`](src/rules/no-conditional-object-spread.ts).

Rejects logical-AND spreads and ternary spreads with an empty object branch in object literals. Assign a possibly undefined property directly when presence does not matter. When the property must be omitted, construct the object first and add the property with an `if`. Array spreads and unconditional object spreads are outside the rule.

#### Why

Conditional object spreads hide whether a property is absent or present with an undefined value. They also make object construction harder to read and type-check. Explicit assignment keeps the value visible; an `if` makes intentional omission visible.

```ts
const options = { ...(timeout !== undefined && { timeout }) }; // violation
const result = { ...(title === undefined ? {} : { title }) }; // violation

const options = { timeout };
const result: { title?: string } = {};
if (title !== undefined) result.title = title;
```

### no-use-effect

Preset: `frontend`. Source: [`src/rules/no-use-effect.ts`](src/rules/no-use-effect.ts).

Rejects `useEffect(...)` and any member call ending in `.useEffect(...)`, such as `React.useEffect`. Prefer derived state, event handlers, or the framework's data APIs. Computed access like `obj["useEffect"]` and other hooks such as `useLayoutEffect` are outside the rule.

#### Why

`useEffect` is for external sync, yet it gets used for derived state, fetching, and prop reactions. Those belong in render, the data layer, or the event handler. A ban makes the rare real sync an explicit, justified disable. See [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect).

```tsx
useEffect(() => sync(value), [value]); // violation
React.useEffect(() => sync(value), [value]); // violation
```

## Development

- One rule per file in `src/rules/<name>.ts`, exported as `<camelName>Rule` via `defineRule`, with a `messageId` and `docs.description`.
- Sibling `<name>.test.ts` using `RuleTester` from `oxlint/plugins-dev`, covering valid and invalid cases.
- Register the rule in `src/index.ts` and enable it in the preset it belongs to under `src/configs/`.
- Add a `### <name>` section above and a row in the repository README table linking to it.

```bash
bun install && bun run test && bun run typecheck && bun run build && bun run lint
```

The package ships compiled `dist/` (JS + `.d.ts`), not `src/`: Node refuses to strip types from `.ts` files under `node_modules`, and oxfmt loads config imports through Node.

Release: every push to `main` that changes this package publishes the next patch automatically, starting at `0.0.1`. Push a tag `lint-typescript-v<x.y.z>` to release that exact version; automatic patches continue from it. Tags are the version source, `package.json` stays at `0.0.0`.
