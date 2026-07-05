const DEFAULT_TIME_ZONE = 'America/Chicago';

function getDateTimeParts(date: Date, timeZone = DEFAULT_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function toDateTimeLocalInput(date: Date | null | undefined, timeZone = DEFAULT_TIME_ZONE): string {
  if (!date) return '';
  const parts = getDateTimeParts(date, timeZone);
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}

export function centralDateTimeInputToUtc(value: string, timeZone = DEFAULT_TIME_ZONE): Date {
  if (!value) throw new Error('Missing date/time.');

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) throw new Error('Date/time must use the browser date picker format.');

  const [, year, month, day, hour, minute] = match.map(Number) as unknown as [number, number, number, number, number, number];

  // Start by pretending the local venue time is UTC, then correct it by comparing
  // what that instant looks like in the target time zone. This handles CST/CDT.
  let utcMillis = Date.UTC(year, month - 1, day, hour, minute, 0);

  for (let i = 0; i < 3; i += 1) {
    const zonedParts = getDateTimeParts(new Date(utcMillis), timeZone);
    const zonedAsUtcMillis = Date.UTC(
      zonedParts.year,
      zonedParts.month - 1,
      zonedParts.day,
      zonedParts.hour,
      zonedParts.minute,
      zonedParts.second
    );
    utcMillis -= zonedAsUtcMillis - Date.UTC(year, month - 1, day, hour, minute, 0);
  }

  return new Date(utcMillis);
}

export function formatTime(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function formatLongDate(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function isSameVenueDate(a: Date, b: Date, timeZone = DEFAULT_TIME_ZONE): boolean {
  const aParts = getDateTimeParts(a, timeZone);
  const bParts = getDateTimeParts(b, timeZone);
  return aParts.year === bParts.year && aParts.month === bParts.month && aParts.day === bParts.day;
}

export function formatEventDate(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  const dateLabel = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  return `${dateLabel} • ${formatTime(date, timeZone)}`;
}

export function formatEventDateLong(date: Date, timeZone = DEFAULT_TIME_ZONE): string {
  return `${formatLongDate(date, timeZone)} at ${formatTime(date, timeZone)}`;
}

export function formatEventDateRange(startsAt: Date, endsAt?: Date | null, timeZone = DEFAULT_TIME_ZONE): string {
  if (!endsAt) return formatEventDateLong(startsAt, timeZone);

  if (isSameVenueDate(startsAt, endsAt, timeZone)) {
    return `${formatLongDate(startsAt, timeZone)} • ${formatTime(startsAt, timeZone)} – ${formatTime(endsAt, timeZone)}`;
  }

  return `${formatEventDateLong(startsAt, timeZone)} – ${formatEventDateLong(endsAt, timeZone)}`;
}


export function formatEventDateRangeCompact(startsAt: Date, endsAt?: Date | null, timeZone = DEFAULT_TIME_ZONE): string {
  if (!endsAt) return formatEventDate(startsAt, timeZone);

  const dateLabel = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(startsAt);

  if (isSameVenueDate(startsAt, endsAt, timeZone)) {
    return `${dateLabel} • ${formatTime(startsAt, timeZone)} – ${formatTime(endsAt, timeZone)}`;
  }

  return `${formatEventDate(startsAt, timeZone)} – ${formatEventDate(endsAt, timeZone)}`;
}
