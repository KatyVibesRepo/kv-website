'use client';

import { useEffect, useState } from 'react';
import { g8Link, takeCheckoutReturn } from '@/lib/g8PreviewClient';

export function G8CheckoutReturn() {
  const [message, setMessage] = useState('Returning to your reservation…');
  useEffect(() => {
    // Do not trust Stripe redirect as proof of settlement.
    const handoff = takeCheckoutReturn();
    if (!handoff) {
      setMessage('Open your saved secure reservation link to check payment status.');
      return;
    }
    window.location.replace(g8Link(handoff.ref, handoff.token));
  }, []);
  return (
    <section className="stack g8-customer-page">
      <h1>Payment update</h1>
      <p role="status">{message}</p>
      <p>Payments are only confirmed when they appear in your reservation status.</p>
      <p>Questions? Call <a href="tel:18324372807">(832) 437-2807</a>.</p>
    </section>
  );
}
