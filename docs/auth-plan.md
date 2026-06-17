# Authentication Plan

## Create Google Cloud OAuth Client

- [x] Зайти в [Google Cloud Console](https://console.cloud.google.com?utm_source=chatgpt.com)
- [x] APIs & Services → Credentials → Create Credentials → OAuth Client ID
- [x] Выбрать Application type (Web application)
- [x] Ввести имя 
- [x] Открыть в другой вкладке Supabase → Authentication → Sign In/Providers → Google
- [x] Скопировать Callback URL из Supabase и вставить в поле `Authorized redirect URIs` в Google Cloud
- [x] Вставить этот же URI также в поле `Authorized JavaScript origins` в Google Cloud и удалить `/auth/v1/callback` в конце (оставить только домен Supabase проекта)
- [x] Создать OAuth Client
- [x] Скопировать `Client ID` и `Client secret` и вставить в соответствующие поля Google провайдера в Supabase
- [x] Включить `Enable Sign in with Google` в Supabase и сохранить провайдер 

## Configure Supabase

### Authentication -> Sign In/Providers:

-[x] Проверить включение провайдеров:
- Email (включен по умолчанию)
- Google (включен в предыдущем разделе)

### Authentication -> URL Configuration:

-[x] Site URL:
```
http://localhost:3030
```

-[x] Redirect URLs:
```
http://localhost:3030/**
https://health-monitor-7w8v.onrender.com/**

```

## Add DB column

-[x] добавить в схему новую колонку:

`prisma/schema.prisma`: 
```prisma
model GlucoseMeasurement {
  // ...
  isDemo Boolean @default(false)
}
// ...
model BloodPressureMeasurement {
  // ...
  isDemo Boolean @default(false)
}
// ...
model WeightMeasurement {
  // ...
  isDemo Boolean @default(false)
}
// ...
model SymptomEntry {
  // ...
  isDemo Boolean @default(false)
}
```

-[x]  запустить миграцию
```bash
npx prisma migrate dev --name add_is_demo
```

## Update seed

Внести изменения в файл `prisma/seed.mjs`:
-[x] К каждому объекту в демо данных (константы `glucoseSeed`, `bloodPressureSeed`, `weightSeed`, `symptomSeed`) добавить `isDemo: true`
```js
// ...
const glucoseSeed = [
  { measuredAt: daysAgo(0), fastingValue: 91, note: 'Morning check', isDemo: true },
  // and so on for all data
];
// and so on for all models
```
-[x] Во всех командах удаления данных указать, что удаляются только демо данные
```js
// ...
async function main() {
  await prisma.$transaction([
    prisma.glucoseMeasurement.deleteMany({where: {isDemo: true}}),
    prisma.bloodPressureMeasurement.deleteMany({where: {isDemo: true}}),
    prisma.weightMeasurement.deleteMany({where: {isDemo: true}}),
    prisma.symptomEntry.deleteMany({where: {isDemo: true}}),
  ]);
  // other transactions
}
```
-[x] Сгенерировать схему
```bash
npm run prisma:generate
```
-[x] Запустить seed
```bash
npx prisma db seed
```

## Fix Admin

-[x] Создать/впустить админа через Supabase Auth
-[x] Взять UUID админа из Authentication → Users
-[x] Заменить `PASTE_ADMIN_SUPABASE_USER_ID_HERE` на UUID и выполнить в SQL editor:
```
create schema if not exists private;

create table if not exists private.admin_users (user_id uuid primary key);

insert into private.admin_users (user_id)
values ('PASTE_ADMIN_SUPABASE_USER_ID_HERE')
    on conflict do nothing;
```
-[x] проверить:
```
select * from private.admin_users;
```
должна быть строка с UUID админа

## RLS for table

-[x] создать функцию `private.is_admin()` (выполнить в SQL Editor):
```
create or replace function private.is_admin()
returns boolean
language sql
security definer
set search_path = private, public
as $$
select exists (
    select 1
    from private.admin_users
    where user_id = auth.uid()
);
$$;
```
-[x] Включить RLS и создать политики (выполнить в SQL Editor):
```
do $$
declare
  table_name text;
  data_name text;
begin
  for table_name, data_name in
    select *
    from (
      values
        ('health_monitor_glucose_measurement', 'glucose'),
        ('health_monitor_blood_pressure_measurement', 'blood pressure'),
        ('health_monitor_weight_measurement', 'weight'),
        ('health_monitor_symptom_entry', 'symptoms')
    ) as tables(table_name, data_name)
  loop
    execute format(
      'alter table public.%I enable row level security;',
      table_name
    );

    execute format(
      'drop policy if exists %I on public.%I;',
      format('guest can read demo %s', data_name),
      table_name
    );

    execute format(
      'create policy %I on public.%I
       for select
       to anon
       using ("isDemo" = true);',
      format('guest can read demo %s', data_name),
      table_name
    );

    execute format(
      'drop policy if exists %I on public.%I;',
      format('admin can read all %s', data_name),
      table_name
    );

    execute format(
      'create policy %I on public.%I
       for select
       to authenticated
       using (private.is_admin());',
      format('admin can read all %s', data_name),
      table_name
    );

    execute format(
      'drop policy if exists %I on public.%I;',
      format('guest can insert demo %s', data_name),
      table_name
    );

    execute format(
      'create policy %I on public.%I
       for insert
       to anon
       with check ("isDemo" = true);',
      format('guest can insert demo %s', data_name),
      table_name
    );

    execute format(
      'drop policy if exists %I on public.%I;',
      format('guest can update demo %s', data_name),
      table_name
    );

    execute format(
      'create policy %I on public.%I
       for update
       to anon
       using ("isDemo" = true)
       with check ("isDemo" = true);',
      format('guest can update demo %s', data_name),
      table_name
    );

    execute format(
      'drop policy if exists %I on public.%I;',
      format('guest can delete demo %s', data_name),
      table_name
    );

    execute format(
      'create policy %I on public.%I
       for delete
       to anon
       using ("isDemo" = true);',
      format('guest can delete demo %s', data_name),
      table_name
    );

    execute format(
      'drop policy if exists %I on public.%I;',
      format('admin can write all %s', data_name),
      table_name
    );

    execute format(
      'create policy %I on public.%I
       for all
       to authenticated
       using (private.is_admin())
       with check (private.is_admin());',
      format('admin can write all %s', data_name),
      table_name
    );
  end loop;
end $$;
```
-[x] Проверить установленные политики:
```
select
  tablename,
  policyname,
  cmd
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```
Будет показано в какой таблице установлена какя полиика

-[x] Проверить, чио у всех таблиц установлено rowsecurity:
```
select
  tablename,
  rowsecurity
from pg_tables
where schemaname = 'public';
```

## API update

-[x] установить Nuxt Supabase:
```bash
npm install @nuxtjs/supabase
```
-[x] добавить в файл `nuxt.config.ts`:
```typescript
export default defineNuxtConfig({
  // ...
  modules: [/* ... */'@nuxtjs/supabase'],
  // ...
  supabase: {
    redirect: false,
  },
})
```
-[x] скопировать из `Supabase` URL публичный кюч и добавить в файл `.env`:
```dotenv
NUXT_PUBLIC_SUPABASE_URL=...
NUXT_PUBLIC_SUPABASE_KEY=...
```
`Supabase -> Project Overview` под именем проекта будет URL и справа кнопка `Copy`  
Там будет и URL и публичный ключ

## APP authorisation Step 1

Создать функционал авторизации по email.

- [x] использовать `useSupabaseClient` для входа и выхода
- [x] текущая Supabase-сессия должна быть доступна на сервере в запросах к job API через cookie/auth state
- [x] после успешного входа и выхода нужно обновлять данные job-списков на клиенте
- [x] ошибки отображать в toast


### Sign In
- [x] создать модальное окно для формы входа
- [x] модальное окно открывается двойным кликом по логотипу, если пользователь еще не авторизован
- [x] создать форму входа с полями `email`  и `password` и кнопкой `Sign In`
- [x] без валидации
- [x] сабмит использует Supabase client auth

### Sign Out
- [x] в правом верхнем углу страницы рахместить кнопку `Sign Out`
- [x] по клику на кнопку использовать Supabase client auth для выхода

## Next API Steps

- [x] Пройтись по всем job API-обработчикам и собрать единый способ определения актера через `server/utils/auth.ts`.
- [x] Использовать текущий `getRequestActor(event)` как точку входа для проверки `serverSupabaseUser(event)` и статуса админа.
- [x] Для `guest` в списке и метаданных всегда добавлять фильтр `where: { isDemo: true }`, чтобы гостю не были видны админские записи.
- [x] Для `admin` в списке и метаданных исключать demo-записи, чтобы админ не видел гостевые данные.
- [x] Для `guest` в `create` и `update` принудительно устанавливать `isDemo: true` на сервере и не принимать это значение с фронта.
- [x] Для `admin` валидировать Supabase session/JWT только на сервере и считать запрос авторизованным только после этой проверки.
- [x] Для всех write-операций не доверять входящим данным из клиента и нормализовать их на сервере перед записью в БД.
- [x] Добавить или обновить тесты для гостевого чтения, гостевого создания/обновления и админского доступа, чтобы закрепить поведение.

## APP authorisation Step 2

- [x] В форму логина добавить авторизацию через Google.
- [x] Добавить отдельную callback-страницу для завершения Google OAuth и редиректа на `/` после обновления auth state.
