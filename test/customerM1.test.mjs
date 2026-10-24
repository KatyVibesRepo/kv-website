import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const load = async path => import('data:text/javascript;base64,' + Buffer.from(ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64'));
const client = await load('../lib/customerM1Client.ts');
const paymentTiming = deadline => ({ contract: 'kvrs.m1.reservation-payment-timing.v1', anchor: 'RESERVATION_START', newPaymentDeadline: deadline, inFlightCompletion: 'ORIGINAL_PREPARED_CHECKOUT_ONLY' });
const quoteGrace = deadline => ({ minutes: null, version: 1, anchor: 'RESERVATION_START', expiresAt: deadline });
const { customerRelease, customerReleaseForHost, customerProductEligible } = await load('../lib/customerM1Release.ts');

test('customer release stays off without explicit read, sales and real approved pairs', () => {
  assert.equal(customerRelease({}).salesEnabled, false);
  const env = { KV_WEBSITE_M1_CUSTOMER_ORIGIN: 'https://www.katyvibes.com', KV_WEBSITE_M1_CUSTOMER_READ_ENABLED: 'true', KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED: 'true', KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: 'event123:product123' };
  assert.equal(customerRelease(env).salesEnabled, true);
  for (const pair of ['qa-event:product123', 'event123:not-for-sale', 'event123:product123,event123:product123']) {
    assert.equal(customerRelease({ ...env, KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: pair }).salesEnabled, false);
  }
});

test('payment availability rejects pending funding, review, stale reads and deadline boundary', () => {
  const now = Date.now();
  const status = { onlinePaymentPending: false, payment: { pendingCents: 0 }, checkoutHistory: [], reconciliationRequired: false,
    nextAction: 'PAY', admissionPlanState: 'CONFIRMED', capacityHeld: true, coverage: { unpaidActive: 4 },
    canonicalReservationStatus: 'RESERVED', paymentTiming: paymentTiming(new Date(now + 60 * 60_000).toISOString()), onlinePaymentInitiationAllowed: true, admissionScope: { type: 'EVENT', showIds: [] }, holdExpiresAt: new Date(now + 60 * 60_000).toISOString(), asOf: new Date(now).toISOString() };
  assert.equal(client.canStartCustomerPayment(status, now), true);
  for (const patch of [{ admissionScope: { type: 'SHOW', showIds: ['show1'] } }, { admissionScope: { type: 'EVENT', showIds: ['show1', 'show2'] } }, { onlinePaymentPending: true }, { reconciliationRequired: true }, { nextAction: 'CONTACT_VENUE' },
    { checkoutHistory: [{ state: 'PENDING' }] }, { capacityHeld: false }, { payment: { pendingCents: 10 } },
    { asOf: new Date(now - 31_000).toISOString() }, { onlinePaymentInitiationAllowed: false }, { paymentTiming: undefined }]) {
    assert.equal(client.canStartCustomerPayment({ ...status, ...patch }, now), false);
  }
});

test('production transport preserves original command and bearer boundary, with no private fallback', async () => {
  const oldWindow = globalThis.window; const oldFetch = globalThis.fetch;
  const ref = 'kvr_' + 'a'.repeat(40); const token = 'kvrs_ra1_' + 'a'.repeat(43);
  const command = client.immutableCommand({ publicReservationRef: ref, contributionMode: 'GUEST_SHARE', guestShareRef: 'guest-1' }, 'original-operation-123');
  const requests = [];
  globalThis.window = { location: { origin: 'https://kv-website-ten.vercel.app' } };
  globalThis.fetch = async (url, init) => { requests.push({ url, init }); return new Response(JSON.stringify({ ok: false, code: 'CUSTOMER_FEATURE_DISABLED' }), { status: 404 }); };
  try {
    for (let i = 0; i < 2; i++) await assert.rejects(client.customerCheckout(token, command, 1500), e => e.code === 'CUSTOMER_FEATURE_DISABLED' && /temporarily unavailable/.test(e.message));
    assert.equal(requests.length, 2);
    assert.equal(requests[0].url, 'https://admin.katyvibes.com/api/public/m1/checkouts');
    assert.equal(requests[0].init.body, requests[1].init.body);
    assert.equal(requests[0].init.headers['Idempotency-Key'], requests[1].init.headers['Idempotency-Key']);
    assert.equal(requests[0].init.headers.Authorization, 'Bearer ' + token);
    assert.equal(requests[0].init.credentials, 'omit');
    assert.equal(requests[0].init.cache, 'no-store');
    assert.ok(!requests[0].url.includes(token));
    globalThis.window.location.origin = 'https://arbitrary-preview.vercel.app';
    await assert.rejects(client.customerCheckout(token, command, 1500), e => e.code === 'WEBSITE_ORIGIN_UNAVAILABLE');
    assert.equal(requests.length, 2);
  } finally { globalThis.window = oldWindow; globalThis.fetch = oldFetch; }
});

test('payment redirect accepts only the Stripe Checkout host', () => {
  assert.equal(client.stripeDestination('https://checkout.stripe.com/c/pay/example'), 'https://checkout.stripe.com/c/pay/example');
  for (const url of ['https://checkout.stripe.com.evil.example/pay', 'http://checkout.stripe.com/pay', 'https://user@checkout.stripe.com/pay']) assert.throws(() => client.stripeDestination(url));
  assert.equal(client.centsFromDollars('12.34'), 1234);
  assert.equal(client.centsFromDollars('12.345'), null);
});

test('original operation survives reload while owner return handoff is consumed once', () => {
  const previous = globalThis.window;
  const values = new Map();
  globalThis.window = { sessionStorage: { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) } };
  const ref = 'kvr_' + 'b'.repeat(40), token = 'kvrs_ra1_' + 'b'.repeat(43);
  try {
    const original = { kind: 'checkout', command: client.immutableCommand({ publicReservationRef: ref, contributionMode: 'PACKAGE_BALANCE', installmentAmountCents: 5000 }, 'original-package-payment'), expectedCents: 5000 };
    client.saveCustomerOperation(original);
    assert.deepEqual(client.loadCustomerOperation(), original);
    assert.ok(!Array.from(values.values()).some(value => value.includes(token)));
    client.saveCustomerReturn(ref, token);
    assert.deepEqual(client.takeCustomerReturn(), { ref, token });
    assert.equal(client.takeCustomerReturn(), null);
    assert.deepEqual(client.loadCustomerOperation(), original);
    client.clearCustomerOperation();
    assert.equal(client.loadCustomerOperation(), null);
  } finally { globalThis.window = previous; }
});

test('QR uses bodyless authenticated POST and rejects owner bearer as scanner value', async () => {
  const oldWindow = globalThis.window, oldFetch = globalThis.fetch;
  const ref = 'kvr_' + 'c'.repeat(40), token = 'kvrs_ra1_' + 'c'.repeat(43);
  const response = { ok: true, contract: 'kvrs.m1.customer-group-qr.v1', publicReservationRef: ref,
    scanValue: 'kvrs_m1_' + 'c'.repeat(43), guestCount: 4, groupCredentialIssued: true,
    admissionConfirmed: false, requiresAuthorizedHostCheckIn: true, oneScanAdmitsZeroWithoutHostConfirmation: true };
  globalThis.window = { location: { origin: 'https://kv-website-ten.vercel.app' } };
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://admin.katyvibes.com/api/public/m1/reservations/' + ref + '/qr');
    assert.equal(init.method, 'POST'); assert.equal(init.body, undefined);
    assert.equal(init.headers.Authorization, 'Bearer ' + token);
    return new Response(JSON.stringify(response));
  };
  try {
    assert.equal((await client.customerQr(ref, token, 4)).guestCount, 4);
    response.scanValue = token;
    await assert.rejects(client.customerQr(ref, token, 4), e => e.code === 'QR_UNAVAILABLE');
  } finally { globalThis.window = oldWindow; globalThis.fetch = oldFetch; }
});


