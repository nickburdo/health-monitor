# Configure Firestore indexes

- установить глобально Firebase CLI
```bash
npm install -g firebase-tools
```
- залогиниться
```bash
firebase login
```
- в папке проекта создать JSON файл с индексами
```bash
firebase init firestore
```
- будут созданы файлы 
  - `firebase.json`
  - `firestore.indexes.json`
  - `firestore.rules`
- задеплоить индексы в Firebase
```bash
firebase deploy --only firestore:indexes 
```
