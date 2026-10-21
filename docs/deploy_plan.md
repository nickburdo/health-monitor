# Деплой на Cloudflare Pages

Приложение — клиентский Nuxt SPA (`ssr: false`, без бэкенда, данные в IndexedDB браузера), поэтому хостится как статический сайт на Cloudflare Pages.

- **Основной сайт:** https://health-monitor-new.pages.dev/
- **Проект в Cloudflare:** Workers & Pages → `health-monitor-new`
- **Репозиторий:** https://github.com/nickburdo/health-monitor (`origin`)

## Как устроен деплой

Проект Cloudflare Pages подключён к GitHub-репозиторию через приложение **Cloudflare Workers and Pages** (Git integration). Отдельного workflow деплоя в `.github/workflows` и конфигурации `wrangler` в репозитории нет — сборку и публикацию делает сам Cloudflare.

1. **Push любой ветки в `origin`** → Cloudflare собирает её и публикует preview:
   - адрес ветки: `https://<имя-ветки>.health-monitor-new.pages.dev` (слэш в имени ветки заменяется на дефис, например `feature/dark-theme` → `feature-dark-theme`);
   - адрес конкретной сборки: `https://<id-сборки>.health-monitor-new.pages.dev`.
2. **PR в `main`** → на коммитах видны проверки:
   - `Cloudflare Pages` — статус сборки и ссылки на preview;
   - `ci` (GitHub Actions, `.github/workflows/ci.yml`) — `npm run lint` и `npm run typecheck`.
3. **Merge в `main`** → Cloudflare пересобирает и публикует основной сайт.

## Рабочий процесс для новой задачи

1. Создать ветку от актуального `main`.
2. Закоммитить изменения и отправить ветку: `git push -u origin <ветка>`.
3. Дождаться проверки `Cloudflare Pages` и посмотреть preview по адресу ветки.
4. Открыть PR в `main`, убедиться, что `ci` и `Cloudflare Pages` зелёные.
5. Сделать merge — основной сайт обновится автоматически.

## Где смотреть статус и настройки

- **GitHub:** значок проверки у коммита или вкладка Checks в PR; установленное приложение — Settings → Integrations → GitHub Apps.
- **Cloudflare:** Workers & Pages → `health-monitor-new`:
  - Deployments — список сборок и логи;
  - Settings → Build — подключённый репозиторий, команда сборки, папка результата, ветка основного сайта.

## Настройки сборки (уточнить в панели Cloudflare)

Из репозитория точные настройки сборки не видны — они хранятся в панели Cloudflare (Settings → Build). Ожидаемые значения для статического Nuxt SPA:

| Параметр | Ожидаемое значение |
| --- | --- |
| Ветка основного сайта | `main` |
| Команда сборки | `npm run generate` (`nuxt generate`) |
| Папка результата | `dist` (или `.output/public`) |
| Переменные окружения | не нужны — бэкенда нет |

После сверки с панелью стоит заменить эту таблицу фактическими значениями.

## Чего больше нет

Прежний вариант деплоя на Render (Node-сервер, `npx prisma generate`, `node .output/server/index.mjs`, переменные из `.env`) устарел: бэкенд и Prisma удалены при переходе на local-first (см. `docs/plans/step-1-local-first-plan.md`). Переменные Supabase/Postgres/Firebase в `.env` приложением не используются.
