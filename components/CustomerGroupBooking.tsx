'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  centsFromDollars, customerCreate, customerLink, customerQuote, customerStatus,
  immutableCommand, loadCustomerOperation, saveCustomerOperation, clearCustomerOperation,
  CustomerRequestError, type CustomerOperation, type CustomerQuote, type PaymentChoice,
} from '@/lib/customerM1Client';
import styles from './CustomerReservations.module.css';
import { CustomerShowCoverage } from './CustomerShowCoverage';

type Product = { eventId: string; productId: string; eventTitle: string; productName: string; guestCount: number;
  shows: Array<{ id: string; label: string }>; showSelection: 'EVENT' | 'SELECTED_SHOW' | 'RESOLVE_LINKED_SHOWS' };
const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);

export function CustomerGroupBooking({ product }: { product: Product }) {
  const [choice, setChoice] = useState<PaymentChoice>('PAY_PER_GUEST');
  const [onlineGuests, setOnlineGuests] = useState(1);
  const [installment, setInstallment] = useState('');
  const [showId, setShowId] = useState(product.showSelection === 'SELECTED_SHOW' && product.shows.length === 1 ? product.shows[0].id : '');
  const [serverRequiresShow, setServerRequiresShow] = useState(false);
  const showRequired = product.showSelection === 'SELECTED_SHOW' || serverRequiresShow;
  const [quote, setQuote] = useState<CustomerQuote | null>(null);
  const [operation, setOperation] = useState<CustomerOperation | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [ready, setReady] = useState(false);
  const locked = useRef(false);
  const createdAccess = useRef<{ ref: string; token: string } | null>(null);

  useEffect(() => {
    try { setOperation(loadCustomerOperation()); setReady(true); }
    catch (error) { setMessage((error as Error).message); }
  }, []);

  async function getQuote(event: FormEvent) {
    event.preventDefault();
    if (locked.current || operation || !ready) return;
    locked.current = true; setBusy(true); setMessage(''); setQuote(null);
    try {
      const proposed = centsFromDollars(installment);
      if (choice === 'PACKAGE_INSTALLMENT' && !proposed) throw new Error('Enter an installment in dollars and cents.');
      if (showRequired && !showId) throw new Error('Please choose a show.');
      const result = await customerQuote({
        eventId: product.eventId, productId: product.productId, quantity: 1,
        paymentChoice: choice, ...(showRequired ? { showId } : {}),
        ...(choice === 'PAY_PER_GUEST' ? { plannedOnlineGuestCount: onlineGuests } :
          choice === 'PACKAGE_INSTALLMENT' ? { proposedInstallmentCents: proposed! } : {}),
      });
      if (result.event.id !== product.eventId || result.product.id !== product.productId ||
        result.guestCount !== product.guestCount || result.product.quantity !== 1 || result.currency !== 'USD' ||
        result.capacityHeld !== false || !result.eligiblePaymentChoices.includes(choice) ||
        result.gracePolicy.anchor !== 'RESERVATION_CREATED' ||
        (product.showSelection === 'EVENT' && result.admissionScope.type !== 'EVENT') ||
        (product.showSelection !== 'EVENT' && result.admissionScope.type !== 'SHOWS') ||
        (product.showSelection === 'RESOLVE_LINKED_SHOWS' && !showRequired &&
          (result.admissionScope.selection !== 'ALL_LINKED_SHOWS' ||
            JSON.stringify([...result.admissionScope.showIds].sort()) !== JSON.stringify(product.shows.map(s => s.id).sort()))) ||
        (showRequired && !result.admissionScope.showIds.includes(showId)) ||
        !Number.isSafeInteger(result.totalCents) || result.totalCents <= 0 ||
        !Number.isFinite(Date.parse(result.quoteExpiresAt))) throw new Error('The reservation quote could not be verified.');
      setQuote(result);
    } catch (error) {
      if (product.showSelection === 'RESOLVE_LINKED_SHOWS' && error instanceof CustomerRequestError && error.code === 'SHOW_REQUIRED') {
        // A read-only quote, not link count or the product label, resolves manual selection.
        setServerRequiresShow(true); setMessage('Please choose the show you would like to attend, then request your quote again.');
      } else setMessage((error as Error).message);
    }
    finally { setBusy(false); locked.current = false; }
  }

  async function submit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (locked.current || !ready || (operation && operation.kind !== 'reservation')) return;
    if (operation?.kind === 'reservation' &&
      (operation.eventId !== product.eventId || operation.productId !== product.productId)) return;
    locked.current = true; setBusy(true); setMessage('');
    try {
      let original = operation;
      if (!original) {
        if (!event || !quote || Date.parse(quote.quoteExpiresAt) <= Date.now()) {
          setQuote(null); throw new Error('Your quote expired. Request an updated quote before reserving.');
        }
        const form = new FormData(event.currentTarget);
        if (form.get('terms') !== 'on') throw new Error('Please accept the unpaid payment terms.');
        original = { kind: 'reservation', eventId: product.eventId, productId: product.productId,
          command: immutableCommand({ quoteToken: quote.quoteToken,
            customerName: String(form.get('name') || '').trim(), customerEmail: String(form.get('email') || '').trim(),
            customerPhone: String(form.get('phone') || '').trim(), paymentChoice: choice, acceptUnpaidPaymentTerms: true as const }) };
        saveCustomerOperation(original); setOperation(original);
      }
      if (original.kind !== 'reservation') return;
      // Once sent, this exact quote token/body/key is retained, including after a lost response/reload.
      if (!createdAccess.current) {
        const created = await customerCreate(original.command);
        createdAccess.current = { ref: created.publicReservationRef, token: created.customerAccessToken };
      }
      const access = createdAccess.current;
      // Initial create/replay counts are not authoritative. Read status before showing confirmation.
      await customerStatus(access.ref, access.token);
      clearCustomerOperation();
      window.location.assign(customerLink(access.ref, access.token));
    } catch (error) {
      if (!createdAccess.current && error instanceof CustomerRequestError && error.code === 'STALE_QUOTE') {
        clearCustomerOperation(); setOperation(null); setQuote(null);
      }
      setMessage((error as Error).message);
    } finally { setBusy(false); locked.current = false; }
  }

  return <section className={`card stack ${styles.panel}`}>
    <h2>{product.productName}</h2><p>{product.eventTitle} · {product.guestCount} guests · One table</p>
    {operation ? <div className="stack">
      <p role="status">An earlier request must be resolved before another reservation or payment can start.</p>
      {operation.kind === 'reservation' && operation.eventId === product.eventId && operation.productId === product.productId &&
        <button className="button" disabled={busy} onClick={() => void submit()}>Retry Original Reservation Request</button>}
      <p>Retrying keeps the original request and does not start a second reservation. Call (832) 437-2807 if you need help.</p>
    </div> : <>
      <form className="stack" onSubmit={getQuote}>
        <label>Payment option<select value={choice} disabled={busy} onChange={e => { setChoice(e.target.value as PaymentChoice); setQuote(null); }}>
          <option value="PAY_PER_GUEST">Pay by guest</option><option value="PACKAGE_INSTALLMENT">Pay toward the table package</option>
          <option value="PAY_AT_DOOR">Pay at the door</option></select></label>
        {showRequired && <label>Show<select required value={showId} disabled={busy} onChange={e => { setShowId(e.target.value); setQuote(null); }}>
          <option value="">Choose a show</option>{product.shows.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label>}
        {choice === 'PAY_PER_GUEST' && <label>Guests planning to pay online<select value={onlineGuests} disabled={busy}
          onChange={e => { setOnlineGuests(Number(e.target.value)); setQuote(null); }}>
          {Array.from({ length: product.guestCount }, (_, i) => <option key={i} value={i + 1}>{i + 1}</option>)}</select></label>}
        {choice === 'PACKAGE_INSTALLMENT' && <label>Proposed installment ($)<input inputMode="decimal" required value={installment}
          disabled={busy} onChange={e => { setInstallment(e.target.value); setQuote(null); }} /></label>}
        <button className="button ghost" disabled={!ready || busy}>Review Reservation Quote</button>
      </form>
      {quote && <form className="stack" onSubmit={event => void submit(event)}>
        <p><strong>Total: {money(quote.totalCents)}</strong></p>
        <p>Planned online: {money(quote.amountDueNowCents)} · Remaining: {money(quote.amountDueLaterCents)}</p>
        <CustomerShowCoverage scope={quote.admissionScope} />
        {choice === 'PAY_PER_GUEST' && <><ul>{quote.guestShares.map(s => <li key={s.shareRef}>Guest {s.ordinal}: {money(s.amountCents)}</li>)}</ul>
          <p>Each Checkout pays for one selected guest. Additional guests require separate payment requests after payment status updates.</p></>}
        {choice === 'PACKAGE_INSTALLMENT' && <p>Payments fund the entire table package. Partial funding grants zero guest admissions until the package is fully funded.</p>}
        <p>Your unpaid payment deadline starts when the reservation is created: {quote.gracePolicy.minutes} minutes.
          The quote holds no capacity. The exact deadline will appear in your reservation.</p>
        <label>Name<input name="name" autoComplete="name" required minLength={2} maxLength={120} disabled={busy} /></label>
        <label>Email<input name="email" type="email" autoComplete="email" required maxLength={200} disabled={busy} /></label>
        <label>Phone<input name="phone" type="tel" autoComplete="tel" required minLength={7} maxLength={40} disabled={busy} /></label>
        <label className={styles.check}><input type="checkbox" name="terms" required disabled={busy} />
          I agree to the unpaid payment deadline. Unpaid places may be released under Katy Vibes&apos; payment terms. Payment and staff check-in are required for admission.</label>
        <button className="button" disabled={busy}>Create Reservation</button>
        <p>No payment is collected by this button. Choose a payment from your reservation page.</p>
      </form>}
    </>}
    {message && <p role="status">{message}</p>}
  </section>;
}
