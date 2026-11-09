# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Health Monitor is a personal web app for tracking glucose, blood pressure, weight and symptoms: quick entry, tables, charts, a period filter, and an `ignore` flag for invalid measurements.

## Working rules

- Start tasks with the `start-task` skill and close them with `finish-task`.
- Edits to project files on `main` are blocked by a hook (`.claude/hooks/block-edits-on-main.mjs`; files outside the project and git-ignored files are allowed). For an urgent edit on `main`, ask the user first, temporarily remove the hook from `.claude/settings.json`, and restore it right after.

## Hard rules

- **IMPORTANT:** never write color literals (`white`, hex, `rgba`) in `main.css` rules or component styles outside the token definitions. Add a CSS custom property with values in both `:root` and `:root.dark` and use `var(--…)`; chart series colors are `var(--chart-*)` strings too.
- Show messages with `useToast()`, never `alert`. Ask for confirmation with `await useConfirm().confirm({...})` (rendered once by `ConfirmDialog` in `HealthShell`), never `window.confirm`.
- Outside `app/lib/db/`, never import `schema.ts`: call the `repositories/*Repository.ts` functions (or `seed.ts` / `export-import.ts` for whole-DB operations).
- To change table indexes in `schema.ts`, add a new `this.version(n)`; never edit an existing version.
- Questions and reports to the user and documentation in `docs/` are in Russian; code, comments, UI copy and `CLAUDE.md` are in English.

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

`npm run lint` also lints scripts under `.claude/` (e.g. hooks), so they follow the same stylistic rules.

Vitest only picks up `tests/**/*.test.ts` (node environment, `~`/`@` aliased to `app/`). There is no `tests/` directory yet. Run a single file with `npx vitest run tests/<name>.test.ts`.

## Architecture

Client-only Nuxt 4 (`ssr: false`) with Nuxt UI v4 and Tailwind 4; no server, API or auth: all data lives in the browser's IndexedDB (Dexie). Full description (data layer, pages, charts, styling): `docs/specifications/Health_Monitor_Structure.md`.

Deployment: Cloudflare Pages project `health-monitor-new`; a pushed branch gets a preview at `https://<branch>.health-monitor-new.pages.dev` (slashes become dashes), merging into `main` updates https://health-monitor-new.pages.dev/. Details: `docs/deploy_plan.md`.

Rules:

- Glucose is stored and shown in mmol/L exactly as entered; never convert it for display. The only conversion (legacy mg/dL) is in `app/lib/db/glucose-units.ts`.
- JSON export (`export-import.ts`): bump the format `version` when the format or units change, and keep import working for older versions.
- Demo auto-seed only adds records and is guarded by the `demoSeeded` flag in `meta`; Load demo data / Clear database set the flag too, so a cleared DB stays empty.
- After a quick entry is saved, `HealthShell` reloads the page with `reloadNuxtApp`; don't add per-list refresh for new entries.
- `HealthLineChart` builds its `viewBox` in real pixels from a `ResizeObserver`; never use `preserveAspectRatio="none"` (it stretches text and points).
- Style with `.health-*` classes in `main.css`; style Nuxt UI components with these classes (through their `ui` prop or `class`) and color tokens.

## Docs

- Spec: `docs/specifications/Health_Monitor_Structure.md`; stage plan with a done-log: `docs/specifications/Health_Monitor_plan.md`; backlog: `docs/specifications/Health_Monitor_BACKLOG.md`.
- Implementation plans, one per task, live in `docs/plans/` (roadmap in `docs/plans/next-update.md`).
