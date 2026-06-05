# Health Monitor Project State

## Project Overview

Health Monitor is a personal health tracking app built with Nuxt 4, Nuxt UI, Tailwind, Prisma, SQLite, and TypeScript.
The app tracks glucose, blood pressure, weight, and symptoms, with a lightweight MVP focused on fast entry, tables, charts, date filtering, and ignore flags for bad records.

## Completed Work

- Scaffolded the Nuxt 4 project and configured `dev` to run on port `3030`.
- Added `@nuxt/ui`, ESLint, Prettier, and TypeScript setup.
- Added `AGENTS.md` with working rules, then removed it from the repository and added it to `.gitignore`.
- Set up Prisma 7 with SQLite, `prisma.config.ts`, `prisma/schema.prisma`, migrations, and a local database at `prisma/dev.db`.
- Changed `GlucoseMeasurement` and `BloodPressureMeasurement` to use a single `ignore` flag per record.
- Added `README.md` instructions for Prisma Studio on port `5555`.
- Implemented API routes for all four entities:
  - `GET` list with optional `dateFrom` and `dateTo`
  - `POST` create
  - `PATCH /:id/ignore`
- Added a shared server utility layer for validation and Prisma operations.
- Added a static symptom list with `Other`.
- Added Vitest and module tests for the API helper layer.

## Current State

- The codebase is functionally scaffolded through stage 3.
- `lint`, `typecheck`, `test`, and `format:check` were passing at the last verification run.
- The working tree is currently dirty, with the stage 3 changes still uncommitted.
- Prisma Studio was verified locally on `http://127.0.0.1:5555`.

## Important Decisions

- Use Nuxt 4 plus Nuxt UI as the app stack.
- Use SQLite for local storage and Prisma 7 for schema/migrations/client generation.
- Use one `ignore` flag per glucose and blood pressure record, not per sub-field.
- Keep symptoms as a static predefined list in MVP, including `Other`.
- Use `Nuxt ECharts` for charts.
- Keep the dev server on port `3030`.
- Keep Prisma Studio on port `5555`.
- Keep `AGENTS.md` out of the repository and ignored locally.

## Known Issues

- The repository currently has uncommitted changes from the stage 3 implementation.
- The documentation still contains some legacy spec text in the `docs/specifications` folder, but the current implementation follows the updated contract.
- No known functional blockers were left in the API layer after the last test run.

## Next Steps

- Commit the stage 3 changes if the branch should be checkpointed.
- Build the UI shell and pages for the dashboard and entity views.
- Add the quick-entry modal and forms.
- Wire the UI to the new API routes.
- Continue with charting and presentation once the chart library integration is started.