test('one exact configured booking origin is required across host aliases and read-only rollback', () => {
  const env = { KV_WEBSITE_M1_CUSTOMER_READ_ENABLED: 'true', KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED: 'true',
    KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: 'event123:product123', KV_WEBSITE_M1_CUSTOMER_ORIGIN: 'https://www.katyvibes.com' };
  assert.equal(customerReleaseForHost('www.katyvibes.com', env).salesEnabled, true);
  for (const host of [null, 'katyvibes.com', 'kv-website-ten.vercel.app', 'arbitrary-preview.vercel.app', 'www.katyvibes.com:444']) {
    assert.equal(customerReleaseForHost(host, env).readEnabled, false);
    assert.equal(customerReleaseForHost(host, env).salesEnabled, false);
  }
  for (const origin of ['', 'https://www.katyvibes.com/', 'https://www.katyvibes.com/path', 'https://www.katyvibes.com#access=x', 'https://arbitrary-preview.vercel.app']) {
    assert.equal(customerRelease({ ...env, KV_WEBSITE_M1_CUSTOMER_ORIGIN: origin }).readEnabled, false);
  }
  const readOnly = customerReleaseForHost('www.katyvibes.com', { ...env, KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED: 'false', KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: '' });
  assert.equal(readOnly.readEnabled, true);
  assert.equal(readOnly.salesEnabled, false);
});

