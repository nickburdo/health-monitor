# Rewrite server/api handlers from Prisma to Firestore

## Glucose
- создать файл репозитория `server/repositories/glucoseRepository.ts`
- обновить файлы API:
  - `server/api/glucose/index.get.ts`
  - `server/api/glucose/index.post.ts`
  - `server/api/glucose/[id]/ignore.patch.ts`

## BloodPressure
- создать файл репозитория `server/repositories/bloodPressureRepository.ts`
- обновить файлы API:
  - `server/api/blood-pressure/index.get.ts`
  - `server/api/blood-pressure/index.post.ts`
  - `server/api/blood-pressure/[id]/ignore.patch.ts`

## Weight
- создать файл репозитория `server/repositories/weightRepository.ts`
- обновить файлы API:
  - `server/api/weight/index.get.ts`
  - `server/api/weight/index.post.ts`
  - `server/api/weight/[id]/ignore.patch.ts`

## Symptoms
- создать файл репозитория `server/repositories/symptomsRepository.ts`
- обновить файлы API:
  - `server/api/symptoms/index.get.ts`
  - `server/api/symptoms/index.post.ts`
  - `server/api/symptoms/[id]/ignore.patch.ts`
