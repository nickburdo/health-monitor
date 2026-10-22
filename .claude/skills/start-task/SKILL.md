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
4. Check `docs/specifications/Health_Monitor_BACKLOG.md` for an item that matches or overlaps the task. If one is found, the plan names it and the action for it (delete / narrow / mark as partly done): for feat / fix as a `- [ ]` step in the plan task that changes `docs/` (add such a task if there is none), for chore / docs in the chat plan.
5. Write the plan:
   - **feat / fix:**
     - create `docs/plans/<short-name>-plan.md` from [plan-template.md](plan-template.md), in Russian, with tasks broken into the smallest concrete steps;
     - add an unchecked item to the chosen step in `docs/plans/next-update.md`, with a link to the plan;
     - add an unchecked item to the chosen stage in `docs/specifications/Health_Monitor_plan.md`.
   - **chore / docs:** write a short plan in the chat (steps, files, what is not covered), ending with finish-task: code review and, if UI is touched, a browser check with the scenarios to cover. Create no plan files. Exception: if the implementation is postponed to another session, save the plan to `docs/plans/<short-name>-plan.md` from [plan-template.md](plan-template.md), without items in `next-update.md` and `Health_Monitor_plan.md`: delete the template lines about these two files (in Задача 0 and in the final task). If an approved chat plan is postponed later, save it to the file at that moment, with its approval status.
   - Every task that changes `CLAUDE.md` or `docs/` has a `**Зачем:**` line with one sentence on why the change is needed.
6. Report to the user in Russian and stop. List any open proposals that need an explicit answer.
7. After the user approves, set the plan status to `✅ Одобрен пользователем <YYYY-MM-DD>` (plans saved to a file only).

Do not write code before the plan is approved. Do not commit or push.
