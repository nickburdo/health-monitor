import type { SymptomOption } from '~/constants/symptom-options';

export type SymptomEntry = {
  id: string;
  happenedAt: string;
  type: SymptomOption;
  intensity: number | null;
  note: string | null;
  createdAt: string;
};

export type CreateSymptomEntryInput = {
  happenedAt: string;
  type: SymptomOption;
  intensity?: number;
  note?: string;
};

export type UpdateSymptomEntryNoteInput = {
  note: string | null;
};
