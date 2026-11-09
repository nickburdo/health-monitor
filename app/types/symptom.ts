import type { SymptomOption } from '~/constants/symptom-options';

export type SymptomEntry = {
  id: string;
  happenedAt: string;
  type: SymptomOption;
  intensity: number;
  note: string | null;
  // Supported by the API; not shown in the UI yet.
  ignored: boolean;
  reason: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateSymptomEntryInput = {
  happenedAt: string;
  type: SymptomOption;
  intensity: number;
  note?: string;
};

export type UpdateSymptomEntryNoteInput = {
  // An empty string clears the note: the API accepts only strings.
  note: string;
};
