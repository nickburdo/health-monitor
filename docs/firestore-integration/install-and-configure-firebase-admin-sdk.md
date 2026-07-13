# Install and configure Firebase Admin SDK
- устанавливаем серверный пакет
```bash
npm install firebase-admin
```
- в `.env` файл добавляем переменные:
```dotenv
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```
- Firebase Console → Project settings → Service accounts → Generate new private key
- будет скачан JSON файл со всеми этими данными
- после заполнения `.env`, скачаный JSON файл удаляем
