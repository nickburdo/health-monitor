import { getRouterParam, readBody } from 'h3';
import { getRequestActor } from '../../../utils/auth';
import { healthDb } from '../../../utils/prisma';
import { setGlucoseMeasurementIgnore } from '../../../utils/health-records';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  return setGlucoseMeasurementIgnore(
    healthDb,
    await getRequestActor(event),
    id,
    body,
  );
});
