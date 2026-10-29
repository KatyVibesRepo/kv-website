'use client';

import { FormEvent, useState } from 'react';
import { g8Link, g8RecoverRequest, g8RecoverVerify, validG8Ref, validG8Token } from '@/lib/g8PreviewClient';

export function G8RecoveryPanel({ reservationRef }: { reservationRef: string }) {
  const [email, setEmail] = useState('');
  const [proof, setProof] = useState('');
  const [requested, setRequested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      const response = await g8RecoverRequest(reservationRef, email.trim());
      if (response.ok) {
        setRequested(true);
        setMessage('If your email matches this reservation, a verification code will be sent. Check your inbox.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to request a code. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!proof.trim()) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await g8RecoverVerify(reservationRef, email.trim(), proof.trim());
      if (result.publicReservationRef !== reservationRef ||
          !validG8Ref(result.publicReservationRef) ||
          !validG8Token(result.customerAccessToken)) {
        throw new Error('Unable to verify the recovered reservation link.');
      }
      // Old link is revoked atomically by KVRS. Token remains in the URL fragment only.
      window.location.replace(g8Link(reservationRef, result.customerAccessToken));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'That code could not be verified.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card stack g8-recovery-panel">
      <h2>Recover your reservation link</h2>
      <p className="muted">Only use this option if your original secure link is lost or no longer works.
        Recovering access replaces your previous link.</p>
      <form className="stack" onSubmit={(event) => void requestCode(event)}>
        <label>
          <span>Reservation email</span>
          <input type="email" autoComplete="email" required maxLength={254}
            value={email} onChange={(event) => { setEmail(event.target.value); setRequested(false); setProof(''); }}
            placeholder="you@example.com" />
        </label>
        <button type="submit" className="button ghost" disabled={busy}>
          {busy ? 'Please wait…' : 'Email Me a Verification Code'}
        </button>
      </form>
      {requested && (
        <form className="stack" onSubmit={(event) => void verifyCode(event)}>
          <label>
            <span>Verification code</span>
            <input type="text" autoComplete="one-time-code" required minLength={20} maxLength={100}
              value={proof} onChange={(event) => setProof(event.target.value)} />
          </label>
          <button type="submit" className="button" disabled={busy}>
            {busy ? 'Verifying…' : 'Recover Secure Link'}
          </button>
        </form>
      )}
      {message && <p className="ticket-form-message" role="status">{message}</p>}
    </div>
  );
}
