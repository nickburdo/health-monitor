# Create server-side Firestore client

Создать файл `server/utils/firebase-admin.ts`
```ts
import { cert, getApps, initializeApp } from 'firebase-admin/app'

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Missing Firebase Admin environment variables')
}

export const firebaseAdminApp =
  getApps()[0] ??
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  })
```

Создать файл `server/utils/firestore.ts`
```ts
import { getFirestore } from 'firebase-admin/firestore'
import { firebaseAdminApp } from './firebase-admin'

export const db = getFirestore(firebaseAdminApp)
```

## Проверка работы
- Создать временный API `server/api/test.get.ts`
```ts
import { db } from '../utils/firestore';

export default defineEventHandler(async () => {
  const snapshot = await db.collection('glucoseMeasurements').limit(1).get();

  return {
    count: snapshot.size,
  };
});
```
- Открыть [http://localhost:3030/api/test](http://localhost:3030/api/test)
- должно быть
```json
{
  "count": 0
}
```
- Удалить временный API
