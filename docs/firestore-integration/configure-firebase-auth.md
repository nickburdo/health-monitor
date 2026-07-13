# Configure Firebase Auth

- В Firebase Console включить провайдер Google
  - `Security → Authentication → Get started → Sign-in method → Add new proivider → Google` 
  - включить `Enable`
  - заполнить `Public-facing name for project` -> `Health Monitor`
  - заполнить `Support email for project` -> email аккаунта, под которым вошёл в Firebase
  - нажать `Save`
- В `.env` файл добвать переменные для `Firebase Client`
```dotenv
VITE_FIREBASE_API_KEY=Firebase-API-key
VITE_FIREBASE_AUTH_DOMAIN=Firebase-auth-domain
VITE_FIREBASE_PROJECT_ID=Firebase-project-id
 
```
- Создать кликетский Firebase файл `plugins/firebase.client.ts`
- Создать composable для Firebase авторизации `composables/useFirebaseAuth.ts`
- Использовать composable для входа в `HealthAuthModal.vue` и для выхода в `HealthShell.vue`
