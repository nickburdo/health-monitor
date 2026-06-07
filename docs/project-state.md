# Health Monitor Handoff

## Overview

Health Monitor is a personal Nuxt 4 app for tracking health. MVP covers glucose, blood pressure, weight, symptoms, quick entry, tables, period filtering, `ignore` flags for invalid measurements, and note editing for symptoms.

## Current State

- Working tree is not clean; there are local edits in the dashboard area.
- Latest commit: `7d0084c` - `Build dashboard overview`.
- Shared helpers already exist for date ranges, period filtering, measurement list loading, page headers, ignore/restore actions, and date formatting.
- `HealthLineChart` powers glucose, blood pressure, weight, and the dashboard charts.
- Dashboard now shows summary cards, three compact line charts, a symptom frequency panel, and a localized latest-entries list.
- The separate symptom line chart is still deferred.

## Important Decisions

- Use Nuxt 4 plus Nuxt UI.
- Keep SQLite as the local store through Prisma.
- Use a single `ignore` flag for glucose, blood pressure, and weight records.
- Keep symptoms as a static predefined list in MVP.
- Keep the dev server on port `3030`.
- Keep Prisma Studio on port `5555`.

## Next Step

- Decide whether the deferred symptom visualization should become a dedicated line chart, bar chart, or heatmap.

## Notes

- `docs/specifications/Health_Monitor_Structure.md` is the spec.
- `docs/specifications/Health_Monitor_plan.md` is the plan.
- Use `toast` instead of `alert` for messages.
- After implementing a feature, update the plan file immediately.
