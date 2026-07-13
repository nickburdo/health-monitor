# Data Model

Current SQL tables:

```text
job_tracker_job_applications
```

Firestore structure:

```text
users
 └── {userId}
      ├── glucoseMeasurements
      |    └── {measurementId}
      |        measuredAt
      |        fastingValue
      |        afterMealValue
      |        ignore
      |        note
      |        reason
      |        createdAt
      |        isDemo
      ├── bloodPressureMeasurements
      |    └── {measurementId}
      |        measuredAt
      |        systolic
      |        diastolic 
      |        ignore
      |        note
      |        reason
      |        createdAt
      |        isDemo
      ├── weightMeasurements
      |    └── {measurementId}
      |        measuredAt
      |        value
      |        ignore
      |        note
      |        reason
      |        createdAt
      |        isDemo
      └── symptomEntries
           └── {entryId}
               happenedAt
               type
               intensity
               note
               createdAt
               isDemo
```

Instead of:

```sql
WHERE userId = ...
```

documents are addressed by:

```text
users/{uid}/glucoseMeasurements/{measurementId}
users/{uid}/bloodPressureMeasurements/{measurementId}
users/{uid}/weightMeasurements/{measurementId}
users/{uid}/symptomEntries/{entryId}
```
