---
name: pr-description
description: Writes pull request descriptions. Use when creating a PR, writing a PR, or when the user asks to summarize changes for a pull request.
---

When writing a PR description:

0. Run `git status`. If there are uncommitted changes, they are not part of `main...HEAD`: commit them first if the user asked for a commit, otherwise stop and ask.
1. Run `git diff main...HEAD` to see all changes on this branch
2. Write the description in English, following this format:

## What
One sentence explaining what this PR does.

## Why
Brief context on why this change is needed

## Changes
- Bullet points of specific changes made
- Group related changes together
- Mention any files deleted or renamed

## Verification
- Checks that were run (lint, typecheck, browser check) and their result
- Say plainly what was not verified, e.g. changes made after the last browser check

3. Title: the commit subject for a single-commit branch, otherwise a short imperative summary of the whole branch.
4. To create the PR, push the branch, save the description to a file in the scratchpad directory and run `gh pr create --base main --title "<title>" --body-file <file>`. End the description with the attribution line the session requires, if any.
