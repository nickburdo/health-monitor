import { createFirestoreRepository } from './firestoreRepository';
import { SymptomEntry } from '~/types/symptom';

export const symptomsRepository =
  createFirestoreRepository<SymptomEntry>('symptomEntries');
