'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { customerLink, takeCustomerReturn, validCustomerRef } from '@/lib/customerM1Client';

export function CustomerCheckoutReturn() {
  const [message, setMessage] = useState('Returning to your reservation to verify payment status…');
  const [reference, setReference] = useState('');
  const handled = useRef(false);
  useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    // Ignore all success/cancel/session query values; never infer settlement from a redirect.
    window.history.replaceState(null, '', window.location.pathname);
    const handoff = takeCustomerReturn();
    if (handoff) window.location.replace(customerLink(handoff.ref, handoff.token));
    else setMessage('Open your saved secure reservation link to check payment status. You can recover access there using your reservation email.');
  }, []);
  function recover(event: FormEvent) {
    event.preventDefault();
    const ref = reference.trim();
    if (validCustomerRef(ref)) window.location.assign('/reservations/group/' + ref);
    else setMessage('Enter the reservation reference from your confirmation, or call Katy Vibes for help.');
  }
  return <section className="stack"><h1>Payment update</h1><p role="status">{message}</p>
    <p>Your reservation will show your latest payment status. Please check it before making another payment.</p>
    <form className="card stack" onSubmit={recover}>
      <h2>Find your reservation</h2><p>Have your confirmation handy? Enter its reservation reference to recover your secure link by email.</p>
      <label>Reservation reference<input value={reference} onChange={e => setReference(e.target.value)}
        autoComplete="off" required maxLength={44} /></label>
      <button className="button">Open My Reservation</button>
    </form>
    <a href="tel:18324372807">Questions? Call (832) 437-2807.</a></section>;
}
