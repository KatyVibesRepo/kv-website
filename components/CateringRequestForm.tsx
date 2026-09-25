'use client';

import { FormEvent, useState } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';
function value(form: FormData, key: string) {
  const item = form.get(key);
  return typeof item === 'string' ? item.trim() : '';
}

export function CateringRequestForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const submitting = status === 'submitting';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const guestCount = value(data, 'guestCount');
    const payload = {
      contactName: value(data, 'contactName'),
      contactPhone: value(data, 'contactPhone'),
      contactEmail: value(data, 'contactEmail'),
      eventDate: value(data, 'eventDate'),
      guestCount: guestCount ? Number(guestCount) : null,
      occasion: value(data, 'occasion'),
      serviceType: value(data, 'serviceType') || 'UNDECIDED',
      eventLocation: value(data, 'eventLocation'),
      budgetRange: value(data, 'budgetRange'),
      menuRequests: value(data, 'menuRequests'),
      details: value(data, 'details'),
      smsConsent: data.get('smsConsent') === 'on',
    };
    setStatus('submitting');
    setMessage('');
    try {
      const response = await fetch('/api/catering/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || 'We could not submit your request. Please try again.');
      }
      setStatus('success');
      setMessage('Your catering request has been received by Katy Vibes. Our team will review it and follow up.');
      form.reset();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not submit your catering request.');
    }
  }

  return (
    <article className="card stack reservation-card-wide catering-request-card">
      <div>
        <div className="eyebrow">Catering request</div>
        <h3>Request catering information</h3>
        <p className="muted">Share your plans. This request goes directly to the Katy Vibes management team; no email app is needed.</p>
      </div>
      <form className="reservation-form-grid" onSubmit={handleSubmit}>
        {message ? (
          <p className={`span-two job-application-alert ${status === 'success' ? 'success' : 'error'}`}
            role="status" aria-live="polite">{message}</p>
        ) : null}
        <label>Full name *
          <input name="contactName" required minLength={2} maxLength={160}
            autoComplete="name" placeholder="Your name" />
        </label>
        <label>Phone *
          <input name="contactPhone" required type="tel" minLength={7} maxLength={40}
            autoComplete="tel" placeholder="Best number to reach you" />
        </label>
        <label className="span-two">Email (required for an automatic receipt)
          <input name="contactEmail" type="email" maxLength={200} autoComplete="email"
            placeholder="you@example.com (optional if you prefer phone follow-up)" />
        </label>
        <label>Event date
          <input name="eventDate" type="date" />
        </label>
        <label>Estimated guest count
          <input name="guestCount" type="number" min={1} max={10000} step={1} placeholder="e.g. 40" />
        </label>
        <label>Occasion
          <input name="occasion" maxLength={160} placeholder="Office lunch, birthday, wedding…" />
        </label>
        <label>Service type
          <select name="serviceType" defaultValue="UNDECIDED">
            <option value="UNDECIDED">Not sure yet</option>
            <option value="PICKUP">Pickup</option>
            <option value="DELIVERY">Delivery</option>
            <option value="ON_SITE">On-site service</option>
          </select>
        </label>
        <label>Event / delivery location
          <input name="eventLocation" maxLength={300} placeholder="Venue, address, or general area" />
        </label>
        <label>Budget range
          <input name="budgetRange" maxLength={160} placeholder="Optional estimate" />
        </label>
        <label className="span-two">Menu interests or dietary requirements
          <textarea name="menuRequests" maxLength={2000} rows={3}
            placeholder="Favorite items, allergies, dietary notes, or service needs." />
        </label>
        <label className="span-two">Additional details *
          <textarea name="details" rows={5} required minLength={10} maxLength={4000}
            placeholder="Tell us the time, occasion, guest count, delivery/pickup needs, and anything else we should know." />
        </label>
        <div className="span-two catering-sms-consent">
          <label className="catering-sms-consent-choice">
            <input name="smsConsent" type="checkbox" value="on" />
            <span>I agree to receive optional text messages from Katy Vibes about this catering request.
              Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.
              SMS consent is not required to submit a catering inquiry.</span>
          </label>
          <p>Read the <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and{' '}
            <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.
            Text messaging is not yet active and will remain disabled until required registration is complete.</p>
        </div>
        <button className="hot span-two" type="submit" disabled={submitting}>
          {submitting ? 'Submitting Request…' : 'Send Catering Request'}
        </button>
      </form>
    </article>
  );
}
