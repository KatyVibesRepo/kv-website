import { formatEventDateRange } from '@/lib/datetime';

export function EventDatePill({ startsAt, endsAt }: { startsAt: Date; endsAt?: Date | null }) {
  const [datePart, timePart] = formatEventDateRange(startsAt, endsAt).split(' • ');
  return (
    <span className="event-date-pill" aria-label={formatEventDateRange(startsAt, endsAt)}>
      <strong>{datePart}</strong>
      {timePart && <span>{timePart}</span>}
    </span>
  );
}
