import { getRouterParam, readBody } from 'h3';
import { healthDb } from '../../utils/prisma';
import { updateSymptomEntryNote } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  return updateSymptomEntryNote(healthDb, id, body);
});
