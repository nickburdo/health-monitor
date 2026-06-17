import { healthDb } from '../../utils/prisma';
import { getRequestActor } from '../../utils/auth';
import { readDateRangeQuery } from '../../utils/date-range';
import { listBloodPressureMeasurements } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  return listBloodPressureMeasurements(
    healthDb,
    await getRequestActor(event),
    readDateRangeQuery(event),
  );
});
