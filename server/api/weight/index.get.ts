import { healthDb } from '../../utils/prisma';
import { readDateRangeQuery } from '../../utils/date-range';
import { listWeightMeasurements } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  return listWeightMeasurements(healthDb, readDateRangeQuery(event));
});
