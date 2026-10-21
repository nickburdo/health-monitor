---
name: finish-task
description: Wraps up a completed feature or fix in Health Monitor. Use when implementation of a planned task is done, when the user says the task is finished, or before preparing a PR — updates the done-log in Health_Monitor_plan.md and next-update.md, then runs lint and typecheck.
---

When a task from an approved plan is implemented:

1. Find the matching item in `docs/specifications/Health_Monitor_plan.md`:
   - mark it `[x]`;
   - add a short Russian description of what was done under it, matching the style of neighbouring entries.
2. Find the matching item in `docs/plans/next-update.md`:
   - mark it `[x]` and link the plan file from `docs/plans/` if it is not linked yet;
   - if every item of the step is done, mark the step as `✅ Выполнено`.
3. Run `npm run lint` and `npm run typecheck`. Report failures with the output; do not fix code that the plan does not cover.
4. Report to the user in Russian: what was marked, check results. Stop and wait for confirmation before the next task.

Do not commit, push or create a PR.
