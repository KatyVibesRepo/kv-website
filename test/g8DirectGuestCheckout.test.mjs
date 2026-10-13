import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [checkout, api, staging, plan] = await Promise.all([
  '../components/EventTicketCheckoutCards.tsx',
  '../lib/g8PreviewClient.ts',
  '../app/g8/staging/page.tsx',
  '../components/MixedPaymentPlanner.tsx',
].map(path => readFile(new URL(path, import.meta.url), 'utf8')));

test('synthetic staging default checkout is enabled and cannot use the Production payment route', () => {
  assert.match(checkout, /g8PilotApproved && isG8Fixture\(event\.id, ticket\?\.id\)/);
  assert.match(checkout, /paymentModes\[key\] \|\| 'guest_split'/);
  assert.match(checkout, /disabled=\{disabled \|\| isPending\}/);
  assert.doesNotMatch(checkout, /isG8Fixture\(event\.id\) && !selectedPaymentMode/);
  assert.doesNotMatch(checkout, /Choose Payment Option/);
  assert.match(checkout, /Checkout — Guest 1/);
  assert.match(checkout, /Online payments are processed one guest at a time/);
  assert.match(checkout, /if \(!g8PilotApproved \|\| !isG8Fixture\(event\.id, ticket\?\.id\)\)/);
  assert.match(checkout, /if \(isG8Fixture\(event\.id\)\)/);
  assert.match(staging, /g8PilotApproved/);
});

test('the first guest Stripe checkout follows a newly created individual reservation', () => {
  const created = checkout.indexOf('const result = await g8Create(quote.quoteToken, choice, contact, stableId)');
  const paying = checkout.indexOf('const checkout = await g8PayGuest(');
  const redirect = checkout.indexOf('window.location.assign(destination.toString())');
  assert.ok(created > 0 && paying > created && redirect > paying);
  assert.match(checkout, /if \(choice === 'PAY_PER_GUEST'\)/);
  assert.match(checkout, /const firstShare = quote.guestShares\[0\]/);
  assert.match(checkout, /firstShare.shareRef !== 'guest-1'/);
  assert.match(checkout, /checkout.amountCents !== firstShare.amountCents/);
  assert.match(checkout, /checkout.paymentState !== 'PENDING'/);
  assert.match(checkout, /checkout.coverageGranted !== false/);
  assert.match(checkout, /stashCheckoutReturn\(result.publicReservationRef, result.customerAccessToken\)/);
  assert.match(checkout, /window.location.assign\(reservationLink\)/);
  assert.match(api, /publicReservationRef: ref, contributionMode: 'GUEST_SHARE'/);
  assert.match(api, /#access=/);
});

test('pay-at-door does not open Stripe and all G8 flows require unpaid terms', () => {
  assert.match(checkout, /choice: G8Choice = selectedPaymentMode === 'at_door' \? 'PAY_AT_DOOR' : 'PAY_PER_GUEST'/);
  assert.match(checkout, /if \(formData.get\('acceptUnpaidPaymentTerms'\) !== 'on'\)/);
  assert.match(checkout, /g8PilotApproved && selectedPaymentMode && \(/);
  assert.match(checkout, /selectedPaymentMode === 'at_door'\s*\? 'Reserve Tickets'/);
  assert.match(plan, /Pay at Door/);
  assert.match(plan, /Pay Individually/);
  assert.doesNotMatch(plan, /Partial Table Payment/);
});

test('ordinary event checkout and free RSVP remain on their established endpoints', () => {
  assert.match(checkout, /freeReservation\s*\?\s*kvrsFreeReservationEndpoint\(\)\s*:\s*kvrsCheckoutEndpoint\(\)/);
  assert.match(checkout, /const selectedPaymentMode = g8PilotApproved && isG8Fixture\(event\.id, ticket\?\.id\)/);
  assert.match(checkout, /Never send alternative payment selections through production full checkout/);
  assert.doesNotMatch(api, /admin\.katyvibes\.com/);
});
