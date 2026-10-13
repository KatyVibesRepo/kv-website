'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

type WarningSnapshot = {
  selectionKey: string;
  status: 'checking' | 'ready' | 'error';
  warnings: TicketedEventWindow[];
  requiresAcknowledgment: boolean;
};
export type TicketedEventWindow = {
  id: string;
  eventId: string;
  title: string;
  slug: string;
  showName: string | null;
  startsAt: string;
  endsAt: string | null;
};

// Compare Chicago venue-local calendar times rather than browser-local time.
// These are preliminary warnings; authoritative admission checks belong to KVRS.
function venueWallTime(isoDateTime: string) {
  const date = new Date(isoDateTime);
  if (!Number.isFinite(date.getTime())) return null;
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const pieces = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );
  return Date.UTC(
    Number(pieces.year),
    Number(pieces.month) - 1,
    Number(pieces.day),
    Number(pieces.hour),
    Number(pieces.minute),
  );
}

function requestedWallTime(date: string, time: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
  return Date.UTC(year, month - 1, day, hour, minute);
}

function ticketedWarnings(windows: TicketedEventWindow[], date: string, time: string) {
  const requested = requestedWallTime(date, time);
  if (requested === null) return [];
  const leadTime = 60 * 60 * 1000;
  return windows.filter((show) => {
    const start = venueWallTime(show.startsAt);
    const end = show.endsAt ? venueWallTime(show.endsAt) : start;
    if (start === null || end === null) return false;
    return requested >= start - leadTime && requested <= Math.max(start, end);
  });
}

