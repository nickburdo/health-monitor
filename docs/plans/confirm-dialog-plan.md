# Диалог подтверждения вместо `window.confirm` — план реализации

> **Статус:** ✅ Одобрен пользователем 2026-10-21
>
> **Для агентов-исполнителей:** используйте superpowers:executing-plans для выполнения плана задача за задачей. Шаги используют синтаксис чекбоксов (`- [ ]`). **Без TDD**: автоматические тесты не пишутся, если явно не попросили. Код-ревью и проверку в браузере (если затронут UI) выполняет скилл finish-task в последней задаче.
>
> **Контрольная точка после каждой задачи (обязательно):** после выполнения задачи остановиться, кратко отчитаться и ждать явного подтверждения пользователя, прежде чем начинать следующую.

**Цель:** системные окна `window.confirm` на дашборде (Import JSON, Load demo data, Clear database) заменяются собственным диалогом подтверждения в стиле приложения, который работает в светлой и тёмной теме.

**Архитектура:** один экземпляр `ConfirmDialog.vue` монтируется в `HealthShell`. Композабл `useConfirm()` хранит состояние диалога и возвращает функцию `confirm(options): Promise<boolean>`, поэтому вызовы в `DashboardDataActions.vue` меняются почти один-в-один (`await confirm({...})` вместо `window.confirm(...)`). Разметка диалога переиспользует существующие классы `.health-modal*`; для узкого окна и красной кнопки добавляются новые классы и токены в `main.css`.

**Технологии:** Vue 3 / Nuxt 4 (`useState`), существующие CSS-классы и токены. Новых зависимостей нет.

## Решения пользователя

- **Архитектура:** переиспользуемый компонент `ConfirmDialog.vue` + композабл `useConfirm()`, возвращающий `Promise<boolean>`; один экземпляр в `HealthShell`.
- **Кнопка подтверждения:** красная danger-кнопка (новый класс `.health-button-danger` на токенах `--danger`) для всех трёх диалогов.
- **Тексты:** конкретные. Кнопки: `Cancel` + действие. Заголовок — название действия, текст — текущая формулировка без «Continue?».
- **Место в планах:** `docs/plans/next-update.md` Step 2, пункт 4; `docs/specifications/Health_Monitor_plan.md`, Этап 9 «Полировка».
- **Ветка:** `feat/confirm-dialog` от актуального `main`.

## Открытые предложения (одобряются вместе с планом)

1. **Состояние через `useState`:** композабл хранит `{ open, options, resolve }` в `useState('confirm-dialog')` — идиоматичный для Nuxt общий стейт. Если `confirm()` вызван, пока диалог уже открыт, предыдущий промис резолвится `false`.
2. **Поведение закрытия:** Escape, клик по фону и крестик = `Cancel` (резолв `false`), как в существующих модалках.
3. **Фокус:** при открытии фокус ставится на кнопку `Cancel` (безопасный вариант для разрушительных действий: случайный Enter не удаляет данные). После закрытия фокус возвращается на элемент, который был активен до открытия.
4. **Ширина:** модификатор `.health-modal-compact` (`width: min(480px, 100%)`), чтобы короткий диалог не растягивался на 920px как quick entry.
5. **Новый токен `--on-danger`:** цвет текста на красной кнопке. Светлая тема — `#ffffff` (на `#dc2626`), тёмная — тёмный текст (например `#1f1111`), потому что `--danger` в тёмной теме светлый `#f87171` и белый текст на нём нечитаем.
6. **Тексты диалогов:**
   - Import: title `Import data`, message `Importing will replace all local data with the contents of this file.`, кнопка `Replace data`.
   - Demo: title `Load demo data`, message `Loading demo data will replace all local data.`, кнопка `Load demo data`.
   - Clear: title `Clear database`, message `This will permanently delete all local data.`, кнопка `Delete all data`.
7. **Eyebrow:** над заголовком `Confirm action`, как `health-eyebrow` в других модалках.
8. **Вне объёма:** `MeasurementIgnoreControls` (у него свой диалог с вводом reason) не переводится на `useConfirm`.

---

### Задача 0: Ветка и документация

- [x] Создать ветку `feat/confirm-dialog` от актуального `main`.
- [x] Создать этот файл плана.
- [x] Добавить пункт `[ ]` в `docs/plans/next-update.md`.
- [x] Добавить пункт `[ ]` в `docs/specifications/Health_Monitor_plan.md` (Этап 9. Полировка).

### Задача 1: Стили

**Файлы:** Изменить: `app/assets/css/main.css`

- [x] Добавить токен `--on-danger` в `:root` (светлая тема).
- [x] Добавить токен `--on-danger` в `:root.dark` (тёмная тема).
- [x] Добавить класс `.health-button-danger` (фон `var(--danger)`, текст `var(--on-danger)`, без цветных литералов).
- [x] Добавить модификатор `.health-modal-compact` (`width: min(480px, 100%)`).
- [x] (Ревизия 2026-10-21, одобрена пользователем) `.health-modal-buttons { margin-left: auto; }`, чтобы кнопки стояли справа, когда в `.health-modal-actions` нет пояснения слева.
- [x] Проверить, что мобильные правила `.health-modal` / `.health-modal-buttons` в медиазапросе корректно применяются к компактному варианту (без новых правил, если всё работает).

