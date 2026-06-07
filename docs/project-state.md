# Health Monitor Handoff

## Overview

Health Monitor is a personal Nuxt 4 app for tracking health. MVP covers glucose, blood pressure, weight, symptoms, quick entry, tables, period filtering, `ignore` flags for invalid measurements, and note editing for symptoms.

## Current State

- Working tree is not clean; there are local edits in the chart area.
- Latest commit: `d50be3b` - `Add glucose chart`.
- Shared helpers already exist for date ranges, period filtering, measurement list loading, page headers, ignore/restore actions, and date formatting.
- `HealthLineChart` now powers both `/blood-pressure` and `/glucose`.
- Glucose uses the shared chart with two series: fasting and after-meal.
- Blood pressure uses the shared chart with systolic and diastolic series.
- Specs and plan were updated to reflect the shared chart direction.

## Important Decisions

- Use Nuxt 4 plus Nuxt UI.
- Keep SQLite as the local store through Prisma.
- Use a single `ignore` flag for glucose, blood pressure, and weight records.
- Keep symptoms as a static predefined list in MVP.
- Keep the dev server on port `3030`.
- Keep Prisma Studio on port `5555`.

## Next Step

- Build dashboard charts next, reusing `HealthLineChart` and expanding the same pattern to the dashboard.

## Notes

- `docs/specifications/Health_Monitor_Structure.md` is the spec.
- `docs/specifications/Health_Monitor_plan.md` is the plan.
- Use `toast` instead of `alert` for messages.
- After implementing a feature, update the plan file immediately.
