# Health Monitor — API specification

Документ описывает все текущие API-эндпойнты проекта, их входные payload и ответы.

## Общие правила

- Все ответы JSON.
- Все списки возвращаются в порядке убывания по дате записи.
- Для списка можно передать диапазон дат через query-параметры `dateFrom` и `dateTo`.
- Для глюкозы, давления и веса сервер сам проставляет `ignore: false`.
- Для симптомов поле `ignore` отсутствует.
- Для глюкозы, давления и веса `PATCH /:id/ignore` меняет только флаг `ignore` у всей записи.
- При `ignore: true` в payload `PATCH /:id/ignore` обязательно передается `note`.
- Для симптомов `PATCH /api/symptoms/:id` обновляет только `note`.

## Общий формат ошибки

Если запрос завершается ошибкой, API возвращает объект ошибки H3/Nuxt в JSON-формате.

```json
{
  "statusCode": 400,
  "statusMessage": "measuredAt is required"
}
```

### Поля объекта ошибки

- `statusCode` - HTTP-код ошибки, например `400` или `404`.
- `statusMessage` - текст ошибки, пригодный для показа пользователю или логирования.

В проекте именно это сообщение задается через `createError(...)` на сервере.

---

## Glucose

### `GET /api/glucose`

Возвращает список измерений глюкозы.

#### Query

- `dateFrom` - optional, ISO-8601 string.
- `dateTo` - optional, ISO-8601 string.

#### Ответ

```json
[
  {
    "id": "cm123...",
    "measuredAt": "2026-06-05T08:00:00.000Z",
    "fastingValue": 6.1,
    "afterMealValue": 8.4,
    "ignore": false,
    "note": "После обычного завтрака",
    "createdAt": "2026-06-05T08:01:00.000Z"
  }
]
```

#### Правила

- Если `dateFrom` и/или `dateTo` переданы, фильтрация идет по `measuredAt`.
- Если `dateFrom > dateTo`, вернется ошибка `400`.

### `POST /api/glucose`

Создает новое измерение глюкозы.

#### Payload

```json
{
  "measuredAt": "2026-06-05T08:00:00.000Z",
  "fastingValue": 6.1,
  "afterMealValue": 8.4,
  "note": "После обычного завтрака"
}
```

#### Поля payload

- `measuredAt` - required, ISO-8601 string.
- `fastingValue` - optional number.
- `afterMealValue` - optional number.
- `note` - optional string.

#### Правила

- Нужно передать хотя бы одно значение: `fastingValue` или `afterMealValue`.
- В ответе приходит созданная запись с `ignore: false`.

### `PATCH /api/glucose/:id/ignore`

Меняет флаг `ignore` у записи целиком.

#### Payload

```json
{
  "ignore": true,
  "note": "Сомнительное значение после еды"
}
```

#### Поля payload

- `ignore` - required boolean.
- `note` - required string, если `ignore=true`.

При `ignore=false` note передавать не нужно.

#### Ответ

Возвращает обновленную запись глюкозы, включая сохраненный `note`.

#### Примечание

- Для восстановления записи достаточно `{ "ignore": false }`.

---

## Blood Pressure

### `GET /api/blood-pressure`

Возвращает список измерений давления.

#### Query

- `dateFrom` - optional, ISO-8601 string.
- `dateTo` - optional, ISO-8601 string.

#### Ответ

```json
[
  {
    "id": "cm123...",
    "measuredAt": "2026-06-05T08:00:00.000Z",
    "systolic": 128,
    "diastolic": 82,
    "pulse": 70,
    "ignore": false,
    "note": "После прогулки",
    "createdAt": "2026-06-05T08:02:00.000Z"
  }
]
```

#### Правила

- Фильтрация идет по `measuredAt`.
- Если `dateFrom > dateTo`, вернется ошибка `400`.

### `POST /api/blood-pressure`

Создает новое измерение давления.

#### Payload

```json
{
  "measuredAt": "2026-06-05T08:00:00.000Z",
  "systolic": 128,
  "diastolic": 82,
  "pulse": 70,
  "note": "После прогулки"
}
```

#### Поля payload

- `measuredAt` - required, ISO-8601 string.
- `systolic` - optional integer.
- `diastolic` - optional integer.
- `pulse` - optional integer.
- `note` - optional string.

