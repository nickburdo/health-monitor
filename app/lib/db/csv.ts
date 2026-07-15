function csvEscape(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  if (/["\n,]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: Array<keyof T & string>,
): string {
  const header = columns.join(',');
  const lines = rows.map((row) =>
    columns.map((column) => csvEscape(row[column])).join(','),
  );

  return [header, ...lines].join('\n');
}

export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}
