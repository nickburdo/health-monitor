---
name: finish-task
description: Wraps up a finished feature, fix or chore in Health Monitor once the whole approved plan is implemented. Use when the user says the work is done or before preparing a PR — runs lint and typecheck, a code review and (for UI changes) a browser check, then updates the done-log in Health_Monitor_plan.md and next-update.md.
---

Run this once, after every task of the approved plan is implemented (not after each task).

1. Run `npm run lint` and `npm run typecheck`. If either fails, report the output and stop; do not fix code that the plan does not cover.
2. Run the checks below in parallel, each in its own subagent so their output stays out of the main context:
   - **Code review:** the `code-review` skill at level `medium` in a `general-purpose` subagent, on the branch changes (`main...HEAD` plus uncommitted changes). The subagent changes no files and returns only verified findings, each with its location, failure scenario and severity.
   - **Browser check, only if the changes touch UI** (`app/components/`, `app/pages/`, `app/layouts/`, `app/assets/`, any `.vue` file): the `browser-checker` agent, with the scenarios from the plan's browser-check item (for chore / docs: from the plan file if there is one, otherwise from the plan in the chat). Pass them as an addition to the agent's standard check, not as a replacement for it. It reuses a dev server already listening on port 3030 and never starts a second one; it stops only a server it started itself and deletes `.playwright-mcp/`. If it started a server, confirm in the report that it is stopped.
3. If there are no findings, go to step 4. Otherwise report them in Russian, each with a recommendation: fix now, move to the backlog, or reject (with the reason), and stop for the user's decision. Then:
   - fixes are a plan revision: add them to the plan as a new task (for chore / docs without a plan file, list them in the chat);
   - before fixing, save the list of findings being fixed and the files each fix touches, and copy those files to the scratchpad as a snapshot; then implement the fixes;
   - rerun lint and typecheck, and rerun the browser check if the fixes touch UI;
   - review the fixes: the `code-review` skill at level `low` in a `general-purpose` subagent, with the same rules as in step 2, scoped to the saved list of fixes and diffed against the snapshot. This review runs once: report its findings the same way (fix now, backlog or reject). Fixes made for them still get lint, typecheck and, if they touch UI, the browser check; only the review is not repeated. Name them in the report;
   - add backlog items to `docs/specifications/Health_Monitor_BACKLOG.md`;
   - continue with step 4.
4. **feat / fix only** (chore / docs have no done-log items; skip to step 6):
   find the matching item in `docs/specifications/Health_Monitor_plan.md`:
   - mark it `[x]`;
   - add a short Russian description of what was done under it, matching the style of neighbouring entries, so it covers the final code including review fixes.
5. **feat / fix only:** find the matching item in `docs/plans/next-update.md`:
   - mark it `[x]` and link the plan file from `docs/plans/` if it is not linked yet;
   - if every item of the step is done, mark the step as `✅ Выполнено`.
6. **If the task has a plan file** in `docs/plans/` (feat / fix, or a postponed chore / docs): in it, mark the finished checkboxes `[x]`. Leave unchecked any item that was not done and name it in the report.
7. Report to the user in Russian: check results, what was marked. Stop and wait for confirmation before committing.

If the code changes after the task was closed, run this skill again: update the existing description in `Health_Monitor_plan.md` instead of adding a duplicate entry, and mark the new plan checkboxes.

Do not commit, push or create a PR.
