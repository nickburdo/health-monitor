export type DateRangeQuery = {
  // ISO timestamps from the period filter; sent to the API as local dates.
  dateFrom?: string;
  dateTo?: string;
};
