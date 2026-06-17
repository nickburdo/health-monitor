import { getRouterParam, readBody } from 'h3';
import { getRequestActor } from '../../utils/auth';
import { healthDb } from '../../utils/prisma';
import { updateSymptomEntryNote } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  return updateSymptomEntryNote(
    healthDb,
    await getRequestActor(event),
    id,
    body,
  );
});