### Задача 2: Композабл `useConfirm`

**Файлы:** Создать: `app/composables/useConfirm.ts`

- [x] Описать тип `ConfirmOptions` (`title`, `message`, `confirmLabel`, `cancelLabel?` = `Cancel`, `danger?`).
- [x] Хранить состояние диалога в `useState('confirm-dialog')`: `open`, `options`, `resolve`.
- [x] Функция `confirm(options): Promise<boolean>`: если диалог уже открыт — резолвит предыдущий промис `false`; открывает диалог с новыми опциями.
- [x] Функции `accept()` и `cancel()`: резолвят промис `true` / `false` и закрывают диалог.
- [x] Вернуть из композабла `{ state, confirm, accept, cancel }`.

### Задача 3: Компонент `ConfirmDialog.vue`

**Файлы:** Создать: `app/components/ConfirmDialog.vue`

- [x] Разметка через `Teleport to="body"` и классы `.health-modal-backdrop`, `.health-modal health-modal-compact`, `.health-modal-header`, `.health-modal-actions`, `.health-modal-buttons`.
- [x] `role="alertdialog"`, `aria-modal="true"`, `aria-labelledby` на заголовок, `aria-describedby` на текст.
- [x] Eyebrow `Confirm action`, заголовок `options.title`, текст `options.message` (`.health-modal-lead`), крестик `.health-modal-close`.
- [x] Кнопки: `Cancel` (`.health-button health-button-secondary`) и подтверждение (`.health-button` + `.health-button-danger`, если `danger`).
- [x] Закрытие по Escape (слушатель `keydown` только пока диалог открыт), по клику на фон и по крестику → `cancel()`.
- [x] При открытии запомнить `document.activeElement` и поставить фокус на `Cancel`; при закрытии вернуть фокус.

### Задача 4: Подключение в `HealthShell`

**Файлы:** Изменить: `app/components/HealthShell.vue`

- [x] Добавить `<ConfirmDialog />` в шаблон рядом с `HealthQuickEntryModal`.

### Задача 5: Замена `window.confirm` в `DashboardDataActions`

**Файлы:** Изменить: `app/components/DashboardDataActions.vue`

- [x] Получить `confirm` из `useConfirm()`.
- [x] `handleFileChange`: заменить `window.confirm` на `await confirm({...})` с текстами из предложения 6; при отмене по-прежнему сбрасывать `input.value`.
- [x] `loadDemoData`: заменить `window.confirm` на `await confirm({...})`.
- [x] `clearData`: заменить `window.confirm` на `await confirm({...})`.
- [x] Убедиться поиском, что в `app/` не осталось `window.confirm`.

### Задача 6: Документация

**Файлы:** Изменить: `CLAUDE.md`, `docs/specifications/Health_Monitor_plan.md`

- [x] В `CLAUDE.md` (раздел Conventions) добавить правило: подтверждения — через `useConfirm()`, не `window.confirm`.
- [x] В Этапе 8 `Health_Monitor_plan.md` в описании кнопок данных заменить упоминание `window.confirm` на диалог `useConfirm`.

### Задача 7: Исправления по код-ревью (ревизия 2026-10-21, одобрена пользователем)

**Файлы:** Изменить: `app/components/ConfirmDialog.vue`, `docs/specifications/Health_Monitor_BACKLOG.md`

- [x] В `onBeforeUnmount` закрывать открытый диалог как Cancel, чтобы он не переезжал на следующую страницу при навигации.
- [x] Добавить `immediate: true` в `watch` открытия, чтобы Escape и фокус на Cancel работали, если компонент монтируется при уже открытом диалоге.
- [x] Добавить в бэклог пункт «удержание фокуса (focus trap) во всех модальных окнах».

### Задача 8: Проверка и завершение

Выполняется скиллом finish-task один раз, после всех задач плана.

- [x] `npm run lint` и `npm run typecheck`.
- [x] Код-ревью изменений ветки (отдельный субагент); найденное разобрать с пользователем: исправить, в бэклог или отклонить.
- [x] Проверка в браузере агентом browser-checker по сценариям: каждый из трёх диалогов открывается с правильными текстами; Cancel, Escape, клик по фону и крестик ничего не меняют в данных; подтверждение выполняет действие и показывает toast; отмена импорта позволяет снова выбрать тот же файл; фокус на Cancel при открытии; красная кнопка читаема в светлой и тёмной теме; узкий экран (375px) и десктоп; нет ошибок в консоли.
- [x] Отметить выполнение в `docs/specifications/Health_Monitor_plan.md` и `docs/plans/next-update.md`.
