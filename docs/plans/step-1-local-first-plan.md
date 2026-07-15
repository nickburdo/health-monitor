# Step 1 — Переход на локальный IndexedDB — план реализации

> **Для агентов-исполнителей:** ОБЯЗАТЕЛЬНЫЙ ПОДНАВЫК: используйте superpowers:subagent-driven-development (рекомендуется) или superpowers:executing-plans для выполнения плана задача за задачей. Шаги используют синтаксис чекбоксов (`- [ ]`) для отслеживания прогресса. **Без TDD**: согласно глобальным инструкциям проекта, автоматические тесты не пишутся, если явно не попросили. Каждая задача заканчивается шагом ручной проверки или проверки типов вместо цикла с тестами. Не проверяйте UI/frontend-изменения в настоящем браузере, если пользователь явно не попросил об этом в текущей сессии — вместо этого опишите, что должен проверить разработчик вручную.
>
> **Контрольная точка после каждой задачи (обязательно):** после выполнения задачи (все шаги, включая коммит) — остановиться, кратко отчитаться о результате и ждать явного подтверждения пользователя, прежде чем начинать следующую задачу. Не переходить к следующей задаче автоматически, даже если предыдущая прошла проверку без проблем. Это применимо к каждой из 27 задач этого плана, включая внутри фаз (например, между Задачей 15 и Задачей 16), а не только на границах фаз A–G.

**Цель:** Заменить текущий серверный бэкенд (Supabase/Firebase) на полностью клиентский слой данных на основе IndexedDB (через Dexie.js), с заполнением демо-данными и экспортом/импортом всей БД в JSON, а также экспортом CSV по каждой сущности — и только после проверки нового пути убрать старый бэкенд.

**Архитектура:** Все записи о здоровье (глюкоза, давление, вес, симптомы) хранятся в одной базе IndexedDB на браузер, доступ к которой идёт через небольшой слой репозиториев, повторяющий `prisma/schema.prisma`. Сервера нет, авторизации нет, разделения demo/real по записям нет — один локальный набор данных на браузер, редактируемый любым, у кого есть доступ к этому браузеру. При первом запуске (пустая база) приложение заполняет себя из `public/data/demo.json`. Пользователи могут экспортировать/импортировать всю базу как JSON и экспортировать любую отдельную сущность как CSV.

**Технологии:** Nuxt 4 (только клиент), Dexie.js для IndexedDB, существующие компоненты Nuxt UI. Никакой новой библиотеки управления состоянием не добавляется.

## Общие ограничения

- Никакого логина, никакой авторизации, никакого разделения guest/admin, никакого флага `isDemo` нигде в новом коде — подтверждено пользователем; это полностью заменяет текущую модель авторизации Supabase/Firebase.
- Реальные записи, которые сейчас лежат в Supabase Postgres, этим планом **не переносятся** — подтверждено пользователем. Пустая/новая база в браузере заполняется только статичным демо-набором. Перенос реальных исторических данных админа в браузер — это отдельная, ручная операция позже, через функцию импорта JSON, которую строит этот план.
- Старый бэкенд (Supabase, Firebase/Firestore, `server/api`, рантайм Prisma) убирается только **после** того, как путь через IndexedDB построен и проверен — подтверждено пользователем. В этом плане такое удаление вынесено в последнюю фазу (Phase G), а не перемешано с фазами построения.
- Библиотека для работы с IndexedDB: **Dexie.js** — подтверждено пользователем.
- Не писать автоматические тесты, если явно не попросили (общее правило проекта). Шаги проверки в этом плане используют `npm run typecheck`, `npm run lint`, `npm run build` и ручные проверки разработчика — без новых тестовых файлов.
- Не проверять UI/frontend-изменения в настоящем браузере, если явно не попросили (общее правило проекта) — шаги проверки описывают, что должен увидеть разработчик; ассистент не управляет браузером, если его не попросили.
- `prisma/schema.prisma` остаётся документированным источником истины для формы данных (в соответствии с исходной идеей пользователя), но после Phase G больше не подключён ни к какой живой базе, генератору или клиенту.

## Открытые предложения (обратите внимание перед одобрением — технические, но стоит посмотреть)

Это технические решения, принятые ради конкретности плана. Они обратимы и низкорискованны, но вынесены наружу согласно правилу проекта «предлагай, а не решай молча»:

1. **`ssr: false` для всего приложения.** IndexedDB существует только в браузере, поэтому ни одна страница с данными о здоровье не может рендериться на сервере. Вместо того чтобы оборачивать каждую страницу с данными в `<ClientOnly>`, план отключает SSR глобально в `nuxt.config.ts` и убирает правило маршрута `'/' : { prerender: true }`. Это совпадает с тем, что уже предлагал (заброшенный) план миграции на Firebase по той же причине.
2. **ID через `crypto.randomUUID()`.** Заменяет `cuid()` из Prisma. Никакой новой зависимости, работает во всех современных браузерах.
3. **Импорт разрушительный (replace-all).** Импорт JSON-экспорта очищает все четыре локальные таблицы и заменяет их содержимым файла после диалога подтверждения. Проще и безопаснее рассуждать об этом, чем о слиянии; совпадает с тем, как `prisma/seed.mjs` уже сбрасывает демо-данные сегодня.
4. **CSV-экспорт отражает текущие отфильтрованные/отображаемые строки** на странице сущности (то есть то, что сейчас показывает фильтр периода на странице), а не безусловно всю таблицу.
5. **Даты демо-данных относительные, разрешаются в момент заполнения базы, а не в момент генерации.** `public/data/demo.json` хранит смещения `daysAgo` (как их сейчас вычисляет `prisma/seed.mjs` внутри себя); приложение превращает их в реальные даты в момент заполнения пустой базы, поэтому демо-данные всегда выглядят свежими, независимо от того, когда кто-то впервые откроет приложение.

---

## Phase A — Источник истины и основа

### Задача 1: Убрать `isDemo` из схемы Prisma (очистка источника истины)

**Файлы:**
- Изменить: `prisma/schema.prisma`

**Интерфейсы:**
- Результат: канонический список полей, который повторяет каждый тип/таблица далее в этом плане (без `isDemo`, без `userId`).

- [ ] **Шаг 1: Убрать поле `isDemo` из всех четырёх моделей**

Заменить всё содержимое `prisma/schema.prisma` на:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

// NOTE: as of Step 1 (local-first IndexedDB migration), this schema is no
// longer connected to a live database, generator, or client. It documents
// the shape that app/lib/db/schema.ts (Dexie) mirrors in the browser.

model GlucoseMeasurement {
  id         String   @id @default(cuid())
  measuredAt DateTime

  fastingValue   Float?
  afterMealValue Float?
  ignore         Boolean @default(false)

  note   String?
  reason String?

  createdAt DateTime @default(now())

  @@index([measuredAt])
}

model BloodPressureMeasurement {
  id         String   @id @default(cuid())
  measuredAt DateTime

  systolic  Int?
  diastolic Int?
  pulse     Int?
  ignore    Boolean @default(false)

  note   String?
  reason String?

  createdAt DateTime @default(now())

  @@index([measuredAt])
}

model WeightMeasurement {
  id         String   @id @default(cuid())
  measuredAt DateTime

  value  Float?
  ignore Boolean @default(false)

  note   String?
  reason String?

  createdAt DateTime @default(now())

  @@index([measuredAt])
}

model SymptomEntry {
  id         String   @id @default(cuid())
  happenedAt DateTime

  type      String
  intensity Int?

  note String?

  createdAt DateTime @default(now())

  @@index([happenedAt])
  @@index([type])
}
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npx prisma validate`
Ожидается: `The schema at prisma/schema.prisma is valid 🚀` (это по-прежнему работает, хотя схема пока ни к чему не подключена — Phase G удаляет сам тулчейн Prisma).

- [ ] **Шаг 3: Коммит**

```bash
git add prisma/schema.prisma
git commit -m "Drop isDemo from the Prisma schema ahead of the local-first migration"
```

---

### Задача 2: Установить Dexie

**Файлы:**
- Изменить: `package.json`

- [ ] **Шаг 1: Установка**

Выполнить: `npm install dexie`

- [ ] **Шаг 2: Проверка**

Выполнить: `npm ls dexie`
Ожидается: выводит установленную версию `dexie` без ошибки `UNMET DEPENDENCY`.

- [ ] **Шаг 3: Коммит**

```bash
git add package.json package-lock.json
git commit -m "Add Dexie for client-side IndexedDB storage"
```

---

### Задача 3: Переписать доменные типы по схеме

**Файлы:**
- Изменить: `app/types/index.ts`
- Изменить: `app/types/glucose.ts`
- Изменить: `app/types/blood-pressure.ts`
- Изменить: `app/types/weight.ts`
- Изменить: `app/types/symptom.ts`

**Интерфейсы:**
- Результат: `GlucoseMeasurement`, `CreateGlucoseMeasurementInput`, `BloodPressureMeasurement`, `CreateBloodPressureMeasurementInput`, `WeightMeasurement`, `CreateWeightMeasurementInput`, `SymptomEntry`, `CreateSymptomEntryInput`, `IgnoreInput` — используются каждым репозиторием, composable и компонентом в следующих задачах.

Текущие типы смешивают остатки Firestore (`Timestamp`, `userId`) и Prisma (`@prisma/client`) от заброшенных миграций и даже не согласованы между собой по имени поля заметки (`GeneralType.notes` против реального поля `note`). Эта задача заменяет всё это на простые типы, соответствующие схеме из Задачи 1.

- [ ] **Шаг 1: Заменить `app/types/index.ts`**

```typescript
export type IgnoreInput = {
  ignore: boolean;
  reason?: string;
};
```

- [ ] **Шаг 2: Заменить `app/types/glucose.ts`**

```typescript
export type GlucoseMeasurement = {
  id: string;
  measuredAt: string;
  fastingValue: number | null;
  afterMealValue: number | null;
  ignore: boolean;
  note: string | null;
  reason: string | null;
  createdAt: string;
};

export type CreateGlucoseMeasurementInput = {
  measuredAt: string;
  fastingValue?: number;
  afterMealValue?: number;
  note?: string;
};
```

- [ ] **Шаг 3: Заменить `app/types/blood-pressure.ts`**

```typescript
export type BloodPressureMeasurement = {
  id: string;
  measuredAt: string;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  ignore: boolean;
  note: string | null;
  reason: string | null;
  createdAt: string;
};

