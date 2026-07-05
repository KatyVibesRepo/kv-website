'use client';

import { useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { PublicEventCta } from '@/components/PublicEventCta';
import type { PublicEvent } from '@/lib/kvrsEvents';
import { eventFlyerImage, formatShortEventDate } from '@/lib/kvrsEvents';

type WeekGroup = {
  key: string;
  label: string;
  events: PublicEvent[];
  hasMondayEvent: boolean;
};

const centralTimeZone = 'America/Chicago';
const oneDayMs = 24 * 60 * 60 * 1000;

function centralDateParts(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value;
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: centralTimeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(date);

  const part = (type: string) => parts.find((item) => item.type === type)?.value || '';

  return {
    year: Number(part('year')),
    month: Number(part('month')),
    day: Number(part('day')),
    weekday: part('weekday'),
  };
}

function dateKeyFromParts(parts: { year: number; month: number; day: number }) {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

function utcNoonFromParts(parts: { year: number; month: number; day: number }) {
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12));
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * oneDayMs);
}

function weekStartForEvent(startsAt: string) {
  const parts = centralDateParts(startsAt);
  const eventDate = utcNoonFromParts(parts);
  const weekdayIndex = eventDate.getUTCDay(); // Sunday = 0, Monday = 1
  const daysSinceMonday = (weekdayIndex + 6) % 7;
  return addDays(eventDate, -daysSinceMonday);
}

