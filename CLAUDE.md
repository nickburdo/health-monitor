# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Health Monitor is a personal web app for tracking glucose, blood pressure, weight and symptoms: quick entry, tables, charts, a period filter, and an `ignore` flag for invalid measurements.

## Working rules

- Write user questions and work reports in Russian.
- Start tasks with the `start-task` skill and close them with `finish-task`.
- A `PreToolUse` hook (`.claude/hooks/block-edits-on-main.mjs`, registered in `.claude/settings.json`) blocks Edit/Write/NotebookEdit on project files while the branch is `main`; files outside the project and git-ignored files are allowed. For an urgent edit on `main`, ask the user before temporarily removing the hook from `.claude/settings.json`, and restore it right after.

## Commands

```bash
npm run dev            # dev server on http://localhost:3030
npm run lint           # ESLint (@nuxt/eslint, stylistic: semicolons, trailing commas, 1tbs)
npm run typecheck      # nuxt typecheck (vue-tsc)
npm run build          # nuxt build
npm run generate       # static build used for hosting
npm run format         # Prettier (single quotes, semicolons, trailing commas)
npm run demo:generate  # regenerate public/data/demo.json from scripts/generate-demo-data.mjs
npm run test           # vitest run
```

CI (`.github/workflows/ci.yml`) runs only `npm run lint` and `npm run typecheck` on every push.

Vitest only picks up `tests/**/*.test.ts` (node environment, `~`/`@` aliased to `app/`). There is no `tests/` directory yet. Run a single file with `npx vitest run tests/<name>.test.ts`.

## Architecture

Nuxt 4 + Nuxt UI v4 + Tailwind 4, **client-only** (`ssr: false`). There is no server, API or auth: all data lives in the browser's IndexedDB.

### Deployment

Static site on Cloudflare Pages, project `health-monitor-new`, connected to the GitHub repository (no deploy workflow or `wrangler` config in the repo). Pushing a branch creates a preview at `https://<branch>.health-monitor-new.pages.dev` (slashes become dashes); merging into `main` updates https://health-monitor-new.pages.dev/. Details: `docs/deploy_plan.md`.

### Data layer (`app/lib/db/`)

- `schema.ts` defines the Dexie database `health-monitor` with four data tables: `glucoseMeasurement`, `bloodPressureMeasurement`, `weightMeasurement`, `symptomEntry`, plus a `meta` key-value table (`version(2)`). Record types live in `app/types/*.ts` and double as table row types. Changing indexes requires a new `this.version(n)`.
- `repositories/*Repository.ts` are the only way pages and components touch the DB: `list*` (loads the table and filters by an ISO `dateFrom`/`dateTo` range in memory), `create*` (IDs via `crypto.randomUUID()`), and `set*Ignore` for measurements / note updates for symptoms.
- Input parsing and the ignore rule live in `validation.ts`: ignoring a measurement requires a `reason`; restoring clears it.
- `seed.ts` + `app/plugins/seed-demo-data.client.ts`: auto-seed from `public/data/demo.json` runs only on the very first open, guarded by the `demoSeeded` flag in `meta`; it only adds records and never clears. `seed.ts` also provides `replaceWithDemoData` and `clearHealthMonitorData` for the dashboard's Load demo data / Clear database buttons (both set the flag, so a cleared DB stays empty after reload). Demo dates are stored as `daysAgo` offsets and resolved at seed time.
- `export-import.ts`: whole-DB JSON export/import (import is replace-all inside a transaction, format `version: 1`). `csv.ts`: per-entity CSV export from each entity page.

### Pages and data flow

- Every page wraps its content in `HealthShell` (header nav, theme toggle, quick entry modal, mobile footer nav).
- Entity pages use `useMeasurementList(listFn)`, which owns the period filter (`usePeriodFilter`, presets `3m` / `6m` / `ytd` / `custom`, default `3m`) and re-runs the loader when the range changes. Tables receive `refresh` as `onUpdated` and call it after ignore/restore or note edits.
- The dashboard (`pages/index.vue`) uses `usePeriodFilter` directly and loads all four repositories in parallel.
- After a quick entry is saved, `HealthShell` calls `reloadNuxtApp` to reload the current page instead of refreshing individual lists.

### Charts

`HealthLineChart.vue` is a hand-written SVG chart shared by glucose, blood pressure, weight and the dashboard. Per-entity series and formatters are in `app/utils/health-line-chart/`. Symptoms use a separate bar panel (`DashboardSymptomsPanel`). Symptom types are a static list in `app/constants/symptom-options.ts`.

### Styling and themes

Styling is custom `.health-*` classes in `app/assets/css/main.css`; Nuxt UI components are barely used (mostly `UApp`, `UIcon`, `useToast`). All colors are CSS custom properties on `:root`, overridden for the dark theme in `:root.dark`. `@nuxtjs/color-mode` (bundled with Nuxt UI) toggles the `dark` class on `<html>` via `ThemeToggle.vue`. Outside the token definitions, never write color literals (`white`, hex, `rgba`) in `main.css` rules or component styles: add a token with values for both themes. This includes chart series colors, which are `var(--chart-*)` strings.

## Conventions and docs

- The UI copy is English; project documentation in `docs/` is Russian.
- Messages to the user go through `useToast()`, not `alert`.
- Confirmations go through `await useConfirm().confirm({...})` (rendered once by `ConfirmDialog` in `HealthShell`), not `window.confirm`.
- Spec: `docs/specifications/Health_Monitor_Structure.md`; stage plan with a done-log: `docs/specifications/Health_Monitor_plan.md`; backlog: `docs/specifications/Health_Monitor_BACKLOG.md`.
- Implementation plans, one per task, live in `docs/plans/` (roadmap in `docs/plans/next-update.md`).