test('PR72 refuses show-scoped and disguised multishow M1 products without affecting event-only eligibility', () => {
  const now = Date.now();
  const product = { id: 'product123', name: 'Table of 4', publicLabel: 'Table of 4', guestCount: 4,
    currency: 'USD', checkoutEnabled: true, status: 'ACTIVE', scope: 'EVENT', showIds: [] };
  const event = { id: 'event123', slug: 'live-music', title: 'Live Music', visibility: 'PUBLIC', status: 'PUBLISHED',
    startsAt: new Date(now + 3600000).toISOString(), isTicketed: true, isReservationEnabled: true, shows: [], ticketTypes: [product] };
  const release = { salesEnabled: true, approvedPairs: ['event123:product123'] };
  assert.equal(customerProductEligible(event, product, release, now), true);
  assert.equal(customerProductEligible(event, { ...product, scope: 'SHOWS', showIds: ['first'] }, release, now), false);
  assert.equal(customerProductEligible(event, { ...product, showIds: ['first', 'second'] }, release, now), false);
  assert.equal(customerProductEligible({ ...event, shows: [{ id: 'first' }, { id: 'second', isVisible: false }] }, product, release, now), false);
  assert.equal(customerProductEligible({ ...event, ticketTypes: [product, { ...product, id: 'combo', scope: 'SHOWS', showIds: ['first', 'second'] }] }, product, release, now), false);
  assert.equal(customerProductEligible({ ...event, startsAt: 'invalid' }, product, release, now), false);
  assert.equal(customerProductEligible(event, product, { ...release, approvedPairs: [] }, now), false);
});

const bundleCoverage = () => ({
  contract: 'kvrs.m1.show-coverage.v1', type: 'SHOWS', selection: 'ALL_LINKED_SHOWS', eventId: 'event123',
  entryScopeKey: 'shows:' + 'd'.repeat(64), showIds: ['first', 'second'],
  entries: [
    { showId: 'first', entryScopeKey: 'show:first', startsAt: '2026-10-24T23:00:00.000Z', endsAt: '2026-10-25T01:00:00.000Z' },
    { showId: 'second', entryScopeKey: 'show:second', startsAt: '2026-10-25T02:00:00.000Z', endsAt: '2026-10-25T04:00:00.000Z' },
  ], reservationStartsAt: '2026-10-24T23:00:00.000Z', salesCutoffAt: '2026-10-24T23:00:00.000Z', departureRequiredBefore: null,
});
const showStatus = () => ({
  ok: true, publicReservationRef: 'kvr_' + 'd'.repeat(40), guestCount: 4,
  event: { id: 'event123', title: 'Live Music' }, product: { id: 'product123', name: 'Table of 4' },
  admissionScope: bundleCoverage(), asOf: new Date().toISOString(), capacityHeld: true, holdExpiresAt: '2026-10-24T23:00:00.000Z',
  onlinePaymentPending: false, reconciliationRequired: false, groupCredentialValue: null,
  payment: { currency: 'USD', totalCents: 10000, stripeSettledCents: 10000, manualAcknowledgedCents: 0,
    pendingCents: 0, outstandingCents: 0, packagePaidCents: 0, packageBalanceCents: 0 },
  coverage: { prepaid: 4, manualAcknowledged: 0, unpaidActive: 0, releasedUnpaid: 0, admitted: 2, remainingCovered: 2 },
  showAdmissions: ['first', 'second'].map(id => ({ entryScopeKey: 'show:' + id, guestUnits: 4,
    prepaid: 4, manualAcknowledged: 0, unpaidActive: 0, releasedUnpaid: 0, admitted: 2, remainingCovered: 2 })),
  checkoutHistory: [], guestShares: [],
});