function formatWeekLabel(weekStart: Date, hasMondayEvent: boolean) {
  const displayStart = hasMondayEvent ? weekStart : addDays(weekStart, 1);
  const displayEnd = addDays(weekStart, 6);

  const sameMonth = displayStart.getUTCMonth() === displayEnd.getUTCMonth();
  const monthFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    timeZone: 'UTC',
  });

  const startMonth = monthFormatter.format(displayStart);
  const endMonth = monthFormatter.format(displayEnd);
  const startDay = displayStart.getUTCDate();
  const endDay = displayEnd.getUTCDate();

  if (sameMonth) return `${startMonth} ${startDay}–${endDay}`;
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}`;
}

function eventWeekdayLabel(startsAt: string) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: centralTimeZone,
    weekday: 'short',
  }).format(new Date(startsAt));
}

function buildWeekGroups(events: PublicEvent[]) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  );

  const map = new Map<string, { weekStart: Date; events: PublicEvent[]; hasMondayEvent: boolean }>();

  for (const event of sortedEvents) {
    const weekStart = weekStartForEvent(event.startsAt);
    const keyParts = {
      year: weekStart.getUTCFullYear(),
      month: weekStart.getUTCMonth() + 1,
      day: weekStart.getUTCDate(),
    };
    const key = dateKeyFromParts(keyParts);
    const weekday = eventWeekdayLabel(event.startsAt).toLowerCase();

    if (!map.has(key)) {
      map.set(key, { weekStart, events: [], hasMondayEvent: false });
    }

    const group = map.get(key)!;
    group.events.push(event);
    if (weekday === 'mon') group.hasMondayEvent = true;
  }

  return Array.from(map.entries()).map(([key, group]) => ({
    key,
    label: formatWeekLabel(group.weekStart, group.hasMondayEvent),
    events: group.events,
    hasMondayEvent: group.hasMondayEvent,
  }));
}

function currentWeekKey() {
  const weekStart = weekStartForEvent(new Date().toISOString());
  return dateKeyFromParts({
    year: weekStart.getUTCFullYear(),
    month: weekStart.getUTCMonth() + 1,
    day: weekStart.getUTCDate(),
  });
}

function startingWeekIndex(weeks: WeekGroup[]) {
  const currentKey = currentWeekKey();
  const exact = weeks.findIndex((week) => week.key === currentKey);
  if (exact >= 0) return exact;

  const next = weeks.findIndex((week) => week.key > currentKey);
  return next >= 0 ? next : 0;
}

function WeeklyVibeCard({ event }: { event: PublicEvent }) {
  const date = formatShortEventDate(event.startsAt);
  const imageUrl = eventFlyerImage(event, 'landscape');
  const description = event.subtitle || event.shortDescription || '';

  return (
    <article className="weekly-vibe-event-card">
      <a className="weekly-vibe-card-art" href={`/events/${event.slug}`} aria-label={`View ${event.title}`}>
        {imageUrl ? (
          <img src={imageUrl} alt={event.flyerAlt || event.title} />
        ) : (
          <div className="weekly-vibe-card-placeholder">
            <span>Katy Vibes</span>
            <strong>{event.title}</strong>
          </div>
        )}
      </a>

      <div className="weekly-vibe-card-copy">
        <div className="weekly-vibe-date-line">
          <strong>{eventWeekdayLabel(event.startsAt)}</strong>
          <span>{date.month} {date.day}</span>
          <small>{date.time}</small>
        </div>

        <h3>{event.title}</h3>
        {description && <p>{description}</p>}

        <div className="weekly-vibe-actions">
          <a className="button ghost" href={`/events/${event.slug}`}>Details</a>
          <PublicEventCta event={event} className="button hot" />
        </div>
      </div>
    </article>
  );
}

export function WeeklyEventVibeCarousel({ events }: { events: PublicEvent[] }) {
  const weeks = useMemo(() => buildWeekGroups(events), [events]);
  const [activeWeekIndex, setActiveWeekIndex] = useState(() => startingWeekIndex(weeks));
  const trackRef = useRef<HTMLDivElement | null>(null);

  function goToWeek(nextIndex: number) {
    if (!weeks.length) return;
    const safeIndex = Math.max(0, Math.min(nextIndex, weeks.length - 1));
    setActiveWeekIndex(safeIndex);

    const track = trackRef.current;
    const panel = track?.querySelector<HTMLElement>(`[data-week-index="${safeIndex}"]`);
    panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  function handleScroll() {
    const track = trackRef.current;
    if (!track || !weeks.length) return;

    const nextIndex = Math.round(track.scrollLeft / Math.max(track.clientWidth, 1));
    if (nextIndex !== activeWeekIndex && nextIndex >= 0 && nextIndex < weeks.length) {
      setActiveWeekIndex(nextIndex);
    }
  }

  if (!weeks.length) {
    return (
      <section className="card stack weekly-vibe-section" id="pick-your-vibe">
        <div className="eyebrow">This Week</div>
        <h2>Pick your next vibe.</h2>
        <p className="muted">Upcoming event flyers will appear here as soon as they are published.</p>
      </section>
    );
  }

  const activeWeek = weeks[activeWeekIndex] || weeks[0];

  return (
    <section className="weekly-vibe-section stack" id="pick-your-vibe" aria-label="Weekly Katy Vibes event listing">
      <div className="row-between event-section-heading weekly-vibe-heading">
        <div>
          <div className="eyebrow">This Week</div>
          <h2>Pick your next vibe.</h2>
          <p className="muted">Swipe or use the arrows to move week by week through upcoming Katy Vibes events.</p>
        </div>

        <div className="weekly-vibe-toolbar">
          <span className="weekly-vibe-week-label">{activeWeek.label}</span>
          <div className="event-carousel-controls">
            <button
              className="button ghost carousel-button"
              type="button"
              onClick={() => goToWeek(activeWeekIndex - 1)}
              aria-label="Previous week"
              disabled={activeWeekIndex === 0}
            >
              ‹
            </button>
            <button
              className="button ghost carousel-button"
              type="button"
              onClick={() => goToWeek(activeWeekIndex + 1)}
              aria-label="Next week"
              disabled={activeWeekIndex >= weeks.length - 1}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      <div className="weekly-vibe-week-track" ref={trackRef} onScroll={handleScroll}>
        {weeks.map((week, index) => {
          const visibleCount = Math.min(Math.max(week.events.length, 1), week.hasMondayEvent ? 7 : 6);
          const style = { '--weekly-vibe-count': String(visibleCount) } as CSSProperties;

          return (
            <div className="weekly-vibe-week-panel" data-week-index={index} key={week.key}>
              <div className="weekly-vibe-panel-header">
                <span>{week.hasMondayEvent ? 'Monday–Sunday' : 'Tuesday–Sunday'}</span>
                <strong>{week.label}</strong>
              </div>

              <div className="weekly-vibe-grid" style={style}>
                {week.events.map((event) => (
                  <WeeklyVibeCard event={event} key={event.id} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
