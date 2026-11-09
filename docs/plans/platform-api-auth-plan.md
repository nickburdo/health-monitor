# Переход на Platform API и авторизация — план реализации

> **Статус:** ✅ Одобрен пользователем 2026-11-09. Ревизия 1 (удаление аккаунта, задача 8) — ✅ одобрена 2026-11-09. Ревизия 2 (исправления по итогам проверки, задача 9) — ✅ одобрена 2026-11-09.
>
> **Для агентов-исполнителей:** используйте superpowers:executing-plans для выполнения плана задача за задачей. Шаги используют синтаксис чекбоксов (`- [ ]`). **Без TDD**: автоматические тесты не пишутся, если явно не попросили. Код-ревью и проверку в браузере (если затронут UI) выполняет скилл finish-task в последней задаче.
>
> **Остановки (обязательно):** задачи выполняются подряд. Остановиться, кратко отчитаться и ждать явного подтверждения пользователя только: (1) после задачи с пометкой `**Остановка:** да` (логика приложения, данные, хуки и другие рискованные изменения); (2) при отступлении от плана или открытом вопросе — до того, как продолжать; (3) перед необратимым шагом (коммит, пуш, PR, удаление). Перед коммитом останавливается finish-task.

**Цель:** Приложение берёт и пишет данные через внешний Platform API вместо IndexedDB. Гость видит демо-данные и ничего не меняет; в шапке кнопка Sign in открывает модальное окно входа (логин/пароль, Google, ссылка на регистрацию); вошедший пользователь видит и меняет только свои данные.

**Архитектура:**

- Весь обмен с API — в новом каталоге `app/lib/api/`: `client.ts` (экземпляр `$fetch.create` с `baseURL` из `runtimeConfig.public.apiBase`, заголовок `Authorization`, распаковка `{ data }`, ошибки в `ApiError`), модули сущностей (`glucose.ts`, `blood-pressure.ts`, `weight.ts`, `symptoms.ts`, `dashboard.ts`) и `auth.ts`. Компоненты и страницы импортируют только эти модули — так же, как раньше репозитории.
- Состояние входа — composable `app/composables/useAuth.ts` (`useState`: токен, пользователь, флаги модалок) и клиентский плагин `app/plugins/auth.client.ts`, который при старте читает токен из `localStorage` и загружает пользователя `GET /auth/me`.
- UI входа: `AuthModal.vue` (вход / регистрация, кнопка Google), `GuestPrompt.vue` (призыв войти для гостя), меню пользователя в `HealthShell.vue`, страница `app/pages/auth/callback.vue` для возврата из Google.
- После входа, регистрации, выхода и протухшего токена приложение перезагружается `reloadNuxtApp` — тот же приём, что уже используется после быстрого ввода: все списки заново загружаются в нужном режиме (гость / пользователь).
- `app/lib/db/`, автосид, демо-файл, Dexie и кнопки работы с базой на дашборде удаляются.

**Технологии:** Nuxt 4 `runtimeConfig.public` и `$fetch.create` (ofetch, сверено с документацией Nuxt: рецепт «Custom $fetch instance» — `baseURL`, `onRequest` с заголовком `Authorization`, `onResponseError` для 401), `localStorage` / `sessionStorage`, `crypto.randomUUID`, Nuxt UI (`UModal`/`UDropdownMenu` уже используются). Новых зависимостей нет; зависимость `dexie` удаляется.

## Решения пользователя

