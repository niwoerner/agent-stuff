---
name: reviewing-code
description: Reviews a change for real bugs and unnecessary complexity using independent Claude Opus and Codex Sol reviewers. Use when asked to review code, a diff, or a PR.
---

# Reviewing Code

Review the requested change against the user's goal and repository conventions. Report findings; do not edit files, push, or post to GitHub unless explicitly authorized.

## Independent reviewers

- Identify the exact review target: base and head commits, plus any uncommitted changes. Read the original request and applicable repository guidance.
- Discover the harness's delegation capabilities and available model identifiers. Launch one Claude Opus reviewer and one Codex Sol reviewer in parallel, both with high thinking effort, using the harness's supported mechanism. Do not guess model identifiers or select a premium variant unless requested.
- If either model, high effort, or parallel delegation is unavailable, explain the limitation and ask before substituting. Never present a single-model or reduced-effort review as the requested pair.
- Give both reviewers the same goal, exact code snapshot, repository guidance, and criteria below. Ensure separate workspaces receive uncommitted changes too. Neither reviewer sees the other's findings before submitting its own.
- Reviewers are read-only: no edits, fixes, GitHub comments, or further delegation. Ask each for concrete findings with file/line references, evidence, consequences, and the smallest useful remedy. An empty review is acceptable.

## Review criteria

Read affected files and trace relevant callers, invariants, tests, and public contracts. Check both correctness and implementation quality:

- Real bugs and regressions in supported workflows, including security, validation at trust boundaries, error handling, and state or resource lifetimes where relevant.
- Whether the implementation achieves the requested behavior without unintended side effects or unrelated changes.
- Abstractions without a coherent responsibility; tiny wrappers, adapters, pass-through helpers, and type indirections that obscure rather than simplify.
- Speculative configuration, fallback behavior, compatibility, defensive checks, or extension points without a current requirement.
- Duplicated logic, excessive state, branching, and special cases that can be removed at the existing ownership boundary.
- Types and optional fields that misrepresent actual invariants. Do not remove checks or behavior until their purpose and consumers are understood.

A finding must describe a substantiated problem in a realistic supported case, or concrete complexity introduced by the change. Its remedy must align with repository conventions and justify its cost. Do not suggest new abstractions merely to shorten code, unrelated cleanup, cosmetic preferences, or tests without a meaningful regression to catch. Do not weaken public contracts or tests to simplify implementation.

## Consolidation

- Verify reviewer claims against the code and run focused checks when needed. Agreement is not proof; a finding from only one reviewer can still be correct.
- Deduplicate findings by underlying issue. Keep the strongest evidence and smallest correct remedy, not two versions of the same concern.
- Report actionable findings in order of consequence, with clickable file/line references, the triggering case or unnecessary complexity, its impact, and supporting evidence.
- After each explanation, leave a blank line before a separate **Recommended Action:** paragraph stating what should change and why the remedy clears the relevance and complexity hurdle.
- Separate material unresolved questions from verified findings. State missing evidence rather than inventing certainty. If nothing clears the hurdle, say no actionable findings were found.
- State which models and effort settings actually ran and any verification limits. Do not claim tests passed unless executed. Stop after the consolidated review unless further action was authorized.
