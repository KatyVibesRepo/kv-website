import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [checkout, api, staging, plan] = await Promise.all([
  '../components/EventTicketCheckoutCards.tsx',
  '../lib/g8PreviewClient.ts',
  '../app/g8/staging/page.tsx',
  '../components/MixedPaymentPlanner.tsx',
].map(path => readFile(new URL(path, import.meta.url), 'utf8')));

test('the staging fixture defaults to an enabled full-table checkout', () => {
  assert.match(checkout, /g8PilotApproved && isG8Fixture\(event\.id, ticket\?\.id\)/);
  assert.match(checkout, /paymentModes\[key\] \|\| 'full'/);
  assert.match(checkout, /disabled=\{disabled \|\| isPending\}/);
  assert.doesNotMatch(checkout, /isG8Fixture\(event\.id\) && !selectedPaymentMode/);
  assert.doesNotMatch(checkout, /Choose Payment Option/);
  assert.match(checkout, /Checkout — \$\{ticketTotalPrice\(event, ticket, selectedQuantity\)\}/);
  assert.match(checkout, /Checkout pays the full Table of 8 in one secure Stripe payment/);
  assert.match(staging, /g8PilotApproved/);
});

test('full-balance payment is one Stripe checkout; Pay Individually is one guest share', () => {
  const created = checkout.indexOf('const result = await g8Create(quote.quoteToken, choice, contact, stableId)');
  const paying = checkout.indexOf('const checkout = choice ===');
  const redirect = checkout.indexOf('window.location.assign(destination.toString())');
  assert.ok(created > 0 && paying > created && redirect > paying);
  assert.match(checkout, /selectedPaymentMode === 'full' \? 'PACKAGE_INSTALLMENT' : 'PAY_PER_GUEST'/);
  assert.match(checkout, /if \(choice === 'PAY_PER_GUEST' \|\| choice === 'PACKAGE_INSTALLMENT'\)/);
  assert.match(checkout, /g8Quote\(choice, onlineGuests, choice === 'PACKAGE_INSTALLMENT' \? ticket.priceCents : undefined\)/);
  assert.match(checkout, /quote.amountDueNowCents !== ticket.priceCents/);
  assert.match(checkout, /firstShare\.shareRef !== 'guest-1'/);
  assert.match(checkout, /g8PayGuest\(/);
  assert.match(checkout, /g8PayFullTable\(/);
  assert.match(api, /contributionMode: 'GUEST_SHARE'/);
  assert.match(api, /contributionMode: 'PACKAGE_BALANCE'/);
  assert.match(api, /proposedInstallmentCents: fullTableCents/);
  assert.match(checkout, /checkout.amountCents !== expectedAmount/);
  assert.match(checkout, /checkout.paymentState !== 'PENDING'/);
  assert.match(checkout, /checkout.coverageGranted !== false/);
  assert.match(checkout, /stashCheckoutReturn\(result.publicReservationRef, result.customerAccessToken\)/);
  assert.match(checkout, /window.location.assign\(reservationLink\)/);
  assert.match(api, /#access=/);
});

test('Pay at Door skips Stripe and all staging modes require terms acceptance', () => {
  assert.match(checkout, /selectedPaymentMode === 'at_door' \? 'PAY_AT_DOOR'/);
  assert.match(checkout, /if \(formData.get\('acceptUnpaidPaymentTerms'\) !== 'on'\)/);
  assert.match(checkout, /g8PilotApproved && selectedPaymentMode && \(/);
  assert.match(checkout, /selectedPaymentMode === 'at_door'\s*\? 'Reserve Tickets'/);
  assert.match(plan, /Pay at Door/);
  assert.match(plan, /Pay Individually/);
  assert.doesNotMatch(plan, /Partial Table Payment/);
});

test('all G8 writes are isolated, normal checkout and RSVP are unchanged', () => {
  assert.match(checkout, /freeReservation\s*\?\s*kvrsFreeReservationEndpoint\(\)\s*:\s*kvrsCheckoutEndpoint\(\)/);
  assert.match(checkout, /if \(!g8PilotApproved \|\| !isG8Fixture\(event\.id, ticket\?\.id\)\)/);
  assert.match(checkout, /if \(isG8Fixture\(event\.id\)\)/);
  assert.match(checkout, /Never send alternative payment selections through production full checkout/);
  assert.doesNotMatch(api, /admin\.katyvibes\.com/);
});