test('PR74 exact coverage keeps combo, selected-show departure and legacy ownership distinct', () => {
  const bundle = bundleCoverage();
  assert.equal(client.validCustomerCoverage(bundle, 'event123'), true);
  const selected = { ...bundle, selection: 'SELECTED_SHOW', entryScopeKey: 'show:first', showIds: ['first'],
    entries: [bundle.entries[0]], departureRequiredBefore: bundle.entries[1].startsAt };
  assert.equal(client.validCustomerCoverage(selected, 'event123'), true);
  assert.equal(client.validCustomerCoverage({ ...selected, departureRequiredBefore: 'invalid' }, 'event123'), false);
  assert.equal(client.validCustomerCoverage({ type: 'EVENT', showIds: [], entryScopeKey: 'event:event123' }, 'event123'), true);
  assert.equal(client.validCustomerCoverage({ type: 'SHOW', showIds: ['first'], entryScopeKey: 'show:first' }, 'event123'), true);
  for (const patch of [{ eventId: 'another-event' }, { type: 'EVENT' }, { selection: 'SELECTED_SHOW' },
    { showIds: ['first', 'first'] }, { entries: [...bundle.entries].reverse() }, { showIds: ['first'] },
    { salesCutoffAt: '2026-10-25T02:00:00.000Z' }, { departureRequiredBefore: bundle.entries[1].startsAt }]) {
    assert.equal(client.validCustomerCoverage({ ...bundle, ...patch }, 'event123'), false);
  }
});

test('PR74 two show visits preserve distinct guest count and original product funding', () => {
  const status = showStatus();
  const verified = client.verifyCustomerStatus(status, status.publicReservationRef);
  assert.equal(verified.guestCount, 4);
  assert.equal(verified.payment.totalCents, 10000);
  assert.equal(verified.coverage.admitted, 2);
  assert.equal(verified.showAdmissions.reduce((sum, bucket) => sum + bucket.admitted, 0), 4);
  assert.equal(client.canStartCustomerPayment(verified), false);
});

test('PR74 refuses missing, duplicate, uncovered or financially inconsistent show buckets', () => {
  const status = showStatus();
  const copies = [
    { ...status, showAdmissions: undefined },
    { ...status, showAdmissions: [status.showAdmissions[0], status.showAdmissions[0]] },
    { ...status, showAdmissions: [{ ...status.showAdmissions[0], entryScopeKey: 'show:uncovered' }, status.showAdmissions[1]] },
    { ...status, showAdmissions: [{ ...status.showAdmissions[0], prepaid: 3 }, status.showAdmissions[1]] },
    { ...status, showAdmissions: [{ ...status.showAdmissions[0], guestUnits: 8 }, status.showAdmissions[1]] },
    { ...status, coverage: { ...status.coverage, admitted: 1 } },
  ];
  for (const value of copies) assert.throws(() => client.verifyCustomerStatus(value, status.publicReservationRef), e => e.code === 'STATUS_UNAVAILABLE');
});

test('PR74 partial package shows funded dollars and zero covered admissions in both shows', () => {
  const status = showStatus();
  status.payment = { ...status.payment, stripeSettledCents: 2500, outstandingCents: 7500, packagePaidCents: 2500, packageBalanceCents: 7500 };
  status.coverage = { prepaid: 0, manualAcknowledged: 0, unpaidActive: 4, releasedUnpaid: 0, admitted: 0, remainingCovered: 0 };
  status.showAdmissions = status.showAdmissions.map(bucket => ({ ...bucket, ...status.coverage }));
  const verified = client.verifyCustomerStatus(status, status.publicReservationRef);
  assert.equal(verified.payment.packagePaidCents, 2500);
  assert.ok(verified.showAdmissions.every(bucket => bucket.prepaid === 0 && bucket.admitted === 0 && bucket.remainingCovered === 0));
});

