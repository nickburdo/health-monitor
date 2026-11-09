# Health Monitor — структура Nuxt 4 проекта

## Цель

Создать личное веб-приложение для мониторинга здоровья:

- быстрый ввод показателей;
- таблицы;
- графики;
- фильтры по датам;
- отметка ошибочных значений через `ignored`;
- вход по логину и паролю или через Google; гость видит демо-данные.

## Стек

- Nuxt 4 (только клиент, `ssr: false`; своего сервера нет)
- Vue 3
- TypeScript
- Nuxt UI v4 (`@nuxtjs/color-mode` для светлой и тёмной темы)
- Tailwind CSS 4
- данные и авторизация — внешний Platform API (`https://platform-api.nick-burdo.workers.dev`, проект `platform-api`); запросы через `$fetch.create` (ofetch)
- графики — собственный SVG-компонент `HealthLineChart`, без сторонней библиотеки
- ESLint
- Prettier
- хостинг — Cloudflare Pages (статическая сборка)

## Базовые продуктовые решения

### Единицы измерения

В MVP единицы измерения фиксированные:

- глюкоза — `ммоль/л`;
- вес — `кг`;
- давление — `мм рт. ст.`;
- пульс — `ударов/мин`.

Переключения единиц измерения в интерфейсе в MVP нет.

Глюкоза вводится, хранится и показывается в `ммоль/л` как есть, без пересчёта. Быстрый ввод не сохраняет глюкозу больше 30 (`MAX_GLUCOSE_MMOL_L` в `app/constants/glucose.ts`) и показывает toast «Glucose must be in mmol/L».

### Дата и время

Все измерения должны храниться как полноценный timestamp:

```ts
measuredAt: DateTime
```

Даже если в интерфейсе на первых этапах отображается только дата, время нужно сохранить в базе.

Это позволит позже анализировать:

- утренние и вечерние измерения;
- глюкозу до еды и после еды;
- давление после прогулки, сна, стресса и т.д.

Для симптомов используется отдельное поле:

```ts
happenedAt: DateTime
```

### Симптомы

Для симптомов используем вариант Б — справочник симптомов.

Пользователь выбирает симптом из заранее заданного списка, а не вводит произвольный текст каждый раз.

Предварительный список симптомов:

- метеоризм;
- понос;
- запор;
- боль в животе;
- тошнота;
- слабость;
- головная боль;
- плохой сон;
- стресс;
- физическая активность;
- изменение питания.

Такой подход лучше подходит для статистики:

- можно считать частоту симптомов;
- можно строить графики;
- можно искать повторяющиеся состояния;
- можно позже анализировать связь симптомов с глюкозой, весом и давлением.

В MVP справочник можно сделать статическим списком в коде.  
Менеджмент справочника симптомов выносится в backlog.

### Dashboard cards

На Dashboard карточки должны показывать не только последнее значение, но и краткую динамику.

Каждая карточка — ссылка на страницу своей сущности (`HealthMetricCard` с пропом `to`): Glucose → `/glucose`, Blood Pressure → `/blood-pressure`, Weight → `/weight`, Symptoms → `/symptoms`.

Примеры:

#### Glucose

```txt
Last: 6.1 mmol/L
Avg 30d: 6.4 mmol/L
```

#### Blood Pressure

```txt
Last: 128 / 82 mmHg
Avg 30d: 131 / 84 mmHg
```

#### Weight

```txt
Last: 91.4 kg
Change 30d: -1.3 kg
```

#### Symptoms

```txt
Last 7d: 3 entries
Most frequent: метеоризм
```

### Цветовая система

Базовая визуальная идея:

- пастельные тона;
- спокойный медицинский интерфейс без ощущения больницы;
- основной акцент — оранжевый.

Базовые цвета:

```txt
Primary: Orange
Background: Warm cream
Cards: White
Text: Dark brown-gray
```

Цвета для сущностей:

```txt
Glucose  → Orange
Pressure → Blue
Weight   → Green
Symptoms → Violet
```

Цвета должны использоваться консистентно:

- в карточках;
- в графиках;
- в бейджах;
- в иконках;
- в активных элементах меню.


## Структура проекта

