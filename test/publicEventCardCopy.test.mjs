import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const checkout = await readFile(new URL('../components/EventTicketCheckoutCards.tsx', import.meta.url), 'utf8');
const planner = await readFile(new URL('../components/MixedPaymentPlanner.tsx', import.meta.url), 'utf8');
const details = await readFile(new URL('../app/events/[slug]/page.tsx', import.meta.url), 'utf8');
const flyerCards = await readFile(new URL('../components/EventFlyerCarousel.tsx', import.meta.url), 'utf8');
const weeklyCards = await readFile(new URL('../components/WeeklyEventVibeCarousel.tsx', import.meta.url), 'utf8');

test('alternative payments show the short call-for-help line without a development notice', () => {
  assert.match(planner, /Any questions\? Call/);
  assert.match(planner, /href="tel:18324372807"/);
  assert.doesNotMatch(planner, /These options can|not yet available|KVRS|prototype/i);
});

test('ticket purchase cards only use their own descriptions, without the event-wide fallback', () => {
  assert.match(checkout, /function ticketDescription\(_event: PublicEvent, ticket: TicketChoice\)/);
  assert.match(checkout, /const description = ticket\?\.description\?\.trim\(\) \|\| ''/);
  assert.doesNotMatch(checkout, /ticket\?\.description \|\| event\.shortDescription \|\| event\.subtitle/);
  assert.match(checkout, /ticketDescription\(event, ticket\)/);
  assert.match(checkout, /EventsManager\\\.Next/);
});

test('all other visible event card summaries exclude source-system placeholder copy', () => {
  assert.match(details, /publicEventDescription\(event\.fullDescription, event\.shortDescription, event\.subtitle\)/);
  assert.match(details, /publicEventDescription\(event\.subtitle\)/);
  assert.match(flyerCards, /\[event\.subtitle, event\.shortDescription\]\.find/);
  assert.match(weeklyCards, /\[event\.subtitle, event\.shortDescription\]\.find/);
  for (const source of [details, flyerCards, weeklyCards]) {
    assert.ok(source.includes('EventsManager\\.Next'), 'event cards should block ingestion copy');
  }
});