test('PR74 quote request preserves an omitted bundle selector and rejects a narrowed response', async () => {
  const oldWindow = globalThis.window, oldFetch = globalThis.fetch;
  const input = { eventId: 'event123', productId: 'product123', quantity: 1, paymentChoice: 'PAY_AT_DOOR' };
  const response = { ok: true, event: { id: 'event123' }, admissionScope: bundleCoverage(), paymentTiming: paymentTiming('2026-10-24T23:00:00.000Z'), gracePolicy: quoteGrace('2026-10-24T23:00:00.000Z'), quoteExpiresAt: '2026-10-24T22:59:00.000Z' };
  globalThis.window = { location: { origin: 'https://kv-website-ten.vercel.app' } };
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://admin.katyvibes.com/api/public/m1/quotes');
    assert.deepEqual(JSON.parse(init.body), input);
    assert.equal(Object.hasOwn(JSON.parse(init.body), 'showId'), false);
    return new Response(JSON.stringify(response));
  };
  try {
    assert.equal((await client.customerQuote(input)).admissionScope.entries.length, 2);
    response.admissionScope = { ...bundleCoverage(), selection: 'SELECTED_SHOW', entryScopeKey: 'show:first',
      showIds: ['first'], entries: [bundleCoverage().entries[0]] };
    await assert.rejects(client.customerQuote(input), e => e.code === 'QUOTE_UNAVAILABLE');
    response.admissionScope = bundleCoverage(); response.quoteExpiresAt = '2026-10-24T23:01:00.000Z';
    await assert.rejects(client.customerQuote(input), e => e.code === 'QUOTE_UNAVAILABLE');
  } finally { globalThis.window = oldWindow; globalThis.fetch = oldFetch; }
});

test('PR74 selected-show quote sends the exact show; manual selection refusal triggers no automatic retry', async () => {
  const oldWindow = globalThis.window, oldFetch = globalThis.fetch;
  const bundle = bundleCoverage();
  const scope = { ...bundle, selection: 'SELECTED_SHOW', entryScopeKey: 'show:second', showIds: ['second'],
    entries: [bundle.entries[1]], reservationStartsAt: bundle.entries[1].startsAt, salesCutoffAt: bundle.entries[1].startsAt };
  const input = { eventId: 'event123', productId: 'product123', showId: 'second', quantity: 1, paymentChoice: 'PAY_AT_DOOR' };
  globalThis.window = { location: { origin: 'https://kv-website-ten.vercel.app' } };
  let requests = 0, manual = false;
  globalThis.fetch = async (url, init) => {
    requests++;
    assert.equal(url, 'https://admin.katyvibes.com/api/public/m1/quotes');
    if (manual) return new Response(JSON.stringify({ ok: false, code: 'SHOW_REQUIRED' }), { status: 409 });
    assert.deepEqual(JSON.parse(init.body), input);
    return new Response(JSON.stringify({ ok: true, event: { id: 'event123' }, admissionScope: scope, paymentTiming: paymentTiming(scope.reservationStartsAt), gracePolicy: quoteGrace(scope.reservationStartsAt), quoteExpiresAt: '2026-10-25T01:59:00.000Z' }));
  };
  try {
    assert.equal((await client.customerQuote(input)).admissionScope.showIds[0], 'second');
    manual = true;
    await assert.rejects(client.customerQuote({ ...input, showId: undefined }), e => e.code === 'SHOW_REQUIRED');
    assert.equal(requests, 2);
  } finally { globalThis.window = oldWindow; globalThis.fetch = oldFetch; }
});

test('PR74 keeps legacy owner reads compatible and refuses unknown coverage versions', () => {
  const status = showStatus();
  status.admissionScope = { type: 'EVENT', showIds: [], entryScopeKey: 'event:event123' };
  delete status.showAdmissions;
  assert.equal(client.verifyCustomerStatus(status, status.publicReservationRef).payment.stripeSettledCents, 10000);
  status.admissionScope = { ...bundleCoverage(), contract: 'unreviewed.version' };
  assert.throws(() => client.verifyCustomerStatus(status, status.publicReservationRef), e => e.code === 'STATUS_UNAVAILABLE');
});

