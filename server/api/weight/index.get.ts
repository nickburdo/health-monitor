import { getQuery } from 'h3';
import { healthDb } from '../../utils/prisma';
import { listWeightMeasurements } from '../../utils/health-records';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);

  return listWeightMeasurements(healthDb, {
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
  });
});