```txt
health-monitor/
  app/
    app.vue
    app.config.ts

    assets/css/
      main.css                  # стили .health-*, CSS-токены светлой и тёмной темы

    pages/
      index.vue                 # dashboard
      glucose.vue
      blood-pressure.vue
      weight.vue
      symptoms.vue
      auth/callback.vue         # возврат из Google Sign-In

    components/
      HealthShell.vue           # хэдер, меню, вход/меню пользователя, футер, модалки
      ThemeToggle.vue
      AuthModal.vue             # вход, регистрация, кнопка Google
      GuestPrompt.vue           # призыв войти для гостя
      DeleteAccountDialog.vue   # удаление аккаунта с вводом имени
      HealthQuickEntryModal.vue
      PeriodFilter.vue
      HealthPageHeaderWithFilter.vue
      MeasurementPageShell.vue
      MeasurementIgnoreControls.vue
      GlucoseTable.vue
      BloodPressureTable.vue
      WeightTable.vue
      SymptomTable.vue
      HealthLineChart.vue       # общий SVG-график
      HealthTrendBars.vue
      HealthMetricCard.vue
      HealthEntryList.vue
      DashboardSummaryPanel.vue
      DashboardMetricsGrid.vue
      DashboardSymptomsPanel.vue
      DashboardLatestEntries.vue

    composables/
      usePeriodFilter.ts
      useMeasurementList.ts
      useAuth.ts                # токен, пользователь, открытие модалок входа

    constants/
      symptom-options.ts
      glucose.ts                # MAX_GLUCOSE_MMOL_L

    lib/api/
      client.ts                 # $fetch.create: baseURL, токен, ApiError, обработка 401
      auth.ts                   # login, register, me, logout, Google
      glucose.ts
      blood-pressure.ts
      weight.ts
      symptoms.ts
      dashboard.ts

    plugins/
      auth.client.ts            # восстановление входа при старте

    types/
      index.ts
      glucose.ts
      blood-pressure.ts
      weight.ts
      symptom.ts
      dashboard.ts
      date-range.ts
      auth.ts

    utils/
      date-format.ts
      csv.ts                    # экспорт CSV по сущности
      health-line-chart/
        blood-pressure.ts
        glucose.ts
        weight.ts

  nuxt.config.ts
  package.json
```

Своего сервера нет: данные хранятся во внешнем Platform API. Контракт API и правила для фронтенда — в проекте `platform-api`: `docs/api.md`, `docs/frontend-guide.md`, `docs/connecting-a-frontend.md`.

## Работа с API

Весь обмен с API — в `app/lib/api/`. Компоненты и страницы вызывают функции модулей сущностей, `$fetch` напрямую не используют.

### Клиент (`client.ts`)

- экземпляр `$fetch.create` с `baseURL` из `runtimeConfig.public.apiBase` (по умолчанию `https://platform-api.nick-burdo.workers.dev`, переопределяется переменной `NUXT_PUBLIC_API_BASE`, например `http://localhost:8787`; при `npm run generate` значение вшивается в сборку);
- добавляет `Authorization: Bearer <token>`, если пользователь вошёл; на `POST /auth/register` и `POST /auth/login` заголовок не отправляется никогда (иначе протухший токен даст `401` вместо входа);
- распаковывает обёртку `{ data }`;
- ошибку ответа переводит в `ApiError { status, message, details }` (`details` — карта ошибок полей для `400`);
- `401 Authentication required` (гость пытается записать) → открывается `GuestPrompt`;
- `401 Invalid or expired token` → токен удаляется, приложение перезагружается гостем и показывает toast «Your session has expired. Sign in again.».

### Модули сущностей

`glucose.ts`, `blood-pressure.ts`, `weight.ts`, `symptoms.ts`:

- `list*` — `GET` с параметрами `date_from` / `date_to`. API принимает только календарные даты (`YYYY-MM-DD`) и считает их сутками по UTC, поэтому запрос шире на день с каждой стороны (локальные даты периода −1 / +1 день), а ответ фильтруется на клиенте по точным границам `dateFrom` / `dateTo` периода и сортируется от новых к старым (API отдаёт от старых к новым);
- `create*` — `POST`; тело строгое: без пустых ключей, без `ignored`/`reason`, `note` — только непустая строка;
- `set*MeasurementIgnore` — `PATCH` с `{ ignored: true, reason }` (причина обязательна) или `{ ignored: false, reason: '' }` (глюкоза, давление, вес);
- `updateSymptomEntryNote` — `PATCH` с `note` (пустая заметка — `""`).

`dashboard.ts` — `getDashboardData(range)`: один запрос `GET /dashboard` с тем же расширенным диапазоном, ответ фильтруется так же и переводится в `DashboardData`.

Записи физически не удаляются: ошибочные помечаются `ignored`.

