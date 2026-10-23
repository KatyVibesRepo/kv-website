import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
const load = async path => import('data:text/javascript;base64,' + Buffer.from(ts.transpileModule(readFileSync(new URL(path, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText).toString('base64'));
const client = await load('../lib/customerM1Client.ts');
const { customerRelease } = await load('../lib/customerM1Release.ts');

test('customer release stays off without explicit read, sales and real approved pairs', () => {
  assert.equal(customerRelease({}).salesEnabled, false);
  const env = { KV_WEBSITE_M1_CUSTOMER_READ_ENABLED: 'true', KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED: 'true', KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: 'event123:product123' };
  assert.equal(customerRelease(env).salesEnabled, true);
  for (const pair of ['qa-event:product123', 'event123:not-for-sale', 'event123:product123,event123:product123']) {
    assert.equal(customerRelease({ ...env, KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: pair }).salesEnabled, false);
  }
});

test('payment availability rejects pending funding, review, stale reads and deadline boundary', () => {
  const now = Date.now();
  const status = { onlinePaymentPending: false, payment: { pendingCents: 0 }, checkoutHistory: [], reconciliationRequired: false,
    nextAction: 'PAY', admissionPlanState: 'CONFIRMED', capacityHeld: true, coverage: { unpaidActive: 4 },
    canonicalReservationStatus: 'RESERVED', holdExpiresAt: new Date(now + 60 * 60_000).toISOString(), asOf: new Date(now).toISOString() };
  assert.equal(client.canStartCustomerPayment(status, now), true);
  for (const patch of [{ onlinePaymentPending: true }, { reconciliationRequired: true }, { nextAction: 'CONTACT_VENUE' },
    { checkoutHistory: [{ state: 'PENDING' }] }, { capacityHeld: false }, { payment: { pendingCents: 10 } },
    { asOf: new Date(now - 31_000).toISOString() }, { holdExpiresAt: new Date(now + 32 * 60_000).toISOString() }]) {
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
