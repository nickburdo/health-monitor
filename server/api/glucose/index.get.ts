import { healthDb } from '../../utils/prisma';
import { readDateRangeQuery } from '../../utils/date-range';
import { listGlucoseMeasurements } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  return listGlucoseMeasurements(healthDb, readDateRangeQuery(event));
});
