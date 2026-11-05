'use client';

import { useCallback, useEffect, useState } from 'react';
import { G8RecoveryPanel } from '@/components/G8RecoveryPanel';
import { G8AdmissionQr } from '@/components/G8AdmissionQr';
import {
  G8RequestError, g8Link, g8PayGuest, g8Status, stashCheckoutReturn, takeCheckoutReturn,
  validG8Ref, validG8Token,
  type G8Status,
} from '@/lib/g8PreviewClient';

type Props = { reservationRef: string };

function money(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value / 100);
}
function datetime(value: string | null) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isFinite(d.getTime())
    ? new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Chicago',
    }).format(d) + ' Central'
    : null;
}
function humanize(value: string) {
  return value.toLowerCase().replaceAll('_', ' ').replace(/\b\w/g, m => m.toUpperCase());
}

export function G8ReservationPage({ reservationRef }: Props) {
  const [accessToken, setAccessToken] = useState('');
  const [status, setStatus] = useState<G8Status | null>(null);
  const [busy, setBusy] = useState(false);
  const [paying, setPaying] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // The URL fragment is never part of the HTTP request or rendered HTML.
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const supplied = fragment.get('access') || '';
    const pending = supplied ? null : takeCheckoutReturn();
    const token = supplied || (pending?.ref === reservationRef ? pending.token : '') || '';
    if (validG8Token(token) && validG8Ref(reservationRef)) {
      setAccessToken(token);
    } else {
      setMessage('Open your original secure reservation link to view this booking.');
    }
    // Remove the fragment from the address bar and history after consuming it.
    // Keep the bearer only in memory, not in localStorage, cookies or the URL.
    if (window.location.hash) window.history.replaceState(null, '', window.location.pathname);
    setInitialized(true);
  }, [reservationRef]);

  const refresh = useCallback(async (token: string, quiet = false) => {
    if (!token || !validG8Ref(reservationRef)) return;
    if (!quiet) setBusy(true);
    try {
      const result = await g8Status(reservationRef, token);
      if (result.publicReservationRef !== reservationRef) throw new Error('Reservation does not match this link.');
      if (result.event.id !== 'kvrs_g8_syn_durable_event_20261012') {
        throw new Error('This reservation is outside the authorized preview.');
      }
      setStatus(result);
      setMessage('');
    } catch (error) {
      if (error instanceof G8RequestError && (error.httpStatus === 401 || error.httpStatus === 404)) {
        // Revoked or expired capabilities must not leave stale private data visible.
        setStatus(null);
        setAccessToken('');
      }
      if (!quiet || error instanceof G8RequestError && error.httpStatus === 401) {
        setMessage(error instanceof Error ? error.message : 'Unable to load your reservation.');
      }
    } finally {
      if (!quiet) setBusy(false);
    }
  }, [reservationRef]);

  useEffect(() => {
    if (!accessToken) return;
    void refresh(accessToken);
    const interval = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh(accessToken, true);
    }, 25000);
    return () => window.clearInterval(interval);
  }, [accessToken, refresh]);

  async function copySecureLink() {
    if (!accessToken) return;
    try {
      await navigator.clipboard.writeText(g8Link(reservationRef, accessToken));
      setCopied(true);
      setMessage('');
    } catch {
      setMessage('Unable to copy automatically. Please keep your original secure link.');
    }
  }

  async function payShare(shareRef: string) {
    if (!status || !accessToken || paying || busy || status.coverage.unpaidActive <= 0) return;
    setPaying(shareRef);
    setMessage('');
    try {
      // Only one unsettled guest-share Checkout may exist at a time.
      const checkout = await g8PayGuest(reservationRef, accessToken, shareRef, crypto.randomUUID());
      const destination = new URL(checkout.checkoutUrl);
      if (destination.protocol !== 'https:' || destination.hostname !== 'checkout.stripe.com') {
        throw new Error('The payment page is unavailable. Please try again later.');
      }
      if (checkout.coverageGranted !== false || checkout.paymentState !== 'PENDING') {
        throw new Error('Payment confirmation is temporarily unavailable.');
      }
      // Session-only handoff across a Stripe redirect, removed on return.
      // Never add the bearer to Stripe URLs, query strings or analytics.
      stashCheckoutReturn(reservationRef, accessToken);
      window.location.assign(destination.toString());
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open checkout.');
      setPaying('');
      void refresh(accessToken);
    }
  }

  const currency = status?.payment.currency || 'USD';
  const activeShares = status?.guestShares.filter(s =>
    s.coverage === 'UNPAID' && s.lifecycle === 'ACTIVE') || [];
  const closed = Boolean(status && (
    status.coverage.unpaidActive === 0 || !status.capacityHeld ||
    status.reservationState === 'EXPIRED_OR_RELEASED' ||
    !status.holdExpiresAt ||
    new Date(status.holdExpiresAt).getTime() <= Date.now() + 32 * 60_000
  ));

  return (
    <section className="stack g8-customer-page" aria-label="Secure reservation">
      <div className="eyebrow">Katy Vibes Reservations</div>
      <h1>Your reservation</h1>
      {!initialized || busy && !status ? <p role="status">Loading your reservation…</p> : null}
      {initialized && !accessToken && !status && (
        <G8RecoveryPanel reservationRef={reservationRef} />
      )}

      {status && (
        <>
          <article className="card stack">
            <div className="row-between">
              <div>
                <p className="muted">Event</p>
                <h2>{status.event.title}</h2>
                <p>{status.product.name} · {status.guestCount} guests</p>
              </div>
              <strong>{humanize(status.paymentState)}</strong>
            </div>
            <div className="g8-status-grid">
              <div><span>Paid online</span><strong>{status.coverage.prepaid}</strong></div>
              <div><span>Paid at venue</span><strong>{status.coverage.manualAcknowledged}</strong></div>
              <div><span>Awaiting payment</span><strong>{status.coverage.unpaidActive}</strong></div>
              <div><span>Released unpaid</span><strong>{status.coverage.releasedUnpaid}</strong></div>
              <div><span>Checked in</span><strong>{status.coverage.admitted}</strong></div>
              <div><span>Covered entries remaining</span><strong>{status.coverage.remainingCovered}</strong></div>
              <div><span>Outstanding</span><strong>{money(status.payment.outstandingCents, currency)}</strong></div>
            </div>
            {status.holdExpiresAt && status.coverage.unpaidActive > 0 && (
              <p>
                Payment deadline: <strong>{datetime(status.holdExpiresAt)}</strong>.
                Unpaid guest places may be released after this time. Paid admissions remain covered.
              </p>
            )}
            {status.payment.pendingCents > 0 && (
              <p role="status">A payment is still processing. Returning from checkout does not confirm payment.</p>
            )}
            {status.coverage.releasedUnpaid > 0 && (
              <p>Some unpaid places were released. They are no longer reserved.</p>
            )}
            {status.coverage.unpaidActive > 0 && closed && (
              <p>New online payments cannot be started this close to the payment deadline. Please call Katy Vibes for help.</p>
            )}
            <p className="muted">
              Payment and admission are verified by Katy Vibes. A table number is assigned by our team.

            </p>
          </article>
          <G8AdmissionQr
            reservationRef={reservationRef}
            customerAccessToken={accessToken}
            guestCount={status.guestCount}
            enabled={Boolean(accessToken)}
          />
          <article className="card stack">
            <h2>Guest payments</h2>
            <p className="muted">
              Each guest pays separately. Only completed, verified payments count toward admission.
            </p>
            <div className="g8-share-list">
              {status.guestShares.map(share => {
                const payable = activeShares.some(s => s.shareRef === share.shareRef);
                return (
                  <div className="g8-share" key={share.shareRef}>
                    <div>
                      <strong>Guest {share.ordinal}</strong>
                      <span>{money(share.amountCents, currency)} · {humanize(share.coverage)}{share.lifecycle === 'RELEASED' ? ' · Released' : ''}</span>
                    </div>
                    {payable && !closed && (
                      <button type="button" className="button ghost" disabled={Boolean(paying) || busy}
                        onClick={() => void payShare(share.shareRef)}>
                        {paying === share.shareRef ? 'Opening…' : 'Pay This Guest'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {status.guestShares.length === 0 && <p>There are no individually payable guest shares for this reservation.</p>}
          </article>
        </>
      )}
      <div className="g8-reservation-actions">
        {accessToken && <button type="button" className="button" onClick={() => void copySecureLink()}>
          {copied ? 'Secure Link Copied' : 'Copy Secure Reservation Link'}
        </button>}
        {accessToken && <button type="button" className="button ghost" disabled={busy}
          onClick={() => void refresh(accessToken)}>
          Refresh Payment Status
        </button>}
      </div>
      {message && <p className="ticket-form-message" role="status">{message}</p>}
      <p className="muted">
        Save your secure link to reopen this reservation through the event and for 30 days afterward.
        We won&apos;t ask you to create an account. Questions? Call <a href="tel:18324372807">(832) 437-2807</a>.
      </p>
    </section>
  );
}
