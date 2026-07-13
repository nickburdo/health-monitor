# Migration Plan: Nuxt + Prisma + Supabase → Nuxt + Firestore

## Goal

Current architecture:

```text
Nuxt
 ↓
server/api
 ↓
Prisma
 ↓
Supabase PostgreSQL
```

Target architecture:

```text
Nuxt client
 ↓
Firebase Auth
 ↓
Firestore Client SDK
 ↓
Firestore
```

The application works directly with Firestore through the Client SDK and uses Security Rules instead of a custom backend.

---

# 1. Create Firebase Project

Enable:

* Authentication
* Firestore Database
* Hosting

Auth provider:

* Google

---

# 2. Install dependencies

```bash
npm install firebase
```

Optional:

```bash
npm install vuefire
```

Initially it is better to use the plain Firebase SDK to understand how everything works.

---

# 3. Add Firebase configuration

---

# 4. Move Data Model

---

# 5. Create TypeScript Types

---

# 6. Replace API calls with composables


---

# 7. Enable realtime updates

Replace manual refresh logic:

```ts
onSnapshot(
  collection(db, 'users', uid, 'jobs'),
  snapshot => {
    jobs.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }))
  }
)
```

This replaces:

* refresh()
* invalidateQueries()
* repeated fetches

---

# 8. Configure Security Rules

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/jobs/{jobId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

Users can only access their own jobs.

---

# 9. Replace Supabase Auth with Firebase Auth

Login:

```ts
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

const provider = new GoogleAuthProvider()

await signInWithPopup(auth, provider)
```

Logout:

```ts
await signOut(auth)
```

---

# 10. Remove Prisma

```bash
npm uninstall prisma @prisma/client
```

Remove:

```text
prisma/
server/utils/prisma.ts
server/api/jobs/*
DATABASE_URL
DIRECT_URL
```

---

# 11. Migrate Existing Data

1. Export data from Supabase/PostgreSQL.
2. Convert to JSON.
3. Import into Firestore.
4. Verify data.
5. Remove the old API.

Example:

```json
[
  {
    "company": "Google",
    "position": "Frontend Developer",
    "status": "APPLIED"
  }
]
```

---

# 12. Deploy to Firebase Hosting

For SPA:

```ts
export default defineNuxtConfig({
  ssr: false,
})
```

Build:

```bash
npm run generate
firebase deploy
```

---

# Recommended Migration Order

```text
1. Create branch firebase-migration
2. Configure Firebase Auth
3. Implement login/logout
4. Create Firestore database
5. Configure Security Rules
6. Rewrite list jobs
7. Rewrite create/edit/delete
8. Add realtime onSnapshot
9. Import old data
10. Remove Prisma, server/api and Supabase
11. Deploy to Firebase Hosting
```

---

# Main Idea

This migration is not simply replacing PostgreSQL with Firestore.

It changes the architecture:

```text
Nuxt
 ↓
Firebase Auth
 ↓
Firestore Client SDK
 ↓
Firestore
```

The application becomes frontend-first and uses Firestore Security Rules instead of its own backend API.
