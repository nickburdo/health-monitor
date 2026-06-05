import { getRouterParam, readBody } from 'h3';
import { healthDb } from '../../../utils/prisma';
import { setBloodPressureMeasurementIgnore } from '../../../utils/health-records';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const body = await readBody(event);

  return setBloodPressureMeasurementIgnore(healthDb, id, body);
});
