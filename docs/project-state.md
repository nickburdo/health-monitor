# Health Monitor Handoff

## Overview

Health Monitor is a personal Nuxt 4 app for tracking health. MVP covers glucose, blood pressure, weight, symptoms, quick entry, tables, period filtering, `ignore` flags for invalid measurements, and note editing for symptoms.

## Current State

- Working tree is not clean; there are local edits in the dashboard area.
- Latest commit: `c03307e` - `Add symptom chart to symptoms page`.
- Shared helpers already exist for date ranges, period filtering, measurement list loading, page headers, ignore/restore actions, and date formatting.
- `HealthLineChart` powers glucose, blood pressure, weight, and the dashboard charts.
- Dashboard now shows summary cards, three compact line charts, a dedicated symptom bar chart, and a localized latest-entries list.
- Dashboard data aggregation has been pushed down into dedicated dashboard components (`DashboardSummaryPanel`, `DashboardMetricsGrid`, `DashboardSymptomsPanel`, `DashboardLatestEntries`).
- Dashboard period filtering now refreshes data explicitly on query changes.
- Dashboard symptom card now keeps its header compact when only a few symptom types are present.
- Dashboard symptom bars are aligned to the bottom of the card when the content is short.
- Dashboard symptom chart accepts an optional `maxTypes` prop; the dashboard uses it to cap the rendered symptom types at five.
- Dashboard symptom cap explicitly keeps the most frequent types, not just the first N items.
- The separate symptom line chart remains deferred; dashboard symptoms are now shown as a bar chart.
- The `/symptoms` page now reuses the same symptom bar chart without a `maxTypes` limit.
- `DashboardSymptomsPanel` takes only a `symptoms` array now, so it can be reused without dashboard-specific wrappers.

## Important Decisions

- Use Nuxt 4 plus Nuxt UI.
- Keep SQLite as the local store through Prisma.
- Use a single `ignore` flag for glucose, blood pressure, and weight records.
- Keep symptoms as a static predefined list in MVP.
- Keep the dev server on port `3030`.
- Keep Prisma Studio on port `5555`.

## Next Step

- Decide whether the deferred symptom visualization should also be added to the standalone `/symptoms` page, or stay dashboard-only for now.

## Notes

- `docs/specifications/Health_Monitor_Structure.md` is the spec.
- `docs/specifications/Health_Monitor_plan.md` is the plan.
- Use `toast` instead of `alert` for messages.
- After implementing a feature, update the plan file immediately.
