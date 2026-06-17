import { readBody } from 'h3';
import { getRequestActor } from '../../utils/auth';
import { healthDb } from '../../utils/prisma';
import { createWeightMeasurement } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return createWeightMeasurement(healthDb, await getRequestActor(event), body);
});
