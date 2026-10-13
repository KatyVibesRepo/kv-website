// Guarded TEST-only Stripe settlement acceptance, independent of Website preview SSO.
// Maximum one reservation/session for settlement; a separate cancel path is optional.
// Credentials, session URLs, personal data and API responses are never printed.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';

const BACKEND = 'https://kv-reservationservice-git-staging-g8-mixed-admission-katy-vibes.vercel.app';
const ORIGIN = 'https://kv-website-git-feat-g8-mixed-payment-preview-katy-vibes.vercel.app';
const EVENT = 'kvrs_g8_syn_durable_event_20261012';
const PRODUCT = 'kvrs_g8_syn_durable_table8_20261012';
if (process.env.G8_STRIPE_TEST_ACCEPTANCE !== '1' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY) {
  throw new Error('Stripe TEST synthetic guard declined execution.');
}
function safe(message) {
  return String(message).replaceAll(/kvrs_ra1_[A-Za-z0-9_-]{43}/g, '[redacted]')
    .replaceAll(/cs_test_[A-Za-z0-9_-]+/g, '[test-session]')
    .replaceAll(/#access=[^\s)"']+/g, '#access=[redacted]').slice(0, 900);
}
async function call(path, { method = 'POST', body, bearer, key } = {}) {
  assert.match(path, /^\/api\/public\/m1\//);
  const res = await fetch(BACKEND + path, { method, redirect: 'error',
    cache: 'no-store', signal: AbortSignal.timeout(20000),
    headers: { Origin: ORIGIN, Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(bearer ? { Authorization: 'Bearer ' + bearer } : {}),
      ...(key ? { 'Idempotency-Key': key } : {}),
    }, ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}
function requireSuccess(reply, stage) {
  if (reply.status < 200 || reply.status >= 300 || reply.data?.ok !== true) {
    throw new Error(stage + ' rejected: HTTP ' + reply.status +
      ' / ' + (typeof reply.data?.code === 'string' ? reply.data.code : 'UNKNOWN'));
  }
  return reply.data;
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function newGuestCheckout() {
  const quote = requireSuccess(await call('/api/public/m1/quotes', {
    body: { eventId: EVENT, productId: PRODUCT, quantity: 1,
      paymentChoice: 'PAY_PER_GUEST', plannedOnlineGuestCount: 1 },
  }), 'Quote');
  assert.equal(quote.event.id, EVENT);
  assert.equal(quote.product.id, PRODUCT);
  assert.equal(quote.totalCents, 8000);
  assert.equal(quote.guestCount, 8);
  assert.equal(quote.amountDueNowCents, 1000);
  assert.equal(quote.guestShares.length, 8);
  assert.equal(quote.capacityHeld, false);
  const request = {
    quoteToken: quote.quoteToken,
    customerName: 'G8 Synthetic Stripe Test',
    customerEmail: 'g8-' + randomUUID().slice(0, 8) + '@example.invalid',
    customerPhone: '8320000000',
    paymentChoice: 'PAY_PER_GUEST',
    acceptUnpaidPaymentTerms: true,
  };
  const key = 'g8-website-stripe-' + randomUUID();
  const created = requireSuccess(await call('/api/public/m1/reservations', {
    body: request, key,
  }), 'Reservation');
  assert.match(created.publicReservationRef, /^kvr_[a-f0-9]{40}$/);
  assert.match(created.customerAccessToken, /^kvrs_ra1_[A-Za-z0-9_-]{43}$/);
  assert.equal(created.capacityHeld, true);
  const again = requireSuccess(await call('/api/public/m1/reservations', {
    body: request, key,
  }), 'Idempotent replay');
  assert.equal(again.publicReservationRef, created.publicReservationRef);
  assert.equal(again.customerAccessToken, created.customerAccessToken);
  const ref = created.publicReservationRef;
  const bearer = created.customerAccessToken;
  const check = async () => requireSuccess(await call(
    '/api/public/m1/reservations/' + ref + '/status', {
      method: 'GET', bearer,
    }), 'Customer status');
  const before = await check();
  assert.equal(before.coverage.prepaid, 0);
  assert.equal(before.coverage.unpaidActive, 8);
  assert.equal(before.payment.outstandingCents, 8000);
  const started = requireSuccess(await call('/api/public/m1/checkouts', {
    bearer, key: 'g8-website-guest-' + randomUUID(),
    body: { publicReservationRef: ref, contributionMode: 'GUEST_SHARE', guestShareRef: 'guest-1' },
  }), 'Guest share Checkout');
  const target = new URL(started.checkoutUrl);
  assert.equal(target.protocol, 'https:');
  assert.equal(target.hostname, 'checkout.stripe.com');
  assert.match(started.checkoutUrl, /cs_test_/);
  assert.equal(started.coverageGranted, false);
  assert.equal(started.paymentState, 'PENDING');
  assert.equal(started.amountCents, 1000);
  const pending = await check();
  assert.equal(pending.coverage.prepaid, 0);
  assert.equal(pending.coverage.admitted, 0);
  console.log('PASS: one staging guest-share Stripe TEST checkout is pending; zero admission granted');
  return { ref, bearer, check, checkoutUrl: started.checkoutUrl };
}
async function visible(page, selectors) {
  for (const frame of page.frames()) for (const selector of selectors) {
    const match = frame.locator(selector).first();
    if (await match.count().catch(() => 0) && await match.isVisible().catch(() => false)) return match;
  }
  return null;
}
async function optionalFill(page, selectors, value) {
  const input = await visible(page, selectors);
  if (input) { await input.fill(value); return true; }
  return false;
}
async function settleTestCard(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  let returnPath = '';
  page.on('request', r => {
    try {
      const u = new URL(r.url());
      if (u.origin === ORIGIN) returnPath = u.pathname;
    } catch { /* no details retained */ }
  });
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 35000 });
    await page.waitForTimeout(1600);
    await optionalFill(page, ['input[type="email"]', 'input[autocomplete="email"]'],
      'g8-synthetic@example.com');
    const card = await visible(page, [
      'input[name="cardNumber"]', 'input[autocomplete="cc-number"]',
      'input[placeholder*="1234 1234"]', 'input[aria-label*="Card number"]',
    ]);
    if (!card) {
      const hints = [];
      for (const frame of page.frames()) {
        const inputs = await frame.locator('input').evaluateAll(ns =>
          ns.map(n => ({
            type: n.getAttribute('type'), name: n.getAttribute('name'),
            autocomplete: n.getAttribute('autocomplete'), placeholder: n.getAttribute('placeholder'),
          })).slice(0, 10)).catch(() => []);
        hints.push(...inputs);
      }
      console.log('Stripe TEST form field names only: ' + JSON.stringify(hints.slice(0, 14)));
      throw new Error('Hosted Stripe TEST card input not found.');
    }
    await card.fill('4242424242424242');
    const exp = await visible(page, [
      'input[name="cardExpiry"]', 'input[autocomplete="cc-exp"]',
      'input[placeholder*="MM / YY"]', 'input[placeholder*="MM/YY"]',
    ]);
    if (!exp) throw new Error('Hosted Stripe TEST expiry input not found.');
    await exp.fill('1235');
    const cvc = await visible(page, [
      'input[name="cardCvc"]', 'input[autocomplete="cc-csc"]',
      'input[placeholder*="CVC"]', 'input[aria-label*="CVC"]',
    ]);
    if (!cvc) throw new Error('Hosted Stripe TEST security code input not found.');
    await cvc.fill('123');
    await optionalFill(page, ['input[name="billingName"]', 'input[autocomplete="cc-name"]'],
      'G8 Synthetic Guest');
    await optionalFill(page, ['input[autocomplete="postal-code"]', 'input[name="billingPostalCode"]'],
      '77494');
    const pay = page.getByRole('button', { name: /^(Pay|Complete|Confirm)/i }).last();
    await pay.waitFor({ timeout: 18000 });
    await pay.click();
    await page.waitForURL(u => u.hostname !== 'checkout.stripe.com', { timeout: 100000 }).catch(() => {});
    return returnPath;
  } finally { await browser.close(); }
}
async function run() {
  const reservation = await newGuestCheckout();
  const checkoutReturn = await settleTestCard(reservation.checkoutUrl);
  if (checkoutReturn) {
    assert.equal(checkoutReturn.startsWith('/g8/'), true,
      'Stripe TEST redirects must target the isolated Website G8 return');
    console.log('PASS: Stripe TEST configured return stayed within G8 Website paths');
  } else {
    console.log('Stripe browser remained on hosted Checkout; checking settlement via authoritative KVRS status.');
  }
  const deadline = Date.now() + 85000;
  while (Date.now() < deadline) {
    const status = await reservation.check();
    if (status.coverage.prepaid === 1 && status.payment.stripeSettledCents === 1000) {
      assert.equal(status.coverage.unpaidActive, 7);
      assert.equal(status.payment.outstandingCents, 7000);
      assert.equal(status.coverage.admitted, 0);
      console.log('PASS: exactly one guest settled by Stripe TEST webhook; seven remain unpaid, zero admitted');
      return;
    }
    await sleep(2500);
  }
  throw new Error('No settled Stripe TEST guest share appeared within 85 seconds.');
}
run().catch(e => { console.error('G8 Stripe TEST acceptance FAILED: ' + safe(e?.message || e)); process.exitCode = 1; });
