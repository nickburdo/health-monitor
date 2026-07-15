export function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = typeof value === 'number' ? value : Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error('Value must be a valid number');
  }

  return parsed;
}

export function parseOptionalInteger(value: unknown): number | undefined {
  const parsed = parseOptionalNumber(value);

  if (parsed === undefined) {
    return undefined;
  }

  if (!Number.isInteger(parsed)) {
    throw new Error('Value must be an integer');
  }

  return parsed;
}

export function parseOptionalString(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const trimmed = String(value).trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

export function buildIgnoreData(input: {
  ignore: boolean;
  reason?: string;
}): { ignore: boolean; reason: string | null } {
  if (!input.ignore) {
    return { ignore: false, reason: null };
  }

  const reason = parseOptionalString(input.reason);

  if (!reason) {
    throw new Error('reason is required when ignore is true');
  }

  return { ignore: true, reason };
}
