import { readBody } from 'h3';
import { healthDb } from '../../utils/prisma';
import { createSymptomEntry } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return createSymptomEntry(healthDb, body);
});
