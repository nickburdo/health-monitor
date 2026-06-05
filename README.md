# Health Monitor

Personal health tracking app built with Nuxt 4, Nuxt UI, Prisma, and SQLite.

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

## Prisma Studio

Open Prisma Studio on port `5555`:

```bash
npm run prisma:studio -- --port 5555
```

Then open `http://127.0.0.1:5555` in the browser.

## Prisma

Generate the client:

```bash
npm run prisma:generate
```

Create and apply a migration:

```bash
npm run prisma:migrate -- --name init
```
