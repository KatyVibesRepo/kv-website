import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

const read = (p) => readFile(new URL('../' + p, import.meta.url), 'utf8');
const [api, checkout, customer, staging, securePage, config, returnClient] = await Promise.all([
  'lib/g8PreviewClient.ts',
  'components/EventTicketCheckoutCards.tsx',
  'components/G8ReservationPage.tsx',
  'app/g8/staging/page.tsx',
  'app/g8/reservations/[publicRef]/page.tsx',
  'next.config.mjs',
  'components/G8CheckoutReturn.tsx',
].map(read));

test('isolated public G8 API is pinned to staging, separate from legacy checkout', () => {
  assert.match(api, /G8_STAGING_API_BASE = 'https:\/\/kv-reservationservice-git-staging-g8-mixed-admission-katy-vibes\.vercel\.app'/);
  assert.doesNotMatch(api, /admin\.katyvibes\.com/);
  assert.match(api, /G8_FIXTURE_EVENT_ID = 'kvrs_g8_syn_durable_event_20261012'/);
  assert.match(api, /G8_FIXTURE_PRODUCT_ID = 'kvrs_g8_syn_durable_table8_20261012'/);
  assert.match(api, /\/api\/public\/m1\/quotes/);
  assert.match(api, /\/api\/public\/m1\/reservations/);
  assert.match(checkout, /freeReservation\s*\?\s*kvrsFreeReservationEndpoint\(\)\s*:\s*kvrsCheckoutEndpoint\(\)/);
  assert.match(checkout, /!g8PilotApproved \|\| !isG8Fixture\(event\.id, ticket\?\.id\)/);
  assert.match(checkout, /if \(isG8Fixture\(event\.id\)\)/);
});

test('new reservations require a server quote and explicit terms before customer access', () => {
  assert.match(checkout, /formData\.get\('acceptUnpaidPaymentTerms'\) !== 'on'/);
  assert.match(checkout, /quote\.eligiblePaymentChoices\.includes\(choice\)/);
  assert.match(checkout, /quote\.totalCents !== ticket\.priceCents/);
  assert.match(checkout, /g8Create\(quote\.quoteToken, choice, contact, stableId\)/);
  assert.match(api, /acceptUnpaidPaymentTerms: true/);
  assert.match(api, /'Idempotency-Key'/);
  assert.match(staging, /g8PilotApproved/);
  assert.match(staging, /g8PreviewAllowed\(\)/);
  assert.match(securePage, /validG8Ref\(publicRef\)/);
});

test('durable bearer only in fragment or Authorization and short-lived browser tab handoff', () => {
  assert.match(api, /customerTokenPattern = \/\^kvrs_ra1_/);
  assert.match(api, /Authorization = 'Bearer ' \+ options\.bearer/);
  assert.match(api, /#access=/);
  assert.match(api, /sessionStorage\.setItem\(handoffKey/);
  assert.match(api, /sessionStorage\.removeItem\(handoffKey\)/);
  assert.doesNotMatch(api, /localStorage|document\.cookie|URLSearchParams\([^)]*bearer/);
  assert.match(customer, /history\.replaceState\(null, '', window\.location\.pathname\)/);
  assert.match(customer, /navigator\.clipboard\.writeText\(g8Link/);
  assert.match(returnClient, /takeCheckoutReturn\(\)/);
  assert.match(config, /source: '\/g8\/:path\*'/);
  assert.match(config, /no-referrer/);
  assert.match(config, /no-store/);
  assert.match(config, /"script-src 'self' 'unsafe-inline'"/);
});

test('status never treats Stripe redirect or pending payment as settled admission', () => {
  assert.match(customer, /status\.coverage\.prepaid/);
  assert.match(customer, /status\.coverage\.manualAcknowledged/);
  assert.match(customer, /status\.coverage\.releasedUnpaid/);
  assert.match(customer, /status\.payment\.outstandingCents/);
  assert.match(customer, /status\.payment\.pendingCents > 0/);
  assert.match(customer, /Returning from checkout does not confirm payment/);
  assert.match(api, /coverageGranted: false/);
  assert.match(customer, /g8PayGuest\(reservationRef, accessToken, shareRef, crypto\.randomUUID\(\)\)/);
  assert.match(customer, /destination\.hostname !== 'checkout\.stripe\.com'/);
  assert.match(customer, /32 \* 60_000/);
  assert.doesNotMatch(customer, /groupCredentialValue\}/);
});

test('original multi-table and Both Shows full checkout stays independent', () => {
  assert.match(checkout, /quantity: safeQuantity/);
  assert.match(checkout, /requestedQuantity/);
  assert.match(checkout, /const showGroups = useMemo/);
  assert.match(checkout, /Both Shows/);
  assert.match(checkout, /isG8Fixture\(event\.id\)/);
  assert.doesNotMatch(checkout, /PACKAGE_INSTALLMENT|Partial Table Payment/);
});
