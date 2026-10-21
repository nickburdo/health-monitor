## План разработки

### Этап 1. Инициализация проекта

- [x] создать Nuxt 4 проект;
- [x] подключить TypeScript;
- [x] подключить Nuxt UI;
- [x] настроить Tailwind;
- [x] настроить ESLint / Prettier.

### Этап 2. База данных

- [x] установить Prisma;
- [x] настроить SQLite;
- [x] создать `schema.prisma`;
- [x] выполнить миграцию;
- [x] проверить базу через Prisma Studio.

### Этап 3. API

- [x] реализовать API для глюкозы;
- [x] реализовать API для давления;
- [x] реализовать API для веса;
- [x] реализовать API для симптомов;

### Этап 4. UI каркас

- [x] сделать layout;
- [x] сделать header;
- [x] добавить кнопку быстрого ввода;
- [x] сделать модальное окно для быстрого ввода;

### Этап 5. Формы

- [x] форма глюкозы;
- [x] форма давления;
- [x] форма веса;
- [x] форма симптома.

### Этап 6. Таблицы

- [x] таблица глюкозы;
- [x] таблица давления;
- [x] таблица веса;
- [x] таблица симптомов;

#### Таблица глюкозы

- [x] таблица глюкозы готова;
- `Игнорировать` открывает confirm dialog;
- в confirm dialog обязательно вводится `reason`;
- после подтверждения отправляется `PATCH /api/glucose/:id/ignore` с `ignore: true` и `reason`;
- `Восстановить` отправляется `PATCH /api/glucose/:id/ignore` без подтверждения с `ignore: false`;
- ignored-строки визуально приглушаются.

#### Таблица давления

- [x] таблица давления реализована;
- `Игнорировать` открывает confirm dialog;
- в confirm dialog обязательно вводится `reason`;
- после подтверждения отправляется `PATCH /api/blood-pressure/:id/ignore` с `ignore: true` и `reason`;
- `Восстановить` отправляется `PATCH /api/blood-pressure/:id/ignore` с `ignore: false` без подтверждения;
- строки с `ignore=true` визуально приглушаются.

#### Таблица веса

- [x] таблица веса реализована;
- `Игнорировать` открывает confirm dialog;
- в confirm dialog обязательно вводится `reason`;
- после подтверждения отправляется `PATCH /api/weight/:id/ignore` с `ignore: true` и `reason`;
- `Восстановить` отправляется `PATCH /api/weight/:id/ignore` с `ignore: false` без подтверждения;
- строки с `ignore=true` визуально приглушаются.

#### Таблица симптомов

- [x] таблица симптомов реализована;
- на странице `/symptoms` таблица показывает дату и время, симптом, балл и заметку;
- `Редактировать` переводит `notes` в режим редактирования;
- на мобильных ширина `notes` растягивается на весь ряд через `colspan`, а кнопки остаются в отдельной ячейке;
- данные сохраняются через `PATCH /api/symptoms/:id`;
- редактирование отменяется кнопками `Отмена` и `Esc`.

### Этап 7. Графики

- [x] график глюкозы через общий `HealthLineChart` на странице `/glucose`;
  - две линии: натощак и после еды;
  - использует те же данные, что и таблица;
  - без отдельного фильтра по датам;
- [x] график давления через общий `HealthLineChart`;
  - линии: систолическое и диастолическое давление;
  - использует те же данные, что и таблица;
  - без отдельного фильтра по датам;
- [x] график веса через общий `HealthLineChart`;
  - одна линия: вес;
  - использует те же данные, что и таблица;
  - без отдельного фильтра по датам;
- [ ] график симптомов (отложен; на dashboard используется отдельная frequency-панель).

### Этап 8. Dashboard

- [x] последние значения;
- [x] карточки;
- [x] графики;
  - glucose, pressure и weight через общий `HealthLineChart`;
  - symptoms через отдельную frequency-панель;
- [x] фильтры периода.
- [x] кнопки «Load demo data» и «Clear database» рядом с экспортом/импортом JSON.
  - справа в строке `DashboardDataActions`, с диалогом подтверждения `useConfirm` и toast; общий флаг `busy` блокирует Import JSON, Load demo data и Clear database, пока идёт любая из этих операций;
  - замена на демо и очистка работают в одной транзакции (`replaceWithDemoData`, `clearHealthMonitorData` в `seed.ts`); очистка в той же транзакции ставит флаг `demoSeeded`, поэтому база остаётся пустой после перезагрузки;
  - автосид только при первом открытии: флаг `demoSeeded` в новой таблице `meta` (схема `version(2)`); автосид повторно проверяет флаг и пустоту таблиц внутри транзакции и только добавляет записи, без `clear()`.

### Этап 9. Полировка

