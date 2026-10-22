---
name: git-summary
description: Shows a short summary of the current git state - branch, uncommitted changes and the last 5 commits. Use when the user asks for a git summary, the repository state, or "where am I" in git.
---

# Git summary

Run these read-only commands in the current repository:

1. `git branch --show-current` - the current branch.
2. `git status --short` - uncommitted and untracked files.
3. `git log --oneline -5` - the last 5 commits.

Do not change anything: no commits, checkouts, stashes or other write commands.

Reply in Russian, in this format:

- **Ветка:** <branch>
- **Изменения:** <a short list of changed files, or "нет">
- **Последние коммиты:**
  1. <hash> <message>
  2. ...
  3. ...
  4. ...
  5. ...