- **Источник данных:** только внешний API (`https://platform-api.nick-burdo.workers.dev`); IndexedDB и всё, что с ней связано, удаляется. Данные, которые остались у пользователей в IndexedDB, игнорируются (не переносятся и не удаляются) — приложение портфолио.
- **Sign in в шапке:** модальное окно с формой входа (логин, пароль), кнопкой входа через Google и ссылкой на форму регистрации. Регистрация — логин и пароль; после регистрации пользователь сразу авторизован.
- **Данные:** гостю — демо-данные, авторизованному — только его данные (разделяет API).
- **Add entry:** гостю — всплывающее окно с призывом авторизоваться и объяснением, кому что показывают, с отдельным упоминанием, что при регистрации email не используется; пользователю — обычный ввод через API.
- **Гость:** все контролы изменения / игнорирования (Ignore, Restore, редактирование заметки симптома) задизейблены.
- **Дашборд:** кнопки Export JSON, Import JSON, Load demo data, Clear database убираются.
- **Шапка вошедшего пользователя:** имя пользователя и меню с пунктами Sign out и Delete account. Привязка Google и установка пароля не делаются (в бэклог).
- **Удаление аккаунта (ревизия 1, 2026-11-09):** вошедший пользователь может удалить свой аккаунт; API удаляет и все его данные. Перед удалением — подтверждение вводом имени пользователя в отдельном диалоге.
- **Google на превью веток:** ограничение принимается. Allowlist API содержит только `https://health-monitor-new.pages.dev` и localhost, поэтому Google проверяется на localhost и после мержа в `main`; на превью работает вход по логину и паролю.
- **Ignore для симптомов:** не добавляем, поведение симптомов как сейчас (только заметка); в бэклог.
- **Ветка:** `feat/platform-api-auth` от актуального `main`.

## Открытые предложения (одобряются вместе с планом)

1. **Адрес API:** `runtimeConfig.public.apiBase` со значением по умолчанию `https://platform-api.nick-burdo.workers.dev`; для локального API — переменная `NUXT_PUBLIC_API_BASE=http://localhost:8787`. При `npm run generate` значение вшивается в сборку на этапе сборки.
2. **Хранение токена:** `localStorage`, ключ `health-monitor-token` (токен живёт 30 дней, вход должен переживать перезагрузку). Nonce Google — `sessionStorage`, ключ `googleNonce`, как в `frontend-guide.md`.
3. **Типы под формат API:** поле `ignore` переименовывается в `ignored` во всех типах и компонентах (≈30 мест), `reason: string`, добавляется `updatedAt`; давление, вес и интенсивность симптома становятся `number` (в API они обязательны); у `SymptomEntry` появляются `ignored`/`reason`/`updatedAt` (в UI не показываются). Альтернатива — переводить поля в `app/lib/api/`, но тогда типы расходятся с API, предлагаю переименовать.
4. **Быстрый ввод под правила API:**
   - давление: обязательны все три поля (систолическое, диастолическое, пульс); сейчас достаточно одного — toast `Enter systolic, diastolic and pulse`;
   - симптом: интенсивность обязательна, целое 1–10 — toast `Intensity must be a whole number from 1 to 10`;
   - в тело запроса не попадают пустые ключи и `null` (API отвергает лишние ключи и `null` в `note`);
   - проверка глюкозы `> 30 mmol/L` остаётся, константа `MAX_GLUCOSE_MMOL_L` переезжает в `app/constants/glucose.ts`.
5. **Заметка симптома:** пустая заметка отправляется как `note: ""` (API принимает только строку).
6. **Дашборд одним запросом:** `GET /dashboard?date_from&date_to` вместо четырёх списков; ответ переводится в существующий `DashboardData` (`glucoseMeasurements` → `glucose` и т. д.). Сортировка по дате по убыванию — на клиенте, если API не гарантирует порядок (проверить на живых данных в задаче 3).
7. **Ошибки API:** `ApiError { status, message, details }`; в toast — `message` и первые сообщения из `details`. Ошибка загрузки списка (нет сети, 5xx) — toast `Could not load data`, страница показывает пустое состояние и не падает.
8. **Две разные 401:**
   - `Authentication required` (гость пишет) → открыть `GuestPrompt`, без toast-ошибки;
   - `Invalid or expired token` → удалить токен, показать toast `Your session has expired. Sign in again.` (через `sessionStorage`-флаг, чтобы toast пережил перезагрузку) и перезагрузить приложение гостем.
   - На `POST /auth/register` и `POST /auth/login` заголовок `Authorization` не отправляется никогда.
