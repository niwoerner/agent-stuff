# @niwoerner/oxlint-rules

Install and usage: see the [repository README](../../README.md#typescript).

## Presets

- `base` — always. Loads the plugin, enables `no-conditional-object-spread`, sets `correctness` to warn and `eslint/no-unused-vars` to error. No ignores: oxlint drops `ignorePatterns` from an extended object, so keep them in the project config.
- `backend` — server and CLI projects. Enables `no-raw-hono-request-input` and `static-hono-routes-before-dynamic`.
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

### no-direct-db-operations

Preset: none; enable it in an override for route-handler files. Source: [`src/rules/no-direct-db-operations.ts`](src/rules/no-direct-db-operations.ts).

Rejects direct `.select()`, `.insert()`, `.update()`, `.delete()`, `.execute()`, and `.transaction()` calls on identifiers named `db` or `tx`. Calls to imported database-layer functions and operations on other receivers remain valid. The rule applies to the whole file selected by the consumer; it does not infer which functions are route handlers.

```ts
app.get("/:id", () => db.select().from(users)); // violation
app.get("/:id", (c) => getUser(db, c.req.valid("param").id));
```

### no-raw-hono-request-input

Preset: `backend`. Source: [`src/rules/no-raw-hono-request-input.ts`](src/rules/no-raw-hono-request-input.ts).

Rejects `.json()`, `.param()`, `.query()`, and `.queries()` on the direct `<identifier>.req` member chain. Consume validator-produced input through `.req.valid(...)`. `.parseBody()` remains valid for explicit multipart parsing. Computed and deeper member chains are outside the rule to avoid matching unrelated APIs.

```ts
const body = await c.req.json(); // violation
const body = c.req.valid("json");
const form = await c.req.parseBody();
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

### static-hono-routes-before-dynamic

Preset: `backend`. Source: [`src/rules/static-hono-routes-before-dynamic.ts`](src/rules/static-hono-routes-before-dynamic.ts).

Reports an earlier parameter or wildcard path when a later static string path on the same router, HTTP method, and lexical registration scope would match it. It supports simple and optional parameter segments plus Hono `*` wildcards for `.get()`, `.post()`, `.put()`, `.delete()`, `.patch()`, `.options()`, and `.head()` calls, including fluent chains.

Template paths, regexp parameters, `createRoute(...)` definitions, `.on()`/`.all()`, aliases, and cross-file ordering are deliberately outside the rule. A `createRoute(...)` declaration does not prove where its route is registered, so checking declaration order would be unreliable.

```ts
app.get("/:id", handler);
app.get("/settings", settingsHandler); // `/settings` is shadowed

app.get("/settings", settingsHandler);
app.get("/:id", handler);
```

## Development

- One rule per file in `src/rules/<name>.ts`, exported as `<camelName>Rule` via `defineRule`, with a `messageId` and `docs.description`.
- Sibling `<name>.test.ts` using `RuleTester` from `oxlint/plugins-dev`, covering valid and invalid cases.
- Register the rule in `src/index.ts`. Enable it in a matching preset, or leave stack- and file-specific rules explicit.
- Add a `### <name>` section above and a row in the repository README table linking to it.

```bash
bun install && bun run test && bun run typecheck && bun run build && bun run lint
```

The package ships compiled `dist/` (JS + `.d.ts`), not `src/`: Node refuses to strip types from `.ts` files under `node_modules`, and oxfmt loads config imports through Node.

Release: every push to `main` that changes this package publishes the next patch automatically, starting at `0.0.1`. Push a tag `lint-typescript-v<x.y.z>` to release that exact version; automatic patches continue from it. Tags are the version source, `package.json` stays at `0.0.0`.
