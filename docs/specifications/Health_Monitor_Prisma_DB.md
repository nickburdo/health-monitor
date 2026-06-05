# Health Monitor — Prisma Schema и структура БД

## Общая идея

База данных хранит личные медицинские наблюдения:

- глюкоза;
- кровяное давление;
- вес;
- симптомы и самочувствие.

В MVP данные не редактируются и не удаляются.  
Ошибочные значения помечаются флагом `ignore` и не участвуют в статистике.

## Технический стек БД

- SQLite
- Prisma ORM
- Nuxt 4 server routes / API routes

## Prisma schema

Файл:

```txt
prisma/schema.prisma
```

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model GlucoseMeasurement {
  id                String   @id @default(cuid())
  measuredAt        DateTime

  fastingValue      Float?
  fastingIgnore     Boolean  @default(false)

  afterMealValue    Float?
  afterMealIgnore   Boolean  @default(false)

  note              String?

  createdAt         DateTime @default(now())

  @@index([measuredAt])
}

model BloodPressureMeasurement {
  id                String   @id @default(cuid())
  measuredAt        DateTime

  systolic          Int?
  systolicIgnore    Boolean  @default(false)

  diastolic         Int?
  diastolicIgnore   Boolean  @default(false)

  pulse             Int?
  pulseIgnore       Boolean  @default(false)

  note              String?

  createdAt         DateTime @default(now())

  @@index([measuredAt])
}

model WeightMeasurement {
  id                String   @id @default(cuid())
  measuredAt        DateTime

  value             Float?
  ignore            Boolean  @default(false)

  note              String?

  createdAt         DateTime @default(now())

  @@index([measuredAt])
}

model SymptomEntry {
  id                String   @id @default(cuid())
  happenedAt        DateTime

  type              String
  intensity         Int?
  ignore            Boolean  @default(false)

  note              String?

  createdAt         DateTime @default(now())

  @@index([happenedAt])
  @@index([type])
}
```

## Почему `Float?` и `Int?`

Некоторые поля сделаны nullable, потому что в одной записи может быть заполнен не весь набор значений.

Например:

- глюкоза натощак есть, а после еды нет;
- давление есть, а пульс не измерялся;
- вес есть без заметки.

## Логика ignore

### Глюкоза

У глюкозы ignore сделан отдельно для каждого значения:

- `fastingIgnore`;
- `afterMealIgnore`.

Это нужно, потому что одно значение может быть корректным, а второе — ошибочным.

### Давление

У давления ignore тоже сделан отдельно:

- `systolicIgnore`;
- `diastolicIgnore`;
- `pulseIgnore`.

### Вес

У веса одно значение, поэтому достаточно общего поля:

- `ignore`.

### Симптомы

У симптома вся запись помечается как ошибочная:

- `ignore`.

## Правила статистики

По умолчанию статистика и графики должны учитывать только неигнорируемые значения.

Пример:

```ts
where: {
  measuredAt: {
    gte: dateFrom,
    lte: dateTo
  },
  fastingIgnore: false
}
```

Для записей, где ignore находится на уровне отдельных параметров, фильтрация должна выполняться отдельно для каждого графика или метрики.

## API endpoints

Предварительная структура API:

```txt
server/api/
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
    [id]/ignore.patch.ts
```

## Пример API: создание записи глюкозы

```ts
// POST /api/glucose

{
  "measuredAt": "2026-06-05T08:00:00.000Z",
  "fastingValue": 6.1,
  "afterMealValue": 8.4,
  "note": "После обычного завтрака"
}
```

## Пример API: ignore значения

```ts
// PATCH /api/glucose/:id/ignore

{
  "field": "afterMeal",
  "ignore": true
}
```

## Возможные значения field для ignore

### GlucoseMeasurement

```ts
type GlucoseIgnoreField = 'fasting' | 'afterMeal'
```

### BloodPressureMeasurement

```ts
type BloodPressureIgnoreField = 'systolic' | 'diastolic' | 'pulse'
```

### WeightMeasurement

```ts
type WeightIgnoreField = 'value'
```

### SymptomEntry

```ts
type SymptomIgnoreField = 'entry'
```

## Переменные окружения

Файл:

```txt
.env
```

```env
DATABASE_URL="file:./dev.db"
```

## Команды Prisma

```bash
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
npx prisma studio
```

## Что можно добавить позже

- авторизацию;
- экспорт данных в CSV;
- импорт из CSV;
- лекарства;
- питание;
- физическую активность;
- напоминания;
- агрегированную статистику по неделям и месяцам;
- корреляции между симптомами и показателями.