Ошибка загрузки списка (нет сети, 5xx) показывает toast «Could not load data», страница остаётся с пустыми данными.

## Авторизация

Три состояния посетителя (по `frontend-guide.md` API):

- **гость** — без токена; API отдаёт демо-данные, любая запись отвергается `401 Authentication required`;
- **пользователь** — с токеном; видит и меняет только свои данные, демо-данные не видны;
- **протухший токен** — API отвечает `401 Invalid or expired token`; токен удаляется, посетитель становится гостем.

Состояние — `app/composables/useAuth.ts` (`useState`): токен, пользователь, какое окно входа открыто, открыт ли `GuestPrompt`. Токен (JWT, живёт 30 дней) хранится в `localStorage` под ключом `health-monitor-token`. Плагин `auth.client.ts` при старте читает токен и до монтирования страниц загружает пользователя `GET /auth/me`; если сервер недоступен, токен сохраняется и показывается toast «Could not reach the server».

### Вход и регистрация (`AuthModal.vue`)

- Кнопка `Sign in` в шапке открывает окно входа: имя пользователя, пароль, кнопка `Continue with Google`, ссылка на регистрацию.
- Регистрация — имя (3–32 символа `[A-Za-z0-9_-]`) и пароль (8–128). Email не запрашивается; рядом с паролем — предупреждение, что пароль нельзя восстановить, и совет войти через Google; под формой — что аккаунт общий с Job Tracker. После регистрации пользователь сразу вошёл.
- Ошибки: `409` — «This username is taken»; `401 Invalid credentials` — «Wrong username or password» с подсказкой про Google; `400` — сообщения полей.
- После входа или регистрации приложение перезагружается (`reloadNuxtApp`), все данные загружаются уже как пользователь.
- Выход (`Sign out` в меню пользователя) — удалить токен и перезагрузить приложение; эндпоинта выхода у API нет.

### Google Sign-In

- Полностраничный редирект: перед переходом создаётся nonce (`crypto.randomUUID()`), сохраняется в `sessionStorage` (`googleNonce`) и добавляется в адрес возврата `/auth/callback?n=<nonce>`; браузер уходит на `<apiBase>/auth/google?redirect=<адрес возврата>`.
- `pages/auth/callback.vue` читает фрагмент (`#token=` / `#error=`) и `n`, сразу чистит адрес (`history.replaceState`), сверяет и удаляет nonce. Токен принимается только при совпадении nonce; при несовпадении текущая сессия не меняется, показывается «Sign-in could not be completed, please try again.». `access_denied` — «Sign-in was cancelled.», остальные ошибки — «Google sign-in failed. Please try again.». После успеха — перезагрузка на дашборд.
- Google работает только с адресов из allowlist API: `https://health-monitor-new.pages.dev` и localhost. На превью веток Cloudflare Pages работает только вход по логину и паролю.

### Удаление аккаунта

- Пункт `Delete account` в меню пользователя (под `Sign out`, красный) открывает `DeleteAccountDialog.vue`.
- Диалог предупреждает: аккаунт и все его данные в обоих приложениях — Health Monitor и Job Tracker — удаляются безвозвратно, восстановить аккаунт нельзя.
- Подтверждение — ввод имени пользователя: красная кнопка `Delete account` активна только при точном совпадении. Cancel, Escape и клик по фону закрывают диалог.
- Запрос `DELETE /auth/me` (пароль не нужен: у Google-аккаунтов его нет, подтверждение — забота фронтенда). На `204` токен удаляется, приложение перезагружается гостем и показывает toast «Your account has been deleted».
- Ошибка (сеть, 5xx) показывается в диалоге, аккаунт остаётся; повтор безопасен — API дочищает данные.

### Ограничения гостя

- Кнопка `+ Add entry` у гостя открывает `GuestPrompt`: гость видит демо-данные и не может их менять, после входа видны только свои записи; отдельно сказано, что при регистрации email не запрашивается. Кнопки окна открывают вход или регистрацию.
- Кнопки Ignore/Restore и редактирование заметки симптома у гостя задизейблены (`title="Sign in to change entries"`).
- `401 Authentication required` от любой записи тоже открывает `GuestPrompt`.
- CSV-экспорт на страницах сущностей доступен всем.

## Main Layout

### Header

