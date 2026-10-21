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

Конвертация единиц измерения в MVP не нужна.

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

## Main Layout

### Header

- слева: лого (белые HM в кружке цвета primary) и название Health Monitor
- по центру: меню - пункты в ряд с иконками, активный пункт выделен; на экране 1000 и менее показываются только иконки, на экране 640 и менее меню в хэдере скрыто
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

В хэдере или сайдбаре должна быть кнопка:

```txt
+ Add Entry
```

Она открывает модальное окно.

В модальном окне вкладки:

- Glucose
- Blood Pressure
- Weight
- Symptom / Note

После успешного сохранения:

- модалка закрывается;
- данные на текущей странице обновляются;
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
