import { apiRequest } from '~/lib/api/client';
import { compactBody, listInRange, toDateRangeParams } from '~/lib/api/date-range';
import type { DateRangeQuery } from '~/types/date-range';
import type {
  CreateSymptomEntryInput,
  SymptomEntry,
  UpdateSymptomEntryNoteInput,
} from '~/types/symptom';

export async function listSymptomEntries(range: DateRangeQuery = {}) {
  const items = await apiRequest<SymptomEntry[]>('/symptoms', { query: toDateRangeParams(range) });

  return listInRange(items, range, item => item.happenedAt);
}

export function createSymptomEntry(input: CreateSymptomEntryInput) {
  return apiRequest<SymptomEntry>('/symptoms', { method: 'POST', body: compactBody(input) });
}

export async function updateSymptomEntryNote(id: string, input: UpdateSymptomEntryNoteInput) {
  await apiRequest<SymptomEntry>(`/symptoms/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });
}
