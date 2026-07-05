import type { PublicCalendarDay } from '@/lib/kvrsEvents';

type CalendarEvent = PublicCalendarDay['events'][number] & {
  flyerImages?: Partial<Record<'default' | 'portrait' | 'square' | 'tall' | 'wide' | 'landscape', string | null>> | null;
  flyerImageUrl?: string | null;
  heroImageUrl?: string | null;
};

type EventCalendarViewProps = {
  days: PublicCalendarDay[];
  title?: string;
  eyebrow?: string;
  intro?: string;
  fullPage?: boolean;
};

function calendarEventImage(event: CalendarEvent) {
  return (
    event.flyerImages?.square ||
    event.flyerImages?.default ||
    event.thumbnailImageUrl ||
    event.flyerImageUrl ||
    event.heroImageUrl ||
    null
  );
}

function formatCalendarTime(startsAt: string, endsAt?: string | null) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
  });

  const startTime = formatter.format(start);
  const endTime = end ? formatter.format(end) : null;
  return endTime ? `${startTime} – ${endTime}` : startTime;
}

function formatCalendarDate(date: string) {
  const safeDate = new Date(`${date}T12:00:00`);

  return {
    weekday: new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      weekday: 'short',
    }).format(safeDate),
    monthDay: new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      month: 'short',
      day: 'numeric',
    }).format(safeDate),
  };
}

export function EventCalendarView({
  days,
  title = 'Everything coming up.',
  eyebrow = 'Event Calendar',
  intro,
  fullPage = false,
}: EventCalendarViewProps) {
  const daysWithEvents = days.filter((day) => day.events.length > 0);

  if (!daysWithEvents.length) {
    return (
      <section className="card stack">
        <div className="eyebrow">{eyebrow}</div>
        <h2>No calendar events are published yet.</h2>
        <p className="muted">
          Upcoming events will appear here as soon as they are published.
        </p>
      </section>
    );
  }

  return (
    <section
      className={`event-calendar-section stack${fullPage ? ' event-calendar-section-full' : ''}`}
      aria-label="Katy Vibes event calendar"
    >
      <div className="row-between event-section-heading">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
          {intro && <p className="muted event-calendar-intro">{intro}</p>}
        </div>
        <div className="button-row event-heading-actions">
          <a className="button ghost" href="/events">Back to Events</a>
          <a className="button hot" href="tel:8324372807">Call Katy Vibes</a>
        </div>
      </div>

      <div className="event-calendar-list">
        {daysWithEvents.map((day) => {
          const dayLabel = formatCalendarDate(day.date);

          return (
            <article className="event-calendar-day" key={day.date}>
              <div className="event-calendar-date">
                <span>{dayLabel.weekday}</span>
                <strong>{dayLabel.monthDay}</strong>
              </div>

              <div className="event-calendar-items">
                {day.events.map((event) => {
                  const imageUrl = calendarEventImage(event as CalendarEvent);
                  return (
                    <a className="event-calendar-item" href={`/events/${event.slug}`} key={event.id}>
                      {imageUrl ? (
                        <img src={imageUrl} alt={`${event.title} flyer`} />
                      ) : (
                        <div className="event-calendar-thumb-placeholder">KV</div>
                      )}

                      <div className="event-calendar-item-copy">
                        <p className="event-calendar-item-time">{formatCalendarTime(event.startsAt, event.endsAt)}</p>
                        <h3>{event.title}</h3>
                        <span className="event-calendar-item-link">View event details</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
