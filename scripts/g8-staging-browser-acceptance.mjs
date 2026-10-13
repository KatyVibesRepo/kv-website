// Guarded, one-shot browser acceptance for the approved G8 synthetic fixture.
// Never print access tokens, checkout URLs, Stripe sessions, guest PII or API bodies.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { chromium } from 'playwright';

const WEBSITE = 'https://kv-website-git-feat-g8-mixed-payment-preview-katy-vibes.vercel.app';
const BACKEND = 'https://kv-reservationservice-git-staging-g8-mixed-admission-katy-vibes.vercel.app';
const EVENT = 'kvrs_g8_syn_durable_event_20261012';
const PRODUCT = 'kvrs_g8_syn_durable_table8_20261012';

if (process.env.G8_AUTHORIZED_BROWSER_ACCEPTANCE !== '1' ||
  process.env.VERCEL_ENV === 'production' ||
  process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY) {
  throw new Error('Synthetic Stripe TEST acceptance guard declined execution.');
}

function safeError(error) {
  let s = error instanceof Error ? error.message : String(error);
  s = s.replaceAll(/kvrs_ra1_[A-Za-z0-9_-]{43}/g, '[REDACTED]');
  s = s.replaceAll(/#access=[^\s)'"]+/g, '#access=[REDACTED]');
  s = s.replaceAll(/cs_test_[A-Za-z0-9_-]+/g, '[TEST_SESSION_REDACTED]');
  return s.slice(0, 1500);
}
async function api(path, { method = 'GET', bearer, body, idempotencyKey } = {}) {
  assert.match(path, /^\/api\/public\/m1\//);
  const response = await fetch(BACKEND + path, {
    method, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(22000),
    headers: {
      Origin: WEBSITE, Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(bearer ? { Authorization: 'Bearer ' + bearer } : {}),
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => null);
  return { status: response.status, data };
}
async function waitStatus(ref, token, validate, timeout = 90000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const result = await api('/api/public/m1/reservations/' + ref + '/status', { bearer: token });
    if (result.status === 200 && result.data?.ok === true && validate(result.data)) return result.data;
    await new Promise(resolve => setTimeout(resolve, 2500));
  }
  throw new Error('Stripe TEST settlement was not confirmed in the allowed time.');
}
async function createFromWebsite(browser, variant) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce', acceptDownloads: false });
  const page = await context.newPage();
  await page.goto(WEBSITE + '/g8/staging', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.getByRole('heading', { name: 'Explore reservation options' }).waitFor();
  await page.getByRole('button', { name: /Additional Payment Options/ }).click();
  await page.getByRole('radio', { name: 'Pay Individually' }).check();
  const form = page.locator('form.ticket-purchase-form');
  assert.equal(await form.count(), 1);
  await form.locator('input[name="customerName"]').fill('Synthetic G8 ' + variant);
  await form.locator('input[name="customerEmail"]').fill('g8-test-' + randomUUID().slice(0,8) + '@example.com');
  await form.locator('input[name="customerPhone"]').fill('8320000000');
  await form.locator('input[name="acceptUnpaidPaymentTerms"]').check();
  const reply = page.waitForResponse(response =>
    response.url().startsWith(BACKEND) && response.url().endsWith('/api/public/m1/reservations') &&
    response.request().method() === 'POST', { timeout: 45000 });
  await form.getByRole('button', { name: 'Continue' }).click();
  const reservationResponse = await reply;
  const created = await reservationResponse.json();
  assert.equal(reservationResponse.status() === 200 || reservationResponse.status() === 201, true);
  assert.equal(created.ok, true);
  assert.match(created.publicReservationRef, /^kvr_[0-9a-f]{40}$/);
  assert.match(created.customerAccessToken, /^kvrs_ra1_[A-Za-z0-9_-]{43}$/);
  assert.equal(created.guestCount, 8);
  await page.waitForURL(url => url.pathname ===
    '/g8/reservations/' + created.publicReservationRef, { timeout: 25000 });
  await page.getByRole('heading', { name: 'Your reservation' }).waitFor();
  await page.getByText('Awaiting payment').first().waitFor();
  const originalLink = WEBSITE + '/g8/reservations/' +
    created.publicReservationRef + '#access=' + created.customerAccessToken;
  await page.goto(originalLink, { waitUntil: 'domcontentloaded' });
  await page.getByRole('heading', { name: 'Your reservation' }).waitFor();
  await page.getByRole('heading', { name: 'Guest payments' }).waitFor();
  assert.equal(new URL(page.url()).hash, '');
  console.log('PASS: ' + variant + ' created in Website UI and reopened via original durable link');
  return { page, context, ref: created.publicReservationRef, token: created.customerAccessToken };
}
async function openStripeFromWebsite(session) {
  const { page } = session;
  const button = page.getByRole('button', { name: 'Pay This Guest' }).first();
  await button.waitFor({ timeout: 20000 });
  await button.click();
  await page.waitForURL(url => url.hostname === 'checkout.stripe.com', { timeout: 35000 });
  assert.match(page.url(), /^https:\/\/checkout\.stripe\.com\//);
  console.log('PASS: one guest-share TEST checkout opened from customer reservation page');
}
async function tryVisible(page, selectors) {
  for (const frame of page.frames()) for (const selector of selectors) {
    const target = frame.locator(selector).first();
    if (await target.count().catch(() => 0) && await target.isVisible().catch(() => false)) return target;
  }
  return null;
}
async function fillIfPresent(page, selectors, value) {
  const item = await tryVisible(page, selectors);
  if (!item) return false;
  await item.fill(value);
  return true;
}
async function payStripeTestCard(page) {
  await page.waitForTimeout(2200);
  await fillIfPresent(page, ['input[type="email"]','input[autocomplete="email"]'],
    'synthetic-g8@example.com');
  const card = await tryVisible(page, [
    'input[name="cardNumber"]','input[autocomplete="cc-number"]',
    'input[placeholder*="1234 1234"]','input[aria-label*="Card number"]',
    'input[data-testid="card-number"]'
  ]);
  if (!card) throw new Error('Stripe-hosted TEST Checkout card-number input was not available to browser automation.');
  await card.fill('4242424242424242');
  const expiry = await tryVisible(page, [
    'input[name="cardExpiry"]','input[autocomplete="cc-exp"]',
    'input[placeholder*="MM / YY"]','input[placeholder*="MM/YY"]'
  ]);
  if (!expiry) throw new Error('Stripe-hosted TEST Checkout expiration input was not available.');
  await expiry.fill('1235');
  const cvc = await tryVisible(page, [
    'input[name="cardCvc"]','input[autocomplete="cc-csc"]',
    'input[placeholder="CVC"]','input[aria-label*="CVC"]'
  ]);
  if (!cvc) throw new Error('Stripe-hosted TEST Checkout security-code input was not available.');
  await cvc.fill('123');
  await fillIfPresent(page, ['input[name="billingName"]', 'input[autocomplete="cc-name"]'],
    'Synthetic G8 Guest');
  await fillIfPresent(page, ['input[autocomplete="postal-code"]', 'input[name="billingPostalCode"]'],
    '77494');
  const submit = page.getByRole('button', { name: /^(Pay|Complete|Subscribe|Confirm)/i }).last();
  await submit.waitFor({ timeout: 20000 });
  await submit.click();
  await page.waitForURL(url => url.hostname !== 'checkout.stripe.com', { timeout: 100000 });
}
async function main() {
  // Read-only warning contract smoke. Real event eligibility may be empty.
  const warning = await fetch(BACKEND + '/api/public/reservations/ticketed-warning/evaluate', {
    method: 'POST', headers: { Origin: WEBSITE, Accept: 'application/json',
      'Content-Type': 'application/json' },
    body: JSON.stringify({ date: '2026-10-17', time: '19:00', partySize: 4 }),
    redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(20000),
  });
  const notice = await warning.json().catch(() => null);
  assert.equal(warning.status, 200, 'Staging warning endpoint must be ready');
  assert.equal(notice?.ok, true);
  assert.equal(Array.isArray(notice?.warnings), true);
  assert.equal(notice?.ticketPurchaseIncluded, false);
  console.log('PASS: authoritative public ticketed-warning evaluation accessible in staging');

  const browser = await chromium.launch({ headless: true });
  try {
    const cancellation = await createFromWebsite(browser, 'Cancellation');
    const wrongRef = 'kvr_' + '0'.repeat(40);
    const wrong = await api('/api/public/m1/reservations/' + wrongRef + '/status', {
      bearer: cancellation.token,
    });
    assert.equal(wrong.status, 404);
    console.log('PASS: durable access cannot read a different reservation');
    await openStripeFromWebsite(cancellation);
    const unpaid = await waitStatus(cancellation.ref, cancellation.token,
      status => status.coverage.prepaid === 0 && status.coverage.unpaidActive === 8, 25000);
    assert.equal(unpaid.payment.outstandingCents, 8000);
    // Cancel by returning to the explicitly configured Website checkout-return page.
    // This verifies the Website return handoff; it is not proof of a Stripe-side void.
    await cancellation.page.goto(WEBSITE + '/g8/return?canceled=1', {
      waitUntil: 'domcontentloaded', timeout: 25000,
    });
    await cancellation.page.waitForURL(url => url.pathname.startsWith('/g8/reservations/'), {
      timeout: 20000,
    });
    await cancellation.page.getByRole('heading', { name: 'Your reservation' }).waitFor();
    console.log('PASS: cancel return retains reservation and does not mark unpaid guests as paid');
    await cancellation.context.close();

    const payment = await createFromWebsite(browser, 'Settlement');
    await openStripeFromWebsite(payment);
    await payStripeTestCard(payment.page);
    await payment.page.waitForURL(url => url.pathname.startsWith('/g8/reservations/') ||
      url.pathname === '/g8/return', { timeout: 45000 });
    const settled = await waitStatus(payment.ref, payment.token,
      status => status.coverage.prepaid === 1 && status.payment.stripeSettledCents === 1000);
    assert.equal(settled.coverage.unpaidActive, 7);
    assert.equal(settled.payment.outstandingCents, 7000);
    assert.equal(settled.coverage.admitted, 0);
    console.log('PASS: Stripe TEST settled exactly one guest, other seven remain unpaid');
    await payment.context.close();
  } finally {
    await browser.close();
  }
}
main().catch(error => {
  console.error('G8 isolated staging acceptance FAILED: ' + safeError(error));
  process.exitCode = 1;
});
