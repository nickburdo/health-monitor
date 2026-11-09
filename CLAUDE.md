# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Health Monitor is a personal web app for tracking glucose, blood pressure, weight and symptoms: quick entry, tables, charts, a period filter, and an `ignore` flag for invalid measurements.

## Working rules

- Start tasks with the `start-task` skill and close them with `finish-task`.
- Edits to project files on `main` are blocked by a hook (`.claude/hooks/block-edits-on-main.mjs`; files outside the project and git-ignored files are allowed). For an urgent edit on `main`, ask the user first, temporarily remove the hook from `.claude/settings.json`, and restore it right after.

## Hard rules

- **IMPORTANT:** never write color literals (`white`, hex, `rgba`) in `main.css` rules or component styles outside the token definitions. Add a CSS custom property with values in both `:root` and `:root.dark` and use `var(--…)`; chart series colors are `var(--chart-*)` strings too.
- Show messages with `useToast()`, never `alert`. Ask for confirmation with `await useConfirm().confirm({...})` (rendered once by `ConfirmDialog` in `HealthShell`), never `window.confirm`.
- Talk to the API only through `app/lib/api/*` modules; components and pages never call `$fetch` directly.
- Never send the `Authorization` header to `POST /auth/register` or `POST /auth/login` (a stale token turns them into `401`).
- On `/auth/callback`, accept a Google `#token=` only when the `n` query parameter matches the nonce stored in `sessionStorage`; delete the nonce right after reading it.
- Questions and reports to the user and documentation in `docs/` are in Russian; code, comments, UI copy and `CLAUDE.md` are in English.

## Commands

```bash
npm run dev            # dev server on http://localhost:3030
npm run lint           # ESLint (@nuxt/eslint, stylistic: semicolons, trailing commas, 1tbs)
npm run typecheck      # nuxt typecheck (vue-tsc)
npm run build          # nuxt build
npm run generate       # static build used for hosting
npm run format         # Prettier (single quotes, semicolons, trailing commas)
npm run test           # vitest run
```

CI (`.github/workflows/ci.yml`) runs only `npm run lint` and `npm run typecheck` on every push.

`npm run lint` also lints scripts under `.claude/` (e.g. hooks), so they follow the same stylistic rules.

Vitest only picks up `tests/**/*.test.ts` (node environment, `~`/`@` aliased to `app/`). There is no `tests/` directory yet. Run a single file with `npx vitest run tests/<name>.test.ts`.

## Architecture

Client-only Nuxt 4 (`ssr: false`) with Nuxt UI v4 and Tailwind 4; no own server. Data and auth come from the external Platform API (sibling project `platform-api`; contract in its `docs/api.md`, frontend rules in `docs/frontend-guide.md`). Guests (no token) read demo data and cannot write; signed-in users see only their own data. Full description (API layer, auth, pages, charts, styling): `docs/specifications/Health_Monitor_Structure.md`.

API base URL: `runtimeConfig.public.apiBase`, production by default, override with `NUXT_PUBLIC_API_BASE=http://localhost:8787`. Google Sign-In works only on localhost and the production origin, not on branch previews.

Deployment: Cloudflare Pages project `health-monitor-new`; a pushed branch gets a preview at `https://<branch>.health-monitor-new.pages.dev` (slashes become dashes), merging into `main` updates https://health-monitor-new.pages.dev/. Details: `docs/deploy_plan.md`.

Rules:

- Glucose is stored and shown in mmol/L exactly as entered; never convert it.
- Two different `401`s: `Authentication required` (guest write) opens `GuestPrompt`; `Invalid or expired token` drops the token and reloads the app as a guest. Both are handled in `app/lib/api/client.ts`.
- Write controls (ignore/restore, symptom note edit) are disabled for guests; Add entry opens `GuestPrompt` for them.
- After a quick entry is saved, and after sign in, register or sign out, the app reloads with `reloadNuxtApp`; don't add per-list refresh for new entries.
- `HealthLineChart` builds its `viewBox` in real pixels from a `ResizeObserver`; never use `preserveAspectRatio="none"` (it stretches text and points).
- Style with `.health-*` classes in `main.css`; style Nuxt UI components with these classes (through their `ui` prop or `class`) and color tokens.

## Docs

- Spec: `docs/specifications/Health_Monitor_Structure.md`; stage plan with a done-log: `docs/specifications/Health_Monitor_plan.md`; backlog: `docs/specifications/Health_Monitor_BACKLOG.md`.
- Implementation plans, one per task, live in `docs/plans/` (roadmap in `docs/plans/next-update.md`).
