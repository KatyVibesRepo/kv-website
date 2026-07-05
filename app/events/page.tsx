import { EventFlyerCard } from '@/components/EventFlyerCarousel';
import { WeeklyEventVibeCarousel } from '@/components/WeeklyEventVibeCarousel';
import { getPublicEvents } from '@/lib/kvrsEvents';

export const metadata = {
  title: 'Events at Katy Vibes | Live Music, DJs, Karaoke, Sports & Watch Parties',
  description:
    'Explore upcoming Katy Vibes events, live music, DJs, karaoke, open mic nights, sports watch parties, patio nights, food, drinks, and private celebrations in Katy, TX.',
};

function GoogleCalendarEmbed({ embedUrl }: { embedUrl?: string }) {
  return (
    <section className="events-google-calendar-section stack" id="google-calendar" aria-label="Katy Vibes Google Calendar">
      <div className="row-between event-section-heading events-google-calendar-heading">
        <div>
          <div className="eyebrow">Calendar View</div>
          <h2>Browse the full Katy Vibes calendar.</h2>
          <p className="muted">
            Use the calendar view customers already know to browse by date and jump into event links.
          </p>
        </div>
        <a className="button ghost" href="/reserve">Tickets & Reservations</a>
      </div>

      <div className="events-google-calendar-frame-shell">
        {embedUrl ? (
          <iframe
            className="events-google-calendar-frame"
            src={embedUrl}
            title="Katy Vibes event calendar"
            loading="lazy"
          />
        ) : (
          <div className="events-google-calendar-missing card stack">
            <div className="eyebrow">Calendar Coming Soon</div>
            <h3>The Katy Vibes calendar will appear here shortly.</h3>
            <p className="muted">Call us at 832-437-2807 for event details, tickets, tables, and reservations.</p>
            <a className="button hot" href="tel:8324372807">Call Katy Vibes</a>
          </div>
        )}
      </div>
    </section>
  );
}

export default async function EventsPage() {
  const upcomingEvents = await getPublicEvents({ limit: 100 });
  const calendarEmbedUrl = process.env.NEXT_PUBLIC_KV_GOOGLE_CALENDAR_EMBED_URL || '';

  return (
    <section className="stack events-page">
      <div className="hero page-hero events-hero">
        <div className="eyebrow">Events at Katy Vibes</div>
        <h1>
          <span className="gradient-text">Live music, DJs, karaoke,</span>
          <br />
          watch parties & weekend vibes.
        </h1>
        <p>
          Find your next night out at Katy Vibes — from live entertainment and open mic nights to sports watch parties, patio energy, food, drinks, and private celebrations.
        </p>
        <div className="button-row">
          <a className="button hot" href="#pick-your-vibe">This Week</a>
          <a className="button ghost" href="#google-calendar">Calendar View</a>
          <a className="button ghost" href="#more-ways">More Events</a>
        </div>
      </div>

      <WeeklyEventVibeCarousel events={upcomingEvents} />

      <GoogleCalendarEmbed embedUrl={calendarEmbedUrl} />

      <section className="stack" id="more-ways" aria-label="Upcoming events">
        <div className="row-between event-section-heading">
          <div>
            <div className="eyebrow">Upcoming</div>
            <h2>More ways to catch the vibe.</h2>
          </div>
          <a className="button ghost" href="/reserve">Tickets & Reservations</a>
        </div>

        {upcomingEvents.length ? (
          <div className="event-card-grid event-flyer-grid">
            {upcomingEvents.map((event) => (
              <EventFlyerCard
                event={event}
                imageVariant="landscape"
                className="event-flyer-grid-card"
                key={event.id}
              />
            ))}
          </div>
        ) : (
          <article className="card stack">
            <div className="eyebrow">Coming Soon</div>
            <h2>Events will appear here as soon as they are published.</h2>
            <p className="muted">
              Check back for Katy Vibes live music, karaoke, DJs, sports watch parties, patio nights, and special events.
            </p>
            <a className="button hot" href="/contact">Call Katy Vibes</a>
          </article>
        )}
      </section>
    </section>
  );
}
