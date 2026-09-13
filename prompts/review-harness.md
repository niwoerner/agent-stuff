---
description: review harness changes (prompts, skills, tools, routing, guardrails, config) for ambiguity, bloat, and misdirection. Propose changes; apply only after approval.
---

Review the changed parts of the agent harness and tighten them without changing intended behavior. Propose every change first. Apply nothing until the user approves it.

## Scope

- The harness is everything that shapes agent behavior: system and sub-prompts, instruction files, skills, agent and role definitions, tool definitions (names, descriptions, schemas), context assembly (retrieval, memory, injected data), routing and orchestration logic, output schemas and parsers, guardrails and validators, and model config. A coding agent is one instance; a user-facing product is another.
- Default target is the change: harness files in the diff plus what they reference or are referenced by. If no change is named, review the whole harness as one system.
- Read the target in full, and the unchanged harness it interacts with. A change is only correct relative to what already exists.
- Trace how an agent runs under it: what loads first, which instructions and triggers fire when, which tools and routes it reaches for, what context it sees and in what order, what it produces, and what wins when two parts conflict.
- Verify claims about tools, guardrails, and runtime behavior against their actual definitions, not the prose describing them.
- Optimize for an agent behaving correctly under pressure, not for brevity alone.

## What to look for

### Ambiguity

- Instructions with more than one reasonable reading, undefined terms, or "should" where "must" or "may" is meant.
- Conditions without a stated trigger or outcome.
- Missing defaults: what to do when an input is absent, a check fails, or two rules apply.
- Instructions that name a tool, capability, or behavior the harness does not provide.

### Bloat and duplication

- The same instruction stated twice in different words, or in two layers (prose and code, system prompt and sub-prompt, tool description and prompt). Keep it where it is enforced.
- Explanations, caveats, and examples that do not change what the agent does.
- Generic advice the agent already follows.

### Output contract mismatches

- The stated output (format, sections, fields, file, tone) differs from what the steps actually produce, or from what the consumer of the output expects.
- A step references a result or artifact no earlier step creates.
- A tool's description or schema promises what its implementation or callers do not deliver.

### Naming inconsistencies

- One thing called by several names, or one name used for several things, across the harness.
- Names that misdescribe the step or artifact they label.
- Tool, skill, and route names that collide, differ only by case or separator, or do not say what they do.

### Misdirected priority

- Secondary concerns placed first, emphasized, or repeated more than the primary goal, so the agent optimizes for the wrong thing.
- Constraints or style notes stated so strongly they read as the main objective.
- Examples that model a narrower or different behavior than the instructions describe.
- Tool descriptions that oversell, so the tool is chosen over a better fit.
- Guardrails that block the primary task more often than the failure they guard against.

### Control flow and logic

- Steps whose order matters but is unstated or stated wrongly.
- Conditions that are unreachable, always true, or overlap so two branches claim the same case.
- Approval gates, stop conditions, and loops without a clear exit.
- Instructions that contradict each other. Note which one an agent would likely follow and why.
- Triggers that overlap, never fire, or fire every turn.
- Rules stated as prose that only code can enforce, or enforced in code and restated as prose.
- Config layers or prompt layers (global, per-role, per-request) that contradict each other.

## Approvals

Do not edit until the user approves. For each proposed change, present:

1. the passage or config entry, quoted;
2. the problem and how it would steer an agent wrong;
3. the replacement text, or the deletion;
4. what behavior could change; and
5. your recommendation.

Present independent changes separately. Group only changes that must land together to stay coherent. Apply exactly what was approved. If approval is partial, apply the approved part and leave the rest.

## Constraints

- Preserve the harness's intent and voice. Match its existing style, tense, and structure.
- Do not add instructions the harness does not need. Fixing an ambiguity should usually make it shorter, not longer.
- Do not remove a constraint because it seems obvious. Check whether it guards a known failure.
- Do not rewrite for taste. Each change must name a concrete misreading, omission, or contradiction it fixes.
