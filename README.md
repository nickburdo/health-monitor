# Health Monitor

Personal health tracking app built with Nuxt 4 and Nuxt UI. The app is local-first: all data (glucose, blood pressure, weight, symptoms) is stored client-side in IndexedDB via Dexie.js, mirroring the shape documented in `prisma/schema.prisma`. There is no backend, no database server, and no authentication — everything lives in the browser.

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

- Export or import the whole database as JSON from the dashboard.
- Export any single entity as CSV from its own page.

## Other Scripts

```bash
npm run typecheck
npm run lint
npm run format
npm run test
npm run build
```
