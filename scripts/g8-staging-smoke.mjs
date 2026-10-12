// One-shot, guarded HTTP acceptance of a synthetic G8 staging reservation.
// No actual Stripe charge, customer, admin token or production API request.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const HOST = 'https://kv-reservationservice-git-staging-g8-mixed-admission-katy-vibes.vercel.app';
const ORIGIN = 'https://kv-website-git-feat-g8-mixed-payment-preview-katy-vibes.vercel.app';
const EVENT = 'kvrs_g8_syn_durable_event_20261012';
const PRODUCT = 'kvrs_g8_syn_durable_table8_20261012';

if (process.env.G8_AUTHORIZED_STAGING_SMOKE !== '1' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.NEXT_PUBLIC_KVRS_BASE_URL === 'https://admin.katyvibes.com' &&
      process.env.G8_ALLOW_CROSS_ENV !== undefined) {
  throw new Error('Synthetic staging smoke guard refused execution.');
}
const headers = {
  Origin: ORIGIN, Accept: 'application/json', 'Content-Type': 'application/json',
};
async function request(path, options = {}) {
  assert.match(path, /^\/api\/public\/m1\/(?:quotes|reservations(?:\/[^/]+\/status)?)$/);
  const response = await fetch(HOST + path, {
    method: options.method ?? 'POST',
    headers: { ...headers, ...(options.bearer ? { Authorization: 'Bearer ' + options.bearer } : {}),
      ...(options.idempotencyKey ? { 'Idempotency-Key': options.idempotencyKey } : {}) },
    redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(20000),
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok !== true) {
    // NEVER dump quote tokens, credentials, requests or response JSON.
    const code = typeof payload?.code === 'string' ? payload.code : 'UNAVAILABLE';
    throw new Error('Staging request rejected (' + response.status + ', ' + code + ').');
  }
  return payload;
}
const quoteInput = choice => ({
  eventId: EVENT, productId: PRODUCT, quantity: 1, paymentChoice: choice,
  plannedOnlineGuestCount: choice === 'PAY_AT_DOOR' ? 0 : 1,
});
console.log('Checking isolated staging quote eligibility (zero inventory writes)');
const quote = await request('/api/public/m1/quotes', { body: quoteInput('PAY_AT_DOOR') });
if (quote.event?.id !== EVENT || quote.product?.id !== PRODUCT ||
    quote.totalCents !== 8000 || quote.guestCount !== 8 ||
    quote.capacityHeld !== false || quote.gracePolicy?.minutes !== 180 ||
    !quote.eligiblePaymentChoices?.includes('PAY_AT_DOOR')) {
  throw new Error('Synthetic staging quote invariant mismatch; no reservation created.');
}
const splitQuote = await request('/api/public/m1/quotes', { body: quoteInput('PAY_PER_GUEST') });
if (splitQuote.amountDueNowCents !== 1000 ||
    splitQuote.guestShares?.length !== 8 ||
    !splitQuote.eligiblePaymentChoices?.includes('PAY_PER_GUEST')) {
  throw new Error('Individual quote invariant mismatch; no reservation created.');
}
console.log('Creating exactly one synthetic Pay at Door reservation');
const idempotencyKey = 'g8-website-ci-' + randomUUID();
const body = {
  quoteToken: quote.quoteToken,
  customerName: 'G8 Synthetic Website Guest',
  customerEmail: 'g8-website-' + randomUUID().replaceAll('-', '') + '@example.invalid',
  customerPhone: '8320000000',
  paymentChoice: 'PAY_AT_DOOR',
  acceptUnpaidPaymentTerms: true,
};
const created = await request('/api/public/m1/reservations', { body, idempotencyKey });
if (!/^kvr_[a-f0-9]{40}$/.test(created.publicReservationRef || '') ||
    !/^kvrs_ra1_[A-Za-z0-9_-]{43}$/.test(created.customerAccessToken || '') ||
    created.capacityHeld !== true || created.guestCount !== 8) {
  throw new Error('Created reservation did not return verified durable customer access.');
}
console.log('Verifying idempotent replay preserves exact durable access');
const replay = await request('/api/public/m1/reservations', { body, idempotencyKey });
if (replay.publicReservationRef !== created.publicReservationRef ||
    replay.customerAccessToken !== created.customerAccessToken ||
    replay.idempotentReplay !== true) {
  throw new Error('Idempotent reservation replay mismatch.');
}
console.log('Verifying read-only, bearer-authorized status and coverage');
const status = await request('/api/public/m1/reservations/' + created.publicReservationRef + '/status', {
  method: 'GET', bearer: created.customerAccessToken,
});
if (status.publicReservationRef !== created.publicReservationRef ||
    status.event?.id !== EVENT || status.guestCount !== 8 ||
    status.coverage?.prepaid !== 0 || status.coverage?.manualAcknowledged !== 0 ||
    status.coverage?.unpaidActive !== 8 || status.coverage?.admitted !== 0 ||
    status.payment?.totalCents !== 8000 || status.payment?.outstandingCents !== 8000 ||
    !status.holdExpiresAt || status.groupCredentialValue !== null) {
  throw new Error('Customer status/coverage invariant mismatch.');
}
console.log('PASS: isolated synthetic G8 quote, reservation, durable replay and customer status');
console.log('No real customer, real event, Stripe charge, or Production write.');
