import { notFound } from 'next/navigation';
import { PublicEventCta, saleStatusLabel } from '@/components/PublicEventCta';
import { EventTicketCheckoutCards } from '@/components/EventTicketCheckoutCards';
import {
  formatEventDateTime,
  getPublicEvent,
  getPublicEvents,
  moneyFromCents,
} from '@/lib/kvrsEvents';

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

type EventDetail = NonNullable<Awaited<ReturnType<typeof getPublicEvent>>>;
type FlyerPreference = 'default' | 'portrait' | 'square' | 'tall' | 'wide' | 'landscape';

const flyerFallbacks: Record<FlyerPreference, FlyerPreference[]> = {
  default: ['default', 'square', 'tall', 'portrait', 'landscape', 'wide'],
  portrait: ['portrait', 'tall', 'default', 'square', 'landscape', 'wide'],
  square: ['square', 'default', 'tall', 'portrait', 'landscape', 'wide'],
  tall: ['tall', 'portrait', 'default', 'square', 'landscape', 'wide'],
  wide: ['wide', 'landscape', 'default', 'square', 'tall', 'portrait'],
  landscape: ['landscape', 'wide', 'default', 'square', 'tall', 'portrait'],
};

function firstValue(...values: Array<string | null | undefined>) {
  return values.find((value): value is string => Boolean(value)) || null;
}

function eventImage(event: EventDetail, preferred: FlyerPreference) {
  const variantImages = flyerFallbacks[preferred].map((key) => event.flyerImages?.[key]);

  return firstValue(
    ...variantImages,
    event.heroImageUrl,
    event.flyerImageUrl,
    event.thumbnailImageUrl,
    event.socialShareImageUrl
  );
}

function prettySaleStatus(event: EventDetail) {
  const label = saleStatusLabel(event.saleStatus);
  return label.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function priceSummary(event: EventDetail) {
  if (event.priceDisplay) return event.priceDisplay;
  if (event.coverText) return event.coverText;

  const lowestPrice = event.ticketSummary?.lowestPriceCents ?? 0;
  if (lowestPrice > 0) return `Starting at ${moneyFromCents(lowestPrice)}`;
  if (event.saleStatus === 'free_entry' || event.isFreeEvent) return 'Free entry';

  return null;
}

export async function generateMetadata({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);

  if (!event) {
    return {
      title: 'Event Not Found | Katy Vibes',
    };
  }

  const socialImage = event.socialShareImageUrl || eventImage(event, 'landscape');

  return {
    title: event.seoTitle || `${event.title} | Katy Vibes`,
    description:
      event.seoDescription ||
      event.shortDescription ||
      event.subtitle ||
      'View event details, tickets, tables, and reservation options for Katy Vibes.',
    openGraph: {
      title: event.seoTitle || `${event.title} | Katy Vibes`,
      description:
        event.seoDescription ||
        event.shortDescription ||
        event.subtitle ||
        'View event details for Katy Vibes.',
      images: socialImage ? [socialImage] : [],
    },
  };
}

export async function generateStaticParams() {
  const events = await getPublicEvents();

  return events.map((event) => ({
    slug: event.slug,
  }));
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);

  if (!event) notFound();

  const heroImage = eventImage(event, 'landscape');
  const flyerImage = eventImage(event, 'portrait');
  const description = event.fullDescription || event.shortDescription || event.subtitle;
  const ticketTypes = event.ticketTypes || [];
  const isTicketedEvent = event.isTicketed || Boolean(event.ticketSummary?.isTicketed) || ticketTypes.length > 0;
  const priceText = priceSummary(event);
  const locationText = event.venueAddress || event.venueName;

  return (
    <section className="stack public-event-detail-page">
      <article className="public-event-detail-hero compact-event-detail-hero">
        {heroImage && (
          <img className="public-event-detail-bg" src={heroImage} alt="" aria-hidden="true" />
        )}

        <div className="public-event-detail-overlay">
          <div className="public-event-detail-copy">
            <div className="event-detail-topline" aria-label="Event status">
              <span className="event-detail-status-pill">{prettySaleStatus(event)}</span>
              {priceText && <span className="event-detail-price-pill">{priceText}</span>}
            </div>

            <h1>{event.title}</h1>
            {event.subtitle && <p className="lead">{event.subtitle}</p>}

            <div className="event-detail-facts event-detail-facts-compact">
              <span>
                <strong>Date & Time</strong>
                {formatEventDateTime(event.startsAt, event.endsAt)}
              </span>
              {event.doorsAt && (
                <span>
                  <strong>Doors</strong>
                  {formatEventDateTime(event.doorsAt)}
                </span>
              )}
              {locationText && (
                <span>
                  <strong>Location</strong>
                  {locationText}
                </span>
              )}
              {event.ageRestriction && (
                <span>
                  <strong>Age</strong>
                  {event.ageRestriction}
                </span>
              )}
            </div>

            <div className="button-row event-detail-main-actions">
              {isTicketedEvent ? (
                <a className="button hot" href="#event-ticket-options">Choose Tickets</a>
              ) : (
                <PublicEventCta event={event} />
              )}
              <a className="button ghost" href="tel:18324372807">Call 832-437-2807</a>
              <a className="button ghost" href="/events">Back to Events</a>
            </div>
          </div>

          {flyerImage && (
            <figure className="public-event-detail-flyer">
              <img src={flyerImage} alt={event.flyerAlt || `${event.title} flyer`} />
            </figure>
          )}
        </div>
      </article>

      <section className="public-event-detail-grid compact-event-detail-grid">
        <article className="card stack event-detail-about-card">
          <div className="eyebrow">Event Details</div>
          <h2>About this event</h2>
          {description ? (
            <p className="event-detail-description">{description}</p>
          ) : (
            <p className="event-detail-description">
              Join us at Katy Vibes for food, drinks, music, and a night built around the vibe.
            </p>
          )}
        </article>

        <aside className="card stack public-event-ticket-card compact-ticket-card">
          <div className="eyebrow">Tickets & Tables</div>
          <h2>{priceText || 'Plan your visit'}</h2>

          {event.coverText && event.coverText !== priceText && <p className="muted">{event.coverText}</p>}
          {event.ageRestriction && <p className="muted">{event.ageRestriction}</p>}

          {event.ticketSummary && (
            <div className="event-ticket-summary-grid">
              <div>
                <span>Sale Status</span>
                <strong>{prettySaleStatus(event)}</strong>
              </div>
              <div>
                <span>Starting At</span>
                <strong>
                  {event.ticketSummary.lowestPriceCents > 0
                    ? moneyFromCents(event.ticketSummary.lowestPriceCents)
                    : 'Free / RSVP'}
                </strong>
              </div>
              <div>
                <span>Tables</span>
                <strong>{event.ticketSummary.hasTables ? 'Available' : 'Not listed'}</strong>
              </div>
              <div>
                <span>VIP</span>
                <strong>{event.ticketSummary.hasVip ? 'Available' : 'Not listed'}</strong>
              </div>
            </div>
          )}

          <div className="event-detail-ticket-actions">
            {isTicketedEvent ? (
              <a className="button" href="#event-ticket-options">Choose Tickets</a>
            ) : (
              <PublicEventCta event={event} />
            )}
            <p className="muted">
              {isTicketedEvent
                ? 'Ticket and table choices are listed below with a quick checkout form for each option.'
                : 'Call Katy Vibes at 832-437-2807 if you need help planning your visit.'}
            </p>
          </div>
        </aside>
      </section>

      {isTicketedEvent && <EventTicketCheckoutCards event={event} ticketTypes={ticketTypes} />}
    </section>
  );
}


