'use client';

import { FormEvent, useMemo, useState } from 'react';

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
  seatingPreference: '',
  occasion: '',
  notes: '',
};

export function ReserveRequestForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle', message: '' });

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  function updateValue<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState({ status: 'submitting', message: 'Submitting your request…' });

    try {
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          guestCount: Number(values.guestCount || 1),
        }),
      });

      const data = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;

      if (!response.ok || !data?.ok) {
        throw new Error(data?.message || 'We could not submit your request right now. Please call Katy Vibes at 832-437-2807.');
      }

      setValues(initialValues);
      setSubmitState({
        status: 'success',
        message: data.message || 'Your request was received. Our team will review it and follow up to confirm.',
      });
    } catch (error) {
      setSubmitState({
        status: 'error',
        message: error instanceof Error ? error.message : 'We could not submit your request right now. Please call Katy Vibes at 832-437-2807.',
      });
    }
  }

  return (
    <form className="reserve-request-form" onSubmit={handleSubmit}>
      <div className="reserve-form-grid">
        <label>
          <span>Name *</span>
          <input
            required
            autoComplete="name"
            name="guestName"
            value={values.guestName}
            onChange={(event) => updateValue('guestName', event.target.value)}
            placeholder="Your name"
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
            max="500"
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
            <option value="">No preference</option>
            <option>Dining room</option>
            <option>Patio</option>
            <option>Bar area</option>
            <option>Near the stage</option>
            <option>VIP / bottle service</option>
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
        <button className="button hot" type="submit" disabled={submitState.status === 'submitting'}>
          {submitState.status === 'submitting' ? 'Sending Request…' : 'Submit Reservation Request'}
        </button>
        <p className="muted">Requests are reviewed by the Katy Vibes team. This form does not automatically confirm your reservation.</p>
      </div>

      {submitState.message ? (
        <div className={`reserve-form-message ${submitState.status}`} role={submitState.status === 'error' ? 'alert' : 'status'}>
          {submitState.message}
        </div>
      ) : null}
    </form>
  );
}