function showTime(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return 'See event details';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

type SubmitState =
  | { status: 'idle'; message: '' }
  | { status: 'submitting'; message: 'Submitting your request…' }
  | { status: 'success'; message: string }
  | { status: 'error'; message: string };

type FormValues = {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: string;
  reservationType: string;
  seatingPreference: string;
  occasion: string;
  notes: string;
};

const initialValues: FormValues = {
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  reservationDate: '',
  reservationTime: '',
  guestCount: '2',
  reservationType: 'Dinner reservation',
  seatingPreference: 'Inside',
  occasion: '',
  notes: '',
};

export function ReserveRequestForm({
  ticketedWindows = [],
  stagingWarningEnabled = false,
}: {
  ticketedWindows?: TicketedEventWindow[];
  stagingWarningEnabled?: boolean;
}) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle', message: '' });
  const [acknowledgedTicketNotice, setAcknowledgedTicketNotice] = useState(false);
  const selectionKey = `${values.reservationDate}|${values.reservationTime}|${values.guestCount}`;
  const [warningSnapshot, setWarningSnapshot] = useState<WarningSnapshot | null>(null);
  const preliminaryWarnings = useMemo(
    () => ticketedWarnings(ticketedWindows, values.reservationDate, values.reservationTime),
    [ticketedWindows, values.reservationDate, values.reservationTime],
  );
  const evaluated = stagingWarningEnabled && warningSnapshot?.selectionKey === selectionKey
    ? warningSnapshot : null;
  const matchingTicketedEvents = stagingWarningEnabled
    ? evaluated?.warnings || [] : preliminaryWarnings;
  const needsAcknowledgment = stagingWarningEnabled
    ? Boolean(evaluated?.requiresAcknowledgment) : matchingTicketedEvents.length > 0;

  useEffect(() => {
    if (!stagingWarningEnabled) return;
    const { reservationDate: date, reservationTime: time, guestCount } = values;
    const partySize = Number(guestCount);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time) ||
        !Number.isInteger(partySize) || partySize < 1 || partySize > 100) return;
    const controller = new AbortController();
    const key = `${date}|${time}|${guestCount}`;
    setWarningSnapshot({ selectionKey: key, status: 'checking', warnings: [], requiresAcknowledgment: false });
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch('/api/g8/ticketed-warning/evaluate', {
          method: 'POST', cache: 'no-store', signal: controller.signal,
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, time, partySize }),
        });
        const data = (await response.json()) as {
          ok?: boolean; warnings?: Array<{
            eventId: string; title: string; slug: string; showId: string | null;
            showName: string | null; startsAt: string; endsAt: string | null;
          }>;
          requiresAcknowledgment?: boolean;
        };
        if (!response.ok || data.ok !== true || !Array.isArray(data.warnings))
          throw new Error('Unavailable');
        if (controller.signal.aborted) return;
        setWarningSnapshot({
          selectionKey: key, status: 'ready',
          requiresAcknowledgment: Boolean(data.requiresAcknowledgment),
          warnings: data.warnings.map(w => ({
            id: w.showId || w.eventId, eventId: w.eventId, title: w.title,
            slug: w.slug, showName: w.showName, startsAt: w.startsAt, endsAt: w.endsAt,
          })),
        });
      } catch {
        if (!controller.signal.aborted) setWarningSnapshot({
          selectionKey: key, status: 'error', warnings: [], requiresAcknowledgment: false,
        });
      }
    }, 250);
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, [stagingWarningEnabled, selectionKey]);
  const [pendingSubmission, setPendingSubmission] = useState<{
    key: string;
    serializedPayload: string;
  } | null>(null);

  const minDate = useMemo(() => {
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(new Date()).map((part) => [part.type, part.value]),
    );
    return parts.year + '-' + parts.month + '-' + parts.day;
  }, []);

  function updateValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (key === 'reservationDate' || key === 'reservationTime' || key === 'guestCount') setAcknowledgedTicketNotice(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (stagingWarningEnabled && (!evaluated || evaluated.status !== 'ready')) {
      setSubmitState({ status: 'error', message: 'Please wait until event admission requirements have been checked.' });
      return;
    }
    if (needsAcknowledgment && !acknowledgedTicketNotice) {
      setSubmitState({
        status: 'error',
        message: 'Please acknowledge the ticketed-event admission notice before submitting your reservation request.',
      });
      return;
    }
    setSubmitState({ status: 'submitting', message: 'Submitting your request…' });

    const payload = {
      ...values,
      guestCount: Number(values.guestCount || 1),
      ...(stagingWarningEnabled ? { ticketedWarningAcknowledged: needsAcknowledgment && acknowledgedTicketNotice } : {}),
    };
    const serializedPayload = JSON.stringify(payload);
    const idempotencyKey =
      pendingSubmission?.serializedPayload === serializedPayload
        ? pendingSubmission.key
        : crypto.randomUUID();

    setPendingSubmission({
      key: idempotencyKey,
      serializedPayload,
    });

    try {
      const response = await fetch(stagingWarningEnabled ? '/api/g8/reserve' : '/api/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: serializedPayload,
      });

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        message?: string;
        warnings?: Array<{
          eventId: string; title: string; slug: string; showId: string | null;
          showName: string | null; startsAt: string; endsAt: string | null;
        }>;
      } | null;

      if (response.status === 409 && data?.code === 'TICKETED_EVENT_ACK_REQUIRED') {
        setAcknowledgedTicketNotice(false);
        setWarningSnapshot({
          selectionKey, status: 'ready', requiresAcknowledgment: true,
          warnings: (data.warnings || []).map(w => ({
            id: w.showId || w.eventId, eventId: w.eventId, title: w.title,
            slug: w.slug, showName: w.showName, startsAt: w.startsAt, endsAt: w.endsAt,
          })),
        });
        throw new Error('Please review the ticketed event notice, check the box, and submit again.');
      }
      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.message
          || 'We could not submit your request right now. Please call Katy Vibes at 832-437-2807.',
        );
      }

      setPendingSubmission(null);
      setValues(initialValues);
      setAcknowledgedTicketNotice(false);
      setSubmitState({
        status: 'success',
        message:
          data.message
          || 'Your request was received. Our team will review it and follow up to confirm.',
      });
    } catch (error) {
      setSubmitState({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'We could not submit your request right now. Please call Katy Vibes at 832-437-2807.',
      });
    }
  }

  return (
    <form className="reserve-request-form" onSubmit={handleSubmit}>
      <div className="reserve-form-grid">
        <label>
          <span>First / Last Name *</span>
          <input
            required
            autoComplete="name"
            name="guestName"
            value={values.guestName}
            onChange={(event) => updateValue('guestName', event.target.value)}
            placeholder="First / Last Name"
          />
        </label>

        <label>
          <span>Email *</span>
          <input
            required
            autoComplete="email"
            type="email"
            name="guestEmail"
            value={values.guestEmail}
            onChange={(event) => updateValue('guestEmail', event.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label>
          <span>Phone *</span>
          <input
            required
            autoComplete="tel"
            type="tel"
            name="guestPhone"
            value={values.guestPhone}
            onChange={(event) => updateValue('guestPhone', event.target.value)}
            placeholder="832-437-2807"
          />
        </label>

        <label>
          <span>Reservation date *</span>
          <input
            required
            type="date"
            name="reservationDate"
            min={minDate}
            value={values.reservationDate}
            onChange={(event) => updateValue('reservationDate', event.target.value)}
          />
        </label>

        <label>
          <span>Reservation time *</span>
          <input
            required
            type="time"
            name="reservationTime"
            value={values.reservationTime}
            onChange={(event) => updateValue('reservationTime', event.target.value)}
          />
        </label>

        <label>
          <span>Guest count *</span>
          <input
            required
            type="number"
            name="guestCount"
            min="1"
            max="100"
            value={values.guestCount}
            onChange={(event) => updateValue('guestCount', event.target.value)}
          />
        </label>

        <label>
          <span>Reservation type</span>
          <select
            name="reservationType"
            value={values.reservationType}
            onChange={(event) => updateValue('reservationType', event.target.value)}
          >
            <option>Dinner reservation</option>
            <option>Birthday / celebration</option>
            <option>Watch party</option>
            <option>Live event / show night</option>
            <option>Private event inquiry</option>
            <option>Other</option>
          </select>
        </label>

        <label>
          <span>Seating preference</span>
          <select
            name="seatingPreference"
            value={values.seatingPreference}
            onChange={(event) => updateValue('seatingPreference', event.target.value)}
          >
            <option>Inside</option>
            <option>Outside</option>
            <option>Bar</option>
          </select>
        </label>

        <label>
          <span>Occasion</span>
          <input
            name="occasion"
            value={values.occasion}
            onChange={(event) => updateValue('occasion', event.target.value)}
            placeholder="Birthday, date night, company outing…"
          />
        </label>
      </div>

      {stagingWarningEnabled && evaluated?.status === 'checking' && (
        <p className="muted" role="status">Checking ticketed-show admission requirements…</p>
      )}
      {stagingWarningEnabled && evaluated?.status === 'error' && (
        <p className="reserve-form-message error" role="alert">
          Ticket requirements cannot be verified right now. Please try again shortly.
        </p>
      )}
      {matchingTicketedEvents.length > 0 && (
        <aside className="reserve-ticketed-warning" role="alert">
          <strong>Ticketed event during your requested visit</strong>
          {matchingTicketedEvents.map((show) => (
            <p key={show.eventId + ':' + show.id}>
              <strong>{show.title}{show.showName ? ' — ' + show.showName : ''}</strong>
              {showTime(show.startsAt)}. Admission tickets or a qualifying event table package
              may be required. A regular dining reservation does not include admission.
              {' '}<a href={'/events/' + encodeURIComponent(show.slug)}>Review tickets and tables</a>
            </p>
          ))}
          {needsAcknowledgment && <label className="reserve-ticket-warning-acknowledgment">
            <input
              type="checkbox"
              checked={acknowledgedTicketNotice}
              onChange={(event) => setAcknowledgedTicketNotice(event.target.checked)}
              required
            />
            <span>I understand this dining request does not purchase event admission.</span>
          </label>}
        </aside>
      )}

      <label className="reserve-notes-field">
        <span>Anything we should know?</span>
        <textarea
          name="notes"
          rows={3}
          value={values.notes}
          onChange={(event) => updateValue('notes', event.target.value)}
          placeholder="Tell us about timing, seating needs, event plans, accessibility needs, or anything else that helps us prepare."
        />
      </label>

      <div className="reserve-form-footer">
        <button className="button hot" type="submit" disabled={submitState.status === 'submitting' || (stagingWarningEnabled && (!evaluated || evaluated.status !== 'ready'))}>
          {submitState.status === 'submitting' ? 'Sending Request…' : 'Submit Reservation Request'}
        </button>
        <p className="muted">
          Requests are reviewed by Katy Vibes; this form does not confirm a table or provide
          admission to a ticketed event. Any applicable ticket requirements are confirmed by our team.
        </p>
      </div>

      {submitState.message ? (
        <div className={`reserve-form-message ${submitState.status}`} role={submitState.status === 'error' ? 'alert' : 'status'}>
          {submitState.message}
        </div>
      ) : null}
    </form>
  );
}
