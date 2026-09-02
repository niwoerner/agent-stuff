# Agent Stuff

Stuff to make agents produce better output.

## Lint

### TypeScript

`@niwoerner/oxlint-rules` ships an oxlint plugin and presets. Source in [`lint/typescript`](lint/typescript).

#### Rules

| Name            | Config   | Details                                            |
| --------------- | -------- | -------------------------------------------------- |
| `no-use-effect` | frontend | [here](lint/typescript/README.md#no-use-effect) |

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

| Name          | Details                                  |
| ------------- | ---------------------------------------- |
| `code-review` | [here](skills/code-review/SKILL.md)      |
