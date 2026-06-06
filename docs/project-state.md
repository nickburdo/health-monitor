# Health Monitor Project State

## Project Overview

Health Monitor is a personal health tracking app built with Nuxt 4, Nuxt UI, Tailwind, Prisma, SQLite, and TypeScript. It tracks glucose, blood pressure, weight, and symptoms, with a lightweight MVP focused on fast entry, tables, charts, date filtering, ignore flags for bad records, and note editing for symptoms.

## Completed Work

- Scaffolded the Nuxt 4 project and configured `dev` to run on port `3030`.
- Added `@nuxt/ui`, ESLint, Prettier, and TypeScript setup.
- Set up Prisma 7 with SQLite, `prisma.config.ts`, `prisma/schema.prisma`, migrations, and a local database at `prisma/dev.db`.
- Changed `GlucoseMeasurement` and `BloodPressureMeasurement` to use a single `ignore` flag per record.
- Removed `ignore` from `SymptomEntry` and switched symptoms to note-only editing.
- Added `README.md` instructions for Prisma Studio on port `5555`.
- Implemented API routes for all four entities:
  - `GET` list with optional `dateFrom` and `dateTo`
  - `POST` create
  - `PATCH /:id/ignore`
- Added a shared server utility layer for validation and Prisma operations.
- Added a static symptom list with `Other`.
- Added Vitest and module tests for the API helper layer.
- Introduced local agent rules files and standardized the repo-level guidance flow.
- Built the first interactive UI shell with dashboard and entity pages.
- Added a working quick-entry modal with forms for glucose, blood pressure, weight, and symptoms.
- Added a symptom table with inline note editing.
- Added a glucose table with ignore/restore actions and mandatory note on ignore.
- Added a blood pressure table with ignore/restore actions and mandatory note on ignore.
- Added a weight table with ignore/restore actions and mandatory note on ignore.

## Current State

- The working tree has new UI changes pending commit.
- `AGENTS.md` is now ignored locally and kept out of git tracking.
- `AGENTS.locale.md` exists locally for project-specific rules.
- The quick-entry flow now creates real records through the POST APIs and refreshes the UI.
- Symptoms are editable only through `note`; they no longer have ignore/restore.
- The glucose table now uses a confirm dialog for ignore and a direct restore action.
- The blood pressure and weight tables use the same ignore/restore interaction model.

## Important Decisions

- Use Nuxt 4 plus Nuxt UI as the app stack.
- Use SQLite for local storage and Prisma 7 for schema, migrations, and client generation.
- Use one `ignore` flag per glucose and blood pressure record, not per sub-field.
- Keep symptoms as a static predefined list in MVP, including `Other`, with note-only editing.
- Keep the dev server on port `3030`.
- Keep Prisma Studio on port `5555`.
- Keep `AGENTS.md` local-only and use `AGENTS.locale.md` for project-specific rules.

## Known Issues

- The documentation still contains some legacy spec text in the `docs/specifications` folder.
- No known functional blockers were left in the API layer after the last test run.

## Next Steps

- Continue with the remaining tables for blood pressure and weight.
- Wire any remaining page-level polish and filters to the new API routes.
- Continue with charting and presentation once the chart library integration is started.
