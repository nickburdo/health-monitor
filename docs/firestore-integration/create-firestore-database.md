# Create Firestore database

- в меню Databases & Storage → Firestore Database
- нажать Create database
- выбрать регион
- выбрать Start in production mode
- появится пустая БД


```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```
