import { healthDb } from '../../utils/prisma';
import { getRequestActor } from '../../utils/auth';
import { readDateRangeQuery } from '../../utils/date-range';
import { listWeightMeasurements } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  return listWeightMeasurements(
    healthDb,
    await getRequestActor(event),
    readDateRangeQuery(event),
  );
});
