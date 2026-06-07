const dateTimeFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const dateOnlyFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
});

const timeOnlyFormatter = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
});

export function formatWhen(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

export function formatWhenParts(value: string) {
  const date = new Date(value);

  return {
    date: dateOnlyFormatter.format(date),
    time: timeOnlyFormatter.format(date),
  };
}
