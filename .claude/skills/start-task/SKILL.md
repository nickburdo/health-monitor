---
name: start-task
description: Starts a new feature, bug fix or improvement in Health Monitor before any code is written. Use when the user asks to build, add, change or fix something — clarifies requirements, creates the branch from main, writes the plan in docs/plans and adds open items to next-update.md and Health_Monitor_plan.md, then waits for plan approval.
---

When the user asks for new work:

1. Decide the task type: `feat` / `fix` (app behaviour changes) or `chore` / `docs` (skills, docs, config, tooling).
2. Clarify requirements with `AskUserQuestion`. In the same call:
   - ask to confirm a proposed branch name: `<type>/<short-kebab-name>`;
   - for feat / fix, if it is not obvious, ask which step of `docs/plans/next-update.md` and which stage of `docs/specifications/Health_Monitor_plan.md` the item belongs to.
3. If the working tree has uncommitted changes, stop and ask what to do with them. Then switch to `main`, pull it with `--ff-only` and create the confirmed branch from it. Never reuse a merged or unrelated branch.
4. Write the plan:
   - **feat / fix:**
     - create `docs/plans/<short-name>-plan.md` from [plan-template.md](plan-template.md), in Russian, with tasks broken into the smallest concrete steps;
     - add an unchecked item to the chosen step in `docs/plans/next-update.md`, with a link to the plan;
     - add an unchecked item to the chosen stage in `docs/specifications/Health_Monitor_plan.md`.
   - **chore / docs:** write a short plan in the chat (steps, files, what is not covered), ending with finish-task: code review and, if UI is touched, a browser check with the scenarios to cover. Create no plan files.
5. Report to the user in Russian and stop. List any open proposals that need an explicit answer.
6. After the user approves, set the plan status to `✅ Одобрен пользователем <YYYY-MM-DD>` (feat / fix only).

Do not write code before the plan is approved. Do not commit or push.
