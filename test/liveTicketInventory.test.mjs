import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const checkoutCardsSource = await readFile(
  new URL('../components/EventTicketCheckoutCards.tsx', import.meta.url),
  'utf8',
);
const inventoryRouteSource = await readFile(
  new URL('../app/api/events/[slug]/ticket-inventory/route.ts', import.meta.url),
  'utf8',
);
const kvrsEventsSource = await readFile(
  new URL('../lib/kvrsEvents.ts', import.meta.url),
  'utf8',
);

test('event inventory proxy is force-dynamic and no-store', () => {
  assert.match(inventoryRouteSource, /export const dynamic = 'force-dynamic';/);
  assert.match(inventoryRouteSource, /export const revalidate = 0;/);
  assert.match(inventoryRouteSource, /getPublicEvent\(slug\)/);
  assert.match(
    inventoryRouteSource,
    /Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'/,
  );
  assert.match(inventoryRouteSource, /quantityAvailable: ticket\.quantityAvailable/);
  assert.match(inventoryRouteSource, /availabilityStatus: ticket\.availabilityStatus \|\| null/);
  assert.match(inventoryRouteSource, /checkoutEnabled: ticket\.checkoutEnabled/);
});

test('ticket cards refresh live inventory while visible and on tab return', () => {
  assert.match(checkoutCardsSource, /new IntersectionObserver\(/);
  assert.match(
    checkoutCardsSource,
    /\/api\/events\/\$\{encodeURIComponent\(event\.slug\)\}\/ticket-inventory/,
  );
  assert.match(checkoutCardsSource, /cache: 'no-store'/);
  assert.match(checkoutCardsSource, /window\.setInterval\([\s\S]{0,120}4_000/);
  assert.match(checkoutCardsSource, /document\.addEventListener\('visibilitychange'/);
  assert.match(checkoutCardsSource, /window\.addEventListener\('focus'/);
});

test('fresh KVRS inventory state replaces stale customer-facing availability', () => {
  assert.match(checkoutCardsSource, /quantityAvailable: fresh\.quantityAvailable/);
  assert.match(checkoutCardsSource, /availabilityStatus: fresh\.availabilityStatus/);
  assert.match(checkoutCardsSource, /checkoutEnabled: fresh\.checkoutEnabled/);
  assert.match(checkoutCardsSource, /action: nextAction/);
  assert.match(
    checkoutCardsSource,
    /fresh\.quantityAvailable > 0[\s\S]{0,120}Math\.min\(configuredMax, fresh\.quantityAvailable\)/,
    'selected quantity must clamp downward when held or sold inventory reduces availability',
  );
  assert.match(
    checkoutCardsSource,
    /ticket\?\.availabilityStatus \|\| ticket\?\.action\?\.status \|\| event\.saleStatus/,
    'disabled labels should prefer current KVRS availability/action state over event-level sale status',
  );
});

test('live reductions preserve original intent across repeated inventory changes', () => {
  assert.match(
    checkoutCardsSource,
    /const originalRequested = existing\.requestedQuantity \?\? existing\.quantity;/,
    'a second inventory drop must retain the original customer request rather than the first adjusted value',
  );
  assert.match(
    checkoutCardsSource,
    /Math\.min\(availableMax, originalRequested\)/,
    'transaction quantity must follow current availability without exceeding the original request',
  );
  assert.match(
    checkoutCardsSource,
    /adjustedQuantity < originalRequested[\s\S]{0,180}requestedQuantity: originalRequested/,
    'automatic reductions must retain requestedQuantity while the transaction remains reduced',
  );
  assert.match(
    checkoutCardsSource,
    /: \{[\s\S]{0,80}quantity: adjustedQuantity,[\s\S]{0,80}\};/,
    'when availability again supports the original request, the adjustment marker must clear',
  );
});

test('manual quantity edits replace stale automatic intent', () => {
  assert.match(
    checkoutCardsSource,
    /setQuantitySelections\(\(current\) => \(\{[\s\S]{0,180}\[key\]: \{[\s\S]{0,80}quantity: nextQuantity,[\s\S]{0,80}\},/,
    'a manual edit must write a fresh selection without carrying requestedQuantity forward',
  );
});

test('PublicTicketType carries KVRS availabilityStatus explicitly', () => {
  assert.match(kvrsEventsSource, /availabilityStatus\?: string \| null;/);
});

test('live refresh preserves whole-night and exact single-show checkout semantics', () => {
  assert.match(
    checkoutCardsSource,
    /if \(ticket\.showIds\.length > 1\) return \[\];/,
    'whole-night products still submit no singular show selection',
  );
  assert.match(
    checkoutCardsSource,
    /ticketScope === 'SHOWS'[\s\S]{0,120}ticket\.showIds\?\.length === 1/,
    'single-show products still require their exact authoritative show',
  );
  assert.match(checkoutCardsSource, /quantity: safeQuantity/);
});