export type CreateBloodPressureMeasurementInput = {
  measuredAt: string;
  systolic?: number;
  diastolic?: number;
  pulse?: number;
  note?: string;
};
```

- [ ] **Шаг 4: Заменить `app/types/weight.ts`**

```typescript
export type WeightMeasurement = {
  id: string;
  measuredAt: string;
  value: number | null;
  ignore: boolean;
  note: string | null;
  reason: string | null;
  createdAt: string;
};

export type CreateWeightMeasurementInput = {
  measuredAt: string;
  value: number;
  note?: string;
};
```

- [ ] **Шаг 5: Заменить `app/types/symptom.ts`**

```typescript
import type { SymptomOption } from '~/constants/symptom-options';

export type SymptomEntry = {
  id: string;
  happenedAt: string;
  type: SymptomOption;
  intensity: number | null;
  note: string | null;
  createdAt: string;
};

export type CreateSymptomEntryInput = {
  happenedAt: string;
  type: SymptomOption;
  intensity?: number;
  note?: string;
};

export type UpdateSymptomEntryNoteInput = {
  note: string | null;
};
```

- [ ] **Шаг 6: Проверка**

Выполнить: `npm run typecheck`
Ожидается: на этом этапе будет падать — `app/types/dashboard.ts` по-прежнему компилируется нормально (он просто реэкспортирует массивы этих типов), но каждый файл, ссылающийся на старую форму `userId`/`notes`/`Timestamp`, теперь покажет ошибки типов. Это ожидаемо; эти файлы будут исправлены в следующих задачах. Убедитесь, что ошибки ограничены файлами, которые этот план трогает позже (репозитории, composables, страницы, компоненты из Phases B–E), а не самим `app/types/dashboard.ts`.

- [ ] **Шаг 7: Коммит**

```bash
git add app/types/index.ts app/types/glucose.ts app/types/blood-pressure.ts app/types/weight.ts app/types/symptom.ts
git commit -m "Rewrite domain types to mirror the Prisma schema, drop Firestore/userId leftovers"
```

---

### Задача 4: Создать базу Dexie

**Файлы:**
- Создать: `app/lib/db/schema.ts`

**Интерфейсы:**
- Использует: `GlucoseMeasurement`, `BloodPressureMeasurement`, `WeightMeasurement`, `SymptomEntry` из Задачи 3.
- Результат: `healthDb` (экземпляр `HealthMonitorDatabase`) с таблицами `glucoseMeasurement`, `bloodPressureMeasurement`, `weightMeasurement`, `symptomEntry` — используется каждым репозиторием в Phase B, `app/lib/db/seed.ts` и `app/lib/db/export-import.ts`.

- [ ] **Шаг 1: Написать класс базы данных**

```typescript
import Dexie, { type Table } from 'dexie';
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import type { GlucoseMeasurement } from '~/types/glucose';
import type { SymptomEntry } from '~/types/symptom';
import type { WeightMeasurement } from '~/types/weight';

export class HealthMonitorDatabase extends Dexie {
  glucoseMeasurement!: Table<GlucoseMeasurement, string>;
  bloodPressureMeasurement!: Table<BloodPressureMeasurement, string>;
  weightMeasurement!: Table<WeightMeasurement, string>;
  symptomEntry!: Table<SymptomEntry, string>;

  constructor() {
    super('health-monitor');

    this.version(1).stores({
      glucoseMeasurement: 'id, measuredAt',
      bloodPressureMeasurement: 'id, measuredAt',
      weightMeasurement: 'id, measuredAt',
      symptomEntry: 'id, happenedAt, type',
    });
  }
}

export const healthDb = new HealthMonitorDatabase();
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `app/lib/db/schema.ts`.

- [ ] **Шаг 3: Коммит**

```bash
git add app/lib/db/schema.ts
git commit -m "Add the Dexie database mirroring the health monitor schema"
```

---

### Задача 5: Общие хелперы валидации

**Файлы:**
- Создать: `app/lib/db/validation.ts`

**Интерфейсы:**
- Результат: `parseOptionalNumber`, `parseOptionalInteger`, `parseOptionalString`, `buildIgnoreData` — используются каждым репозиторием в Phase B.

Они намеренно повторяют правила валидации, которые сейчас применяются на сервере в `server/utils/health-records.ts` (сохранены идентичными, чтобы поведение для пользователя не менялось), за вычетом всего, что связано с demo/actor.

- [ ] **Шаг 1: Написать хелперы**

```typescript
export function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error('Value must be a valid number');
  }

  return parsed;
}

export function parseOptionalInteger(value: unknown): number | undefined {
  const parsed = parseOptionalNumber(value);

  if (parsed === undefined) {
    return undefined;
  }

  if (!Number.isInteger(parsed)) {
    throw new Error('Value must be an integer');
  }

  return parsed;
}

export function parseOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = String(value).trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildIgnoreData(input: {
  ignore: boolean;
  reason?: string;
}): { ignore: boolean; reason: string | null } {
  if (!input.ignore) {
    return { ignore: false, reason: null };
  }

  const reason = parseOptionalString(input.reason);

  if (!reason) {
    throw new Error('reason is required when ignore is true');
  }

  return { ignore: true, reason };
}
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `app/lib/db/validation.ts`.

- [ ] **Шаг 3: Коммит**

```bash
git add app/lib/db/validation.ts
git commit -m "Add shared validation helpers for the local repositories"
```

---

## Phase B — Репозитории

### Задача 6: Репозиторий глюкозы

**Файлы:**
- Создать: `app/lib/db/repositories/glucoseRepository.ts`

**Интерфейсы:**
- Использует: `healthDb` (Задача 4), `parseOptionalNumber`/`parseOptionalString`/`buildIgnoreData` (Задача 5), `GlucoseMeasurement`/`CreateGlucoseMeasurementInput` (Задача 3), `IgnoreInput` (Задача 3).
- Результат: `listGlucoseMeasurements(range)`, `createGlucoseMeasurement(input)`, `setGlucoseMeasurementIgnore(id, input)` — используются `useMeasurementList` (Задача 12), `HealthQuickEntryModal.vue` (Задача 19), `GlucoseTable.vue`/`glucose.vue` (Задача 15) и дашбордом (Задача 20).

- [ ] **Шаг 1: Написать репозиторий**

```typescript
import { healthDb } from '~/lib/db/schema';
import {
  buildIgnoreData,
  parseOptionalNumber,
  parseOptionalString,
} from '~/lib/db/validation';
import type {
  CreateGlucoseMeasurementInput,
  GlucoseMeasurement,
} from '~/types/glucose';
import type { IgnoreInput } from '~/types';

export type DateRangeQuery = {
  dateFrom?: string;
  dateTo?: string;
};

function withinRange(measuredAt: string, range: DateRangeQuery): boolean {
  if (range.dateFrom && measuredAt < range.dateFrom) {
    return false;
  }

  if (range.dateTo && measuredAt > range.dateTo) {
    return false;
  }

  return true;
}

export async function listGlucoseMeasurements(
  range: DateRangeQuery = {},
): Promise<GlucoseMeasurement[]> {
  const all = await healthDb.glucoseMeasurement.toArray();

  return all
    .filter((item) => withinRange(item.measuredAt, range))
    .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
}

export async function createGlucoseMeasurement(
  input: CreateGlucoseMeasurementInput,
): Promise<GlucoseMeasurement> {
  const fastingValue = parseOptionalNumber(input.fastingValue);
  const afterMealValue = parseOptionalNumber(input.afterMealValue);
  const note = parseOptionalString(input.note);

  if (fastingValue === undefined && afterMealValue === undefined) {
    throw new Error('fastingValue or afterMealValue is required');
  }

  const record: GlucoseMeasurement = {
    id: crypto.randomUUID(),
    measuredAt: input.measuredAt,
    fastingValue: fastingValue ?? null,
    afterMealValue: afterMealValue ?? null,
    ignore: false,
    note: note ?? null,
    reason: null,
    createdAt: new Date().toISOString(),
  };

  await healthDb.glucoseMeasurement.add(record);

  return record;
}

export async function setGlucoseMeasurementIgnore(
  id: string,
  input: IgnoreInput,
): Promise<void> {
  const existing = await healthDb.glucoseMeasurement.get(id);

  if (!existing) {
    throw new Error('Glucose measurement not found');
  }

  await healthDb.glucoseMeasurement.update(id, buildIgnoreData(input));
}
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `app/lib/db/repositories/glucoseRepository.ts`.

- [ ] **Шаг 3: Коммит**

```bash
git add app/lib/db/repositories/glucoseRepository.ts
git commit -m "Add the local glucose repository"
```

---

### Задача 7: Репозиторий давления

**Файлы:**
- Создать: `app/lib/db/repositories/bloodPressureRepository.ts`

**Интерфейсы:**
- Та же форма, что и в Задаче 6, для давления.
- Результат: `listBloodPressureMeasurements(range)`, `createBloodPressureMeasurement(input)`, `setBloodPressureMeasurementIgnore(id, input)`.

- [ ] **Шаг 1: Написать репозиторий**

