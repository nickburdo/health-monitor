# Health Monitor — структура Nuxt 4 проекта

## Цель

Создать личное веб-приложение для мониторинга здоровья:

- быстрый ввод показателей;
- таблицы;
- графики;
- фильтры по датам;
- отметка ошибочных значений через `ignore`.

## Стек

- Nuxt 4 (только клиент, `ssr: false`; сервера и авторизации нет)
- Vue 3
- TypeScript
- Nuxt UI v4 (`@nuxtjs/color-mode` для светлой и тёмной темы)
- Tailwind CSS 4
- IndexedDB через Dexie.js — все данные хранятся в браузере
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

Глюкоза вводится, хранится и показывается в `ммоль/л` как есть, без пересчёта при отображении. Единственный перевод — `app/lib/db/glucose-units.ts`, только для старых данных в mg/dL: значение больше 30 (`MAX_GLUCOSE_MMOL_L`) считается mg/dL, делится на 18 и округляется до 0.1. Перевод выполняется миграцией базы `version(3)` и при импорте JSON-файлов `version: 1` (см. «Слой данных»). Быстрый ввод не сохраняет глюкозу больше 30 и показывает toast «Glucose must be in mmol/L».

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

    components/
      HealthShell.vue           # хэдер, меню, футер, модалка быстрого ввода
      ThemeToggle.vue
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
      DashboardDataActions.vue  # экспорт/импорт JSON

    composables/
      usePeriodFilter.ts
      useMeasurementList.ts

    constants/
      symptom-options.ts

    lib/db/
      schema.ts                 # база IndexedDB (Dexie)
      repositories/
        glucoseRepository.ts
        bloodPressureRepository.ts
        weightRepository.ts
        symptomRepository.ts
      validation.ts
      glucose-units.ts          # перевод старых значений глюкозы из mg/dL
      seed.ts                   # заполнение демо-данными при пустой базе
      export-import.ts          # экспорт/импорт всей базы в JSON
      csv.ts                    # экспорт CSV по сущности

    plugins/
      seed-demo-data.client.ts

    types/
      index.ts
      glucose.ts
      blood-pressure.ts
      weight.ts
      symptom.ts
      meta.ts
      dashboard.ts

    utils/
      date-format.ts
      health-line-chart/
        blood-pressure.ts
        glucose.ts
        weight.ts

  public/data/
    demo.json                   # демо-данные

  scripts/
    generate-demo-data.mjs

  nuxt.config.ts
  package.json