- слева: лого (белые HM в кружке цвета primary) и название Health Monitor; на экране 900 и менее название скрыто, остаётся только знак HM
- по центру: выпадающее меню страниц (`UDropdownMenu`); на кнопке — иконка и название текущей страницы и шеврон, в списке все пять страниц с иконками, текущая выделена; адрес со слешем в конце (`/glucose/`) распознаётся как та же страница, на неизвестном адресе кнопка показывает «Menu»; на экране 640 и менее меню в хэдере скрыто
- справа: переключатель светлой/тёмной темы (`ThemeToggle`), кнопка открытия модального окна ввода данных и вход: у гостя кнопка `Sign in`, у пользователя — меню (`UDropdownMenu`, иконка и имя) с пунктами `Sign out` и `Delete account`

### Main

### Footer

только для мобильных! (экран 640 и менее) - меню в виде иконок в ряд

## Основные страницы

### Dashboard — `/`

Главная страница.

Содержит:

- карточки последних значений;
- общий выбор периода;
- график глюкозы;
- график давления;
- график веса;
- график симптомов;
- последние записи.

Кнопок экспорта/импорта и работы с базой на дашборде нет.

### Glucose — `/glucose`

Содержит:

- таблицу измерений глюкозы;
- отдельный график глюкозы на основе тех же данных, что и таблица;
- две линии: натощак и после еды;
- фильтр периода выборки;

#### Таблица измерений глюкозы

Таблица измерений глюкозы на странице `/glucose` должна показывать:

- тип записи;
- дату и время;
- значение;
- `notes`;
- кнопку `Игнорировать` или `Восстановить`.

##### Поведение

- `Игнорировать` открывает confirm dialog;
- в confirm dialog обязательно вводится причина (`reason`);
- после подтверждения запись глюкозы обновляется через API (`setGlucoseMeasurementIgnore`, `PATCH`) с `ignored: true` и `reason`;
- `Восстановить` срабатывает сразу, без подтверждения: `ignored: false`, `reason: ''`;
- строки с `ignored=true` визуально приглушаются;
- у гостя кнопки задизейблены.

#### График глюкозы

График глюкозы на странице `/glucose` должен:

- быть отдельным компонентом;
- использовать те же данные, что и таблица;
- показывать две линии: натощак и после еды;
- не иметь отдельного фильтра по датам;
- поддерживать tooltip с датой и значением точки.

Для визуализации можно использовать SVG или другой локальный компонентный подход без обязательной внешней библиотеки.


### Blood Pressure — `/blood-pressure`

Содержит:

- таблицу давления;
- график систолического давления;
- график диастолического давления;
- график пульса, если пульс используется;
- фильтр периода выборки;

#### Таблица давления

Таблица давления на странице `/blood-pressure` должна показывать:

- дату и время;
- значение;
- `notes`;
- кнопку `Игнорировать` или `Восстановить`.

##### Поведение

- `Игнорировать` открывает confirm dialog;
- в confirm dialog обязательно вводится причина (`reason`);
- после подтверждения запись давления обновляется через API (`setBloodPressureMeasurementIgnore`, `PATCH`) с `ignored: true` и `reason`;
- `Восстановить` срабатывает сразу, без подтверждения: `ignored: false`, `reason: ''`;
- строки с `ignored=true` визуально приглушаются;
- у гостя кнопки задизейблены.


### Weight — `/weight`

Содержит:

- таблицу веса;
- график веса;
- фильтр периода выборки;

#### Таблица веса

Таблица веса на странице `/weight` должна показывать:

- дату и время;
- значение;
- `notes`;
- кнопку `Игнорировать` или `Восстановить`.

##### Поведение

- `Игнорировать` открывает confirm dialog;
- в confirm dialog обязательно вводится причина (`reason`);
- после подтверждения запись веса обновляется через API (`setWeightMeasurementIgnore`, `PATCH`) с `ignored: true` и `reason`;
- `Восстановить` срабатывает сразу, без подтверждения: `ignored: false`, `reason: ''`;
- строки с `ignored=true` визуально приглушаются;
- у гостя кнопки задизейблены.


### Symptoms — `/symptoms`

Содержит:

- таблицу симптомов;
- график частоты симптомов;
- фильтр периода выборки;

#### Таблица симптомов

Таблица симптомов на странице `/symptoms` должна показывать:

- дату и время;
- симптом (из справочника);
- частоту (в баллах) - заголовок колонки "Балл";
- `notes`;
- кнопку `Редактировать`.

##### Поведение

`Редактировать` переводит ячейку `notes` в режим редактирования.
- кнопка `Редактировать` заменяется кнопками `Сохранить` и `Отмена`
- данные в ячейке `notes` заменяются на textarea
- данные сохраняются при нажатии `Сохранить` или `Enter`
- редактирование отменяется при нажатии `Отмена` или `Esc`
- у гостя кнопка `Редактировать` задизейблена