```typescript
import { healthDb } from '~/lib/db/schema';
import {
  buildIgnoreData,
  parseOptionalInteger,
  parseOptionalString,
} from '~/lib/db/validation';
import type {
  BloodPressureMeasurement,
  CreateBloodPressureMeasurementInput,
} from '~/types/blood-pressure';
import type { IgnoreInput } from '~/types';
import type { DateRangeQuery } from '~/lib/db/repositories/glucoseRepository';

function withinRange(measuredAt: string, range: DateRangeQuery): boolean {
  if (range.dateFrom && measuredAt < range.dateFrom) {
    return false;
  }

  if (range.dateTo && measuredAt > range.dateTo) {
    return false;
  }

  return true;
}

export async function listBloodPressureMeasurements(
  range: DateRangeQuery = {},
): Promise<BloodPressureMeasurement[]> {
  const all = await healthDb.bloodPressureMeasurement.toArray();

  return all
    .filter((item) => withinRange(item.measuredAt, range))
    .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
}

export async function createBloodPressureMeasurement(
  input: CreateBloodPressureMeasurementInput,
): Promise<BloodPressureMeasurement> {
  const systolic = parseOptionalInteger(input.systolic);
  const diastolic = parseOptionalInteger(input.diastolic);
  const pulse = parseOptionalInteger(input.pulse);
  const note = parseOptionalString(input.note);

  if (
    systolic === undefined &&
    diastolic === undefined &&
    pulse === undefined
  ) {
    throw new Error('systolic, diastolic or pulse is required');
  }

  const record: BloodPressureMeasurement = {
    id: crypto.randomUUID(),
    measuredAt: input.measuredAt,
    systolic: systolic ?? null,
    diastolic: diastolic ?? null,
    pulse: pulse ?? null,
    ignore: false,
    note: note ?? null,
    reason: null,
    createdAt: new Date().toISOString(),
  };

  await healthDb.bloodPressureMeasurement.add(record);

  return record;
}

export async function setBloodPressureMeasurementIgnore(
  id: string,
  input: IgnoreInput,
): Promise<void> {
  const existing = await healthDb.bloodPressureMeasurement.get(id);

  if (!existing) {
    throw new Error('Blood pressure measurement not found');
  }

  await healthDb.bloodPressureMeasurement.update(id, buildIgnoreData(input));
}
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `app/lib/db/repositories/bloodPressureRepository.ts`.

- [ ] **Шаг 3: Коммит**

```bash
git add app/lib/db/repositories/bloodPressureRepository.ts
git commit -m "Add the local blood pressure repository"
```

---

### Задача 8: Репозиторий веса

**Файлы:**
- Создать: `app/lib/db/repositories/weightRepository.ts`

**Интерфейсы:**
- Результат: `listWeightMeasurements(range)`, `createWeightMeasurement(input)`, `setWeightMeasurementIgnore(id, input)`.

- [ ] **Шаг 1: Написать репозиторий**

```typescript
import { healthDb } from '~/lib/db/schema';
import { buildIgnoreData, parseOptionalString } from '~/lib/db/validation';
import type {
  CreateWeightMeasurementInput,
  WeightMeasurement,
} from '~/types/weight';
import type { IgnoreInput } from '~/types';
import type { DateRangeQuery } from '~/lib/db/repositories/glucoseRepository';

function withinRange(measuredAt: string, range: DateRangeQuery): boolean {
  if (range.dateFrom && measuredAt < range.dateFrom) {
    return false;
  }

  if (range.dateTo && measuredAt > range.dateTo) {
    return false;
  }

  return true;
}

export async function listWeightMeasurements(
  range: DateRangeQuery = {},
): Promise<WeightMeasurement[]> {
  const all = await healthDb.weightMeasurement.toArray();

  return all
    .filter((item) => withinRange(item.measuredAt, range))
    .sort((a, b) => b.measuredAt.localeCompare(a.measuredAt));
}

export async function createWeightMeasurement(
  input: CreateWeightMeasurementInput,
): Promise<WeightMeasurement> {
  const note = parseOptionalString(input.note);

  const record: WeightMeasurement = {
    id: crypto.randomUUID(),
    measuredAt: input.measuredAt,
    value: input.value,
    ignore: false,
    note: note ?? null,
    reason: null,
    createdAt: new Date().toISOString(),
  };

  await healthDb.weightMeasurement.add(record);

  return record;
}

export async function setWeightMeasurementIgnore(
  id: string,
  input: IgnoreInput,
): Promise<void> {
  const existing = await healthDb.weightMeasurement.get(id);

  if (!existing) {
    throw new Error('Weight measurement not found');
  }

  await healthDb.weightMeasurement.update(id, buildIgnoreData(input));
}
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `app/lib/db/repositories/weightRepository.ts`.

- [ ] **Шаг 3: Коммит**

```bash
git add app/lib/db/repositories/weightRepository.ts
git commit -m "Add the local weight repository"
```

---

### Задача 9: Репозиторий симптомов

**Файлы:**
- Создать: `app/lib/db/repositories/symptomRepository.ts`

**Интерфейсы:**
- Результат: `listSymptomEntries(range)`, `createSymptomEntry(input)`, `updateSymptomEntryNote(id, input)` (без ignore — у симптомов его никогда не было, согласно `prisma/schema.prisma`).

- [ ] **Шаг 1: Написать репозиторий**

```typescript
import { healthDb } from '~/lib/db/schema';
import { parseOptionalInteger, parseOptionalString } from '~/lib/db/validation';
import type {
  CreateSymptomEntryInput,
  SymptomEntry,
  UpdateSymptomEntryNoteInput,
} from '~/types/symptom';
import type { DateRangeQuery } from '~/lib/db/repositories/glucoseRepository';

function withinRange(happenedAt: string, range: DateRangeQuery): boolean {
  if (range.dateFrom && happenedAt < range.dateFrom) {
    return false;
  }

  if (range.dateTo && happenedAt > range.dateTo) {
    return false;
  }

  return true;
}

export async function listSymptomEntries(
  range: DateRangeQuery = {},
): Promise<SymptomEntry[]> {
  const all = await healthDb.symptomEntry.toArray();

  return all
    .filter((item) => withinRange(item.happenedAt, range))
    .sort((a, b) => b.happenedAt.localeCompare(a.happenedAt));
}

export async function createSymptomEntry(
  input: CreateSymptomEntryInput,
): Promise<SymptomEntry> {
  const intensity = parseOptionalInteger(input.intensity);
  const note = parseOptionalString(input.note);

  const record: SymptomEntry = {
    id: crypto.randomUUID(),
    happenedAt: input.happenedAt,
    type: input.type,
    intensity: intensity ?? null,
    note: note ?? null,
    createdAt: new Date().toISOString(),
  };

  await healthDb.symptomEntry.add(record);

  return record;
}

export async function updateSymptomEntryNote(
  id: string,
  input: UpdateSymptomEntryNoteInput,
): Promise<void> {
  const existing = await healthDb.symptomEntry.get(id);

  if (!existing) {
    throw new Error('Symptom entry not found');
  }

  await healthDb.symptomEntry.update(id, { note: input.note });
}
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `app/lib/db/repositories/symptomRepository.ts`.

- [ ] **Шаг 3: Коммит**

```bash
git add app/lib/db/repositories/symptomRepository.ts
git commit -m "Add the local symptom repository"
```

---

## Phase C — Демо-данные и заполнение

### Задача 10: Сгенерировать статичный демо-набор данных

**Файлы:**
- Создать: `scripts/generate-demo-data.mjs` (заменяет `prisma/seed.mjs` как источник демо-данных)
- Создать: `public/data/demo.json` (сгенерированный результат, коммитится в репозиторий)
- Изменить: `package.json` (добавить скрипт `demo:generate`)

**Интерфейсы:**
- Результат: `public/data/demo.json` в форме `{ glucoseMeasurement, bloodPressureMeasurement, weightMeasurement, symptomEntry }`, где каждый — массив `{ daysAgo: number, ...поля }` — используется `app/lib/db/seed.ts` (Задача 11).

Здесь повторно используются те же значения фикстур, что и в текущем `prisma/seed.mjs`, с заменой вызовов `daysAgo(N)` на простое поле `daysAgo: N` (разрешается в реальную дату позже, в момент заполнения, а не сейчас) и без `isDemo: true`.

- [ ] **Шаг 1: Написать скрипт-генератор**

```javascript
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(__dirname, '../public/data/demo.json');

const glucoseMeasurement = [
  { daysAgo: 0, fastingValue: 91, note: 'Morning check' },
  { daysAgo: 2, afterMealValue: 128, note: 'After lunch' },
  { daysAgo: 7, fastingValue: 89, note: 'Stable morning' },
  { daysAgo: 9, afterMealValue: 132, note: 'After dinner' },
  { daysAgo: 14, fastingValue: 87, note: 'Before breakfast' },
  { daysAgo: 16, afterMealValue: 124, note: 'After snack' },
  { daysAgo: 21, fastingValue: 90, note: 'Morning check' },
  { daysAgo: 23, afterMealValue: 130, note: 'After meal' },
  { daysAgo: 28, fastingValue: 92, note: 'Morning check' },
  { daysAgo: 30, afterMealValue: 126, note: 'After meal' },
];

const bloodPressureMeasurement = [
  { daysAgo: 0, systolic: 118, diastolic: 76, pulse: 68, note: 'Morning check' },
  { daysAgo: 2, systolic: 122, diastolic: 80, pulse: 71, note: 'After walk' },
  { daysAgo: 7, systolic: 124, diastolic: 78, pulse: 69, note: 'Rested' },
  { daysAgo: 9, systolic: 130, diastolic: 82, pulse: 72, note: 'Evening' },
  { daysAgo: 14, systolic: 116, diastolic: 74, pulse: 66, note: 'Calm' },
  { daysAgo: 16, systolic: 128, diastolic: 84, pulse: 74, note: 'After stress' },
  { daysAgo: 21, systolic: 120, diastolic: 77, pulse: 70, note: 'Morning check' },
  { daysAgo: 23, systolic: 134, diastolic: 86, pulse: 76, note: 'After work' },
  { daysAgo: 28, systolic: 117, diastolic: 73, pulse: 67, note: 'Rested' },
  { daysAgo: 30, systolic: 126, diastolic: 79, pulse: 71, note: 'Morning check' },
];

const weightMeasurement = [
  { daysAgo: 0, value: 84.6, note: 'Morning weight' },
  { daysAgo: 2, value: 84.8, note: 'Morning weight' },
  { daysAgo: 7, value: 85.0, note: 'Morning weight' },
  { daysAgo: 9, value: 85.1, note: 'Morning weight' },
  { daysAgo: 14, value: 85.3, note: 'Morning weight' },
  { daysAgo: 16, value: 85.4, note: 'Morning weight' },
  { daysAgo: 21, value: 85.6, note: 'Morning weight' },
  { daysAgo: 23, value: 85.7, note: 'Morning weight' },
  { daysAgo: 28, value: 85.9, note: 'Morning weight' },
  { daysAgo: 30, value: 86.0, note: 'Morning weight' },
];

const symptomEntry = [
  { daysAgo: 0, type: 'bloating', intensity: 2, note: 'Light discomfort' },
  { daysAgo: 2, type: 'headache', intensity: 3, note: 'Short episode' },
  { daysAgo: 7, type: 'bloating', intensity: 1, note: 'Brief note' },
  { daysAgo: 9, type: 'bloating', intensity: 4, note: 'Managed well' },
  { daysAgo: 14, type: 'headache', intensity: 2, note: 'Mild issue' },
  { daysAgo: 16, type: 'stress', intensity: 5, note: 'Noticeable symptom' },
  { daysAgo: 21, type: 'bloating', intensity: 3, note: 'Short episode' },
  { daysAgo: 23, type: 'headache', intensity: 4, note: 'Evening note' },
  { daysAgo: 28, type: 'bloating', intensity: 2, note: 'Mild issue' },
  { daysAgo: 30, type: 'bloating', intensity: 1, note: 'Brief note' },
];