9. **Тексты окон (английский, как весь UI):**
   - `GuestPrompt`: заголовок `Sign in to add your own data`; текст: `Guests see demo data and can't change it. After you sign in, you see and edit only your own entries — the demo data is hidden.` и отдельной строкой `Registration asks only for a username and password — we never ask for your email.`; кнопки `Sign in`, `Create account`, `Cancel`.
   - Регистрация, рядом с паролем: `We don't ask for an email, so we can't reset your password. If you forget it, your account is lost. Signing in with Google is more reliable.`; под формой: `One account works in Health Monitor and Job Tracker.`
   - Ошибки: `409` → `This username is taken` у поля имени; `401 Invalid credentials` → `Wrong username or password. If you signed up with Google, use the Google button.`; `400` → сообщения полей из `details`.
   - Правила полей в форме регистрации: имя 3–32 символа `[A-Za-z0-9_-]`, пароль 8–128 (атрибуты `minlength`/`maxlength`/`pattern`).
10. **Google:** кнопка `Continue with Google` — обычный переход `location.href` на `<apiBase>/auth/google?redirect=<origin>/auth/callback?n=<nonce>`. Страница `/auth/callback` делает всё по `frontend-guide.md` п. 9–10: читает фрагмент и `n`, сразу чистит адрес `history.replaceState`, сверяет и удаляет nonce, при совпадении сохраняет токен и перезагружает приложение на `/`; ошибки `access_denied` → `Sign-in was cancelled.`, `google_failed` и прочие → `Google sign-in failed. Please try again.`; несовпадение nonce → `Sign-in could not be completed, please try again.` без смены текущей сессии. После callback пользователь всегда попадает на дашборд (возврат на исходную страницу не делаем).
11. **Задизейбленные контролы гостя:** кнопки Ignore/Restore и редактирование заметки симптома получают `disabled` и `title="Sign in to change entries"`. Кнопка Add entry у гостя остаётся активной и открывает `GuestPrompt`. CSV-экспорт на страницах сущностей остаётся для всех (работает по загруженным данным); `csv.ts` переезжает в `app/utils/csv.ts`.
12. **Меню пользователя:** справа в `.health-actions` вместо `Sign in` — `UDropdownMenu`, триггер: иконка `i-lucide-user` + имя; пункт `Sign out` (удалить токен, перезагрузить гостем). Стили — классы `.health-*` и токены, как у меню страниц.
13. **Пока загружается `GET /auth/me`** при старте, плагин ждёт ответа до монтирования страниц, чтобы не было мигания «гость → пользователь» и двойной загрузки данных. Если `/auth/me` упал по сети (не 401) — токен сохраняется, приложение стартует, toast `Could not reach the server`.
14. **Маршрут `/auth/callback` на Cloudflare Pages:** открывается так же, как прямые ссылки на `/glucose` (SPA). В задаче 6 проверить прямой заход на `/auth/callback` в `npm run generate`-сборке; если не открывается — остановиться и обсудить.
15. **Удаление аккаунта (ревизия 1):**
    - пункт `Delete account` в меню пользователя (под `Sign out`, красный текст через токен `--danger`) открывает `DeleteAccountDialog.vue`;
    - диалог на классах `.health-modal*` / `.health-modal-compact`, заголовок `Delete your account?`, текст: `This permanently deletes your account and all its data in both apps — Health Monitor and Job Tracker. This cannot be undone, and the account cannot be recovered.`;
    - поле `Type your username to confirm` (`<username>` в подсказке); красная кнопка `Delete account` (`.health-button-danger`) активна только при точном совпадении с именем; `Cancel`, Escape и клик по фону закрывают диалог;
    - запрос `DELETE /auth/me`; на время запроса кнопки заблокированы; на `204` — удалить токен, флаг в `sessionStorage` для toast `Your account has been deleted` после перезагрузки, `reloadNuxtApp` гостем;
    - ошибка (сеть, 5xx) — сообщение в диалоге, аккаунт остаётся; повтор запроса безопасен (API дочищает данные);
    - `401 Invalid or expired token` обрабатывает клиент API как обычно.

---

### Задача 0: Ветка и документация