```

Сервера (`server/`), API и базы данных на сервере нет: все данные хранятся в IndexedDB браузера.

## Слой данных

Весь доступ к данным — в `app/lib/db/`. Вне этой папки `schema.ts` не импортируется: компоненты и страницы вызывают функции репозиториев (или `seed.ts` / `export-import.ts` для операций над всей базой).

### База (`schema.ts`)

Dexie-база `health-monitor`:

- таблицы данных: `glucoseMeasurement`, `bloodPressureMeasurement`, `weightMeasurement` (индексы `id`, `measuredAt`), `symptomEntry` (`id`, `happenedAt`, `type`);
- таблица `meta` (ключ–значение, ключ `key`), сейчас в ней только флаг `demoSeeded`.

Типы записей лежат в `app/types/*.ts` и одновременно служат типами строк таблиц.

Версии схемы:

- `version(1)` — четыре таблицы данных;
- `version(2)` — таблица `meta`;
- `version(3)` — без изменения индексов; миграция переводит старые значения глюкозы из mg/dL в ммоль/л (`glucose-units.ts`, см. «Единицы измерения»).

Изменение индексов — только новой `this.version(n)`; существующие версии не правятся.

### Репозитории (`repositories/*Repository.ts`)

По одному на сущность:

- `list*` — загружает таблицу и фильтрует по ISO-диапазону `dateFrom` / `dateTo` в памяти;
- `create*` — создаёт запись, ID через `crypto.randomUUID()`;
- `set*MeasurementIgnore` — игнорирование и восстановление измерений (глюкоза, давление, вес);
- `updateSymptomEntryNote` — правка заметки у симптома.

Разбор ввода и правило игнорирования — в `validation.ts`: игнорирование требует `reason`, восстановление его очищает.

### Демо-данные (`seed.ts`, `plugins/seed-demo-data.client.ts`)

- Демо-данные лежат в `public/data/demo.json` (генерируется `npm run demo:generate` из `scripts/generate-demo-data.mjs`). Даты хранятся смещениями `daysAgo` и пересчитываются в момент заполнения.
- Автозаполнение (`seedDemoDataIfEmpty`) выполняется только при самом первом открытии: его охраняет флаг `demoSeeded` в `meta`; записи только добавляются, база не очищается.
- Кнопки дашборда «Load demo data» и «Clear database» (`replaceWithDemoData`, `clearHealthMonitorData`) работают в одной транзакции и тоже ставят флаг, поэтому очищенная база остаётся пустой после перезагрузки.

### Экспорт и импорт

- `export-import.ts` — экспорт и импорт всей базы в JSON. Экспорт пишет формат `version: 2` (глюкоза всегда в ммоль/л). Импорт принимает `version: 1` и `version: 2`; для `version: 1` значения глюкозы проходят перевод из mg/dL. Импорт заменяет все данные в одной транзакции.
- `csv.ts` — экспорт CSV отдельной сущности со страницы этой сущности.

## Main Layout

### Header

- слева: лого (белые HM в кружке цвета primary) и название Health Monitor; на экране 900 и менее название скрыто, остаётся только знак HM
- по центру: выпадающее меню страниц (`UDropdownMenu`); на кнопке — иконка и название текущей страницы и шеврон, в списке все пять страниц с иконками, текущая выделена; адрес со слешем в конце (`/glucose/`) распознаётся как та же страница, на неизвестном адресе кнопка показывает «Menu»; на экране 640 и менее меню в хэдере скрыто (место справа оставлено под будущие Sign-in и переключатель языка)
- справа: переключатель светлой/тёмной темы (`ThemeToggle`) и кнопка открытия модального окна ввода данных

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
- после подтверждения запись глюкозы обновляется в IndexedDB через `setGlucoseMeasurementIgnore` с `ignore: true` и `reason`;
- `Восстановить` срабатывает сразу, без подтверждения: `ignore` сбрасывается в `false`, `reason` очищается;
- строки с `ignore=true` визуально приглушаются.

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
- после подтверждения запись давления обновляется в IndexedDB через `setBloodPressureMeasurementIgnore` с `ignore: true` и `reason`;
- `Восстановить` срабатывает сразу, без подтверждения: `ignore` сбрасывается в `false`, `reason` очищается;
- строки с `ignore=true` визуально приглушаются.


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
- после подтверждения запись веса обновляется в IndexedDB через `setWeightMeasurementIgnore` с `ignore: true` и `reason`;
- `Восстановить` срабатывает сразу, без подтверждения: `ignore` сбрасывается в `false`, `reason` очищается;
- строки с `ignore=true` визуально приглушаются.


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

В MVP справочник симптомов статический.  
Редактирование справочника симптомов выносится в backlog.

## Быстрый ввод

В хэдере справа есть кнопка:

```txt
+ Add entry
```

Она открывает модальное окно.

В модальном окне вкладки:

- Glucose
- Blood Pressure
- Weight
- Symptom / Note

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
- Дашборд (`pages/index.vue`) использует `usePeriodFilter` напрямую и загружает все четыре репозитория параллельно.

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
app/types/meta.ts
app/types/dashboard.ts
```

Эти типы одновременно описывают записи таблиц IndexedDB (`app/lib/db/schema.ts`).

```ts
export type IgnoreInput = {
  ignore: boolean
  reason?: string
}

export type GlucoseMeasurement = {
  id: string
  measuredAt: string
  fastingValue: number | null
  afterMealValue: number | null
  ignore: boolean
  note: string | null
  reason: string | null
  createdAt: string
}

export type BloodPressureMeasurement = {
  id: string
  measuredAt: string
  systolic: number | null
  diastolic: number | null
  pulse: number | null
  ignore: boolean
  note: string | null
  reason: string | null
  createdAt: string
}

export type WeightMeasurement = {
  id: string
  measuredAt: string
  value: number | null
  ignore: boolean
  note: string | null
  reason: string | null
  createdAt: string
}

export type SymptomEntry = {
  id: string
  happenedAt: string
  type: SymptomOption // из app/constants/symptom-options.ts
  intensity: number | null
  note: string | null
  createdAt: string
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
- хранить данные в IndexedDB через Dexie.js (`app/lib/db/`);
- заполнять пустую базу демо-данными;
- сделать репозитории для добавления и получения данных;
- сделать ignore / restore для глюкозы, давления и веса;
- сделать редактирование note у симптомов;
- сделать экспорт/импорт всей базы в JSON и экспорт CSV по сущности;
- сделать быстрый ввод через модалку;
- сделать таблицы;
- сделать графики;
- сделать фильтр периода.

### Не входит в MVP

- авторизация (данные хранятся локально в браузере);
- редактирование данных (кроме note у симптомов);
- удаление данных;
- импорт CSV;
- напоминания;
- мобильное приложение;
- сложная медицинская аналитика;
- корреляции.
