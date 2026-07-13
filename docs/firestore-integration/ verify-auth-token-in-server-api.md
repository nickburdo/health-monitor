#  Verify auth token in server/api

- Создать composable `app/composables/useApiFetch.ts`
- Создать хелпер для проверки токена `erver/utils/requireFirebaseUser.ts`
- Создать хелпер для получения юзера `server/utils/requireUser.ts`
- В API-методах заменить
```ts
const userId = 'dev-user';
```
на реальные `uid`
```ts
const user = await requireUser(event);

const userId = user.uid;
```