- [x] Создать ветку `feat/platform-api-auth` от актуального `main`.
- [x] Создать этот файл плана.
- [x] Добавить пункт `[ ]` в `docs/plans/next-update.md` (новый Step 3).
- [x] Добавить пункт `[ ]` в `docs/specifications/Health_Monitor_plan.md` (Этап 3. API).
- Пункты бэклога: «Авторизация» — удалить (сделано); «Технический долг»: «Выборка списков по индексу дат», «Общий список таблиц данных», «Место для операций над всей базой», «Обновление схемы при открытых старых вкладках», «Старт приложения при ошибке загрузки демо-данных» — удалить (IndexedDB больше нет); «Скиллы → `db-schema-change`» — удалить; «Бэкап данных» — сузить (ручной экспорт базы убран вместе с JSON). Шаги — в задаче 1.

### Задача 1: Документация до кода

**Файлы:** Изменить: `docs/specifications/Health_Monitor_Structure.md`, `CLAUDE.md`, `README.md`, `docs/deploy_plan.md`, `docs/specifications/Health_Monitor_BACKLOG.md`
**Зачем:** документация описывает новую архитектуру до реализации (ADR-005), а правила `CLAUDE.md` про Dexie и экспорт иначе будут вводить агентов в заблуждение.

- [x] `Health_Monitor_Structure.md`: переписать «Стек» (без Dexie, с Platform API), «Структура проекта» (`app/lib/api/`, `useAuth`, `auth.client.ts`, `pages/auth/callback.vue`, `AuthModal`, `GuestPrompt`; без `lib/db`, `seed-demo-data`, `DashboardDataActions`, `public/data`, `scripts`).
- [x] `Health_Monitor_Structure.md`: раздел «Слой данных» заменить на «Работа с API»: клиент, модули сущностей, формат `date_from`/`date_to`, распаковка `data`, `ApiError`, две разные 401.
- [x] `Health_Monitor_Structure.md`: новый раздел «Авторизация»: три состояния посетителя, хранение токена, вход/регистрация/выход, Google с nonce, гостевые ограничения, `GuestPrompt`.
- [x] `Health_Monitor_Structure.md`: обновить Dashboard (без кнопок базы), Header (Sign in / меню пользователя), «Быстрый ввод» (обязательные поля), «Общие TypeScript-типы» (`ignored`, `updatedAt`), «Загрузка данных».
- [x] `CLAUDE.md`: описание приложения и «Architecture» — данные в Platform API, без IndexedDB; убрать правила про `schema.ts`, `this.version(n)`, `glucose-units.ts`, JSON export, demo auto-seed и команду `demo:generate`.
- [x] `CLAUDE.md`: новые правила: обмен с API только через `app/lib/api/*`; не отправлять `Authorization` на `/auth/register` и `/auth/login`; nonce обязателен на `/auth/callback`; Google работает только на prod и localhost; адрес API — `NUXT_PUBLIC_API_BASE`; ссылка на `platform-api/docs/frontend-guide.md` и `api.md`.
- [x] `README.md`: описание (данные в Platform API, вход), убрать раздел Demo Data, добавить `NUXT_PUBLIC_API_BASE`.
- [x] `docs/deploy_plan.md`: первая строка — данные в Platform API; заметка, что Google не работает на превью веток.
- [x] `Health_Monitor_BACKLOG.md`: удалить «Авторизация».
- [x] `Health_Monitor_BACKLOG.md`: удалить пять пунктов технического долга про IndexedDB/Dexie/демо (см. задачу 0) и скилл `db-schema-change`.
- [x] `Health_Monitor_BACKLOG.md`: сузить «Бэкап данных» — пометка, что JSON-экспорт/импорт удалён вместе с IndexedDB, бэкап теперь вопрос API.
- [x] `Health_Monitor_BACKLOG.md`: добавить «Аккаунт»: удаление аккаунта (с предупреждением про данные Job Tracker), привязка Google, установка пароля Google-аккаунту; Ignore/Restore для симптомов; Google на превью веток (расширить allowlist в platform-api).

### Задача 2: Клиент API и состояние входа

**Остановка:** да
**Файлы:** Создать: `app/lib/api/client.ts`, `app/lib/api/auth.ts`, `app/composables/useAuth.ts`, `app/plugins/auth.client.ts`, `app/types/auth.ts`. Изменить: `nuxt.config.ts`

