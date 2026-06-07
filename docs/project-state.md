# Health Monitor Project State

## Обзор

Health Monitor - личное Nuxt 4-приложение для отслеживания здоровья. В MVP поддерживаются глюкоза, давление, вес и симптомы, быстрый ввод, таблицы, фильтр периода, флаги `ignore` для некорректных записей и редактирование `note` у симптомов.

## Что уже сделано

- Поднят Nuxt 4-проект с TypeScript, Nuxt UI, Tailwind, Prisma и SQLite.
- Настроены ESLint и Prettier.
- Созданы Prisma schema, миграция и локальная база `prisma/dev.db`.
- Реализованы API для всех сущностей:
  - `GET` списки с `dateFrom` / `dateTo`
  - `POST` создание записей
  - `PATCH /:id/ignore` для глюкозы, давления и веса
  - `PATCH /:id` для `note` у симптомов
- Вынесена общая серверная логика диапазона дат в [`server/utils/date-range.ts`](C:\Users\nikbu\projects\health-monitor\server\utils\date-range.ts).
- Вынесена общая клиентская логика периода в [`app/composables/usePeriodFilter.ts`](C:\Users\nikbu\projects\health-monitor\app\composables\usePeriodFilter.ts).
- Вынесена общая логика загрузки списков с фильтром в [`app/composables/useMeasurementListPage.ts`](C:\Users\nikbu\projects\health-monitor\app\composables\useMeasurementListPage.ts).
- Вынесена общая шапка страниц с фильтром в [`app/components/HealthPageHeaderWithFilter.vue`](C:\Users\nikbu\projects\health-monitor\app\components\HealthPageHeaderWithFilter.vue).
- Добавлен компонент фильтра периода в [`app/components/PeriodFilter.vue`](C:\Users\nikbu\projects\health-monitor\app\components\PeriodFilter.vue):
  - 4 кнопки
  - custom-период в модальном окне
  - отображение custom-диапазона в формате `DD.MM.YY - DD.MM.YY`
- Подключён фильтр периода и общий header-компонент ко всем четырём страницам:
  - [`app/pages/glucose.vue`](C:\Users\nikbu\projects\health-monitor\app\pages\glucose.vue)
  - [`app/pages/blood-pressure.vue`](C:\Users\nikbu\projects\health-monitor\app\pages\blood-pressure.vue)
  - [`app/pages/weight.vue`](C:\Users\nikbu\projects\health-monitor\app\pages\weight.vue)
  - [`app/pages/symptoms.vue`](C:\Users\nikbu\projects\health-monitor\app\pages\symptoms.vue)
- Сделаны таблицы с ignore/restore для глюкозы, давления и веса, а для симптомов - inline-edit note.
- Обновлены спецификации в `docs/specifications`.

## Текущее состояние

- Рабочее дерево чистое.
- Последний коммит: `a36fc51` - `Extract shared page headers`.
- Локальные общие helpers уже вынесены, повторяющаяся логика заметно сокращена.
- Текущая архитектура страниц теперь строится вокруг:
  - общего period composable
  - общего list-page composable
  - общего header-компонента с slot для фильтра

## Важные решения

- Используется Nuxt 4 + Nuxt UI.
- Локальное хранилище - SQLite через Prisma.
- Для измерений глюкозы, давления и веса используется единый `ignore` на запись.
- Симптомы остаются статическим справочником в MVP.
- Дев-сервер держится на порту `3030`.
- Prisma Studio - на порту `5555`.

## Известные моменты

- В `docs/specifications` ещё может быть старый текст, который нужно сверять с текущей реализацией.
- Табличный UI уже приведён к общей схеме, но дальнейшая полировка возможна.

## Следующий шаг

- Начать серьёзный рефакторинг UI-слоя:
  - ещё сильнее сократить дубли в page-shell
  - проверить, можно ли унифицировать layout-карточки
  - решить, нужен ли общий компонент для повторяющихся table headers и action cells
