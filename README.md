# Health Monitor

Personal health tracking app built with Nuxt 4 and Nuxt UI. Data (glucose, blood pressure, weight, symptoms) is stored in the external Platform API (`https://platform-api.nick-burdo.workers.dev`, project `platform-api`). Guests see read-only demo data; after signing in (username and password, or Google) a user sees and edits only their own data.

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

The app talks to the production API by default. To use a local API instance, set `NUXT_PUBLIC_API_BASE`:

```bash
NUXT_PUBLIC_API_BASE=http://localhost:8787 npm run dev
```

Google Sign-In works only on origins allowed by the API: localhost and https://health-monitor-new.pages.dev (not on branch previews).

## Data Export

Export any single entity as CSV from its own page.

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