const demoData = {
  glucoseMeasurement,
  bloodPressureMeasurement,
  weightMeasurement,
  symptomEntry,
};

writeFileSync(outputPath, `${JSON.stringify(demoData, null, 2)}\n`, 'utf-8');

console.log(`Demo data written to ${outputPath}`);
console.log(
  JSON.stringify(
    {
      glucoseMeasurement: glucoseMeasurement.length,
      bloodPressureMeasurement: bloodPressureMeasurement.length,
      weightMeasurement: weightMeasurement.length,
      symptomEntry: symptomEntry.length,
    },
    null,
    2,
  ),
);
```

- [ ] **Шаг 2: Добавить npm-скрипт**

В `package.json`, внутри `"scripts"`, добавить:

```json
"demo:generate": "node scripts/generate-demo-data.mjs",
```

- [ ] **Шаг 3: Запустить, чтобы получить `public/data/demo.json`**

Выполнить: `npm run demo:generate`
Ожидается: выводит `Demo data written to .../public/data/demo.json` и по `10` записей для каждой сущности; `public/data/demo.json` теперь существует с четырьмя массивами выше.

- [ ] **Шаг 4: Коммит**

```bash
git add scripts/generate-demo-data.mjs public/data/demo.json package.json
git commit -m "Add the static demo dataset and its generator script"
```

---

### Задача 11: Заполнить пустую базу из демо-набора

**Файлы:**
- Создать: `app/lib/db/seed.ts`
- Создать: `app/plugins/seed-demo-data.client.ts`

**Интерфейсы:**
- Использует: `healthDb` (Задача 4), `public/data/demo.json` (Задача 10).
- Результат: `seedDemoDataIfEmpty()`, вызывается один раз при старте приложения плагином.

- [ ] **Шаг 1: Написать логику заполнения**

```typescript
import { healthDb } from '~/lib/db/schema';
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import type { GlucoseMeasurement } from '~/types/glucose';
import type { SymptomEntry } from '~/types/symptom';
import type { WeightMeasurement } from '~/types/weight';
import type { SymptomOption } from '~/constants/symptom-options';

type DemoDataFile = {
  glucoseMeasurement: Array<{
    daysAgo: number;
    fastingValue?: number;
    afterMealValue?: number;
    note?: string;
  }>;
  bloodPressureMeasurement: Array<{
    daysAgo: number;
    systolic?: number;
    diastolic?: number;
    pulse?: number;
    note?: string;
  }>;
  weightMeasurement: Array<{ daysAgo: number; value: number; note?: string }>;
  symptomEntry: Array<{
    daysAgo: number;
    type: SymptomOption;
    intensity?: number;
    note?: string;
  }>;
};

function resolveDate(daysAgo: number): string {
  const base = new Date();
  base.setHours(12, 0, 0, 0);
  base.setDate(base.getDate() - daysAgo);
  return base.toISOString();
}

export async function seedDemoDataIfEmpty(): Promise<void> {
  const [glucoseCount, bloodPressureCount, weightCount, symptomCount] =
    await Promise.all([
      healthDb.glucoseMeasurement.count(),
      healthDb.bloodPressureMeasurement.count(),
      healthDb.weightMeasurement.count(),
      healthDb.symptomEntry.count(),
    ]);

  const isEmpty =
    glucoseCount === 0 &&
    bloodPressureCount === 0 &&
    weightCount === 0 &&
    symptomCount === 0;

  if (!isEmpty) {
    return;
  }

  const demoData = await $fetch<DemoDataFile>('/data/demo.json');
  const createdAt = new Date().toISOString();

  const glucoseRecords: GlucoseMeasurement[] = demoData.glucoseMeasurement.map(
    (entry) => ({
      id: crypto.randomUUID(),
      measuredAt: resolveDate(entry.daysAgo),
      fastingValue: entry.fastingValue ?? null,
      afterMealValue: entry.afterMealValue ?? null,
      ignore: false,
      note: entry.note ?? null,
      reason: null,
      createdAt,
    }),
  );

  const bloodPressureRecords: BloodPressureMeasurement[] =
    demoData.bloodPressureMeasurement.map((entry) => ({
      id: crypto.randomUUID(),
      measuredAt: resolveDate(entry.daysAgo),
      systolic: entry.systolic ?? null,
      diastolic: entry.diastolic ?? null,
      pulse: entry.pulse ?? null,
      ignore: false,
      note: entry.note ?? null,
      reason: null,
      createdAt,
    }));

  const weightRecords: WeightMeasurement[] = demoData.weightMeasurement.map(
    (entry) => ({
      id: crypto.randomUUID(),
      measuredAt: resolveDate(entry.daysAgo),
      value: entry.value,
      ignore: false,
      note: entry.note ?? null,
      reason: null,
      createdAt,
    }),
  );

  const symptomRecords: SymptomEntry[] = demoData.symptomEntry.map((entry) => ({
    id: crypto.randomUUID(),
    happenedAt: resolveDate(entry.daysAgo),
    type: entry.type,
    intensity: entry.intensity ?? null,
    note: entry.note ?? null,
    createdAt,
  }));

  await Promise.all([
    healthDb.glucoseMeasurement.bulkAdd(glucoseRecords),
    healthDb.bloodPressureMeasurement.bulkAdd(bloodPressureRecords),
    healthDb.weightMeasurement.bulkAdd(weightRecords),
    healthDb.symptomEntry.bulkAdd(symptomRecords),
  ]);
}
```

- [ ] **Шаг 2: Подключить к старту приложения**

```typescript
export default defineNuxtPlugin(async () => {
  await seedDemoDataIfEmpty();
});
```

- [ ] **Шаг 3: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок.

Ручная проверка (разработчик, после того как приложение заработает в Phase D/E): открыть приложение с очищенным хранилищем браузера для dev-origin, убедиться, что четыре страницы сущностей и дашборд показывают 10 засеянных строк каждая, с датами, выглядящими свежими; перезагрузить страницу и убедиться, что данные остались и не были засеяны повторно (счётчики остаются на 10, а не 20).

- [ ] **Шаг 4: Коммит**

```bash
git add app/lib/db/seed.ts app/plugins/seed-demo-data.client.ts
git commit -m "Seed the local database from the demo dataset on first run"
```

---

## Phase D — Composable и конфигурация Nuxt

### Задача 12: Заменить `useMeasurementListPage` на локальный composable на репозиториях

**Файлы:**
- Создать: `app/composables/useMeasurementList.ts`
- Удалить: `app/composables/useMeasurementListPage.ts` (заменён — вне этого плана его больше никто не вызывает после Phase E)

**Интерфейсы:**
- Использует: `usePeriodFilter` (существующий, без изменений), функцию `loader: (range) => Promise<T[]>` — ей соответствует любая из функций `list*` из репозиториев Phase B.
- Результат: `{ periodFilters, query, data, pending, refresh }` — используется каждой страницей сущности (Задачи 15–18) и дашбордом (Задача 20).

- [ ] **Шаг 1: Написать composable**

```typescript
import { usePeriodFilter, type PeriodPreset } from '~/composables/usePeriodFilter';
import type { DateRangeQuery } from '~/lib/db/repositories/glucoseRepository';

export async function useMeasurementList<T>(
  loader: (range: DateRangeQuery) => Promise<T[]>,
  preset?: Exclude<PeriodPreset, 'custom'>,
) {
  const { periodFilters, query } = usePeriodFilter(preset);
  const data = ref<T[]>([]) as Ref<T[]>;
  const pending = ref(false);

  async function refresh() {
    pending.value = true;

    try {
      data.value = await loader(query.value);
    } finally {
      pending.value = false;
    }
  }

  watch(query, refresh);
  await refresh();

  return {
    periodFilters,
    query,
    data,
    pending,
    refresh,
  };
}
```

- [ ] **Шаг 2: Удалить заменённый composable**

Удалить `app/composables/useMeasurementListPage.ts`.

- [ ] **Шаг 3: Проверка**

Выполнить: `npm run typecheck`
Ожидается: появятся новые ошибки на четырёх страницах сущностей (они всё ещё вызывают удалённый `useMeasurementListPage`) — ожидаемо, исправляется в Phase E.

- [ ] **Шаг 4: Коммит**

```bash
git add app/composables/useMeasurementList.ts
git rm app/composables/useMeasurementListPage.ts
git commit -m "Replace useMeasurementListPage with a repository-backed composable"
```

---

### Задача 13: Сделать приложение только клиентским, убрать модуль Supabase

**Файлы:**
- Изменить: `nuxt.config.ts`

**Интерфейсы:**
- Результат: приложение работает полностью на клиенте (см. открытое предложение №1). Регистрация модуля `@nuxtjs/supabase` и блок его конфигурации убираются здесь; сам пакет удаляется позже, в Phase G, вместе с остальным бэкендом, когда его уже никто не импортирует — то, что он пока остаётся установленным, но неиспользуемым, сделано намеренно и безвредно.

- [ ] **Шаг 1: Обновить конфиг**

Заменить содержимое `nuxt.config.ts` на:

```typescript
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/eslint', '@nuxt/ui'],

  ssr: false,

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'always-multiline',
        semi: true,
        braceStyle: '1tbs',
      },
    },
  },
});
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из самого `nuxt.config.ts` (не связанные с ним ошибки уровня страниц из Задачи 12 всё ещё висят до Phase E).

- [ ] **Шаг 3: Коммит**

```bash
git add nuxt.config.ts
git commit -m "Run the app client-only; drop the Supabase module wiring"
```

---

## Phase E — Подключить страницы и компоненты к локальному слою данных

### Задача 14: Переделать `MeasurementIgnoreControls` на вызов функции репозитория вместо `$fetch`

**Файлы:**
- Изменить: `app/components/MeasurementIgnoreControls.vue`

**Интерфейсы:**
- Использует: ничего нового напрямую; получает callback `setIgnore` от родительского компонента таблицы.
- Результат: emit `updated`, который слушает родительская таблица (заменяет `refreshNuxtData(refreshKey)`).

- [ ] **Шаг 1: Заменить props/emits и две функции действий**

Заменить:

```typescript
const props = defineProps<{
  item: {
    id: string;
    ignore: boolean;
  };
  endpoint: string;
  refreshKey: string;
  entityLabel: string;
  summary: SummaryLine[];
  ignoreLead?: string;
  reasonPlaceholder?: string;
}>();
```

На:

