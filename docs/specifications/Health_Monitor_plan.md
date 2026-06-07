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
