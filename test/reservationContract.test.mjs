import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const reserveFormSource = await readFile(
  new URL('../components/ReserveRequestForm.tsx', import.meta.url),
  'utf8',
);
const reserveRouteSource = await readFile(
  new URL('../app/api/reserve/route.ts', import.meta.url),
  'utf8',
);
const eventDetailSource = await readFile(
  new URL('../app/events/[slug]/page.tsx', import.meta.url),
  'utf8',
);

test('generic reservation form reuses an idempotency key for identical retries', () => {
  assert.match(reserveFormSource, /crypto\.randomUUID\(\)/);
  assert.match(
    reserveFormSource,
    /pendingSubmission\?\.serializedPayload === serializedPayload/,
  );
  assert.match(reserveFormSource, /'Idempotency-Key': idempotencyKey/);
  assert.match(reserveFormSource, /max="100"/);
});

test('Website reserve proxy maps to the deployed KVRS public reservation schema', () => {
  assert.match(reserveRouteSource, /date: reservationDate/);
  assert.match(reserveRouteSource, /time: reservationTime/);
  assert.match(reserveRouteSource, /partySize: guestCount/);
  assert.match(reserveRouteSource, /bringingCake: false/);
  assert.match(reserveRouteSource, /'Idempotency-Key': idempotencyKey/);
  assert.match(reserveRouteSource, /'error' in data/);
  assert.doesNotMatch(
    reserveRouteSource,
    /\n\s*reservationDate,\n\s*reservationTime,\n\s*guestCount,/,
    'proxy must not forward the old Website-only field names to KVRS',
  );
});

test('RSVP-only event detail pages expose the transaction form instead of looping the CTA', () => {
  assert.match(
    eventDetailSource,
    /event\.saleStatus === 'rsvp_only'/,
  );
  assert.match(
    eventDetailSource,
    /hasEventTransactionForm && \([\s\S]*<EventTicketCheckoutCards/,
  );
  assert.match(
    eventDetailSource,
    /\? 'Reserve Your Spot'\s*:\s*'Choose Tickets'/,
  );
});
