import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const load = async path => import('data:text/javascript;base64,' + Buffer.from(ts.transpileModule(
  readFileSync(new URL(path, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText).toString('base64'));
const release = await load('../lib/customerM1Release.ts');
const client = await load('../lib/customerM1Client.ts');
const draft = JSON.parse(readFileSync(new URL('./fixtures/oct30-launch-event.json', import.meta.url), 'utf8'));
const now = Date.parse('2026-10-30T22:59:59.999Z');
const event = { ...draft, status: 'PUBLISHED', visibility: 'PUBLIC',
  ticketTypes: draft.ticketTypes.map(product => ({ ...product, checkoutEnabled: true, isVisible: true })) };
const env = { KV_WEBSITE_M1_CUSTOMER_ORIGIN: 'https://www.katyvibes.com',
  KV_WEBSITE_M1_CUSTOMER_READ_ENABLED: 'true', KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED: 'true',
  KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: event.ticketTypes.map(product => `${event.id}:${product.id}`).join(',') };
const enabled = release.customerRelease({ ...env, KV_WEBSITE_M1_CUSTOMER_SHOWS_ENABLED: 'true' });

test('October 30 private/disabled scope stays unavailable even under prospective reviewed flags', () => {
  assert.equal(draft.ticketTypes.length, 15);
  assert.equal(draft.ticketTypes.reduce((sum, product) => sum + product.showIds.length, 0), 20);
  for (const product of draft.ticketTypes) {
    assert.equal(release.customerProductEligible(draft, product, enabled, now), false);
    assert.equal(release.customerProductEligible(event, product, enabled, now), false);
  }
  for (const product of event.ticketTypes) {
    assert.equal(release.customerProductEligible(event, product, release.customerRelease(env), now), false);
  }
  assert.equal(release.customerRelease({}).showSalesEnabled, false);
  assert.equal(release.customerProductEligible({ ...event, shows: [{ startsAt: null }] }, event.ticketTypes[0],
    { salesEnabled: false, approvedPairs: [] }, now), false);
  for (const patch of [{ KV_WEBSITE_M1_CUSTOMER_READ_ENABLED: 'false' },
    { KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED: 'false' }, { KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: '' }]) {
    assert.equal(release.customerRelease({ ...env, KV_WEBSITE_M1_CUSTOMER_SHOWS_ENABLED: 'true', ...patch }).showSalesEnabled, false);
  }
  assert.equal(release.customerReleaseForHost('katyvibes.com', { ...env, KV_WEBSITE_M1_CUSTOMER_SHOWS_ENABLED: 'true' }).showSalesEnabled, false);
});

test('prospective review preserves 12 exact table options and leaves all three GA products on ordinary checkout', () => {
  for (const product of event.ticketTypes) {
    assert.equal(release.customerProductEligible(event, product, enabled, now), product.type !== 'general_admission');
    const selection = release.customerProductSelection(event, product, now);
    assert.deepEqual(selection.shows.map(show => show.id).sort(), [...product.showIds].sort());
    assert.equal(selection.showSelection, product.allLinkedShows ? 'RESOLVE_LINKED_SHOWS' : 'SELECTED_SHOW');
    assert.ok(selection.shows.every(show => show.label.includes('Oct 30, 2026') && show.label.endsWith('Central')));
  }
  assert.deepEqual(draft.ticketTypes.filter(product => product.type === 'vip_table').map(product => product.priceCents), [24500, 28500, 32500]);
});

test('6 PM closes first and both-show options while second-only remains eligible until 9 PM', () => {
  for (const product of event.ticketTypes.filter(product => product.type !== 'general_admission')) {
    const second = product.id.endsWith('_second');
    assert.equal(release.customerProductEligible(event, product, enabled, Date.parse('2026-10-30T23:00:00.000Z')), second);
    assert.equal(release.customerProductEligible(event, product, enabled, Date.parse('2026-10-31T01:59:59.999Z')), second);
    assert.equal(release.customerProductEligible(event, product, enabled, Date.parse('2026-10-31T02:00:00.000Z')), false);
  }
});

test('cross-event links, duplicates, hidden/inactive shows and disguised EVENT bundles fail closed', () => {
  const product = event.ticketTypes.find(product => product.id.endsWith('table4_both'));
  for (const patch of [{ showIds: [] }, { showIds: [product.showIds[0], product.showIds[0]] },
    { showIds: ['kvrs_4dasoul_20261024_show_1'] }, { scope: 'EVENT' }]) {
    assert.equal(release.customerProductEligible(event, { ...product, ...patch }, enabled, now), false);
  }
  for (const patch of [{ isVisible: false }, { definitionState: 'archived' }, { status: 'canceled' },
    { transactionEnabled: false }, { startsAt: 'invalid' }, { startsAt: null }, { endsAt: null }]) {
    assert.equal(release.customerProductEligible({ ...event, shows: [{ ...event.shows[0], ...patch }, event.shows[1]] }, product, enabled, now), false);
  }
});

function scope(product) {
  const entries = event.shows.filter(show => product.showIds.includes(show.id)).map(show => ({
    showId: show.id, entryScopeKey: `show:${show.id}`, startsAt: show.startsAt, endsAt: show.endsAt,
  }));
  return { contract: 'kvrs.m1.show-coverage.v1', type: 'SHOWS', eventId: event.id,
    selection: product.allLinkedShows ? 'ALL_LINKED_SHOWS' : 'SELECTED_SHOW',
    entryScopeKey: product.allLinkedShows ? 'shows:' + 'b'.repeat(64) : entries[0].entryScopeKey,
    showIds: entries.map(entry => entry.showId).sort(), entries, reservationStartsAt: entries[0].startsAt,
    salesCutoffAt: entries[0].startsAt,
    departureRequiredBefore: product.id.endsWith('_first') ? event.shows[1].startsAt : null };
}
const timing = coverage => ({ contract: 'kvrs.m1.reservation-payment-timing.v1', anchor: 'RESERVATION_START',
  newPaymentDeadline: coverage.reservationStartsAt, inFlightCompletion: 'ORIGINAL_PREPARED_CHECKOUT_ONLY' });

test('each exact table scope can pay only under explicit SHOWS review and fresh server timing permission', () => {
  for (const product of event.ticketTypes.filter(product => product.type !== 'general_admission')) {
    const coverage = scope(product);
    const status = { event: { id: event.id }, admissionScope: coverage, paymentTiming: timing(coverage),
      onlinePaymentInitiationAllowed: true, onlinePaymentPending: false, payment: { pendingCents: 0 }, checkoutHistory: [],
      reconciliationRequired: false, nextAction: 'PAY', admissionPlanState: 'CONFIRMED', capacityHeld: true,
      coverage: { unpaidActive: product.guestCount }, canonicalReservationStatus: 'RESERVED', asOf: new Date(now).toISOString() };
    assert.equal(client.canStartCustomerPayment(status, now), false);
    assert.equal(client.canStartCustomerPayment(status, now, true), true);
    for (const patch of [{ onlinePaymentInitiationAllowed: false }, { onlinePaymentPending: true },
      { reconciliationRequired: true }, { paymentTiming: { ...status.paymentTiming, newPaymentDeadline: '2026-10-31T05:00:00.000Z' } },
      { admissionScope: { ...coverage, eventId: 'kvrs_4dasoul_20261024' } }]) {
      assert.equal(client.canStartCustomerPayment({ ...status, ...patch }, now, true), false);
    }
  }
});

test('October 30 quote transport sends exact single show IDs, omits combo selector, and refuses narrowed combo responses', async () => {
  const oldWindow = globalThis.window, oldFetch = globalThis.fetch;
  globalThis.window = { location: { origin: 'https://www.katyvibes.com' } };
  try {
    for (const product of event.ticketTypes.filter(product => product.type !== 'general_admission')) {
      const coverage = scope(product);
      const input = { eventId: event.id, productId: product.id, quantity: 1, paymentChoice: 'PAY_AT_DOOR',
        ...(product.allLinkedShows ? {} : { showId: product.showIds[0] }) };
      let responseScope = coverage;
      globalThis.fetch = async (url, init) => {
        assert.equal(url, 'https://admin.katyvibes.com/api/public/m1/quotes');
        assert.deepEqual(JSON.parse(init.body), input);
        return new Response(JSON.stringify({ ok: true, event: { id: event.id }, admissionScope: responseScope,
          paymentTiming: timing(responseScope), gracePolicy: { minutes: null, version: 1, anchor: 'RESERVATION_START', expiresAt: responseScope.reservationStartsAt },
          quoteExpiresAt: new Date(Date.parse(responseScope.salesCutoffAt) - 1).toISOString() }));
      };
      assert.deepEqual((await client.customerQuote(input)).admissionScope.showIds, [...product.showIds].sort());
      if (product.allLinkedShows) {
        responseScope = scope(event.ticketTypes.find(item => item.id === product.id.replace(/_both$/, '_first')));
        await assert.rejects(client.customerQuote(input), error => error.code === 'QUOTE_UNAVAILABLE');
      }
    }
  } finally { globalThis.window = oldWindow; globalThis.fetch = oldFetch; }
});
