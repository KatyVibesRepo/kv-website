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
const draft = JSON.parse(readFileSync(new URL('./fixtures/nov21-launch-event.json', import.meta.url)));
const live = { ...draft, status: 'PUBLISHED', visibility: 'PUBLIC', ticketTypes: draft.ticketTypes.map(p =>
  ({ ...p, status: 'ACTIVE', checkoutEnabled: true, isVisible: true })) };
const env = { KV_WEBSITE_M1_CUSTOMER_ORIGIN: 'https://kv-website-ten.vercel.app',
  KV_WEBSITE_M1_CUSTOMER_READ_ENABLED: 'true', KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED: 'true',
  KV_WEBSITE_M1_CUSTOMER_SHOWS_ENABLED: 'true',
  KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: draft.ticketTypes.map(p => `${draft.id}:${p.id}`).join(',') };
const enabled = release.customerRelease(env);
const before = Date.parse('2026-11-21T23:59:59.999Z');

test('November 21 exact 15 identities stay private/paused; twelve tables prepare and GA retains ordinary checkout', () => {
  assert.equal(draft.ticketTypes.length, 15);
  assert.equal(new Set(draft.ticketTypes.map(p => p.id)).size, 15);
  assert.equal(draft.ticketTypes.reduce((n, p) => n + p.showIds.length, 0), 20);
  for (const p of draft.ticketTypes) assert.equal(release.customerProductEligible(draft, p, enabled, before), false);
  for (const p of live.ticketTypes) {
    assert.equal(release.customerProductEligible(live, p, enabled, before), p.guestCount > 1);
    assert.deepEqual(release.customerProductSelection(live, p, before).shows.map(s => s.id).sort(), [...p.showIds].sort());
    assert.equal(p.showIds.length, p.allLinkedShows ? 2 : 1);
  }
  assert.deepEqual(live.ticketTypes.filter(p => p.name.includes('VIP')).map(p => p.priceCents), [24500, 28500, 32500]);
  assert.equal(release.customerRelease({}).salesEnabled, false);
});

test('November 21 Chicago CST closes first/combo at 6 PM and second-only at 9 PM', () => {
  for (const p of live.ticketTypes.filter(p => p.guestCount > 1)) {
    const secondOnly = p.showIds.length === 1 && p.showIds[0] === live.shows[1].id;
    assert.equal(release.customerProductEligible(live, p, enabled, Date.parse('2026-11-22T00:00:00.000Z')), secondOnly);
    assert.equal(release.customerProductEligible(live, p, enabled, Date.parse('2026-11-22T02:59:59.999Z')), secondOnly);
    assert.equal(release.customerProductEligible(live, p, enabled, Date.parse('2026-11-22T03:00:00.000Z')), false);
  }
});

test('development and future apex aliases lead to one configured booking origin without enabling sales', () => {
  const path = '/reservations/group/return';
  const held = { ...env, KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED: 'false', KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: '' };
  assert.equal(release.customerPortalRedirect('katyvibes.com', path, held), env.KV_WEBSITE_M1_CUSTOMER_ORIGIN + path);
  const future = { ...held, KV_WEBSITE_M1_CUSTOMER_ORIGIN: 'https://katyvibes.com' };
  assert.equal(release.customerPortalRedirect('kv-website-ten.vercel.app', path, future), 'https://katyvibes.com' + path);
  assert.equal(release.customerPortalRedirect('www.katyvibes.com', path, future), 'https://katyvibes.com' + path);
  assert.equal(release.customerPortalRedirect('katyvibes.com', path, future), null);
  for (const host of ['attacker.example', 'katyvibes.com.attacker.example', null])
    assert.equal(release.customerPortalRedirect(host, path, future), null);
  assert.equal(release.customerPortalRedirect('kv-website-ten.vercel.app', '/events', future), null);
  assert.equal(release.customerPortalRedirect('kv-website-ten.vercel.app', path + '?access=private', future), null);
  assert.equal(release.customerReleaseForHost('katyvibes.com', future).readEnabled, true);
  assert.equal(release.customerReleaseForHost('katyvibes.com', future).salesEnabled, false);
  assert.equal(release.customerReleaseForHost('kv-website-ten.vercel.app', future).salesEnabled, false);
});

test('Pay in Full uses each authoritative table total once; combo quote carries both actual shows', async () => {
  const oldWindow = globalThis.window, oldFetch = globalThis.fetch;
  globalThis.window = { location: { origin: env.KV_WEBSITE_M1_CUSTOMER_ORIGIN } };
  try {
    for (const p of live.ticketTypes.filter(p => p.guestCount > 1)) {
      const entries = live.shows.filter(s => p.showIds.includes(s.id)).map(s => ({
        showId: s.id, entryScopeKey: 'show:' + s.id, startsAt: s.startsAt, endsAt: s.endsAt }));
      const scope = { contract: 'kvrs.m1.show-coverage.v1', type: 'SHOWS', eventId: live.id,
        selection: p.allLinkedShows ? 'ALL_LINKED_SHOWS' : 'SELECTED_SHOW',
        entryScopeKey: p.allLinkedShows ? 'shows:' + 'c'.repeat(64) : entries[0].entryScopeKey,
        showIds: [...p.showIds].sort(), entries, reservationStartsAt: entries[0].startsAt,
        salesCutoffAt: entries[0].startsAt, departureRequiredBefore: null };
      const input = { eventId: live.id, productId: p.id, quantity: 1, paymentChoice: 'PACKAGE_INSTALLMENT',
        proposedInstallmentCents: p.priceCents, ...(p.allLinkedShows ? {} : { showId: p.showIds[0] }) };
      globalThis.fetch = async (url, init) => {
        assert.equal(url, 'https://admin.katyvibes.com/api/public/m1/quotes');
        assert.deepEqual(JSON.parse(init.body), input);
        return Response.json({ ok: true, event: { id: live.id }, admissionScope: scope,
          paymentTiming: { contract: 'kvrs.m1.reservation-payment-timing.v1', anchor: 'RESERVATION_START',
            newPaymentDeadline: scope.reservationStartsAt, inFlightCompletion: 'ORIGINAL_PREPARED_CHECKOUT_ONLY' },
          gracePolicy: { minutes: null, version: 1, anchor: 'RESERVATION_START', expiresAt: scope.reservationStartsAt },
          quoteExpiresAt: new Date(before).toISOString() });
      };
      assert.deepEqual((await client.customerQuote(input)).admissionScope.showIds, [...p.showIds].sort());
    }
  } finally { globalThis.window = oldWindow; globalThis.fetch = oldFetch; }
});
