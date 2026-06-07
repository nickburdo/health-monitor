import { getQuery, type H3Event } from 'h3';

export type DateRangeQuery = {
  dateFrom?: unknown;
  dateTo?: unknown;
};

export function readDateRangeQuery(event: H3Event): DateRangeQuery {
  const query = getQuery(event);

  return {
    dateFrom: query.dateFrom,
    dateTo: query.dateTo,
  };
}
