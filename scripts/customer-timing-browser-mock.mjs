// Local browser verification only. Every Website/API/provider request is intercepted.
// No real backend request, reservation, Checkout Session, payment or QR is created.
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');

if (process.env.CUSTOMER_BROWSER_MOCK_AUTHORIZED !== '1') throw new Error('Local browser mock guard declined.');
const WEBSITE = 'https://www.katyvibes.com', API = 'https://admin.katyvibes.com';
const ref = 'kvr_' + 'f'.repeat(40), token = 'kvrs_ra1_' + 'f'.repeat(43), checkoutRef = 'kvc_' + 'f'.repeat(32);
const pagePath = '/reservations/group/' + ref;
const initialNow = Date.now(), deadline = new Date(initialNow + 5 * 60_000).toISOString();
const providerExpiresAt = new Date(Date.parse(deadline) + 31 * 60_000).toISOString();
const timing = { contract: 'kvrs.m1.reservation-payment-timing.v1', anchor: 'RESERVATION_START', newPaymentDeadline: deadline,
  inFlightCompletion: 'ORIGINAL_PREPARED_CHECKOUT_ONLY' };
let observedNow = initialNow, state = 'READY', qrCalls = 0, recoveryRequests = 0;
const posts = [], pageErrors = [];
const coverage = { contract: 'kvrs.m1.show-coverage.v1', type: 'EVENT', selection: 'EVENT', eventId: 'event123',
  entryScopeKey: 'event:event123', showIds: [], entries: [], reservationStartsAt: deadline, salesCutoffAt: deadline, departureRequiredBefore: null };