#### Правила

- Нужно передать хотя бы одно из значений: `systolic`, `diastolic`, `pulse`.
- В ответе приходит созданная запись с `ignore: false`.

### `PATCH /api/blood-pressure/:id/ignore`

Меняет флаг `ignore` у записи целиком.

#### Payload

```json
{
  "ignore": true,
  "note": "Манжета была надета неправильно"
}
```

#### Ответ

Возвращает обновленную запись давления, включая сохраненный `note`.

#### Примечание

- Для восстановления записи достаточно `{ "ignore": false }`.

---

## Weight

### `GET /api/weight`

Возвращает список измерений веса.

#### Query

- `dateFrom` - optional, ISO-8601 string.
- `dateTo` - optional, ISO-8601 string.

#### Ответ

```json
[
  {
    "id": "cm123...",
    "measuredAt": "2026-06-05T08:00:00.000Z",
    "value": 91.4,
    "ignore": false,
    "note": "Утренний замер",
    "createdAt": "2026-06-05T08:03:00.000Z"
  }
]
```

#### Правила

- Фильтрация идет по `measuredAt`.
- Если `dateFrom > dateTo`, вернется ошибка `400`.

### `POST /api/weight`

Создает новое измерение веса.

#### Payload

```json
{
  "measuredAt": "2026-06-05T08:00:00.000Z",
  "value": 91.4,
  "note": "Утренний замер"
}
```

#### Поля payload

- `measuredAt` - required, ISO-8601 string.
- `value` - required number.
- `note` - optional string.

#### Ответ

Возвращает созданную запись с `ignore: false`.

### `PATCH /api/weight/:id/ignore`

Меняет флаг `ignore` у записи целиком.

#### Payload

```json
{
  "ignore": true,
  "note": "Неверный замер на весах"
}
```

#### Ответ

Возвращает обновленную запись веса, включая сохраненный `note`.

#### Примечание

- Для восстановления записи достаточно `{ "ignore": false }`.

---

## Symptoms

### `GET /api/symptoms`

Возвращает список симптомов.

#### Query

- `dateFrom` - optional, ISO-8601 string.
- `dateTo` - optional, ISO-8601 string.

#### Ответ

```json
[
  {
    "id": "cm123...",
    "happenedAt": "2026-06-05T08:00:00.000Z",
    "type": "Other",
    "intensity": 6,
    "note": "Свободный комментарий",
    "createdAt": "2026-06-05T08:04:00.000Z"
  }
]
```

#### Правила

- Фильтрация идет по `happenedAt`.
- Если `dateFrom > dateTo`, вернется ошибка `400`.

### `POST /api/symptoms`

Создает новую запись симптома.

#### Payload

```json
{
  "happenedAt": "2026-06-05T08:00:00.000Z",
  "type": "Other",
  "intensity": 6,
  "note": "Свободный комментарий"
}
```

#### Поля payload

- `happenedAt` - required, ISO-8601 string.
- `type` - required string из статического справочника симптомов.
- `intensity` - optional integer.
- `note` - optional string.

#### Допустимые значения `type`

- `метеоризм`
- `понос`
- `запор`
- `боль в животе`
- `тошнота`
- `слабость`
- `головная боль`
- `плохой сон`
- `стресс`
- `физическая активность`
- `изменение питания`
- `Other`

#### Ответ

Возвращает созданную запись.

### `PATCH /api/symptoms/:id`

Обновляет только `note` у симптома.

#### Payload

```json
{
  "note": "Свободный комментарий"
}
```

#### Ответ

Возвращает обновленную запись симптома.

#### Поля payload

- `note` - required string или `null`.

Если передать `null` или пустую строку, заметка будет очищена.

---

## Итог по ответам

Все `GET` и `POST` эндпойнты возвращают объект сущности или массив объектов сущностей.

Все `PATCH /:id/ignore` эндпойнты для глюкозы, давления и веса возвращают обновленную запись того же типа, что и исходный ресурс, с записанным `note`.

`PATCH /api/symptoms/:id` возвращает обновленную запись симптома с новым `note`.

При ошибке возвращается JSON-объект с `statusCode` и `statusMessage`.
