# Agent Stuff

Stuff to make agents produce better output.

## Lint

### TypeScript

`@niwoerner/oxlint-rules` ships an oxlint plugin and presets. Source in [`lint/typescript`](lint/typescript).

#### Rules

| Name                                | Config   | Details                                                             |
| ----------------------------------- | -------- | ------------------------------------------------------------------- |
| `no-conditional-object-spread`      | base     | [here](lint/typescript/README.md#no-conditional-object-spread)      |
| `no-direct-db-operations`           | explicit | [here](lint/typescript/README.md#no-direct-db-operations)           |
| `no-raw-error-message`              | frontend | [here](lint/typescript/README.md#no-raw-error-message)              |
| `no-raw-hono-request-input`         | backend  | [here](lint/typescript/README.md#no-raw-hono-request-input)         |
| `no-use-effect`                     | frontend | [here](lint/typescript/README.md#no-use-effect)                     |
| `static-hono-routes-before-dynamic` | backend  | [here](lint/typescript/README.md#static-hono-routes-before-dynamic) |

<details>
<summary><b>Usage</b></summary>

```bash
bun add -d @niwoerner/oxlint-rules oxlint
```

Presets: `base` (always), then `frontend` or `backend`, plus `testing`. Three ways to use them in `oxlint.config.ts`:

```ts
import { defineConfig } from "oxlint";
import { base, frontend } from "@niwoerner/oxlint-rules/configs";

// 1. Preset only
export default defineConfig({ extends: [base, frontend] });

// 2. Preset, then tweak single rules. Local rules always win over extends.
export default defineConfig({
  extends: [base, frontend],
  rules: { "niwoerner/no-use-effect": "off" },
});

// 3. No presets at all. Load the plugin and hand-pick.
export default defineConfig({
  jsPlugins: ["@niwoerner/oxlint-rules"],
  rules: { "niwoerner/no-use-effect": "error" },
});
```

Formatting shares the same package:

```ts
// oxfmt.config.ts
import { defineConfig } from "oxfmt";
import { fmt } from "@niwoerner/oxlint-rules/configs";

export default defineConfig({ ...fmt, ignorePatterns: [...fmt.ignorePatterns, "**/generated/**"] });
```

</details>

## Skills

Agent skills, one directory each under [`skills/`](skills).

| Name          | Details                             |
| ------------- | ----------------------------------- |
| `code-review` | [here](skills/code-review/SKILL.md) |
| `filing-pr` | [here](skills/filing-pr/SKILL.md) |
| `monitor-pr` | [here](skills/monitor-pr/SKILL.md) |
| `reviewing-code` | [here](skills/reviewing-code/SKILL.md) |

```bash
npx skills add niwoerner/agent-stuff
```

Choose the skills and agents to install to; add `-g` to install globally.

### Credits

`filing-pr` was copied from [t3dotgg/tstack](https://github.com/t3dotgg/tstack)
by Theo Browne, with the follow-up PR comment instruction removed.

`monitor-pr` was inspired by the [babysit-pr skill in t3dotgg/tstack](https://github.com/t3dotgg/tstack/tree/main/skills/babysit-pr).
`reviewing-code` incorporates review criteria from our `code-review` skill and
[`deslop` prompt](prompts/deslop.md), which credits [earendil-works/pi](https://github.com/earendil-works/pi).