function status() {
  const pending = state === 'PENDING', paid = state === 'SETTLED';
  return { ok: true, publicReservationRef: ref, reservationState: 'RESERVED', canonicalReservationStatus: 'RESERVED', admissionPlanState: 'CONFIRMED',
    statusRevision: 'mock', paymentState: paid ? 'PARTIALLY_PAID' : 'AWAITING_PAYMENT', asOf: new Date(observedNow).toISOString(),
    event: { id: 'event123', title: 'Local browser verification', slug: 'local', timezone: 'America/Chicago' },
    product: { id: 'product123', name: 'Table of 4', kind: 'TABLE', quantity: 1, guestsPerProduct: 4 }, guestCount: 4,
    capacityHeld: true, holdExpiresAt: deadline, paymentTiming: timing, onlinePaymentInitiationAllowed: state === 'READY' && observedNow < Date.parse(deadline),
    onlinePaymentPending: pending, reconciliationRequired: false, admissionScope: coverage,
    payment: { currency: 'USD', totalCents: 6000, stripeSettledCents: paid ? 1500 : 0, manualAcknowledgedCents: 0,
      pendingCents: pending ? 1500 : 0, outstandingCents: paid ? 4500 : 6000, packagePaidCents: 0, packageBalanceCents: 0 },
    coverage: { prepaid: paid ? 1 : 0, manualAcknowledged: 0, unpaidActive: paid ? 3 : 4, releasedUnpaid: 0, admitted: 0, remainingCovered: paid ? 1 : 0 },
    guestShares: [1,2,3,4].map(n => ({ shareRef: 'guest-' + n, ordinal: n, amountCents: 1500, coverage: paid && n === 1 ? 'PREPAID' : 'UNPAID', lifecycle: 'ACTIVE' })),
    checkoutHistory: state === 'READY' ? [] : [{ checkoutRef, state: paid ? 'SETTLED' : 'PENDING', amountCents: 1500 }],
    groupCredentialIssued: false, groupCredentialValue: null, nextAction: 'PAYMENT_REQUIRED' };
}
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3198'], {
  env: { ...process.env, KV_WEBSITE_M1_CUSTOMER_ORIGIN: WEBSITE, KV_WEBSITE_M1_CUSTOMER_READ_ENABLED: 'true',
    KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED: 'true', KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: 'event123:product123' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
const localRequest = request => new Promise((resolve, reject) => {
  const url = new URL(request.url());
  assert.equal(request.method(), 'GET');
  const outgoing = http.get({ hostname: '127.0.0.1', port: 3198, path: url.pathname + url.search,
    headers: { ...request.headers(), Host: 'www.katyvibes.com', 'accept-encoding': 'identity' } }, response => {
    const chunks = []; response.on('data', part => chunks.push(part));
    response.on('end', () => {
      const headers = Object.fromEntries(Object.entries(response.headers).filter(([key, value]) =>
        value !== undefined && !['transfer-encoding','content-length','content-encoding','set-cookie'].includes(key)).map(([key,value]) => [key, String(value)]));
      resolve({ status: response.statusCode, headers, body: Buffer.concat(chunks) });
    });
  });
  outgoing.setTimeout(15000, () => outgoing.destroy(Error('Local HTTP timeout'))); outgoing.on('error', reject);
});
let browser;
try {
  await new Promise((resolve, reject) => {
    let log = ''; const timer = setTimeout(() => reject(Error('Local server startup timeout')), 20000);
    server.stdout.on('data', chunk => { log += chunk.toString(); if (log.includes('Ready')) { clearTimeout(timer); resolve(); } });
    server.on('exit', () => { clearTimeout(timer); reject(Error('Local server exited')); });
  });
  browser = await chromium.launch({ headless: true,
    ...(process.env.CUSTOMER_BROWSER_EXECUTABLE ? { executablePath: process.env.CUSTOMER_BROWSER_EXECUTABLE } : {}),
    ...(process.env.CUSTOMER_BROWSER_ARGS_JSON ? { args: JSON.parse(process.env.CUSTOMER_BROWSER_ARGS_JSON).filter(arg => arg !== '--disable-web-security' && arg !== '--allow-running-insecure-content') } : {}),
  });
  async function context(viewport) {
    const ctx = await browser.newContext({ viewport, reducedMotion: 'reduce', serviceWorkers: 'block' });
    await ctx.route('**/*', async route => {
      const req = route.request(), url = new URL(req.url());
      if (url.origin === WEBSITE) return route.fulfill(await localRequest(req));
      if (url.origin === 'https://checkout.stripe.com') return route.fulfill({ contentType: 'text/html', body:
        `<h1>Local provider mock</h1><a href="${WEBSITE}/reservations/group/return?result=success&session_id=untrusted">Return to reservation</a>` });
      if (url.origin !== API) return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg"/>' });
      const cors = { 'Access-Control-Allow-Origin': WEBSITE, 'Access-Control-Allow-Headers': 'Accept,Content-Type,Idempotency-Key,Authorization', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Cache-Control': 'no-store' };
      if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
      const json = value => route.fulfill({ status: 200, headers: cors, contentType: 'application/json', body: JSON.stringify(value) });
      if (url.pathname.endsWith('/recover/request')) { recoveryRequests++; return json({ ok: true, notice: 'Local verification only' }); }
      if (url.pathname.endsWith('/recover/verify')) return json({ ok: true, publicReservationRef: ref, customerAccessToken: token });
      assert.equal(req.headers().authorization, 'Bearer ' + token);
      if (url.pathname === '/api/public/m1/reservations/' + ref + '/status') return json(status());
      if (url.pathname === '/api/public/m1/checkouts' && req.method() === 'POST') {
        posts.push({ key: req.headers()['idempotency-key'], body: req.postData() }); state = 'PENDING';
        if (posts.length === 1) return route.abort('failed'); // simulate loss after original preparation
        assert.deepEqual(posts[1], posts[0]);
        return json({ ok: true, publicReservationRef: ref, checkoutRef, checkoutUrl: 'https://checkout.stripe.com/c/pay/local_mock',
          amountCents: 1500, currency: 'USD', paymentState: 'PENDING', coverageGranted: false, paymentTiming: timing, providerExpiresAt });
      }
      if (url.pathname === '/api/public/m1/checkouts/' + checkoutRef) return json({ ok: true, checkoutRef, state: 'PENDING', providerStatus: 'open',
        checkoutUrl: 'https://checkout.stripe.com/c/pay/local_mock', amountCents: 1500, currency: 'USD', newPaymentCreated: false, coverageGranted: false, freshStatusRequired: true });
      if (url.pathname.endsWith('/qr') && req.method() === 'POST') { qrCalls++; return json({ ok: true, contract: 'kvrs.m1.customer-group-qr.v1',
        publicReservationRef: ref, scanValue: 'kvrs_m1_' + 'm'.repeat(43), guestCount: 4, groupCredentialIssued: true, admissionConfirmed: false,
        requiresAuthorizedHostCheckIn: true, oneScanAdmitsZeroWithoutHostConfirmation: true }); }
      throw Error('Unexpected mock API path');
    });
    return ctx;
  }
  const ctx = await context({ width: 390, height: 844 }); const page = await ctx.newPage();
  page.on('pageerror', e => pageErrors.push(e.message)); await page.clock.install({ time: new Date(observedNow) });
  await page.goto(WEBSITE + pagePath + '#access=' + token);
  await page.getByRole('button', { name: 'Pay This Guest' }).first().waitFor();
  assert.equal(new URL(page.url()).hash, '');
  await page.getByRole('button', { name: 'Pay This Guest' }).first().click();
  await page.getByRole('button', { name: 'Retry Original Payment Request' }).waitFor();
  observedNow = Date.parse(deadline) + 1000; await page.clock.setFixedTime(new Date(observedNow));
  await page.getByRole('button', { name: 'Retry Original Payment Request' }).click();
  await page.waitForURL(url => url.hostname === 'checkout.stripe.com');
  assert.equal(posts.length, 2); assert.deepEqual(posts[1], posts[0]);
  await page.waitForLoadState('domcontentloaded');
  await page.getByRole('link', { name: 'Return to reservation' }).click();
  await page.getByText('Original Checkout expires:', { exact: false }).waitFor();
  await page.getByText('$15.00 is pending.', { exact: false }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Pay This Guest' }).count(), 0);
  assert.equal(new URL(page.url()).search, ''); assert.equal(new URL(page.url()).hash, '');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  mkdirSync('/tmp/customer-timing-browser-evidence', { recursive: true });
  await page.getByRole('heading', { name: 'Payment timing' }).locator('..').screenshot({ path: '/tmp/customer-timing-browser-evidence/payment-timing-mobile.png' });
  console.log('PASS: mobile lost response -> same original key/body retry after deadline -> original Session -> same-origin return remains pending');
  state = 'SETTLED'; await page.getByRole('button', { name: 'Refresh Payment Status' }).click();
  await page.getByText('Verified online admissions: 1.', { exact: false }).waitFor();
  assert.equal(posts.length, 2); assert.equal(await page.getByRole('button', { name: 'Pay This Guest' }).count(), 0);
  await page.getByRole('button', { name: 'Show Entry QR', exact: true }).click();
  await page.getByRole('img', { name: 'Group admission QR for authorized Katy Vibes staff' }).waitFor();
  assert.equal(qrCalls, 1); assert.deepEqual(pageErrors, []);
  console.log('PASS: only authoritative status updates funds/coverage; QR is separately requested and rendered locally');
  const desktop = await context({ width: 1280, height: 900 }); const recoveredPage = await desktop.newPage();
  recoveredPage.on('pageerror', e => pageErrors.push(e.message)); await recoveredPage.clock.install({ time: new Date(observedNow) });
  await recoveredPage.goto(WEBSITE + pagePath);
  await recoveredPage.getByLabel('Email', { exact: true }).fill('local-browser@example.test');
  await recoveredPage.getByRole('button', { name: 'Email Me a Verification Code' }).click();
  await recoveredPage.getByLabel('Verification code', { exact: true }).fill('local-proof-for-browser-verification');
  await recoveredPage.getByRole('button', { name: 'Verify and Open Reservation' }).click();
  await recoveredPage.getByRole('heading', { name: 'Guest payments' }).waitFor();
  assert.equal(recoveryRequests, 1); assert.equal(qrCalls, 1); assert.equal(posts.length, 2);
  assert.equal(await recoveredPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  assert.deepEqual(pageErrors, []);
  console.log('PASS: desktop email access recovery loads status without creating a payment or replacing the QR');
} catch (error) {
  const message = String(error?.message ?? error).replace(/kvrs_ra1_[A-Za-z0-9_-]{43}/g, '[OWNER_CAPABILITY]').replace(/kvrs_m1_[A-Za-z0-9_-]{43}/g, '[QR_CAPABILITY]');
  throw new Error(message);
} finally { if (browser) await browser.close().catch(() => {}); server.kill('SIGTERM'); }
