# Connect Firebase SDK

## Установить Firebase SDK
```
npm install firebase
```

## Создать Firebase Nuxt плагин
`app/plugins/firebase.client.ts`
```js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  const firebaseConfig = {
    apiKey: 'AIzaSyDyyv5dvSfe1TagJIPlH121tQPJmNymhGg',
    authDomain: 'health-monitor-8b523.firebaseapp.com',
    projectId: 'health-monitor-8b523',
    storageBucket: 'health-monitor-8b523.firebasestorage.app',
    messagingSenderId: '248734110949',
    appId: '1:248734110949:web:f4e1f210d1ccfa8af0b00c',
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  return {
    provide: {
      db,
    },
  }
})
```
`firebaseConfig` и `app` можно просто скопировать из Settings → General → Your apps

## Проверка работы Firestore в Nuxt

### Проверка подключения плагина
Создать временную страницу `pages/firebase-test.vue`
```vue
<script setup lang="ts">
const { $db } = useNuxtApp()

console.log('Firestore db:', $db)
</script>

<template>
  <main>
    <h1>Firebase test</h1>
    <p>Open console and check Firestore db.</p>
  </main>
</template>
```
Открыть эту страницу в браузере.

В консоли должен быть объект `Firestore`.

### Проверка создания коллекции
- На временной странице `pages/firebase-test.vue` сделать создание коллекции:
```vue
<script setup lang="ts">
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const { $db } = useNuxtApp()

async function createTestDoc() {
  const docRef = await addDoc(collection($db, 'testCollection'), {
    title: 'First Firestore document',
    createdAt: serverTimestamp(),
  })

  console.log('Document created with ID:', docRef.id)
}
</script>

<template>
  <button @click="createTestDoc">
    Create test document
  </button>
</template>
```

- Зайти в Firebase в консоль Database, перейти в табу Rules и временно установить `true`  на строке 6
```
allow read, write: if true;
```
- Нажать кнопку Publish
- Открыть временную страницу и нажать кнопку Create test document
- В консоли Firebase должно появиться:
```  
Firestore Database
└── testCollection
    └── auto-generated-id
        ├── title: "First Firestore document"
        └── createdAt: timestamp
```

### Проверка чтения документов из коллекции
- На тестовую страницу `pages/firebase-test.vue` добавить чтение коллекции и запись в консоль:
```vue
<script setup lang="ts">
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'

const { $db } = useNuxtApp()

async function createTestDoc() {
  const docRef = await addDoc(collection($db, 'testCollection'), {
    title: 'First Firestore document',
    createdAt: serverTimestamp(),
  })

  console.log('Document created with ID:', docRef.id)
}

async function readTestDocs() {
  const snapshot = await getDocs(collection($db, 'testCollection'))

  const docs = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))

  console.log('Firestore docs:', docs)
}
</script>

<template>
  <div>
    <button @click="createTestDoc">
      Create test document
    </button>

    <button @click="readTestDocs">
      Read test documents
    </button>
  </div>
</template>
```
- проверить запись и чтение документов
