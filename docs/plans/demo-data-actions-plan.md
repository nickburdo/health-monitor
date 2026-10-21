# Кнопки «Load demo data» и «Clear database» на дашборде — план реализации

> **Статус:** ✅ Одобрен пользователем 2026-10-21.
>
> **Для агентов-исполнителей:** используйте superpowers:executing-plans для выполнения плана задача за задачей. Шаги используют синтаксис чекбоксов (`- [ ]`). **Без TDD**: автоматические тесты не пишутся, если явно не попросили. Не проверяйте UI-изменения в настоящем браузере, если пользователь явно не попросил — вместо этого опишите, что должен проверить разработчик вручную.
>
> **Контрольная точка после каждой задачи (обязательно):** после выполнения задачи остановиться, кратко отчитаться и ждать явного подтверждения пользователя, прежде чем начинать следующую.

**Цель:** На дашборде, в строке с кнопками «Export JSON» / «Import JSON», по правому краю добавить две кнопки: «Load demo data» (заменить все данные демо-данными) и «Clear database» (удалить все записи).

**Архитектура:** Логика работы с БД остаётся в `app/lib/db/`: в `seed.ts` появляются функции замены базы демо-данными и очистки базы, обе работают в одной транзакции Dexie. Чтобы после очистки и перезагрузки автосид не заливал демо снова, в схему добавляется таблица `meta` с флагом «демо уже записывались». Кнопки живут в существующем компоненте `DashboardDataActions.vue`.

**Технологии:** Nuxt 4 (только клиент), Dexie (`version(2)`, `transaction`), `useToast`. Новых зависимостей нет.

## Решения пользователя

- **«Load demo data» заменяет всё:** очищает 4 таблицы и записывает `public/data/demo.json` в одной транзакции.
- **Автосид только при самом первом открытии:** флаг хранится в IndexedDB, в новой таблице `meta`. После «Clear database» база остаётся пустой и после перезагрузки.
- **Подтверждение через `window.confirm`**, как у Import JSON. После действия показывается toast и обновляется дашборд.
- **Ветка:** `feat/demo-data-actions` от актуального `main`.

## Открытые предложения (одобряются вместе с планом)

1. **Таблица `meta`:** `meta: 'key'`, строки вида `{ key: string; value: unknown }`. Флаг: `{ key: 'demoSeeded', value: true }`. Тип `MetaEntry` — в `app/types/meta.ts`.
2. **Правило автосида с флагом** (`seedDemoDataIfEmpty`):
   - флаг есть → ничего не делать;
   - флага нет и база пустая → записать демо и поставить флаг;
   - флага нет и база не пустая (пользователи, у которых данные были до этой версии) → только поставить флаг.
3. **Автосид тоже пишет в одной транзакции** (заодно закрывает вариант 1 из обсуждения: частичный сид больше невозможен). Запись демо и флага делается одной общей функцией, её же использует «Load demo data».
4. **Export/Import JSON не трогают `meta`:** формат экспорта `version: 1` не меняется, импорт заменяет только 4 таблицы.
5. **Обе новые кнопки — `health-button-secondary health-button-small`**, как соседние. Красную «danger»-кнопку для очистки не делаем (можно отдельной задачей).
6. **Раскладка:** `.health-dashboard-data-actions` становится flex-строкой с `justify-content: space-between` и `flex-wrap: wrap`; внутри две группы — слева Export/Import, справа Load demo/Clear. На узком экране правая группа переносится на новую строку.
7. **Событие компонента** `imported` переименовывается в `changed`, потому что теперь его шлют три действия. В `pages/index.vue` — `@changed="refresh"`.
8. **Тексты:**
   - Load demo — confirm: `Loading demo data will replace all local data. Continue?`; toast: `Demo data loaded`.
   - Clear — confirm: `This will permanently delete all local data. Continue?`; toast: `Database cleared`.
   - Ошибки — toast `color: 'error'` с текстом ошибки, как у импорта.

---

### Задача 0: Ветка и документация

- [x] Создать ветку `feat/demo-data-actions` от актуального `main`.
- [x] Создать этот файл плана.
- [x] Добавить пункт `[ ]` в `docs/plans/next-update.md` (Step 2).
- [x] Добавить пункт `[ ]` в `docs/specifications/Health_Monitor_plan.md` (Этап 8. Dashboard).