В MVP справочник симптомов статический.  
Редактирование справочника симптомов выносится в backlog.

## Быстрый ввод

В хэдере справа есть кнопка:

```txt
+ Add entry
```

Пользователю она открывает модальное окно, гостю — `GuestPrompt` (см. «Ограничения гостя»).

В модальном окне вкладки:

- Glucose
- Blood Pressure
- Weight
- Symptom / Note

Обязательные поля — по правилам API: глюкоза — одно из значений (натощак или после еды), не больше 30; давление — систолическое, диастолическое и пульс, целые положительные; вес — значение; симптом — тип и интенсивность, целое 1–10.

После успешного сохранения:

- модалка закрывается;
- данные на текущей странице обновляются: `HealthShell` перезагружает текущую страницу через `reloadNuxtApp`, отдельные списки не обновляются;
- показывается уведомление об успешном сохранении.

## Фильтр периода

Содержит 4 кнопки:
- "3 месяца"
- "6 месяцев"
- "С начала года"
- "Выбрать" или выбранный custom-диапазон в формате `DD.MM.YY - DD.MM.YY`

Компонент принимает `dateFrom`, `dateTo` и `preset`, а при выборе кнопок эмитит новые значения фильтра.

### Расположение

- На странице блок фильтра находится в той же шапке, что и название страницы.
- На десктопе фильтр выравнивается справа внизу блока.
- На мобильных фильтр располагается под названием страницы.
- Кнопки идут в ряд, а на мобильных - в колонку и выравниваются по левому краю.

### Поведение

добавляет в запрос данных фильтры `dateFrom` и `dateTo`

**Кнопка "3 месяца":**
- `dateFrom` - текущая дата минус 3 месяца
- `dateTo` - текущая дата

**Кнопка "6 месяцев":**
- `dateFrom` - текущая дата минус 6 месяцев
- `dateTo` - текущая дата

**Кнопка "С начала года":**
- `dateFrom` - 1 января текущего года
- `dateTo` - текущая дата

**Кнопка "Выбрать":**
- Открывает модальное окно с выбором периода
- После подтверждения устанавливает `dateFrom` и `dateTo` по выбранным датам
- Если выбран custom-фильтр, вместо текста "Выбрать" показывается выбранный диапазон

По умолчанию выбрано "3 месяца"

## Графики

`app/components/HealthLineChart.vue` — собственный SVG-график, общий для глюкозы, давления, веса и дашборда; серии и форматтеры каждой сущности лежат в `app/utils/health-line-chart/`. Симптомы на дашборде показываются отдельной столбчатой панелью `DashboardSymptomsPanel`; типы симптомов — статический список в `app/constants/symptom-options.ts`.

Устройство `HealthLineChart`:

- размер области графика измеряется через `ResizeObserver` (подключается в `watch` на ref SVG, потому что SVG рендерится только при наличии данных); `viewBox` строится в реальных пикселях, без `preserveAspectRatio="none"`, поэтому текст и точки не растягиваются;
- слева отводится колонка под подписи оси Y (ширина приблизительно по самой длинной подписи); сетка и линии начинаются правее неё, подписи выровнены по её правому краю;
- игнорируемые измерения на график не попадают;
- подсказка у точки (по наведению и по фокусу с клавиатуры) ставится в пикселях над точкой с зазором 8px, под точкой — если сверху нет места; по горизонтали не выходит за график; при изменении размера графика скрывается.

## Стили и темы

- Стили — собственные классы `.health-*` в `app/assets/css/main.css`.
- Все цвета — CSS-переменные в `:root` и переопределения для тёмной темы в `:root.dark`; в правилах используется только `var(--…)`, цвета графиков тоже токены `--chart-*`.
- Тему переключает `ThemeToggle.vue` через `@nuxtjs/color-mode` (входит в Nuxt UI): класс `dark` на `<html>`, при первом запуске тема берётся из ОС.
- Компоненты Nuxt UI используются точечно: `UApp`, `UIcon`, `useToast` и `UDropdownMenu` (меню в шапке). Внешний вид `UDropdownMenu` задаётся через его проп `ui` классами `.health-nav-menu*` и токенами `--nav-menu-*`.

## Состояние интерфейса

Pinia не используется: состояние хранится локально в компонентах и composables.

### Период

