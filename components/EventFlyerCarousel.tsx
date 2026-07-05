'use client';

import { useRef } from 'react';
import type { PublicEvent, PublicFlyerImageKey } from '@/lib/kvrsEvents';
import { eventFlyerImage, formatShortEventDate } from '@/lib/kvrsEvents';
import { PublicEventCta } from '@/components/PublicEventCta';

type EventFlyerCardProps = {
  event: PublicEvent;
  imageVariant?: PublicFlyerImageKey;
  className?: string;
};

export function EventFlyerCard({ event, imageVariant = 'landscape', className = '' }: EventFlyerCardProps) {
  const date = formatShortEventDate(event.startsAt);
  const imageUrl = eventFlyerImage(event, imageVariant);
  const description = event.subtitle || event.shortDescription || '';

  return (
    <article className={`event-flyer-slide ${className}`.trim()}>
      <a className="event-flyer-art" href={`/events/${event.slug}`} aria-label={`View ${event.title}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={event.flyerAlt || event.title} />
        ) : (
          <div className="event-flyer-placeholder">
            <span>Katy Vibes</span>
            <strong>{event.title}</strong>
          </div>
        )}
      </a>

      <div className="event-flyer-copy">
        <div className="event-date-chip">
          <span>{date.month}</span>
          <strong>{date.day}</strong>
          <small>{date.time}</small>
        </div>

        <div className="stack event-flyer-text">
          <h3>{event.title}</h3>
          {description && <p>{description}</p>}

          <div className="button-row">
            <a className="button ghost" href={`/events/${event.slug}`}>View Details</a>
            <PublicEventCta event={event} />
          </div>
        </div>
      </div>
    </article>
  );
}

export function EventFlyerCarousel({ events }: { events: PublicEvent[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  function scrollByCard(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;

    track.scrollBy({
      left: direction * Math.min(track.clientWidth * 0.86, 520),
      behavior: 'smooth',
    });
  }

  if (!events.length) {
    return (
      <section className="card stack">
        <div className="eyebrow">Featured Events</div>
        <h2>New event flyers are coming soon.</h2>
        <p className="muted">
          Check back for upcoming Katy Vibes shows, karaoke nights, sports watch parties, DJs, and special events.
        </p>
      </section>
    );
  }

  return (
    <section className="event-featured-section stack" aria-label="Featured event flyers">
      <div className="row-between event-section-heading">
        <div>
          <div className="eyebrow">Featured Events</div>
          <h2>Pick your next vibe.</h2>
        </div>

        <div className="event-carousel-controls">
          <button className="button ghost carousel-button" type="button" onClick={() => scrollByCard(-1)} aria-label="Previous featured events">
            ‹
          </button>
          <button className="button ghost carousel-button" type="button" onClick={() => scrollByCard(1)} aria-label="Next featured events">
            ›
          </button>
        </div>
      </div>

      <div className="event-flyer-carousel" ref={trackRef}>
        {events.map((event) => (
          <EventFlyerCard event={event} imageVariant="landscape" key={event.id} />
        ))}
      </div>
    </section>
  );
}