- пустые состояния;
- loading states;
- обработка ошибок;
- уведомления;
- адаптивность;
- [x] quick entry и note-поля теперь нормализуют значения до trim, поэтому создание записи не падает на нестроковом вводе.
- [x] ignore dialogs for glucose, blood pressure, and weight now require reason and send PATCH with `ignore: true`.
- [x] restore actions for glucose, blood pressure, and weight now run without confirmation and send PATCH with `ignore: false`.
- [x] period filter component now renders as four inline buttons, opens a modal for custom ranges, and is placed inside the main page title blocks with query filtering wired up for glucose, blood pressure, weight, and symptoms.
- [x] shared server helper now reads `dateFrom` and `dateTo` for all measurement list endpoints.
- [x] shared client helper now loads measurement lists with the period filter and removes repeated `useAsyncData` code from the four pages.
- [x] shared page header component now wraps the page title and filter slot for all measurement pages.
- [x] shared measurement page shell now wraps the repeated page grid and header/table structure for glucose, blood pressure, weight, and symptoms.
- [x] shared ignore/restore component now owns the buttons, confirm dialog, reason handling, direct restore action, and PATCH calls for glucose, blood pressure, and weight.
- [x] next chart work starts with a standalone glucose chart component on the `/glucose` page; dashboard charting will be added later.
- [x] page-specific measurement list types were extracted into `app/types` for blood pressure, weight, and symptoms to match the glucose type pattern.
- [x] shared line-chart props and per-page series/formatters were extracted into `app/utils/health-line-chart` for glucose and blood pressure.
- [x] shared line-chart props and per-page series/formatters were extracted into `app/utils/health-line-chart` for glucose, blood pressure, and weight.
- [x] dashboard now uses shared line charts for glucose, blood pressure, and weight, plus a separate symptom frequency panel and real latest-entry aggregation.
- [x] dashboard hero now shows the selected period in the title, the summary block keeps only pills, and the latest entries list uses localized statuses.
- [x] dashboard hero summary and metric grid were extracted into dedicated components; the summary list now uses a flex column with `justify-between` and no top margin.
- [x] dashboard data aggregation is now owned by dedicated dashboard components instead of a single page-level `dashboard` computed block.
- [x] dashboard symptoms block now renders a dedicated Russian bar chart with title `Симптомы` and the subtitle `Сколько раз симптомы были отмечены за выбранный период`.
- [x] dashboard symptom bars now sit at the bottom of the card when there are few symptom types.
- [x] dashboard symptom chart now accepts an optional `maxTypes` prop so the dashboard can cap the number of displayed symptom types without constraining future reuse.
- [x] `/symptoms` page now uses the shared symptom bar chart without a `maxTypes` limit, so all symptom types are shown there.
- [x] `DashboardSymptomsPanel` now accepts only a symptoms array, not the whole dashboard data object.
- [x] hidden auth modal now opens on logo double-click for guests, signs in with Supabase email/password, shows toast errors, and refreshes page data after sign in or sign out.
- [x] measurement page and dashboard SSR data loading now use request-aware fetch so Supabase auth cookies reach server API handlers.
- [x] weight API now resolves actor through `server/utils/auth.ts`, returns only `isDemo=true` rows to guests and only private rows to admin, and forces server-side `isDemo` on create/update flows.
- [x] glucose, blood pressure, and symptoms APIs now use the same actor resolution and server-side demo/private separation as weight.
- [x] auth modal now supports Google OAuth and `/auth/callback` completes the session exchange before redirecting back to `/`.
- [x] the app UI is now fully translated to English, including the dashboard, measurement pages, modals, filters, and toast copy.
- [x] dark theme: all UI colors (including chart series and the symptoms panel) now come from CSS tokens in `main.css`, a warm graphite palette overrides them in `:root.dark`, and a sun/moon `ThemeToggle` in the header switches light/dark via `useColorMode` (first visit follows the OS, the choice is saved in localStorage). Plan: `docs/plans/dark-theme-plan.md`.
- [x] mobile footer navigation accessibility: the footer is now a `<nav>` landmark, its icon-only links get `aria-label`/`title` with the section name, and the icons are `aria-hidden`; an empty `@media (max-width: 768px)` block was removed from `main.css`.
- [x] собственный диалог подтверждения (`ConfirmDialog` + `useConfirm`) вместо `window.confirm` для Import JSON, Load demo data и Clear database. План: `docs/plans/confirm-dialog-plan.md`.
  - `useConfirm().confirm({ title, message, confirmLabel, danger })` возвращает `Promise<boolean>`; состояние в `useState`, новый вызов при открытом диалоге отменяет предыдущий;
  - `ConfirmDialog` монтируется в `HealthShell`, собран на классах `.health-modal*` с узким вариантом `.health-modal-compact` (480px); Escape, клик по фону и крестик = Cancel; при открытии фокус на Cancel, после закрытия возвращается на кнопку-открыватель; при уходе со страницы открытый диалог отменяется;
  - красная кнопка `.health-button-danger` на токенах `--danger` / `--on-danger` (обе темы); `.health-modal-buttons` прижаты вправо через `margin-left: auto`;
  - правило «подтверждения через `useConfirm`, не `window.confirm`» добавлено в `CLAUDE.md`; focus trap для всех модалок вынесен в бэклог.
