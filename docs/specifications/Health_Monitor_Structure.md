# Health Monitor — структура Nuxt 4 проекта

## Цель

Создать личное веб-приложение для мониторинга здоровья:

- быстрый ввод показателей;
- таблицы;
- графики;
- фильтры по датам;
- отметка ошибочных значений через `ignore`.

## Стек

- Nuxt 4
- Vue 3
- TypeScript
- Pinia
- Nuxt UI
- Tailwind CSS
- SQLite
- Prisma
- Nuxt ECharts
- linter
- prettier

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


## Рекомендуемая структура проекта

```txt
health-monitor/
  app/
    app.vue

    pages/
      index.vue
      glucose.vue
      blood-pressure.vue
      weight.vue
      symptoms.vue
      settings.vue

    components/
      layout/
        AppHeader.vue
        AppSidebar.vue

      quick-entry/
        QuickEntryButton.vue
        QuickEntryModal.vue
        GlucoseForm.vue
        BloodPressureForm.vue
        WeightForm.vue
        SymptomForm.vue

      symptoms/
        SymptomSelect.vue
        symptom-options.ts

      dashboard/
        DashboardCards.vue
        LatestMeasurements.vue
        PeriodSelector.vue

      tables/
        GlucoseTable.vue
        BloodPressureTable.vue
        WeightTable.vue
        SymptomsTable.vue

      charts/
        GlucoseChart.vue
        BloodPressureChart.vue
        WeightChart.vue
        SymptomsFrequencyChart.vue

      ui/
        IgnoreBadge.vue
        EmptyState.vue

    stores/
      period.ts
      quick-entry.ts

    types/
      health.ts

    utils/
      dates.ts
      formatters.ts

  server/
    api/
      glucose/
        index.get.ts
        index.post.ts
        [id]/ignore.patch.ts

      blood-pressure/
        index.get.ts
        index.post.ts
        [id]/ignore.patch.ts

      weight/
        index.get.ts
        index.post.ts
        [id]/ignore.patch.ts

      symptoms/
        index.get.ts
        index.post.ts
        [id].patch.ts

    utils/
      prisma.ts
      date-range.ts

  prisma/
    schema.prisma
    dev.db

  .env
  nuxt.config.ts
  package.json
```

## Main Layout

### Header

- слева: лого (белые HM в кружке цвета primary) и название Health Monitor
- по центру: меню - пункты в ряд с иконками (экран 768 и более), активный пункт выделен
- справа: кнопка открытия модально окна ввода данных

### Main

### Footer

только для мобильных! (экран меньше 768) - меню в виде иконок в ряд

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
- график натощак;
- график после еды;
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
- в confirm dialog обязательно вводится `note`;
- после подтверждения отправляется `PATCH /api/glucose/:id/ignore` с `ignore: true` и `note`;
- `Восстановить` открывает confirm dialog, требует `note` и отправляет `PATCH /api/glucose/:id/ignore` с `ignore: false` и `note`;
- строки с `ignore=true` визуально приглушаются.


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
- в confirm dialog обязательно вводится `note`;
- после подтверждения отправляется `PATCH /api/weight/:id/ignore` с `ignore: true` и `note`;
- `Восстановить` открывает confirm dialog, требует `note` и отправляет `PATCH /api/weight/:id/ignore` с `ignore: false` и `note`;
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
- в confirm dialog обязательно вводится `note`;
- после подтверждения отправляется `PATCH /api/blood-pressure/:id/ignore` с `ignore: true` и `note`;
- `Восстановить` открывает confirm dialog, требует `note` и отправляет `PATCH /api/blood-pressure/:id/ignore` с `ignore: false` и `note`;
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

## Pinia stores

### `stores/period.ts`

Хранит выбранный период.

```ts
type Period = '1m' | '3m' | '6m' | 'ytd' | 'custom'
```

Состояние:

```ts
{
  period: Period
  dateFrom?: Date
  dateTo?: Date
}
```

### `stores/quick-entry.ts`

Хранит состояние модального окна быстрого ввода.

```ts
{
  isOpen: boolean
  activeTab: 'glucose' | 'bloodPressure' | 'weight' | 'symptom'
}
```

## Общие TypeScript-типы

Файл:

```txt
app/types/health.ts
```

```ts
export type Period = '1m' | '3m' | '6m' | 'ytd' | 'custom'

export type QuickEntryTab =
  | 'glucose'
  | 'bloodPressure'
  | 'weight'
  | 'symptom'

export interface GlucoseMeasurement {
  id: string
  measuredAt: string
  fastingValue?: number | null
  afterMealValue?: number | null
  ignore: boolean
  note?: string | null
  createdAt: string
}

export interface BloodPressureMeasurement {
  id: string
  measuredAt: string
  systolic?: number | null
  diastolic?: number | null
  pulse?: number | null
  ignore: boolean
  note?: string | null
  createdAt: string
}

export interface WeightMeasurement {
  id: string
  measuredAt: string
  value?: number | null
  ignore: boolean
  note?: string | null
  createdAt: string
}

export interface SymptomEntry {
  id: string
  happenedAt: string
  type: string
  intensity?: number | null
  note?: string | null
  createdAt: string
}
```

## Фильтры по датам

Нужные периоды:

- последний месяц;
- последние 3 месяца;
- последние полгода;
- с начала года;
- произвольный диапазон.

Файл:

```txt
app/utils/dates.ts
```

Примерная функция:

```ts
export function getDateRange(period: Period) {
  const now = new Date()

  // TODO:
  // 1m — минус 1 месяц
  // 3m — минус 3 месяца
  // 6m — минус 6 месяцев
  // ytd — с 1 января текущего года
}
```

## MVP-функциональность

### Обязательно

- создать проект Nuxt;
- подключить Nuxt UI;
- подключить Prisma и SQLite;
- создать Prisma schema;
- сделать миграцию;
- сделать API для добавления данных;
- сделать API для получения данных;
- сделать API для ignore / restore для глюкозы, давления и веса;
- сделать API для редактирования note у симптомов;
- сделать быстрый ввод через модалку;
- сделать таблицы;
- сделать графики;
- сделать фильтр периода.

### Не входит в MVP

- авторизация;
- редактирование данных;
- удаление данных;
- экспорт CSV;
- импорт CSV;
- напоминания;
- мобильное приложение;
- сложная медицинская аналитика;
- корреляции.
