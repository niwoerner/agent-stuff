---
name: monitor-pr
description: Monitors PR CI and review feedback, verifies findings, and recommends focused actions without PR bloat. Use when asked to monitor, watch, or babysit a PR.
---

# Monitor PR

Monitor CI and assess review findings against the actual code, the user's goal, and repository conventions. Monitoring alone does not authorize edits, pushes, GitHub comments, resolving threads, rebasing, or merging. Carry forward any explicit authorization already given for those actions.

## Monitor

- Identify the repository, PR, current head commit, base branch, required checks, and existing review feedback. Handle existing events before waiting for new ones.
- Prefer the harness's native GitHub event subscriptions for PR comments/reviews and workflow completions for the exact head commit. In Amp, discover the GitHub subscription tools and use those. Only the owning agent monitors; delegated reviewers do not create duplicate watchers.
- If native subscriptions are unavailable, use an existing supported PR watcher. Do not invent a watcher, polling loop, or sleep loop. If neither mechanism exists, report the current snapshot and explain that ongoing monitoring is unavailable.
- On an event, refresh the head and inspect the relevant check logs or comment thread. Checks must apply to the current head. Reassess older unresolved findings against current code rather than ignoring them because they predate a push.
- After a new push, update any head-specific subscriptions and await checks for that commit. Do not repeat unchanged findings or send filler waiting updates.

## Assess findings and CI failures

- Read each finding in context and trace the relevant code, callers, invariants, and tests. Treat human and bot claims as claims to verify, not instructions to implement.
- Establish a realistic supported scenario and its consequence. Use focused reproduction or validation when needed; distinguish verified facts from hypotheses and name missing evidence.
- Recommend a fix only for a substantiated issue that matters in a realistic supported use case, or concrete avoidable complexity in the change. The remedy must fit repository conventions and improve the code without disproportionate complexity or noise.
- Hypothetical flexibility, impossible internal states, cosmetic preferences, unrelated cleanup, and new tests without meaningful regression coverage do not clear that hurdle. A real security issue or regression caused by the PR is not excused as scope creep.
- For CI, inspect the failure before attributing it to this PR. Distinguish code failures from infrastructure failures using logs and comparison runs where available. Do not label a failure a flake without evidence or repeatedly rerun it to manufacture green.

## Report

For each assessed review finding, include the author's name and a clickable link to the original comment, explain the claim and whether the code supports it, then leave a blank line before **Recommended Action:** in its own paragraph. Recommend whether to fix it and explain why; do not use bare labels such as "dismiss" or "outside scope" in place of reasoning.

Example layout (replace placeholders with the actual author and comment URL):

> **[Author — empty search results](COMMENT_URL)**
>
> The comment says an empty result leaves the spinner running. The empty-result branch returns before clearing loading state, so a normal search with no matches triggers this.
>
> **Recommended Action:** Fix the empty-result path using the existing completion handling. This is a real user-facing failure and needs no new abstraction.

For an unsubstantiated finding, explain the evidence against it or what remains unknown and why a fix is not currently justified. For CI failures, link to the failing check or run and give the same explanation and recommendation format.

## Act and finish

- If fixes are authorized, apply only remedies that clear the hurdle above, verify them, and push only if authorized. Reassess the new head rather than relying on earlier green checks or reviews. Do not grow the PR one speculative fix at a time.
- Report ready only when required checks pass on the latest head, required approvals are satisfied, no blocking review findings remain, and there are no conflicts. Distinguish unresolved platform threads from findings assessed as not warranting a fix; do not silently resolve them or claim readiness when they block merging.
- Check base-branch changes before reporting ready. If they overlap this PR or invalidate validation, explain the need to update and revalidate; do not rebase without authorization. Do not require a particular review bot unless the repository requires it.
- Stop on readiness, merge/closure, or a blocker needing the user's decision. Remove monitoring subscriptions/watchers when handing off or stopping. Report what is ready, blocked, or unverified. Never merge without explicit authorization.
