'use client';

import { useMemo, useState } from 'react';
import type { PublicCalendarDay } from '@/lib/kvrsEvents';

type CalendarEvent = PublicCalendarDay['events'][number] & {
  flyerImages?: Partial<Record<'default' | 'portrait' | 'square' | 'tall' | 'wide' | 'landscape', string | null>> | null;
  flyerImageUrl?: string | null;
  heroImageUrl?: string | null;
};

type WeeklyEventCalendarProps = {
  days: PublicCalendarDay[];
};

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const shortWeekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function calendarEventImage(event: CalendarEvent) {
  return (
    event.flyerImages?.square ||
    event.flyerImages?.landscape ||
    event.flyerImages?.wide ||
    event.flyerImages?.default ||
    event.thumbnailImageUrl ||
    event.flyerImageUrl ||
    event.heroImageUrl ||
    null
  );
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function dateKeyFromDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date: Date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(12, 0, 0, 0);
  return start;
}

function sameDay(a: Date, b: Date) {
  return dateKeyFromDate(a) === dateKeyFromDate(b);
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

function formatDayNumber(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function formatWeekRange(weekStart: Date) {
  const weekEnd = addDays(weekStart, 6);
  const sameMonth = weekStart.getMonth() === weekEnd.getMonth();
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();

  if (sameMonth && sameYear) {
    const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(weekStart);
    return `${month} ${weekStart.getDate()}–${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
  }

  if (sameYear) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `${formatter.format(weekStart)} – ${formatter.format(weekEnd)}, ${weekEnd.getFullYear()}`;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return `${formatter.format(weekStart)} – ${formatter.format(weekEnd)}`;
}

function pickInitialWeekStart(days: PublicCalendarDay[]) {
  const todayWeekStart = startOfWeek(new Date());
  const eventDates = days
    .filter((day) => day.events?.length)
    .map((day) => parseDateKey(day.date))
    .sort((a, b) => a.getTime() - b.getTime());

  if (!eventDates.length) return todayWeekStart;

  const today = new Date();
  const firstEventDate = eventDates[0];
  const lastEventDate = eventDates[eventDates.length - 1];

  if (today >= firstEventDate && today <= addDays(lastEventDate, 6)) {
    return todayWeekStart;
  }

  return startOfWeek(firstEventDate);
}

export function WeeklyEventCalendar({ days }: WeeklyEventCalendarProps) {
  const eventDays = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();

    for (const day of days || []) {
      const sortedEvents = [...(day.events || [])].sort(
        (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
      );
      map.set(day.date, sortedEvents as CalendarEvent[]);
    }

    return map;
  }, [days]);

  const [weekStart, setWeekStart] = useState(() => pickInitialWeekStart(days || []));
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart]
  );

  const today = new Date();
  const weekHasEvents = weekDays.some((day) => (eventDays.get(dateKeyFromDate(day)) || []).length > 0);

  return (
    <section className="weekly-calendar-section stack" aria-label="Weekly Katy Vibes event calendar">
      <div className="row-between weekly-calendar-toolbar">
        <div>
          <div className="eyebrow">Weekly Calendar</div>
          <h2>{formatWeekRange(weekStart)}</h2>
          <p className="muted weekly-calendar-intro">
            Scroll through the week to see what is happening each day, then tap an event for details, tickets, tables, or reservations.
          </p>
        </div>

        <div className="button-row weekly-calendar-controls">
          <button className="button ghost" type="button" onClick={() => setWeekStart((current) => addDays(current, -7))}>
            Previous Week
          </button>
          <button className="button ghost" type="button" onClick={() => setWeekStart(startOfWeek(new Date()))}>
            This Week
          </button>
          <button className="button hot" type="button" onClick={() => setWeekStart((current) => addDays(current, 7))}>
            Next Week
          </button>
        </div>
      </div>

      <div className="weekly-calendar-scroller">
        <div className="weekly-calendar-grid">
          {weekDays.map((day, index) => {
            const key = dateKeyFromDate(day);
            const events = eventDays.get(key) || [];
            const isToday = sameDay(day, today);

            return (
              <article className={`weekly-calendar-day${isToday ? ' is-today' : ''}`} key={key}>
                <header className="weekly-calendar-day-header">
                  <span>{shortWeekdayNames[index]}</span>
                  <strong>{formatDayNumber(day)}</strong>
                  {isToday && <small>Today</small>}
                </header>

                <div className="weekly-calendar-events">
                  {events.length ? (
                    events.map((event) => {
                      const imageUrl = calendarEventImage(event);

                      return (
                        <a className="weekly-calendar-event" href={`/events/${event.slug}`} key={event.id}>
                          {imageUrl ? (
                            <img src={imageUrl} alt={`${event.title} flyer`} />
                          ) : (
                            <span className="weekly-calendar-event-placeholder">KV</span>
                          )}

                          <span className="weekly-calendar-event-copy">
                            <small>{formatCalendarTime(event.startsAt, event.endsAt)}</small>
                            <strong>{event.title}</strong>
                          </span>
                        </a>
                      );
                    })
                  ) : (
                    <p className="weekly-calendar-empty">No events posted for {weekdayNames[index]}.</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {!weekHasEvents && (
        <div className="card weekly-calendar-note">
          <p className="muted">
            No events are published for this week yet. Try the next week, or check back after new Katy Vibes events are added.
          </p>
        </div>
      )}
    </section>
  );
}