```typescript
import type { IgnoreInput } from '~/types';

const props = defineProps<{
  item: {
    id: string;
    ignore: boolean;
  };
  setIgnore: (id: string, input: IgnoreInput) => Promise<void>;
  entityLabel: string;
  summary: SummaryLine[];
  ignoreLead?: string;
  reasonPlaceholder?: string;
}>();

const emit = defineEmits<{
  updated: [];
}>();
```

Заменить тело `ignoreSelected`:

```typescript
async function ignoreSelected() {
  const normalizedReason = String(ignoreReason.value ?? '').trim();

  if (!normalizedReason) {
    errorText.value = 'reason is required';
    return;
  }

  try {
    savingId.value = props.item.id;

    await props.setIgnore(props.item.id, {
      ignore: true,
      reason: normalizedReason,
    });

    toast.add({
      title: 'Entry marked ignored',
      description: 'The reason was saved in reason.',
    });

    closeIgnoreDialog();
    emit('updated');
  } catch (error) {
    errorText.value = errorMessage(error);
  } finally {
    savingId.value = null;
  }
}
```

Заменить тело `restoreSelected`:

```typescript
async function restoreSelected() {
  try {
    savingId.value = props.item.id;

    await props.setIgnore(props.item.id, { ignore: false });

    toast.add({
      title: 'Entry restored',
      description: 'The ignored status was removed without confirmation.',
    });

    emit('updated');
  } catch (error) {
    toast.add({
      title: 'Restore failed',
      description: errorMessage(error),
      color: 'error',
    });
  } finally {
    savingId.value = null;
  }
}
```

Упростить `errorMessage` (форма серверной ошибки `error.data.statusMessage` больше не применима — функции репозиториев бросают обычный `Error`):

```typescript
function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not change the status';
}
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck`
Ожидается: новые ошибки в `GlucoseTable.vue`, `BloodPressureTable.vue`, `WeightTable.vue` (они всё ещё передают props `endpoint`/`refresh-key`) — ожидаемо, исправляется дальше.

- [ ] **Шаг 3: Коммит**

```bash
git add app/components/MeasurementIgnoreControls.vue
git commit -m "Drive ignore/restore through a repository callback instead of $fetch"
```

---

### Задача 15: Подключить глюкозу (таблица, страница, CSV-экспорт, исправление бага с полем note)

**Файлы:**
- Изменить: `app/components/GlucoseTable.vue`
- Изменить: `app/pages/glucose.vue`
- Изменить: `app/components/HealthLineChart.vue` (обнаружено при выполнении: устаревший тип `measuredAt: Timestamp` из `firebase/firestore`, хотя компонент уже везде кастовал значение к строке — `measuredAt: Timestamp` → `measuredAt: string`, убран импорt `firebase/firestore` и три каста `as unknown as string`. Без этого фикса чистый typecheck недостижим не только для `glucose.vue`, но и для `blood-pressure.vue`, `weight.vue`, `index.vue` в Задачах 16/17/20 — по решению пользователя исправлено здесь, а не отдельной задачей.)
- Создать: `app/lib/db/csv.ts`

**Интерфейсы:**
- Использует: `listGlucoseMeasurements`/`setGlucoseMeasurementIgnore` (Задача 6), `useMeasurementList` (Задача 12).
- Результат: `toCsv`/`downloadCsv` в `app/lib/db/csv.ts` — переиспользуются в Задачах 16–18.

- [ ] **Шаг 1: Добавить CSV-хелпер (новый файл, общий для всех четырёх страниц сущностей)**

```typescript
function csvEscape(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  if (/["\n,]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: Array<keyof T & string>,
): string {
  const header = columns.join(',');
  const lines = rows.map((row) =>
    columns.map((column) => csvEscape(row[column])).join(','),
  );

  return [header, ...lines].join('\n');
}

export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
```

- [ ] **Шаг 2: Обновить `GlucoseTable.vue`**

Заменить props и использование `MeasurementIgnoreControls`:

```typescript
import { setGlucoseMeasurementIgnore } from '~/lib/db/repositories/glucoseRepository';

const props = defineProps<{
  items: GlucoseMeasurement[];
  onUpdated: () => void;
}>();
```

Исправить баг с полем заметки (поле называется `note`, а не `notes`):

```typescript
function displayNote(item: GlucoseMeasurement) {
  if (item.ignore) {
    return item.reason ?? '—';
  }

  return item.note ?? '—';
}
```

Заменить тег `MeasurementIgnoreControls`:

```html
<MeasurementIgnoreControls
  :item="item"
  :set-ignore="setGlucoseMeasurementIgnore"
  entity-label="glucose"
  :summary="glucoseSummary(item)"
  reason-placeholder="For example: a suspiciously high reading after a heavy dinner"
  @updated="props.onUpdated"
/>
```

- [ ] **Шаг 3: Обновить `app/pages/glucose.vue`**

Заменить весь блок `<script setup>`:

```typescript
import type { GlucoseMeasurement } from '~/types/glucose';
import { listGlucoseMeasurements } from '~/lib/db/repositories/glucoseRepository';
import { downloadCsv, toCsv } from '~/lib/db/csv';
import {
  formatGlucoseAxisValue,
  formatGlucoseValue,
  glucoseChartSeries,
} from '~/utils/health-line-chart/glucose';

const { periodFilters, data, refresh } = await useMeasurementList<GlucoseMeasurement>(
  listGlucoseMeasurements,
);

function exportCsv() {
  const csvContent = toCsv(data.value, [
    'measuredAt',
    'fastingValue',
    'afterMealValue',
    'ignore',
    'note',
    'reason',
  ]);

  downloadCsv(`glucose-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

useHead({ title: 'Glucose · Health Monitor' });
```

Добавить кнопку экспорта рядом с фильтром периода и передать `refresh` в `GlucoseTable`:

```html
<template #filter>
  <PeriodFilter v-model="periodFilters" />
  <button
    type="button"
    class="health-button health-button-secondary health-button-small"
    @click="exportCsv"
  >
    Export CSV
  </button>
</template>
<HealthLineChart
  v-bind="{ ariaLabel: 'Glucose chart with fasting and after meal lines' }"
  :items="data ?? []"
  :series="glucoseChartSeries"
  :value-formatter="formatGlucoseValue"
  :y-axis-formatter="formatGlucoseAxisValue"
/>
<GlucoseTable
  :items="data ?? []"
  :on-updated="refresh"
/>
```

- [ ] **Шаг 4: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `GlucoseTable.vue`, `glucose.vue` или `app/lib/db/csv.ts`.

Ручная проверка (разработчик): открыть `/glucose`, убедиться, что рендерятся 10 засеянных строк, отметить одну как игнорируемую с указанием причины и убедиться, что она переходит в состояние игнорируемой, а причина отображается в колонке заметок, восстановить её, нажать «Export CSV» и убедиться, что скачивается файл с заголовком и 10 строками данных.

- [ ] **Шаг 5: Коммит**

```bash
git add app/lib/db/csv.ts app/components/GlucoseTable.vue app/pages/glucose.vue
git commit -m "Wire the glucose page to the local repository and add CSV export"
```

---

### Задача 16: Подключить давление (таблица, страница)

**Файлы:**
- Изменить: `app/components/BloodPressureTable.vue`
- Изменить: `app/pages/blood-pressure.vue`

**Интерфейсы:**
- Использует: `listBloodPressureMeasurements`/`setBloodPressureMeasurementIgnore` (Задача 7), `useMeasurementList` (Задача 12), `toCsv`/`downloadCsv` (Задача 15).

- [ ] **Шаг 1: Обновить `BloodPressureTable.vue`**

Добавить prop `onUpdated` и заменить подключение ignore-контролов, по той же схеме, что и в Задаче 15:

```typescript
import { setBloodPressureMeasurementIgnore } from '~/lib/db/repositories/bloodPressureRepository';

const props = defineProps<{
  items: BloodPressureMeasurement[];
  onUpdated: () => void;
}>();
```

```html
<MeasurementIgnoreControls
  :item="item"
  :set-ignore="setBloodPressureMeasurementIgnore"
  entity-label="blood pressure"
  :summary="bloodPressureSummary(item)"
  reason-placeholder="For example: a reading taken right after exercise"
  @updated="props.onUpdated"
/>
```

(Остальную часть файла — хелперы форматирования, разметку таблицы — оставить без изменений; меняются только props и тег `MeasurementIgnoreControls`.)

- [ ] **Шаг 2: Обновить `app/pages/blood-pressure.vue`**

```typescript
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import { listBloodPressureMeasurements } from '~/lib/db/repositories/bloodPressureRepository';
import { downloadCsv, toCsv } from '~/lib/db/csv';
import {
  formatBloodPressureAxisValue,
  formatBloodPressureValue,
  bloodPressureChartSeries,
} from '~/utils/health-line-chart/blood-pressure';

const { periodFilters, data, refresh } =
  await useMeasurementList<BloodPressureMeasurement>(
    listBloodPressureMeasurements,
  );

function exportCsv() {
  const csvContent = toCsv(data.value, [
    'measuredAt',
    'systolic',
    'diastolic',
    'pulse',
    'ignore',
    'note',
    'reason',
  ]);

  downloadCsv(
    `blood-pressure-${new Date().toISOString().slice(0, 10)}.csv`,
    csvContent,
  );
}

useHead({ title: 'Blood pressure · Health Monitor' });
```

Обновить шаблон так же, как в Задаче 15 (кнопка Export CSV в слоте `#filter`, `:on-updated="refresh"` на таблице).

- [ ] **Шаг 3: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок ни в одном из файлов.

Ручная проверка (разработчик): открыть `/blood-pressure`, повторить ту же проверку ignore/restore/CSV-экспорта, что и в Задаче 15.

- [ ] **Шаг 4: Коммит**

```bash
git add app/components/BloodPressureTable.vue app/pages/blood-pressure.vue
git commit -m "Wire the blood pressure page to the local repository and add CSV export"
```

---

### Задача 17: Подключить вес (таблица, страница)

**Файлы:**
- Изменить: `app/components/WeightTable.vue`
- Изменить: `app/pages/weight.vue`

**Интерфейсы:**
- Использует: `listWeightMeasurements`/`setWeightMeasurementIgnore` (Задача 8), `useMeasurementList` (Задача 12), `toCsv`/`downloadCsv` (Задача 15).

- [ ] **Шаг 1: Обновить `WeightTable.vue`**