### Задача 1: Таблица `meta` в схеме

**Файлы:** Создать: `app/types/meta.ts`. Изменить: `app/lib/db/schema.ts`

- [x] Создать тип `MetaEntry = { key: string; value: unknown }`.
- [x] Добавить в `HealthMonitorDatabase` поле `meta!: Table<MetaEntry, string>`.
- [x] Добавить `this.version(2).stores({ meta: 'key' })`, `version(1)` не трогать.

### Задача 2: Функции сида и очистки в `seed.ts`

**Файлы:** Изменить: `app/lib/db/seed.ts`

- [x] Вынести построение записей из `demoData` в функцию `buildDemoRecords(demoData)`.
- [x] Добавить `replaceWithDemoData()`: загружает `/data/demo.json`, в одной транзакции по 5 таблицам очищает 4 таблицы данных, записывает демо и ставит флаг `demoSeeded`.
- [x] Добавить `clearHealthMonitorData()`: в одной транзакции очищает 4 таблицы данных, `meta` не трогает.
- [x] Переписать `seedDemoDataIfEmpty()` по правилу из предложения 2; запись демо — через `replaceWithDemoData()`.

### Задача 3: Кнопки в `DashboardDataActions.vue`

**Файлы:** Изменить: `app/components/DashboardDataActions.vue`, `app/pages/index.vue`

- [x] Переименовать событие `imported` → `changed`, обновить `emit` в импорте и обработчик в `pages/index.vue`.
- [x] Добавить обработчик `loadDemoData()`: confirm → `replaceWithDemoData()` → toast → `emit('changed')`; ошибки → toast с `color: 'error'`; флаг `busy` блокирует кнопку на время операции.
- [x] Добавить обработчик `clearData()` по той же схеме с `clearHealthMonitorData()`.
- [x] В шаблоне обернуть кнопки в две группы: левая — Export/Import, правая — Load demo data/Clear database.

### Задача 4: Стили раскладки

**Файлы:** Изменить: `app/assets/css/main.css`

- [x] Добавить `.health-dashboard-data-actions` (flex, `justify-content: space-between`, `flex-wrap: wrap`, `gap`).
- [x] Добавить блоку `grid-column: 1 / -1`, чтобы строка занимала всю ширину двухколоночной сетки `.health-hero` (ревизия плана, одобрена пользователем 2026-10-21).
- [x] Добавить класс группы `.health-dashboard-data-actions-group` (flex, `gap`). Цветовые литералы не используются.

### Задача 5: Проверка и завершение

- [x] `npm run lint` и `npm run typecheck`.
- [x] Описать, что разработчик проверяет вручную: первый запуск на чистой базе (демо появилось), Clear → перезагрузка (база пустая), Load demo → данные заменены, отмена confirm ничего не меняет, раскладка на узком экране, обе темы.
- [x] Отметить выполнение в `docs/specifications/Health_Monitor_plan.md` и `docs/plans/next-update.md` (скилл finish-task).

### Задача 6: Правки по код-ревью (ревизия плана, одобрена пользователем 2026-10-21)

**Файлы:** Изменить: `app/components/DashboardDataActions.vue`, `app/lib/db/seed.ts`, `docs/specifications/Health_Monitor_BACKLOG.md`

- [x] Один общий флаг `busy` вместо `importing` + `busy`: пока идёт импорт, загрузка демо или очистка, заблокированы Import JSON, Load demo data и Clear database (текст «Importing…» остаётся у кнопки импорта).
- [x] `clearHealthMonitorData()` ставит флаг `demoSeeded` в той же транзакции (транзакция расширяется на `meta`).
- [x] Автосид без `clear()`: `seedDemoDataIfEmpty()` повторно проверяет флаг и пустоту таблиц внутри транзакции и только добавляет записи; `clear()` остаётся только у `replaceWithDemoData()` (кнопка). Общая запись демо-записей и флага — функция `writeDemoRecords(records)`.
- [x] В бэклог («Технический долг»): общий список таблиц данных для seed/export/import; место для `clearHealthMonitorData`; обработка `versionchange` / `blocked` в Dexie; старт приложения при ошибке загрузки `demo.json`. В «Улучшения интерфейса»: свой диалог подтверждения вместо `window.confirm`.
