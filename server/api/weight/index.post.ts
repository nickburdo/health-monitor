import { readBody } from 'h3';
import { healthDb } from '../../utils/prisma';
import { createWeightMeasurement } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return createWeightMeasurement(healthDb, body);
});
