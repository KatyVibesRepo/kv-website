'use client';
import { useEffect, useState } from 'react';
import { customerLink, takeCustomerReturn } from '@/lib/customerM1Client';

export function CustomerCheckoutReturn() {
  const [message, setMessage] = useState('Returning to your reservation to verify payment status…');
  useEffect(() => {
    // Ignore all success/cancel/session query values; never infer settlement from a redirect.
    window.history.replaceState(null, '', window.location.pathname);
    const handoff = takeCustomerReturn();
    if (handoff) window.location.replace(customerLink(handoff.ref, handoff.token));
    else setMessage('Open your saved secure reservation link to check payment status. You can recover access there using your reservation email.');
  }, []);
  return <section className="stack"><h1>Payment update</h1><p role="status">{message}</p>
    <p>A return from Checkout does not confirm payment. Your reservation shows the verified status.</p>
    <a href="tel:18324372807">Questions? Call (832) 437-2807.</a></section>;
}
