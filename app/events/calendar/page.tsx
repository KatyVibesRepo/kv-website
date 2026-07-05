import Link from 'next/link';

export const metadata = {
  title: 'Event Calendar | Katy Vibes',
  description:
    'View the Katy Vibes event calendar and find upcoming live music, karaoke, watch parties, patio events, and ticketed shows.',
};

const calendarSrc = process.env.NEXT_PUBLIC_KV_GOOGLE_CALENDAR_EMBED_URL?.trim() ?? '';

export default function EventsCalendarPage() {
  const hasCalendar = calendarSrc.length > 0;

  return (
    <main className="events-page google-calendar-page">
      <section className="site-section google-calendar-hero">
        <div className="section-heading compact-heading">
          <span className="eyebrow">Event calendar</span>
          <h1>Plan your next Katy Vibes night.</h1>
          <p>
            Browse the legacy calendar view customers already know, then open an event for details,
            tickets, tables, or reservations.
          </p>
        </div>
        <div className="google-calendar-actions">
          <Link className="pill-button" href="/events">
            Back to Events
          </Link>
          {hasCalendar ? (
            <a className="pill-button ghost" href={calendarSrc} target="_blank" rel="noreferrer">
              Open Calendar
            </a>
          ) : null}
        </div>
      </section>

      <section className="site-section google-calendar-section" aria-label="Katy Vibes Google Calendar">
        <div className="google-calendar-shell">
          {hasCalendar ? (
            <iframe
              className="google-calendar-frame"
              title="Katy Vibes event calendar"
              src={calendarSrc}
              loading="lazy"
            />
          ) : (
            <div className="google-calendar-missing">
              <span className="eyebrow">Setup needed</span>
              <h2>Add the Google Calendar embed URL.</h2>
              <p>
                Add <code>NEXT_PUBLIC_KV_GOOGLE_CALENDAR_EMBED_URL</code> to <code>.env.local</code>,
                then restart <code>npm run dev</code>. Use the full Google Calendar iframe <code>src</code>
                URL, not the whole iframe tag.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
