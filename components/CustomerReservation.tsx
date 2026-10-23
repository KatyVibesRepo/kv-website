'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import {
  canStartCustomerPayment, customerFeatureDisabled, centsFromDollars, clearCustomerOperation, customerCheckout, customerLink,
  customerQr, customerRecoverCheckout, customerRecoverRequest, customerRecoverVerify, customerStatus,
  immutableCommand, loadCustomerOperation, saveCustomerOperation, saveCustomerReturn, stripeDestination,
  takeCustomerReturn, validCustomerToken, CustomerRequestError,
  type CustomerOperation, type CustomerStatus, type PaymentInput,
} from '@/lib/customerM1Client';
import { qrcodegen } from '@/lib/vendor/qrcodegen';
import styles from './CustomerReservations.module.css';
import { CustomerShowCoverage } from './CustomerShowCoverage';

const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const label = (value: string) => value.toLowerCase().replaceAll('_', ' ');
const date = (value: string) => new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago', dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value)) + ' Central';

function CustomerAccessRecovery({ reservationRef, onRecovered }: {
  reservationRef: string; onRecovered: (token: string) => void;
}) {
  const [email, setEmail] = useState(''); const [proof, setProof] = useState('');
  const [requested, setRequested] = useState(false); const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(''); const locked = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (locked.current) return;
    locked.current = true; setBusy(true); setMessage('');
    try {
      if (requested) {
        const access = await customerRecoverVerify(reservationRef, email.trim(), proof.trim());
        setProof(''); onRecovered(access.customerAccessToken);
      } else {
        await customerRecoverRequest(reservationRef, email.trim()); setRequested(true);
        setMessage('If your email matches this reservation, a verification code will be sent.');
      }
    } catch (error) { setMessage((error as Error).message); }
    finally { locked.current = false; setBusy(false); }
  }
  return <form className="card stack" onSubmit={submit}>
    <h2>Recover your reservation link</h2>
    <p>Use the reservation email to verify ownership. Recovering access replaces your previous secure link.</p>
    <label>Email<input type="email" autoComplete="email" maxLength={254} required value={email} disabled={busy}
      onChange={e => { setEmail(e.target.value); setRequested(false); setProof(''); }} /></label>
    {requested && <label>Verification code<input autoComplete="one-time-code" value={proof} required minLength={20} maxLength={100}
      disabled={busy} onChange={e => setProof(e.target.value)} /></label>}
    <button className="button" disabled={busy}>{requested ? 'Verify and Open Reservation' : 'Email Me a Verification Code'}</button>
    {message && <p role="status">{message}</p>}
  </form>;
}

function CustomerGroupQr({ reservationRef, token, guestCount }: { reservationRef: string; token: string; guestCount: number }) {
  const [path, setPath] = useState<{ pixels: number; modules: string } | null>(null);
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const locked = useRef(false);
  useEffect(() => { setPath(null); setMessage(''); }, [reservationRef, token]);
  async function showQr() {
    if (locked.current) return; locked.current = true; setBusy(true); setPath(null); setMessage('');
    try {
      const qr = await customerQr(reservationRef, token, guestCount);
      const matrix = qrcodegen.QrCode.encodeText(qr.scanValue, qrcodegen.QrCode.Ecc.MEDIUM);
      const modules: string[] = []; const quiet = 4;
      for (let y = 0; y < matrix.size; y++) for (let x = 0; x < matrix.size; x++) {
        if (matrix.getModule(x, y)) modules.push(`M${x + quiet} ${y + quiet}h1v1h-1z`);
      }
      setPath({ pixels: matrix.size + 2 * quiet, modules: modules.join('') });
    } catch { setMessage('Your entry QR is unavailable. Please contact Katy Vibes if you need assistance.'); }
    finally { locked.current = false; setBusy(false); }
  }
  return <article className="card stack">
    <h2>Your group entry QR</h2>
    <p>Show your QR to Katy Vibes staff when you arrive. A scan alone confirms neither payment nor admission, arrival or seating.</p>
    {path && <div className={styles.qr}><svg viewBox={`0 0 ${path.pixels} ${path.pixels}`} role="img"
      aria-label="Group admission QR for authorized Katy Vibes staff" shapeRendering="crispEdges">
      <rect width={path.pixels} height={path.pixels} fill="#fff" /><path d={path.modules} fill="#000" /></svg></div>}
    <button className="button ghost" disabled={busy} onClick={() => void showQr()}>{path ? 'Show Entry QR Again' : 'Show Entry QR'}</button>
    {message && <p role="status">{message}</p>}
    <p className="muted">Admission requires verified coverage and staff confirmation. Contact the venue for a revoked QR; recovering your link does not replace it.</p>
  </article>;
}

