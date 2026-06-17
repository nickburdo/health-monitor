import { healthDb } from '../../utils/prisma';
import { getRequestActor } from '../../utils/auth';
import { readDateRangeQuery } from '../../utils/date-range';
import { listSymptomEntries } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  return listSymptomEntries(
    healthDb,
    await getRequestActor(event),
    readDateRangeQuery(event),
  );
});
