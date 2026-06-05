import { getRouterParam, readBody } from 'h3';
import { healthDb } from '../../../utils/prisma';
import { setSymptomEntryIgnore } from '../../../utils/health-records';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  return setSymptomEntryIgnore(healthDb, id, body);
});
