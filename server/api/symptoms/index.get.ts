import { healthDb } from '../../utils/prisma';
import { readDateRangeQuery } from '../../utils/date-range';
import { listSymptomEntries } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  return listSymptomEntries(healthDb, readDateRangeQuery(event));
});