test('reservation-start payability has no early cutoff and requires the server decision', () => {
  const deadline = Date.parse('2026-10-25T02:00:00.000Z');
  const base = { onlinePaymentPending: false, payment: { pendingCents: 0 }, checkoutHistory: [], reconciliationRequired: false,
    nextAction: 'PAYMENT_REQUIRED', admissionPlanState: 'CONFIRMED', capacityHeld: true, coverage: { unpaidActive: 4 },
    canonicalReservationStatus: 'RESERVED', admissionScope: { type: 'EVENT', showIds: [] },
    paymentTiming: paymentTiming(new Date(deadline).toISOString()), onlinePaymentInitiationAllowed: true };
  for (const now of [deadline - 32 * 60_000, deadline - 1]) assert.equal(client.canStartCustomerPayment({ ...base, asOf: new Date(now).toISOString() }, now), true);
  assert.equal(client.canStartCustomerPayment({ ...base, onlinePaymentInitiationAllowed: false, asOf: new Date(deadline).toISOString() }, deadline), false);
  assert.equal(client.canStartCustomerPayment({ ...base, paymentTiming: undefined, asOf: new Date(deadline - 1).toISOString() }, deadline - 1), false);
});

test('new status timing binds reservation start and still permits pending original completion afterward', () => {
  const status = showStatus();
  status.paymentTiming = paymentTiming(status.admissionScope.reservationStartsAt);
  status.onlinePaymentInitiationAllowed = false;
  status.onlinePaymentPending = true; status.payment.pendingCents = 1500;
  status.asOf = '2026-10-25T00:00:00.000Z';
  assert.equal(client.verifyCustomerStatus(status, status.publicReservationRef).reconciliationRequired, false);
  for (const patch of [{ paymentTiming: { ...status.paymentTiming, anchor: 'RESERVATION_CREATED' } },
    { paymentTiming: { ...status.paymentTiming, newPaymentDeadline: '2026-10-25T02:00:00.000Z' } },
    { onlinePaymentInitiationAllowed: undefined }, { holdExpiresAt: '2026-10-25T02:00:00.000Z' }]) {
    assert.throws(() => client.verifyCustomerStatus({ ...status, ...patch }, status.publicReservationRef), e => e.code === 'STATUS_UNAVAILABLE');
  }
});

test('uncertain payment retries retain original key/body/deadline and a separate provider expiry', async () => {
  const oldWindow = globalThis.window, oldFetch = globalThis.fetch;
  const ref = 'kvr_' + 'e'.repeat(40), token = 'kvrs_ra1_' + 'e'.repeat(43);
  const timing = paymentTiming('2026-10-24T23:00:00.000Z');
  const command = client.immutableCommand({ publicReservationRef: ref, contributionMode: 'GUEST_SHARE', guestShareRef: 'guest-1' }, 'original-timing-request-123');
  const sent = []; let fail = true;
  globalThis.window = { location: { origin: 'https://kv-website-ten.vercel.app' } };
  globalThis.fetch = async (url, init) => { sent.push({ body: init.body, key: init.headers['Idempotency-Key'] });
    if (fail) { fail = false; throw new Error('Simulated response loss'); }
    return new Response(JSON.stringify({ ok: true, publicReservationRef: ref, checkoutRef: 'kvc_' + 'e'.repeat(32),
      checkoutUrl: 'https://checkout.stripe.com/c/pay/local_mock', amountCents: 1500, currency: 'USD',
      paymentState: 'PENDING', coverageGranted: false, paymentTiming: timing, providerExpiresAt: '2026-10-24T23:31:00.000Z' }));
  };
  try {
    await assert.rejects(client.customerCheckout(token, command, 1500, timing), e => e.code === 'REQUEST_UNCERTAIN');
    const result = await client.customerCheckout(token, command, 1500, timing);
    assert.equal(result.paymentTiming.newPaymentDeadline, '2026-10-24T23:00:00.000Z');
    assert.equal(result.providerExpiresAt, '2026-10-24T23:31:00.000Z');
    assert.deepEqual(sent[0], sent[1]);
    await assert.rejects(client.customerCheckout(token, command, 1500, paymentTiming('2026-10-25T02:00:00.000Z')), e => e.code === 'CHECKOUT_UNCERTAIN');
  } finally { globalThis.window = oldWindow; globalThis.fetch = oldFetch; }
});
