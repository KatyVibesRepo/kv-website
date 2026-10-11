import { ReserveRequestForm, type TicketedEventWindow } from '@/components/ReserveRequestForm';
import { getPublicEventsFeedResult } from '@/lib/kvrsEvents';

export const metadata = {
  title: 'Reserve a Table | Katy Vibes',
  description: 'Request a table, celebration, patio seating, or event-night reservation at Katy Vibes in Katy, Texas.',
};

export const dynamic = 'force-dynamic';

export default async function ReservePage() {
  // Read-only preliminary guidance. KVRS must independently revalidate any
  // ticketed-event admission restriction when a reservation is submitted.
  const feed = await getPublicEventsFeedResult({ limit: 100 });
  const ticketedWindows: TicketedEventWindow[] = feed.events
    .filter((event) =>
      (event.isTicketed || event.ticketSummary?.isTicketed)
      && !['canceled', 'postponed'].includes(event.saleStatus),
    )
    .flatMap((event) => {
      const shows = event.shows?.length
        ? event.shows
        : [{
            id: event.id,
            name: null,
            startsAt: event.startsAt,
            endsAt: event.endsAt,
            transactionEnabled: true,
          }];

      return shows
        .filter((show) => show.transactionEnabled !== false)
        .map((show) => ({
          id: show.id,
          eventId: event.id,
          title: event.title,
          slug: event.slug,
          showName: show.name,
          startsAt: show.startsAt,
          endsAt: show.endsAt,
        }));
    });

  return (
    <main className="reserve-page">
      <section className="hero reserve-hero">
        <div className="hero-copy">
          <p className="eyebrow">Reservations</p>
          <h1>Save your spot at Katy Vibes.</h1>
          <p>
            Tell us when you want to come through, how many guests are joining, and what kind of vibe you are planning. Our team will review your request and follow up to confirm.
          </p>
          <div className="button-row">
            <a className="button hot" href="#reservation-request-form">Request a Reservation</a>
          </div>
        </div>
        <div className="reserve-hero-card panel-card">
          <p className="eyebrow">Good to know</p>
          <h2>Requests are reviewed before confirmation.</h2>
          <p>
            Submitting this form does not automatically confirm your table. For urgent requests, same-day parties, or large groups, call us directly.
          </p>
          <ul className="reserve-note-list">
            <li>Lunch starts at 11 AM Tuesday through Sunday.</li>
            <li>Event nights may have ticket or table requirements.</li>
            <li>Patio, VIP, and stage-area requests depend on availability.</li>
          </ul>
        </div>
      </section>

      <section className="section reserve-form-section" id="reservation-request-form">
        <div className="section-heading compact-heading">
          <p className="eyebrow">Reservation request</p>
          <h2>Tell us what you need.</h2>
          <p>
            We will send your request to our reservation system for manager review. A team member will confirm availability before your reservation is finalized.
          </p>
        </div>
        <ReserveRequestForm ticketedWindows={ticketedWindows} />
      </section>
    </main>
  );
}
