# Next Updates

## Step 1: ✅ Выполнено

План реализации: [`docs/plans/step-1-local-first-plan.md`](../plans/step-1-local-first-plan.md).

1. [x] Полностью отказаться от бек-енд.
2. [x] Данные хранить в IndexedDB.
3. [x] Структуру БД делать на основе схемы Prisma.
4. [x] Если БД еще нету в браузере, создать и заполнить демо данными.
5. [x] Демо данные хранить в `public/data/demo.json`.
6. [x] Для создания демо данных использовать структуру БД и `prisma/seed.mjs`.
7. [x] Сделать экспорт/импорт JSON для всей БД (на дашборде) и экспорт CSV для каждой сущности (на странице сущности).

## Step 2:

1. Сделать PWA.
2. [x] Тёмная тема и переключатель светлой/тёмной темы в шапке. План: [`docs/plans/dark-theme-plan.md`](../plans/dark-theme-plan.md).
3. [x] Кнопки «Load demo data» и «Clear database» на дашборде рядом с экспортом/импортом JSON. План: [`docs/plans/demo-data-actions-plan.md`](../plans/demo-data-actions-plan.md).
4. [x] Собственный диалог подтверждения в стиле приложения вместо `window.confirm`. План: [`docs/plans/confirm-dialog-plan.md`](../plans/confirm-dialog-plan.md).
5. [x] Глюкоза в mmol/L без пересчётов: убрать деление на 18, перевести старые данные из mg/dL в mmol/L. План: [`docs/plans/glucose-mmol-units-plan.md`](../plans/glucose-mmol-units-plan.md).
6. [x] Обновление внешнего вида: выпадающее меню в шапке, карточки дашборда — ссылки, шрифт единиц, графики без сплющивания. План: [`docs/plans/ui-layout-refresh-plan.md`](../plans/ui-layout-refresh-plan.md).

## Step 3: ✅ Выполнено — внешний API и авторизация

1. [x] Данные через Platform API вместо IndexedDB; вход (логин/пароль, Google), регистрация, гость видит демо-данные и ничего не меняет; удаление аккаунта; кнопки базы на дашборде убраны. План: [`docs/plans/platform-api-auth-plan.md`](../plans/platform-api-auth-plan.md).