- [x] `nuxt.config.ts`: `runtimeConfig.public.apiBase` со значением по умолчанию.
- [x] `app/types/auth.ts`: `AuthUser`, `AuthResponse`.
- [x] `useAuth.ts`: `useState` для `token`, `user`, `authModal` (`closed | signIn | register`), `guestPromptOpen`; computed `isGuest`; функции чтения/записи/удаления токена в `localStorage` (в `try/catch`).
- [x] `client.ts`: `ApiError`; `apiRequest` на `$fetch.create` — `baseURL`, `Authorization` при наличии токена и не для `/auth/register` / `/auth/login`, распаковка `data`, перевод ошибки ответа в `ApiError`.
- [x] `client.ts`: обработка `401 Authentication required` → `guestPromptOpen = true`; `401 Invalid or expired token` → удалить токен, флаг toast в `sessionStorage`, `reloadNuxtApp` гостем.
- [x] `auth.ts`: `login`, `register`, `fetchMe`, `logout` (удалить токен, `reloadNuxtApp`), `startGoogleSignIn` (nonce + переход).
- [x] `auth.client.ts`: прочитать токен, при наличии дождаться `fetchMe`; показать отложенный toast «session expired», если стоит флаг.

### Задача 3: Модули данных и переход страниц на API

**Остановка:** да
**Файлы:** Создать: `app/lib/api/glucose.ts`, `app/lib/api/blood-pressure.ts`, `app/lib/api/weight.ts`, `app/lib/api/symptoms.ts`, `app/lib/api/dashboard.ts`, `app/types/date-range.ts`. Изменить: `app/types/*.ts`, `app/composables/useMeasurementList.ts`, `app/pages/*.vue`, `app/components/{GlucoseTable,BloodPressureTable,WeightTable,SymptomTable,MeasurementIgnoreControls,DashboardLatestEntries,DashboardMetricsGrid,DashboardSummaryPanel,HealthLineChart,HealthQuickEntryModal}.vue`, `app/assets/css/main.css` (если `ignore` там в именах селекторов — только проверить, классы не переименовывать)

- [x] `app/types/date-range.ts`: `DateRangeQuery` (вместо экспорта из `glucoseRepository.ts`).
- [x] Типы сущностей под формат API (предложение 3); `IgnoreInput` → `{ ignored: boolean; reason: string }`.
- [x] Модули сущностей: `list*` (`GET` с `date_from`/`date_to`), `create*` (`POST`), `set*Ignore` (`PATCH`), `updateSymptomEntryNote` (`PATCH`) — с прежними именами функций.
- [x] `dashboard.ts`: `getDashboardData(range)` → `DashboardData`; сверить порядок записей на живом ответе.
- [x] Переключить импорты страниц и компонентов с `~/lib/db/...` на `~/lib/api/...`; `index.vue` — на `getDashboardData`.
- [x] Переименовать `ignore` → `ignored` в компонентах.
- [x] `useMeasurementList` и `index.vue`: ошибка загрузки → toast `Could not load data`, пустой список.
- [x] Проверить вручную (dev-сервер): гость видит демо-данные на всех пяти страницах, фильтр периода меняет выборку.

### Задача 4: Удаление IndexedDB

**Остановка:** да
**Файлы:** Удалить: `app/lib/db/` (весь каталог), `app/plugins/seed-demo-data.client.ts`, `app/components/DashboardDataActions.vue`, `app/types/meta.ts`, `public/data/demo.json`, `scripts/generate-demo-data.mjs`. Создать: `app/utils/csv.ts`, `app/constants/glucose.ts`. Изменить: `app/pages/index.vue`, `app/pages/{glucose,blood-pressure,weight,symptoms}.vue`, `package.json`, `package-lock.json`

- [x] Перенести `csv.ts` в `app/utils/csv.ts`, поправить импорты на четырёх страницах.
- [x] Перенести `MAX_GLUCOSE_MMOL_L` в `app/constants/glucose.ts`, поправить импорт в `HealthQuickEntryModal.vue`.
- [x] Убрать `DashboardDataActions` из `index.vue` и удалить компонент.
- [x] Удалить `app/lib/db/`, плагин автосида, `types/meta.ts`, `public/data/demo.json`, `scripts/generate-demo-data.mjs`.
- [x] `package.json`: удалить скрипт `demo:generate` и зависимость `dexie` (`npm uninstall dexie`).
- [x] `grep` по `app/` на `lib/db`, `dexie`, `demo.json`, `healthDb` — пусто.
- [x] `npm run lint` и `npm run typecheck` проходят.