```typescript
import { setWeightMeasurementIgnore } from '~/lib/db/repositories/weightRepository';

const props = defineProps<{
  items: WeightMeasurement[];
  onUpdated: () => void;
}>();
```

```html
<MeasurementIgnoreControls
  :item="item"
  :set-ignore="setWeightMeasurementIgnore"
  entity-label="weight"
  :summary="weightSummary(item)"
  reason-placeholder="For example: scale was on an uneven surface"
  @updated="props.onUpdated"
/>
```

- [ ] **Шаг 2: Обновить `app/pages/weight.vue`**

```typescript
import type { WeightMeasurement } from '~/types/weight';
import { listWeightMeasurements } from '~/lib/db/repositories/weightRepository';
import { downloadCsv, toCsv } from '~/lib/db/csv';
import {
  formatWeightAxisValue,
  formatWeightValue,
  weightChartSeries,
} from '~/utils/health-line-chart/weight';

const { periodFilters, data, refresh } = await useMeasurementList<WeightMeasurement>(
  listWeightMeasurements,
);

function exportCsv() {
  const csvContent = toCsv(data.value, [
    'measuredAt',
    'value',
    'ignore',
    'note',
    'reason',
  ]);

  downloadCsv(`weight-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

useHead({ title: 'Weight · Health Monitor' });
```

Обновить шаблон так же, как в Задаче 15.

- [ ] **Шаг 3: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок ни в одном из файлов.

Ручная проверка (разработчик): открыть `/weight`, повторить проверку ignore/restore/CSV-экспорта.

- [ ] **Шаг 4: Коммит**

```bash
git add app/components/WeightTable.vue app/pages/weight.vue
git commit -m "Wire the weight page to the local repository and add CSV export"
```

---

### Задача 18: Подключить симптомы (таблица, страница — обновление заметки вместо ignore)

**Файлы:**
- Изменить: `app/components/SymptomTable.vue`
- Изменить: `app/pages/symptoms.vue`

**Интерфейсы:**
- Использует: `listSymptomEntries`/`updateSymptomEntryNote` (Задача 9), `useMeasurementList` (Задача 12), `toCsv`/`downloadCsv` (Задача 15).

- [ ] **Шаг 1: Обновить `SymptomTable.vue`**

Добавить prop `onUpdated` и заменить `$fetch` PATCH в `saveNote`:

```typescript
import { updateSymptomEntryNote } from '~/lib/db/repositories/symptomRepository';

const props = defineProps<{
  items: SymptomRow[];
  onUpdated: () => void;
}>();
```

```typescript
async function saveNote(item: SymptomRow) {
  if (savingId.value) {
    return;
  }

  try {
    savingId.value = item.id;

    await updateSymptomEntryNote(item.id, {
      note: normalizeNote(draftNote.value),
    });

    toast.add({
      title: 'Note updated',
      description: 'The symptom entry was saved.',
    });

    cancelEditing();
    props.onUpdated();
  } catch (error) {
    toast.add({
      title: 'Update failed',
      description: errorMessage(error),
      color: 'error',
    });
  } finally {
    savingId.value = null;
  }
}
```

Упростить `errorMessage` так же, как в Задаче 14:

```typescript
function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not update the note';
}
```

- [ ] **Шаг 2: Обновить `app/pages/symptoms.vue`**

Повторить схему из Задач 15/16/17, используя `listSymptomEntries` и CSV-колонки `happenedAt, type, intensity, note`, и передать `:on-updated="refresh"` в `SymptomTable`.

```typescript
import type { SymptomEntry } from '~/types/symptom';
import { listSymptomEntries } from '~/lib/db/repositories/symptomRepository';
import { downloadCsv, toCsv } from '~/lib/db/csv';

const { periodFilters, data, refresh } = await useMeasurementList<SymptomEntry>(
  listSymptomEntries,
);

function exportCsv() {
  const csvContent = toCsv(data.value, ['happenedAt', 'type', 'intensity', 'note']);

  downloadCsv(`symptoms-${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
}

useHead({ title: 'Symptoms · Health Monitor' });
```

- [ ] **Шаг 3: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок ни в одном из файлов.

Ручная проверка (разработчик): открыть `/symptoms`, отредактировать заметку, сохранить, убедиться, что она сохраняется после перезагрузки, нажать «Export CSV» и убедиться, что файл скачивается.

- [ ] **Шаг 4: Коммит**

```bash
git add app/components/SymptomTable.vue app/pages/symptoms.vue
git commit -m "Wire the symptoms page to the local repository and add CSV export"
```

---

### Задача 19: Подключить модалку быстрого ввода к репозиториям

**Файлы:**
- Изменить: `app/components/HealthQuickEntryModal.vue`

**Интерфейсы:**
- Использует: `createGlucoseMeasurement` (Задача 6), `createBloodPressureMeasurement` (Задача 7), `createWeightMeasurement` (Задача 8), `createSymptomEntry` (Задача 9).
- Результат: emit `entryCreated`, чтобы `HealthShell.vue` (Задача 21) мог обновить ту страницу/дашборд, что сейчас смонтированы.

- [ ] **Шаг 1: Импортировать функции репозиториев и добавить emit**

```typescript
import { createGlucoseMeasurement } from '~/lib/db/repositories/glucoseRepository';
import { createBloodPressureMeasurement } from '~/lib/db/repositories/bloodPressureRepository';
import { createWeightMeasurement } from '~/lib/db/repositories/weightRepository';
import { createSymptomEntry } from '~/lib/db/repositories/symptomRepository';

const emit = defineEmits<{
  close: [];
  entryCreated: [];
}>();
```

- [ ] **Шаг 2: Заменить каждый вызов `$fetch` в `submit()` на соответствующий вызов репозитория**

Заменить:

```typescript
await $fetch('/api/glucose', {
  method: 'POST',
  body: {
    measuredAt: toIsoDateTime(form.glucose.measuredAt),
    fastingValue,
    afterMealValue,
    note: form.glucose.note || undefined,
  },
});
```

На:

```typescript
await createGlucoseMeasurement({
  measuredAt: toIsoDateTime(form.glucose.measuredAt),
  fastingValue,
  afterMealValue,
  note: form.glucose.note || undefined,
});
```

Заменить:

```typescript
await $fetch('/api/blood-pressure', {
  method: 'POST',
  body: {
    measuredAt: toIsoDateTime(form.bloodPressure.measuredAt),
    systolic,
    diastolic,
    pulse,
    note: form.bloodPressure.note || undefined,
  },
});
```

На:

```typescript
await createBloodPressureMeasurement({
  measuredAt: toIsoDateTime(form.bloodPressure.measuredAt),
  systolic,
  diastolic,
  pulse,
  note: form.bloodPressure.note || undefined,
});
```

Заменить:

```typescript
await $fetch('/api/weight', {
  method: 'POST',
  body: {
    measuredAt: toIsoDateTime(form.weight.measuredAt),
    value,
    note: form.weight.note || undefined,
  },
});
```

На:

```typescript
await createWeightMeasurement({
  measuredAt: toIsoDateTime(form.weight.measuredAt),
  value,
  note: form.weight.note || undefined,
});
```

Заменить:

```typescript
await $fetch('/api/symptoms', {
  method: 'POST',
  body: {
    happenedAt: toIsoDateTime(form.symptom.happenedAt),
    type: form.symptom.type,
    intensity,
    note: form.symptom.note || undefined,
  },
});
```

На:

```typescript
await createSymptomEntry({
  happenedAt: toIsoDateTime(form.symptom.happenedAt),
  type: form.symptom.type,
  intensity,
  note: form.symptom.note || undefined,
});
```

- [ ] **Шаг 3: Заменить вызов обновления после сохранения**

Заменить:

```typescript
resetForm(activeType.value);
await refreshNuxtData();
closeModal();
```

На:

```typescript
resetForm(activeType.value);
emit('entryCreated');
closeModal();
```

- [ ] **Шаг 4: Упростить `errorMessage`**

Заменить всю функцию на:

```typescript
function errorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Could not save the entry';
}
```

- [ ] **Шаг 5: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `HealthQuickEntryModal.vue`. (В `HealthShell.vue` появится новая ошибка из-за необработанного emit `entryCreated` до Задачи 21.)

- [ ] **Шаг 6: Коммит**

```bash
git add app/components/HealthQuickEntryModal.vue
git commit -m "Save quick entries directly to the local repositories"
```

---

### Задача 20: Подключить дашборд к репозиториям, добавить экспорт/импорт JSON

**Файлы:**
- Изменить: `app/pages/index.vue`
- Создать: `app/lib/db/export-import.ts`
- Создать: `app/components/DashboardDataActions.vue`

**Интерфейсы:**
- Использует: `listGlucoseMeasurements`, `listBloodPressureMeasurements`, `listWeightMeasurements`, `listSymptomEntries` (Phase B).
- Результат: `exportHealthMonitorData()`, `downloadHealthMonitorExport()`, `importHealthMonitorData(file)` — используются только здесь, в рамках Step 1.

- [ ] **Шаг 1: Написать модуль экспорта/импорта**

```typescript
import { healthDb } from '~/lib/db/schema';
import type { BloodPressureMeasurement } from '~/types/blood-pressure';
import type { GlucoseMeasurement } from '~/types/glucose';
import type { SymptomEntry } from '~/types/symptom';
import type { WeightMeasurement } from '~/types/weight';

export type HealthMonitorExport = {
  version: 1;
  exportedAt: string;
  data: {
    glucoseMeasurement: GlucoseMeasurement[];
    bloodPressureMeasurement: BloodPressureMeasurement[];
    weightMeasurement: WeightMeasurement[];
    symptomEntry: SymptomEntry[];
  };
};

export async function exportHealthMonitorData(): Promise<HealthMonitorExport> {
  const [glucoseMeasurement, bloodPressureMeasurement, weightMeasurement, symptomEntry] =
    await Promise.all([
      healthDb.glucoseMeasurement.toArray(),
      healthDb.bloodPressureMeasurement.toArray(),
      healthDb.weightMeasurement.toArray(),
      healthDb.symptomEntry.toArray(),
    ]);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { glucoseMeasurement, bloodPressureMeasurement, weightMeasurement, symptomEntry },
  };
}

export function downloadHealthMonitorExport(exportData: HealthMonitorExport): void {
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `health-monitor-export-${exportData.exportedAt.slice(0, 10)}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

export async function importHealthMonitorData(file: File): Promise<void> {
  const text = await file.text();
  const parsed = JSON.parse(text) as HealthMonitorExport;

  if (parsed.version !== 1 || !parsed.data) {
    throw new Error('Unsupported export file format');
  }

  await healthDb.transaction(
    'rw',
    [
      healthDb.glucoseMeasurement,
      healthDb.bloodPressureMeasurement,
      healthDb.weightMeasurement,
      healthDb.symptomEntry,
    ],
    async () => {
      await Promise.all([
        healthDb.glucoseMeasurement.clear(),
        healthDb.bloodPressureMeasurement.clear(),
        healthDb.weightMeasurement.clear(),
        healthDb.symptomEntry.clear(),
      ]);

      await Promise.all([
        healthDb.glucoseMeasurement.bulkAdd(parsed.data.glucoseMeasurement),
        healthDb.bloodPressureMeasurement.bulkAdd(parsed.data.bloodPressureMeasurement),
        healthDb.weightMeasurement.bulkAdd(parsed.data.weightMeasurement),
        healthDb.symptomEntry.bulkAdd(parsed.data.symptomEntry),
      ]);
    },
  );
}
```

- [ ] **Шаг 2: Добавить UI экспорта/импорта на дашборде**

```vue
<script setup lang="ts">
import {
  downloadHealthMonitorExport,
  exportHealthMonitorData,
  importHealthMonitorData,
} from '~/lib/db/export-import';

const emit = defineEmits<{
  imported: [];
}>();

const toast = useToast();
const fileInput = ref<HTMLInputElement | null>(null);
const importing = ref(false);

async function exportData() {
  const exportData = await exportHealthMonitorData();
  downloadHealthMonitorExport(exportData);
}

function openImportDialog() {
  fileInput.value?.click();
}

async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    return;
  }

  const confirmed = window.confirm(
    'Importing will replace all local data with the contents of this file. Continue?',
  );

  if (!confirmed) {
    input.value = '';
    return;
  }

  try {
    importing.value = true;
    await importHealthMonitorData(file);

    toast.add({
      title: 'Import complete',
      description: 'The local database was replaced with the imported file.',
    });

    emit('imported');
  } catch (error) {
    toast.add({
      title: 'Import failed',
      description: error instanceof Error ? error.message : 'Could not import the file',
      color: 'error',
    });
  } finally {
    importing.value = false;
    input.value = '';
  }
}
</script>

