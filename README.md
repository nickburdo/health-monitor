# Health Monitor

Personal health tracking app built with Nuxt 4 and Nuxt UI. The app is local-first: all data (glucose, blood pressure, weight, symptoms) is stored client-side in IndexedDB via Dexie.js. There is no backend, no database server, and no authentication — everything lives in the browser.

The interface has a light and a dark theme, switched from the header. The first visit follows the OS theme; after that the choice is saved in the browser.

## Setup

Install dependencies:

```bash
npm install
```

## Development Server

Start the app on `http://localhost:3030`:

```bash
npm run dev
```

On first run, if the local database is empty, the app seeds itself from `public/data/demo.json`.

## Demo Data

`public/data/demo.json` is generated from `scripts/generate-demo-data.mjs`. To regenerate it:

```bash
npm run demo:generate
```

## Data Export / Import

- Export or import the whole database as JSON from the dashboard. Import replaces all local data.
- Export any single entity as CSV from its own page.

## Deployment

The app is hosted as a static site on Cloudflare Pages: https://health-monitor-new.pages.dev/

Cloudflare Pages is connected to this GitHub repository. Pushing a branch creates a preview deployment, and merging into `main` updates the production site. See [`docs/deploy_plan.md`](docs/deploy_plan.md) for details.

## Other Scripts

```bash
npm run typecheck
npm run lint
npm run format
npm run test
npm run build
npm run generate   # static build for hosting
```