export function CustomerReservation({ reservationRef, salesEnabled, approvedPairs }: { reservationRef: string; salesEnabled: boolean; approvedPairs: string[] }) {
  const [token, setToken] = useState(''); const [initialized, setInitialized] = useState(false);
  const [status, setStatus] = useState<CustomerStatus | null>(null); const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(''); const [installment, setInstallment] = useState('');
  const [operation, setOperation] = useState<CustomerOperation | null>(null);
  const [journalError, setJournalError] = useState(false); const [clock, setClock] = useState(Date.now());
  const locked = useRef(false); const liveToken = useRef(''); const mounted = useRef(true);
  liveToken.current = token;
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => {
    const supplied = new URLSearchParams(window.location.hash.slice(1)).get('access');
    const returned = supplied ? null : takeCustomerReturn();
    const access = supplied || (returned?.ref === reservationRef ? returned.token : '') || '';
    window.history.replaceState(null, '', window.location.pathname);
    if (validCustomerToken(access)) setToken(access);
    try { setOperation(loadCustomerOperation()); } catch { setJournalError(true); }
    setInitialized(true);
  }, [reservationRef]);

  const refresh = useCallback(async (): Promise<CustomerStatus> => {
    const access = liveToken.current;
    try {
      const result = await customerStatus(reservationRef, access);
      if (mounted.current && liveToken.current === access) setStatus(result);
      return result;
    } catch (error) {
      if (mounted.current && liveToken.current === access) {
        // Any failed read removes stale status/payment/QR UI. Feature-disabled is not ownership loss.
        setStatus(null);
        if (error instanceof CustomerRequestError && (error.httpStatus === 401 ||
          error.httpStatus === 404 && !customerFeatureDisabled(error.code))) setToken('');
      }
      throw error;
    }
  }, [reservationRef]);

  useEffect(() => {
    if (!token) return;
    let active = true;
    async function read() {
      try { await refresh(); if (active) setMessage(''); }
      catch (error) { if (active) setMessage((error as Error).message); }
    }
    void read();
    const interval = window.setInterval(() => {
      setClock(Date.now()); if (document.visibilityState === 'visible' && !locked.current) void read();
    }, 30000);
    const visible = () => { if (document.visibilityState === 'visible' && !locked.current) void read(); };
    document.addEventListener('visibilitychange', visible);
    return () => { active = false; window.clearInterval(interval); document.removeEventListener('visibilitychange', visible); };
  }, [token, refresh]);

  async function manualRefresh() {
    if (locked.current) return; locked.current = true; setBusy(true);
    try { await refresh(); setMessage(''); } catch (error) { setMessage((error as Error).message); }
    finally { locked.current = false; setBusy(false); }
  }

  async function openCheckout(checkoutRef: string) {
    const recovered = await customerRecoverCheckout(token, checkoutRef);
    const fresh = await refresh(); // required even when provider returns an open URL
    if (fresh.reconciliationRequired || fresh.nextAction === 'CONTACT_VENUE') throw new Error('Please contact Katy Vibes to review this payment.');
    const entry = fresh.checkoutHistory.find(h => h.checkoutRef === checkoutRef);
    if (!entry || entry.state !== 'PENDING' || !recovered.checkoutUrl) {
      if (operation?.kind === 'checkout' && operation.checkoutRef === checkoutRef && entry && entry.state !== 'PENDING') {
        clearCustomerOperation(); setOperation(null);
      }
      setMessage('Payment status has been refreshed. This Checkout cannot be reopened.'); return;
    }
    saveCustomerReturn(reservationRef, token); // refuse navigation if tab handoff cannot be saved
    window.location.assign(stripeDestination(recovered.checkoutUrl));
  }

  async function payment(body?: PaymentInput) {
    if (locked.current || journalError || operation?.kind === 'reservation') return;
    if (operation?.kind === 'checkout' && operation.command.body.publicReservationRef !== reservationRef) return;
    locked.current = true; setBusy(true); setMessage('');
    try {
      let original = operation;
      if (!original) {
        const fresh = await refresh();
        if (!salesEnabled || !approvedPairs.includes(`${fresh.event.id}:${fresh.product.id}`) || !body || !canStartCustomerPayment(fresh)) {
          throw new Error('A new payment is unavailable. Refresh status or contact Katy Vibes.');
        }
        let expectedCents: number;
        if (body.contributionMode === 'GUEST_SHARE') {
          const share = fresh.guestShares.find(s => s.shareRef === body.guestShareRef && s.coverage === 'UNPAID' && s.lifecycle === 'ACTIVE');
          if (!share) throw new Error('This guest share is no longer available.');
          expectedCents = share.amountCents;
        } else {
          if (fresh.guestShares.length || !Number.isSafeInteger(body.installmentAmountCents) ||
            body.installmentAmountCents <= 0 || body.installmentAmountCents > fresh.payment.packageBalanceCents) {
            throw new Error('Enter an installment within the remaining table balance.');
          }
          expectedCents = body.installmentAmountCents;
        }
        original = { kind: 'checkout', command: immutableCommand(body), expectedCents };
        saveCustomerOperation(original); setOperation(original);
      }
      if (original.kind !== 'checkout') return;
      if (original.checkoutRef) { await openCheckout(original.checkoutRef); return; }
      // Even if sales are subsequently disabled, an uncertain original command is never replaced.
      // Backend gates remain authoritative; no alternative amount, body, key or provider Session.
      const checkout = await customerCheckout(token, original.command, original.expectedCents);
      original = { ...original, checkoutRef: checkout.checkoutRef };
      saveCustomerOperation(original); setOperation(original);
      await openCheckout(checkout.checkoutRef);
    } catch (error) {
      setMessage((error as Error).message);
      // Status can reveal pending/reconciliation; the journal remains until the original is resolved.
      try { await refresh(); } catch { /* Keep original uncertainty message. */ }
    } finally { locked.current = false; setBusy(false); }
  }

  async function resume(checkoutRef: string) {
    if (locked.current) return; locked.current = true; setBusy(true); setMessage('');
    try { await openCheckout(checkoutRef); }
    catch (error) { setMessage((error as Error).message); }
    finally { locked.current = false; setBusy(false); }
  }
  async function copyLink() {
    try { await navigator.clipboard.writeText(window.location.origin + customerLink(reservationRef, token)); setMessage('Secure reservation link copied. Keep it private.'); }
    catch { setMessage('Unable to copy your link. Please keep your original secure link.'); }
  }

  const packageMode = status?.guestShares.length === 0;
  const payable = status && salesEnabled && approvedPairs.includes(`${status.event.id}:${status.product.id}`) && !operation && !journalError && canStartCustomerPayment(status, clock);
  return <section className={`stack ${styles.panel}`}>
    <div className="eyebrow">Katy Vibes Reservations</div><h1>Your reservation</h1>
    {!initialized && <p role="status">Opening your reservation…</p>}
    {initialized && !token && <CustomerAccessRecovery reservationRef={reservationRef} onRecovered={access => { setToken(access); setStatus(null); }} />}
    {token && !status && <p role="status">Use Refresh Payment Status to check your current reservation.</p>}
    {status && <>
      <article className="card stack"><h2>{status.event.title}</h2>
        <p>{status.product.name} · {status.guestCount} guests</p><strong>Payment status: {label(status.paymentState)}</strong>
        <div className={styles.stats}>
          <div><span>Verified online funds</span><strong>{money(status.payment.stripeSettledCents)}</strong></div>
          <div><span>Acknowledged at venue</span><strong>{money(status.payment.manualAcknowledgedCents)}</strong></div>
          <div><span>Outstanding balance</span><strong>{money(status.payment.outstandingCents)}</strong></div>
          <div><span>{status.admissionScope.type === 'SHOWS' ? 'Guests checked in at least once' : 'Checked in by staff'}</span><strong>{status.coverage.admitted}</strong></div>
        </div>
        {packageMode ? <p>Table package funded: {money(status.payment.packagePaidCents)}. Package balance: {money(status.payment.packageBalanceCents)}.
          Partial package funding grants zero guest admissions. Coverage confirmed by the venue: {status.coverage.prepaid + status.coverage.manualAcknowledged} guests.</p> :
          <p>Verified online admissions: {status.coverage.prepaid}. Venue-acknowledged admissions: {status.coverage.manualAcknowledged}.
            Awaiting payment: {status.coverage.unpaidActive}. Released unpaid: {status.coverage.releasedUnpaid}.</p>}
        {status.holdExpiresAt && <p>Unpaid payment deadline: <strong>{date(status.holdExpiresAt)}</strong>.
          The deadline starts when your reservation is created. Capacity changes only when confirmed by the venue.</p>}
        {(status.onlinePaymentPending || status.payment.pendingCents > 0) && <p role="status" className={styles.notice}>
          {money(status.payment.pendingCents)} is pending. Please wait for verified payment status. Returning from Checkout does not confirm payment.</p>}
        {(status.reconciliationRequired || status.nextAction === 'CONTACT_VENUE') && <p role="alert" className={styles.notice}>
          This payment needs venue review. Call (832) 437-2807 before making another payment.</p>}
        <p>Payment does not establish arrival or seating. Staff confirm admission and table placement separately.</p>
      </article>
      {status.admissionScope.contract === 'kvrs.m1.show-coverage.v1' &&
        <CustomerShowCoverage scope={status.admissionScope} admissions={status.showAdmissions} />}
      <CustomerGroupQr key={token} reservationRef={reservationRef} token={token} guestCount={status.guestCount} />
      <article className="card stack"><h2>{packageMode ? 'Table package payments' : 'Guest payments'}</h2>
        {!salesEnabled && <p>New online payments are temporarily unavailable. You can still review current payment status.</p>}
        {status.guestShares.length > 0 && <div className={styles.rows}>{status.guestShares.map(share => <div key={share.shareRef} className={styles.row}>
          <div><strong>Guest {share.ordinal}: {money(share.amountCents)}</strong><span>{label(share.coverage)} · {label(share.lifecycle)}</span></div>
          {payable && share.coverage === 'UNPAID' && share.lifecycle === 'ACTIVE' && <button className="button ghost" disabled={busy}
            onClick={() => void payment({ publicReservationRef: reservationRef, contributionMode: 'GUEST_SHARE', guestShareRef: share.shareRef })}>Pay This Guest</button>}
        </div>)}</div>}
        {packageMode && payable && <form className="stack" onSubmit={event => { event.preventDefault(); const amount = centsFromDollars(installment);
          if (amount) void payment({ publicReservationRef: reservationRef, contributionMode: 'PACKAGE_BALANCE', installmentAmountCents: amount });
          else setMessage('Enter a valid installment in dollars and cents.'); }}>
          <label>Installment ($)<input inputMode="decimal" required value={installment} disabled={busy} onChange={e => setInstallment(e.target.value)} /></label>
          <button className="button" disabled={busy}>Pay Toward Table Package</button></form>}
        {!payable && salesEnabled && !status.onlinePaymentPending && !status.reconciliationRequired && !operation &&
          <p>New online payments are unavailable for the current reservation status or deadline. Refresh status or call Katy Vibes for help.</p>}
        <p>One online Checkout can be pending at a time. Each guest share is an explicit separate payment.</p>
      </article>
      {status.checkoutHistory.length > 0 && <article className="card stack"><h2>Online payment requests</h2>
        {status.checkoutHistory.map(entry => <div className={styles.row} key={entry.checkoutRef}>
          <span>{money(entry.amountCents)} · {label(entry.state)}</span>
          {entry.state === 'PENDING' && <button className="button ghost" disabled={busy || status.reconciliationRequired}
            onClick={() => void resume(entry.checkoutRef)}>Resume Original Checkout</button>}
        </div>)}
      </article>}
    </>}
    {operation && <article className="card stack"><h2>Resolve your earlier request</h2>
      <p>Your original request is saved in this browser tab. A new request is blocked until its outcome is confirmed.</p>
      {operation.kind === 'checkout' && operation.command.body.publicReservationRef === reservationRef && token &&
        <button className="button" disabled={busy} onClick={() => void payment()}>{operation.checkoutRef ? 'Review Original Checkout' : 'Retry Original Payment Request'}</button>}
      {operation.kind === 'reservation' && <p>Return to the group booking page where you started the reservation, or contact Katy Vibes.</p>}
    </article>}
    {journalError && <p role="alert">Your earlier request needs assistance. Contact Katy Vibes before trying again.</p>}
    <div className={styles.actions}>{token && <>
      <button className="button ghost" disabled={busy} onClick={() => void manualRefresh()}>Refresh Payment Status</button>
      <button className="button ghost" onClick={() => void copyLink()}>Copy Secure Reservation Link</button>
    </>}<a className="button ghost" href="tel:18324372807">Call (832) 437-2807</a></div>
    {message && <p role="status">{message}</p>}
    <p>Keep your secure link private. If it is lost, verify your reservation email to recover access.</p>
  </section>;
}
