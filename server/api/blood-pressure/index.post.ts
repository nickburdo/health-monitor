import { readBody } from 'h3';
import { getRequestActor } from '../../utils/auth';
import { healthDb } from '../../utils/prisma';
import { createBloodPressureMeasurement } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  return createBloodPressureMeasurement(
    healthDb,
    await getRequestActor(event),
    body,
  );
});