<template>
  <div class="health-dashboard-data-actions">
    <button
      type="button"
      class="health-button health-button-secondary health-button-small"
      @click="exportData"
    >
      Export JSON
    </button>
    <button
      type="button"
      class="health-button health-button-secondary health-button-small"
      :disabled="importing"
      @click="openImportDialog"
    >
      {{ importing ? 'Importing…' : 'Import JSON' }}
    </button>
    <input
      ref="fileInput"
      type="file"
      accept="application/json"
      class="sr-only"
      @change="handleFileChange"
    >
  </div>
</template>
```

- [ ] **Шаг 3: Обновить `app/pages/index.vue`**

Заменить блок загрузки данных:

```typescript
import { listGlucoseMeasurements } from '~/lib/db/repositories/glucoseRepository';
import { listBloodPressureMeasurements } from '~/lib/db/repositories/bloodPressureRepository';
import { listWeightMeasurements } from '~/lib/db/repositories/weightRepository';
import { listSymptomEntries } from '~/lib/db/repositories/symptomRepository';
import DashboardDataActions from '~/components/DashboardDataActions.vue';

const { periodFilters, query } = usePeriodFilter();
const emptyDashboardData: DashboardData = {
  bloodPressure: [],
  glucose: [],
  symptoms: [],
  weight: [],
};

const data = ref<DashboardData>(emptyDashboardData);

async function refresh() {
  const [glucose, bloodPressure, weight, symptoms] = await Promise.all([
    listGlucoseMeasurements(query.value),
    listBloodPressureMeasurements(query.value),
    listWeightMeasurements(query.value),
    listSymptomEntries(query.value),
  ]);

  data.value = { bloodPressure, glucose, symptoms, weight };
}

watch(query, refresh);
await refresh();

const dashboardData = computed(() => data.value ?? emptyDashboardData);
```

(Оставить `periodHeadlineSuffix`, `useHead`, `useSeoMeta` без изменений.)

Добавить компонент действий с данными в hero-секцию и передать `refresh` там, где раньше использовался `refresh` из `useAsyncData`:

```html
<DashboardSummaryPanel :data="dashboardData" />
<DashboardDataActions @imported="refresh" />
```

- [ ] **Шаг 4: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `index.vue`, `DashboardDataActions.vue` или `app/lib/db/export-import.ts`.

Ручная проверка (разработчик): открыть `/`, нажать «Export JSON», убедиться, что скачивается файл со всеми четырьмя массивами; добавить запись через быстрый ввод, нажать «Import JSON» с ранее экспортированным файлом, убедиться, что появляется диалог подтверждения в браузере, и что после подтверждения дашборд соответствует содержимому экспортированного снимка.

- [ ] **Шаг 5: Коммит**

```bash
git add app/lib/db/export-import.ts app/components/DashboardDataActions.vue app/pages/index.vue
git commit -m "Wire the dashboard to the local repositories, add JSON export/import"
```

---

### Задача 21: Убрать UI авторизации из shell приложения, подключить обновление после быстрого ввода

**Файлы:**
- Изменить: `app/components/HealthShell.vue`
- Удалить: `app/components/HealthAuthModal.vue`
- Удалить: `app/pages/auth/callback.vue` (обнаружено при выполнении Задачи 22: оба файла становятся полностью осиротелыми уже здесь — `HealthAuthModal.vue` теряет своего единственного вызывающего в этом же шаге, `auth/callback.vue` был осиротелым ещё с Задачи 13. Изначально план откладывал их удаление до Phase G/Задачи 24, но это делало условие Задачи 22 («никаких ошибок typecheck нигде в `app/`») недостижимым до Phase G. По решению пользователя удаление перенесено сюда; функциональное удаление остального бэкенда (server/*, зависимости Supabase/Firebase/Prisma) по-прежнему происходит только в Phase G.)

**Интерфейсы:**
- Использует: emit `entryCreated` из `HealthQuickEntryModal.vue` (Задача 19).

- [ ] **Шаг 1: Убрать импорты, состояние и обработчики авторизации**

Убрать из `<script setup>` следующие строки:

```typescript
import { useFirebaseAuth } from '~/composables/useFirebaseAuth';
```

```typescript
const supabase = useSupabaseClient();
const user = useSupabaseUser();
```

```typescript
const authModalOpen = ref(false);
const { logout, isAuthenticated, isLoading } = useFirebaseAuth();
```

```typescript
function openAuthModal() {
  if (user.value) {
    return;
  }

  authModalOpen.value = true;
}

function closeAuthModal() {
  authModalOpen.value = false;
}
```

```typescript
async function signOut() {
  try {
    await logout();
    await refreshNuxtData();

    toast.add({
      title: 'Signed out',
      description: 'The app returned to guest mode.',
    });
  } catch (error) {
    toast.add({
      title: 'Sign out failed',
      description: errorMessage(error),
      color: 'error',
    });
  }
}
```

Оставить `errorMessage` только если он ещё используется где-то ещё в файле; иначе убрать и его тоже (он использовался только в `signOut`).

- [ ] **Шаг 2: Убрать UI авторизации из шаблона**

Заменить:

```html
<NuxtLink to="/" class="health-brand" @dblclick.prevent="openAuthModal">
  <span class="health-mark">HM</span>
  <span>Health Monitor</span>
</NuxtLink>
```

На:

```html
<NuxtLink to="/" class="health-brand">
  <span class="health-mark">HM</span>
  <span>Health Monitor</span>
</NuxtLink>
```

Заменить:

```html
<div class="health-actions">
  <button
    v-if="isAuthenticated"
    type="button"
    class="health-button health-button-secondary health-button-small"
    @click="signOut"
  >
    Sign Out
  </button>
  <button
    type="button"
    class="health-button"
    @click="quickEntryOpen = true"
  >
    + Add entry
  </button>
</div>
```

На:

```html
<div class="health-actions">
  <button
    type="button"
    class="health-button"
    @click="quickEntryOpen = true"
  >
    + Add entry
  </button>
</div>
```

Заменить:

```html
<HealthQuickEntryModal
  :open="quickEntryOpen"
  @close="quickEntryOpen = false"
/>

<HealthAuthModal :open="authModalOpen" @close="closeAuthModal" />
```

На:

```html
<HealthQuickEntryModal
  :open="quickEntryOpen"
  @close="quickEntryOpen = false"
  @entry-created="refreshNuxtData"
/>
```

Примечание: `refreshNuxtData` (без аргумента) — встроенная функция Nuxt, обновляющая все ключи `useAsyncData`/`useFetch` на текущей странице; поскольку Задачи 15–20 теперь загружают данные через обычные `ref`, заполняемые локальной функцией `refresh()`, вместо этого нужно событие уровня страницы — см. Шаг 3.

- [ ] **Шаг 3: Дать быстрому вводу настоящий способ обновить текущую страницу**

Поскольку теперь каждая страница (Задачи 15–18, 20) владеет собственной `refresh()` из `useMeasurementList` или собственной локальной `refresh`, а `HealthShell` — это обёртка layout вокруг `<slot />`, самый простой корректный вариант — оставить emit `entryCreated` от `HealthQuickEntryModal` всплывающим через `HealthShell`, но вместо переизлучения через кросс-компонентные события использовать встроенную перезагрузку страницы Nuxt, что проще и соответствует принципу «минимально достаточный шаг»:

Заменить `@entry-created="refreshNuxtData"` из Шага 2 на:

```html
<HealthQuickEntryModal
  :open="quickEntryOpen"
  @close="quickEntryOpen = false"
  @entry-created="() => reloadNuxtApp({ persistState: false, path: route.path })"
