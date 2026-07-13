import type { GeneralType } from '~/types/index';

export type SymptomEntry = GeneralType & {
  happenedAt: string;
  type: string;
  intensity: number | null;
};

export type CreateSymptomEntryContext = Omit<
  SymptomEntry,
  'id' | 'createdAt' | 'updatedAt'
>;

export type UpdateSymptomEntryContext = Partial<
  Omit<CreateSymptomEntryContext, 'userId'>
>;