### Задача 5: Быстрый ввод под правила API

**Остановка:** да
**Файлы:** Изменить: `app/components/HealthQuickEntryModal.vue`, `app/components/SymptomTable.vue`

- [x] Давление: требовать все три поля, целые положительные (предложение 4).
- [x] Симптом: требовать интенсивность 1–10.
- [x] Собирать тело запроса без пустых ключей; заметка — только непустая строка.
- [x] Ошибку API показывать toast с `message` и сообщениями полей.
- [x] `SymptomTable`: пустая заметка → `note: ""` (предложение 5).

### Задача 6: Вход, регистрация, Google и меню пользователя

**Остановка:** да
**Файлы:** Создать: `app/components/AuthModal.vue`, `app/pages/auth/callback.vue`. Изменить: `app/components/HealthShell.vue`, `app/assets/css/main.css`

- [x] `AuthModal.vue`, режим Sign in: поля username/password, кнопка `Sign in`, кнопка `Continue with Google`, ссылка `Create an account`.
- [x] `AuthModal.vue`, режим Register: поля с правилами, предупреждение про пароль и общий аккаунт, кнопка `Create account`, ссылка `Already have an account? Sign in`, кнопка Google.
- [x] Обработка ответов: успех → сохранить токен, `reloadNuxtApp`; `409`, `401`, `400` — сообщения из предложения 9; кнопки блокируются на время запроса.
- [x] `pages/auth/callback.vue` по предложению 10 (без шапки-мигания: показывать короткий текст `Signing in…`).
- [x] `HealthShell.vue`: гость — кнопка `Sign in`; пользователь — меню с именем и `Sign out` (предложение 12); подключить `AuthModal`.
- [x] Стили новых элементов — классы `.health-*`, цвета только через токены в `:root` и `:root.dark`.
- [x] Проверить в `npm run generate`-сборке прямой заход на `/auth/callback` (предложение 14).
- [x] Проверить вручную на localhost: регистрация, выход, вход, неверный пароль, занятое имя, Google (успех и отмена).

### Задача 7: Ограничения гостя

**Остановка:** да
**Файлы:** Создать: `app/components/GuestPrompt.vue`. Изменить: `app/components/HealthShell.vue`, `app/components/MeasurementIgnoreControls.vue`, `app/components/SymptomTable.vue`, `app/assets/css/main.css`

- [x] `GuestPrompt.vue` с текстами из предложения 9; кнопки открывают `AuthModal` в нужном режиме.
- [x] `HealthShell.vue`: Add entry у гостя открывает `GuestPrompt`, у пользователя — быстрый ввод; `GuestPrompt` открывается и по `guestPromptOpen` из клиента API (401 `Authentication required`).
- [x] `MeasurementIgnoreControls.vue`: Ignore/Restore `disabled` + `title` для гостя.
- [x] `SymptomTable.vue`: редактирование заметки `disabled` + `title` для гостя (десктоп и мобильный вариант).
- [x] Стиль `disabled` у кнопок через токены, если его ещё нет.
- [x] Проверить вручную: гость не может ничего изменить; вошедший пользователь — добавляет запись, игнорирует/восстанавливает, правит заметку; протухший токен (подменить в `localStorage`) → toast и гостевой режим.

### Задача 8: Удаление аккаунта (ревизия 1)

**Остановка:** да
**Файлы:** Создать: `app/components/DeleteAccountDialog.vue`. Изменить: `docs/specifications/Health_Monitor_Structure.md`, `docs/specifications/Health_Monitor_BACKLOG.md`, `app/lib/api/auth.ts`, `app/lib/api/client.ts`, `app/composables/useAuth.ts`, `app/plugins/auth.client.ts`, `app/components/HealthShell.vue`, `app/assets/css/main.css`
**Зачем:** спецификация и бэклог должны описывать удаление аккаунта до реализации (ADR-005) и не числить его отложенным.