`app/composables/usePeriodFilter.ts` — `usePeriodFilter()` создаёт на странице `ref` с выбранным периодом (по умолчанию `'3m'`) и вычисляемый `query` с `dateFrom` / `dateTo` для загрузки данных.

```ts
type PeriodPreset = '3m' | '6m' | 'ytd' | 'custom'

type PeriodFilterValue = {
  preset: PeriodPreset
  dateFrom?: string | null // ISO
  dateTo?: string | null // ISO
}
```

### Загрузка данных

- Страницы сущностей используют `useMeasurementList(listFn)`: он владеет фильтром периода (`usePeriodFilter`) и перезапускает загрузку при смене диапазона. Таблицы получают `refresh` как `onUpdated` и вызывают его после игнорирования, восстановления или правки заметки.
- Дашборд (`pages/index.vue`) использует `usePeriodFilter` напрямую и загружает данные одним запросом `getDashboardData` (`GET /dashboard`).
- Ошибка загрузки — toast «Could not load data» и пустые данные.

### Быстрый ввод

- открытие модалки — локальный `ref` `quickEntryOpen` в `HealthShell.vue`;
- активная вкладка — локальный `ref` `activeType` в `HealthQuickEntryModal.vue` (`'glucose' | 'bloodPressure' | 'weight' | 'symptom'`).

## Общие TypeScript-типы

Файлы:

```txt
app/types/index.ts
app/types/glucose.ts
app/types/blood-pressure.ts
app/types/weight.ts
app/types/symptom.ts
app/types/dashboard.ts
app/types/date-range.ts
app/types/auth.ts
```

Типы записей повторяют формат ответов Platform API.

```ts
export type IgnoreInput = {
  ignored: boolean
  reason: string // non-empty when ignored is true, '' on restore
}

export type GlucoseMeasurement = {
  id: string
  measuredAt: string
  fastingValue: number | null
  afterMealValue: number | null
  note: string | null
  ignored: boolean
  reason: string
  createdAt: string
  updatedAt: string
}

export type BloodPressureMeasurement = {
  id: string
  measuredAt: string
  systolic: number
  diastolic: number
  pulse: number
  note: string | null
  ignored: boolean
  reason: string
  createdAt: string
  updatedAt: string
}

export type WeightMeasurement = {
  id: string
  measuredAt: string
  value: number
  note: string | null
  ignored: boolean
  reason: string
  createdAt: string
  updatedAt: string
}

export type SymptomEntry = {
  id: string
  happenedAt: string
  type: SymptomOption // из app/constants/symptom-options.ts
  intensity: number
  note: string | null
  ignored: boolean // в UI не используется
  reason: string
  createdAt: string
  updatedAt: string
}

export type DateRangeQuery = {
  dateFrom?: string // ISO, sent as date_from
  dateTo?: string // ISO, sent as date_to
}

export type AuthUser = {
  id: string
  username: string
  hasPassword: boolean
  createdAt: string
  updatedAt: string
}
```

## Фильтры по датам

Нужные периоды:

- последние 3 месяца;
- последние полгода;
- с начала года;
- произвольный диапазон.

Файл:

```txt
app/composables/usePeriodFilter.ts
```

- `createPresetPeriodFilters(preset)` — считает `dateFrom` / `dateTo` для `'3m'`, `'6m'` и `'ytd'` (`dateTo` — конец текущего дня, `dateFrom` — начало дня);
- `startOfDayIso` / `endOfDayIso` — границы дня в ISO;
- `formatPeriodShortDate`, `toDateInputValue` — форматирование дат для кнопок и полей custom-диапазона.

Форматирование дат в таблицах и списках — `app/utils/date-format.ts`.

## MVP-функциональность

### Обязательно

- создать проект Nuxt;
- подключить Nuxt UI;
- хранить данные во внешнем Platform API (`app/lib/api/`);
- гостю показывать демо-данные API, пользователю — только его данные;
- сделать модули API для добавления и получения данных;
- сделать вход, регистрацию и вход через Google;
- сделать ignore / restore для глюкозы, давления и веса;
- сделать редактирование note у симптомов;
- сделать экспорт CSV по сущности;
- сделать быстрый ввод через модалку;
- сделать таблицы;
- сделать графики;
- сделать фильтр периода.

### Не входит в MVP

- привязка Google к паролю, установка пароля Google-аккаунту;
- экспорт/импорт всей базы в JSON;
- редактирование данных (кроме note у симптомов);
- удаление данных;
- импорт CSV;
- напоминания;
- мобильное приложение;
- сложная медицинская аналитика;
- корреляции.
