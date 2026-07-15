import { healthDb } from '~/lib/db/schema';
import { parseOptionalInteger, parseOptionalString } from '~/lib/db/validation';
import type {
  CreateSymptomEntryInput,
  SymptomEntry,
  UpdateSymptomEntryNoteInput,
} from '~/types/symptom';
import type { DateRangeQuery } from '~/lib/db/repositories/glucoseRepository';

function withinRange(happenedAt: string, range: DateRangeQuery): boolean {
  if (range.dateFrom && happenedAt < range.dateFrom) {
    return false;
  }

  if (range.dateTo && happenedAt > range.dateTo) {
    return false;
  }

  return true;
}

export async function listSymptomEntries(
  range: DateRangeQuery = {},
): Promise<SymptomEntry[]> {
  const all = await healthDb.symptomEntry.toArray();

  return all
    .filter((item) => withinRange(item.happenedAt, range))
    .sort((a, b) => b.happenedAt.localeCompare(a.happenedAt));
}

export async function createSymptomEntry(
  input: CreateSymptomEntryInput,
): Promise<SymptomEntry> {
  const intensity = parseOptionalInteger(input.intensity);
  const note = parseOptionalString(input.note);

  const record: SymptomEntry = {
    id: crypto.randomUUID(),
    happenedAt: input.happenedAt,
    type: input.type,
    intensity: intensity ?? null,
    note: note ?? null,
    createdAt: new Date().toISOString(),
  };

  await healthDb.symptomEntry.add(record);

  return record;
}

export async function updateSymptomEntryNote(
  id: string,
  input: UpdateSymptomEntryNoteInput,
): Promise<void> {
  const existing = await healthDb.symptomEntry.get(id);

  if (!existing) {
    throw new Error('Symptom entry not found');
  }

  await healthDb.symptomEntry.update(id, { note: input.note });
}