- [x] `Health_Monitor_Structure.md`: в «Авторизация» — подраздел «Удаление аккаунта» (предложение 15); в Header — пункт `Delete account`; в «Структура проекта» — `DeleteAccountDialog.vue`; в «Не входит в MVP» убрать удаление аккаунта.
- [x] `Health_Monitor_BACKLOG.md`: из раздела «Аккаунт» удалить пункт про удаление аккаунта.
- [x] `auth.ts`: `deleteAccount()` — `DELETE /auth/me`, затем удалить токен, поставить флаг toast и перезагрузить приложение гостем.
- [x] `client.ts`: поддержать ответ `204` без тела (вернуть `undefined`); общий помощник для флагов отложенных toast (session expired, account deleted).
- [x] `useAuth.ts`: состояние `deleteAccountOpen`.
- [x] `auth.client.ts`: показать toast `Your account has been deleted` по флагу.
- [x] `DeleteAccountDialog.vue` по предложению 15.
- [x] `HealthShell.vue`: пункт `Delete account` в меню пользователя, подключить диалог.
- [x] Стили — классы `.health-*`, цвета только через токены.
- [x] Проверить вручную: кнопка неактивна, пока имя не совпадает; Cancel/Escape закрывают; удаление тестового аккаунта → гостевой режим и toast.

### Задача 9: Исправления по итогам проверки (ревизия 2)

**Остановка:** да
**Файлы:** Изменить: `app/lib/api/date-range.ts`, `app/lib/api/{glucose,blood-pressure,weight,symptoms,dashboard}.ts`, `app/plugins/auth.client.ts`, `app/lib/api/auth.ts`, `app/components/AuthModal.vue`, `app/assets/css/main.css`, `docs/specifications/Health_Monitor_Structure.md`, `docs/specifications/Health_Monitor_BACKLOG.md`
**Зачем:** спецификация должна описывать, как фильтр периода учитывает часовой пояс, а бэклог — хранить отложенное замечание по шапке.

- [x] `Health_Monitor_Structure.md`: в «Модули сущностей» — запрос шире на день с каждой стороны и точная фильтрация по локальным границам периода на клиенте.
- [x] `Health_Monitor_BACKLOG.md`: в «Улучшения интерфейса» — шапка на ≤ 640px (`width: calc(100vw - 16px)`) прижата к краю при обычной полосе прокрутки.
- [x] Ревью 1 (важное): `date-range.ts` — `date_from` на день раньше, `date_to` на день позже локальных дат периода; общий помощник «отфильтровать по точным границам `dateFrom`/`dateTo` и отсортировать от новых к старым»; применить в четырёх модулях списков и в `dashboard.ts`.
- [x] Ревью 2 (мелкое): `auth.client.ts` — при ошибке `/auth/me` без ответа сервера toast `Could not reach the server`, при HTTP-ошибке — `Could not load your account`; токен сохраняется в обоих случаях.
- [x] Ревью 3 (мелкое): `auth.ts` — `startGoogleSignIn` ловит ошибку `sessionStorage` и сообщает о ней; `AuthModal.vue` показывает в форме `Google sign-in needs browser storage. Allow site data and try again.`
- [x] Браузер 4 (мелкое): `main.css` — у `.health-input[aria-invalid='true']` рамка цвета `var(--danger)`.
- [x] Отклонено: `TypeError … reading 'flags'` в общем журнале браузера — не воспроизводится, вероятно след горячей перезагрузки при ручной отладке.

### Задача 10: Проверка и завершение

Выполняется скиллом finish-task один раз, после всех задач плана.

- [x] `npm run lint` и `npm run typecheck`.
- [x] Код-ревью изменений ветки (отдельный субагент); найденное разобрать с пользователем: исправить, в бэклог или отклонить.
- [x] Проверка в браузере агентом browser-checker по сценариям: гость на всех страницах (демо-данные, задизейбленные контролы, Add entry → GuestPrompt), окно входа и регистрации (переключение, ошибки), меню пользователя и Sign out, диалог удаления аккаунта (без реального удаления), дашборд без кнопок базы; ширины 375 / 768 / 1280 px; светлая и тёмная тема; ошибки в консоли.
- [x] Отметить выполнение в `docs/specifications/Health_Monitor_plan.md` и `docs/plans/next-update.md`.