/>
```

Это делает полную клиентскую перезагрузку текущего маршрута, что заново выполняет `<script setup>` страницы (включая её вызов `await useMeasurementList(...)` / `await refresh()`) и поэтому показывает новую запись. Это чуть более «тяжёлое» обновление, чем точечный вызов `refresh()`, но не требует новой кросс-компонентной проводки событий, а быстрый ввод — не такое уж частое действие.

- [ ] **Шаг 4: Проверка**

Выполнить: `npm run typecheck`
Ожидается: никаких новых ошибок из `HealthShell.vue`.

Ручная проверка (разработчик): открыть любую страницу сущности, добавить новую запись через «+ Add entry», убедиться, что страница перезагружается и новая запись появляется в таблице и на графике.

- [ ] **Шаг 5: Коммит**

```bash
git add app/components/HealthShell.vue
git commit -m "Remove the auth UI from the app shell; refresh the page after quick entry"
```

---

## Phase F — Проверить новый путь, прежде чем трогать старый бэкенд

### Задача 22: Полный проход проверки

**Файлы:** нет (только проверка)

- [ ] **Шаг 1: Проверка типов**

Выполнить: `npm run typecheck`
Ожидается: никаких ошибок нигде в `app/`.

- [ ] **Шаг 2: Линтер**

Выполнить: `npm run lint`
Ожидается: никаких ошибок. `server/`, `tests/server/` и composables/компоненты, убранные из пути данных (`useApiFetch.ts`, `useFirebaseAuth.ts`, `HealthAuthModal.vue`), на этом этапе всё ещё существуют и по-прежнему проходят линт чисто — они удаляются в Phase G, а не изменяются здесь.

- [ ] **Шаг 3: Сборка**

Выполнить: `npm run build`
Ожидается: сборка проходит успешно. Поскольку в Задаче 13 был выставлен `ssr: false`, это даёт только клиентский бандл; никакого серверного вывода, который мог бы сломаться, пока нет, так как `server/api` всё ещё существует, но теперь не используется ни одной страницей.

- [ ] **Шаг 4: Ручное дымовое тестирование (разработчик)**

С очищенной IndexedDB для dev-origin (devtools браузера → Application → IndexedDB → удалить `health-monitor`):

1. Открыть приложение — дашборд показывает засеянные демо-данные на всех четырёх графиках и в панели сводки.
2. Открыть каждую из `/glucose`, `/blood-pressure`, `/weight`, `/symptoms` — в каждой таблице 10 строк.
3. Добавить быструю запись для каждого из четырёх типов — каждая появляется после перезагрузки страницы.
4. Отметить одну запись на применимую сущность как игнорируемую с причиной, убедиться, что она показана игнорируемой, затем восстановить её.
5. Отредактировать заметку симптома, убедиться, что она сохраняется.
6. Экспортировать CSV с каждой страницы сущности, убедиться, что в каждом файле ожидаемые колонки и число строк.
7. Экспортировать JSON с дашборда, убедиться, что в файле все четыре массива.
8. Полностью перезагрузить приложение (жёсткая перезагрузка) — убедиться, что ничего не пересевается заново и все изменения сохранились.
9. Импортировать JSON-файл, экспортированный на шаге 7 — убедиться, что появляется диалог подтверждения, и после подтверждения дашборд соответствует экспортированному снимку.

Не автоматизировать это инструментом, управляющим браузером, если не попросили — это ручной проход разработчика согласно общим инструкциям проекта.

- [ ] **Шаг 5: Отчёт и пауза**

Не переходить к Phase G, пока разработчик не подтвердит, что все проверки из Шага 4 прошли. Если что-то не работает — исправить и заново пройти Шаги 1–4, прежде чем двигаться дальше — это явная контрольная точка, о которой явно попросил пользователь («сначала построить и проверить IndexedDB, бэкенд убрать отдельным шагом»).

---

## Phase G — Убрать старый бэкенд (только после того, как Phase F подтверждена)

### Задача 23: Удалить серверный API и репозитории

**Файлы:**
- Удалить: `server/api/` (весь каталог)
- Удалить: `server/repositories/` (весь каталог)
- Удалить: `server/utils/auth.ts`, `server/utils/firebase-admin.ts`, `server/utils/firestore.ts`, `server/utils/health-records.ts`, `server/utils/requireFirebaseUser.ts`, `server/utils/requireUser.ts`, `server/utils/prisma.ts`, `server/utils/date-range.ts`
- Удалить: `tests/server/health-records.test.ts`

- [ ] **Шаг 1: Удалить файлы**

```bash
git rm -r server/api server/repositories
git rm server/utils/auth.ts server/utils/firebase-admin.ts server/utils/firestore.ts server/utils/health-records.ts server/utils/requireFirebaseUser.ts server/utils/requireUser.ts server/utils/prisma.ts server/utils/date-range.ts
git rm -r tests/server
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck && npm run lint`
Ожидается: никаких ошибок — после Phase E ничего в `app/` не импортирует из `server/`.

- [ ] **Шаг 3: Коммит**

```bash
git commit -m "Remove the server API, repositories, and their tests"
```

---

### Задача 24: Удалить клиентские остатки авторизации/Firebase

**Файлы:**
- Удалить: `app/composables/useApiFetch.ts`
- Удалить: `app/composables/useFirebaseAuth.ts`
- Удалить: `app/lib/firebase.client.ts`

(`app/components/HealthAuthModal.vue` и `app/pages/auth/callback.vue` были удалены раньше, в Задаче 21, чтобы Задача 22 могла достичь чистого typecheck до этой фазы — см. примечание там.)

- [ ] **Шаг 1: Удалить файлы**

```bash
git rm app/composables/useApiFetch.ts app/composables/useFirebaseAuth.ts app/lib/firebase.client.ts
```

- [ ] **Шаг 2: Проверка**

Выполнить: `npm run typecheck && npm run lint`
Ожидается: никаких ошибок — `HealthShell.vue` больше не импортирует `useFirebaseAuth` (Задача 21), и ни одна страница не использует `useApiFetch` (Phase E).

- [ ] **Шаг 3: Коммит**

```bash
git commit -m "Remove the Firebase auth composable and the auth modal"
```

---

### Задача 25: Убрать зависимости бэкенда, скрипты и тулчейн Prisma

**Файлы:**
- Изменить: `package.json`
- Удалить: `prisma/dev.db`, `prisma/migrations/`, `prisma/seed.mjs`, `prisma.config.ts`
- Оставить: `prisma/schema.prisma` (в урезанном виде, только как документация)

- [ ] **Шаг 1: Убрать рантайм-зависимости бэкенда**

Выполнить:

```bash
npm uninstall @nuxtjs/supabase firebase firebase-admin @prisma/adapter-pg @prisma/client prisma
```

- [ ] **Шаг 2: Убрать теперь неиспользуемые npm-скрипты `prisma:*`**

В `package.json` убрать:

```json
"prisma:generate": "prisma generate",
"prisma:migrate": "prisma migrate dev",
"prisma:studio": "prisma studio",
"prisma:validate": "prisma validate",
```

- [ ] **Шаг 3: Удалить рантайм-артефакты Prisma, оставить только схему**

```bash
git rm prisma/dev.db prisma/seed.mjs prisma.config.ts
git rm -r prisma/migrations
```

`prisma/schema.prisma` остаётся (уже урезан от `isDemo` и специфики Postgres в Задаче 1) как документированный референс для схемы Dexie в `app/lib/db/schema.ts`.

- [ ] **Шаг 4: Убрать теперь неиспользуемые `dotenv` и `tsx`, если на них больше никто не ссылается**

Выполнить: `npx depcheck` либо поискать по кодовой базе импорты `dotenv` / `tsx` вне только что удалённых файлов. Если больше ничто их не импортирует:

```bash
npm uninstall dotenv tsx
```

- [ ] **Шаг 5: Проверка**

Выполнить: `npm run typecheck && npm run lint && npm run build`
Ожидается: все три команды проходят успешно без единой ссылки на удалённые пакеты.

- [ ] **Шаг 6: Коммит**

```bash
git add package.json package-lock.json prisma/schema.prisma
git commit -m "Remove Supabase, Firebase, and the Prisma runtime toolchain"
```

---

### Задача 26: Убрать инфраструктурные файлы Firebase/Supabase и устаревшие документы миграции

**Файлы:**
- Удалить: `firebase.json`, `firestore.rules`, `firestore.indexes.json`, `filestore.indexes.json.back`, `.firebaserc`
- Удалить: `docs/firestore-integration/` (весь каталог)
- Удалить: `docs/auth-plan.md`, `docs/auth-summary.md`, `docs/db-change-plan.md`

- [ ] **Шаг 1: Удалить инфраструктурные файлы**

```bash
git rm firebase.json firestore.rules firestore.indexes.json filestore.indexes.json.back .firebaserc
```

- [ ] **Шаг 2: Удалить устаревшие документы**

```bash
git rm -r docs/firestore-integration
git rm docs/auth-plan.md docs/auth-summary.md docs/db-change-plan.md
```

- [ ] **Шаг 3: Ручная очистка (разработчик, без коммита)**

Убрать `DATABASE_URL`, `DIRECT_URL` и любые ключи Firebase/Supabase из локального файла `.env` — он не отслеживается git, поэтому этот план не может сделать это за вас.

- [ ] **Шаг 4: Проверка**

Выполнить: `npm run build`
Ожидается: успешно, без ссылок на удалённые конфигурационные файлы (Nuxt не читает `firebase.json`/`firestore.rules` во время сборки, так что это просто гигиена репозитория, а не зависимость сборки).

- [ ] **Шаг 5: Коммит**

```bash
git commit -m "Remove Firebase/Supabase infra files and stale migration docs"
```

---

### Задача 27: Обновить документ передачи проекта, финальная проверка

**Файлы:**
- Изменить: `docs/project-state.md`

- [ ] **Шаг 1: Обновить разделы «Important Decisions» и «Current State»**

Заменить строку `Keep SQLite as the local store through Prisma.` на `Store all data client-side in IndexedDB via Dexie.js; no server, no auth.` Добавить строку о том, что `prisma/schema.prisma` — это только документация. Обновить `Current State`, описав локальную архитектуру вместо (уже удалённого) состояния Supabase/Firebase.

- [ ] **Шаг 2: Финальная полная проверка**

Выполнить: `npm run typecheck && npm run lint && npm run build`
Ожидается: все команды проходят успешно.

- [ ] **Шаг 3: Коммит**

```bash
git add docs/project-state.md
git commit -m "Update the project handoff doc for the local-first architecture"
```

---

## Итог того, что даёт Step 1

- Никакого бэкенда, никакой авторизации: одна локальная база IndexedDB на браузер (Dexie.js), повторяющая `prisma/schema.prisma`.
- Первый запуск заполняет себя из `public/data/demo.json`, сгенерированного `scripts/generate-demo-data.mjs` (наследник `prisma/seed.mjs`).
- Экспорт/импорт всей базы в JSON с дашборда; экспорт CSV по каждой сущности с её страницы.
- Старый бэкенд (Supabase, Firebase/Firestore, `server/api`, рантайм Prisma) убирается только после того, как новый путь полностью проверен.
