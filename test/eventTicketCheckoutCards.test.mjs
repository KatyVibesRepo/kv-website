import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const checkoutCardsSource = await readFile(
  new URL('../components/EventTicketCheckoutCards.tsx', import.meta.url),
  'utf8',
);

test('single-show checkout submits the authoritative show ID', () => {
  assert.match(
    checkoutCardsSource,
    /showId:\s*showId \|\| null/,
    'checkout payload must carry an exact showId when one is required',
  );
  assert.match(
    checkoutCardsSource,
    /ticket\.showIds\?\.length === 1/,
    'only one-show SHOWS products require a singular show selection',
  );
  assert.match(
    checkoutCardsSource,
    /name="showId" value=\{selectableShows\[0\]\.id\}/,
    'single-show products must submit their only authoritative showId',
  );
  assert.match(
    checkoutCardsSource,
    /const availableShows = event\.shows\.filter\([\s\S]{0,120}show\.transactionEnabled !== false/,
    'show choices must come only from transaction-enabled event shows',
  );
});

test('multi-show whole-night products submit no singular show selection', () => {
  assert.match(
    checkoutCardsSource,
    /if \(ticket\.showIds\.length > 1\) return \[\];/,
    'multi-show Contract-v1 products must not offer a singular show selector',
  );
  assert.match(
    checkoutCardsSource,
    /ticketScope === 'SHOWS'[\s\S]{0,120}ticket\.showIds\?\.length === 1/,
    'show selection must be limited to exact one-show products',
  );
});

test('GA, table, and VIP quantity are bounded by configured max and current availability', () => {
  assert.match(
    checkoutCardsSource,
    /ticket\?\.type === 'table' \|\| ticket\?\.type === 'vip_table'/,
    'table and VIP products must participate in paid quantity selection',
  );
  assert.match(
    checkoutCardsSource,
    /return isGeneralAdmissionTicket\(ticket\) \|\| isTableOrVipTicket\(ticket\);/,
    'GA and table/VIP products must share the bounded paid-quantity path',
  );
  assert.match(
    checkoutCardsSource,
    /Math\.min\(configuredMax, ticket\.quantityAvailable\)/,
    'maximum quantity must never exceed current public availability or configured max',
  );
  assert.match(
    checkoutCardsSource,
    /quantity: safeQuantity/,
    'checkout payload must submit the selected bounded quantity unchanged as quantity',
  );
});

test('displayed paid total reacts to selected quantity', () => {
  assert.match(
    checkoutCardsSource,
    /ticket\.priceCents \* Math\.max\(1, quantity\)/,
    'displayed total must multiply unit price by selected quantity',
  );
  assert.match(
    checkoutCardsSource,
    /Total: \$\{ticketTotalPrice\(event, ticket, selectedQuantity\)\}/,
    'paid cards must render the reactive total price',
  );
  assert.match(
    checkoutCardsSource,
    /value=\{quantityInputValue\}/,
    'quantity input must render the customer editing value instead of an immediately clamped number',
  );
});

test('quantity input supports natural intermediate editing before bounded commit', () => {
  assert.match(
    checkoutCardsSource,
    /inputValue\?: string;/,
    'quantity state must preserve a temporary raw editing value',
  );
  assert.match(
    checkoutCardsSource,
    /onFocus=\{\(focusEvent\) => \{[\s\S]{0,100}focusEvent\.currentTarget\.select\(\)/,
    'focusing an existing quantity should select it so typing 2 replaces the initial 1',
  );
  assert.match(
    checkoutCardsSource,
    /const inputValue = changeEvent\.currentTarget\.value;/,
    'onChange must retain the raw editing value, including an empty intermediate state',
  );
  assert.match(
    checkoutCardsSource,
    /inputValue !== ''[\s\S]{0,180}parsedQuantity >= minQuantity[\s\S]{0,180}parsedQuantity <= maxQuantity/,
    'only an already-valid edit should update the committed numeric quantity during typing',
  );
  assert.match(
    checkoutCardsSource,
    /existing\.inputValue === undefined[\s\S]{0,260}inputValue === ''[\s\S]{0,260}Math\.max\([\s\S]{0,120}Math\.min\(maxQuantity, parsedQuantity\)/,
    'blur must commit blank to min and clamp the final edited value to current min/max',
  );
  assert.doesNotMatch(
    checkoutCardsSource,
    /const requestedQuantity = Number\(changeEvent\.currentTarget\.value\);[\s\S]{0,180}Math\.max\(minQuantity, Math\.min\(maxQuantity, requestedQuantity\)\)/,
    'onChange must not immediately clamp 12 to max while the customer is editing',
  );
});

test('free RSVP submission uses the final edited quantity and bounds it at submit time', () => {
  assert.match(
    checkoutCardsSource,
    /const rawQuantity = readFormValue\(formData, 'quantity'\);/,
  );
  assert.match(
    checkoutCardsSource,
    /rawQuantity === ''[\s\S]{0,120}quantitySelection\?\.quantity \?\? min/,
    'blank editing state must fall back to the committed/min quantity at submission',
  );
  assert.match(
    checkoutCardsSource,
    /const safeQuantity = Math\.max\(min, Math\.min\(max, quantity\)\);/,
    'final submit must still enforce current min/max/availability bounds',
  );
  assert.match(
    checkoutCardsSource,
    /partySize: safeQuantity/,
    'Free RSVP must submit the final bounded customer quantity as partySize',
  );
});

test('paid checkout preserves an automatically reduced requested quantity', () => {
  assert.match(
    checkoutCardsSource,
    /type QuantitySelection = \{[\s\S]{0,120}quantity: number;[\s\S]{0,120}requestedQuantity\?: number;/,
    'quantity state must retain the original request separately from the adjusted transaction quantity',
  );
  assert.match(
    checkoutCardsSource,
    /quantity: safeQuantity,[\s\S]{0,120}\{ requestedQuantity \}/,
    'paid checkout must send the adjusted quantity plus optional requestedQuantity',
  );
  assert.match(
    checkoutCardsSource,
    /!freeReservation[\s\S]{0,180}quantitySelection\?\.requestedQuantity[\s\S]{0,180}quantitySelection\.requestedQuantity > safeQuantity/,
    'requestedQuantity must be emitted only for a paid checkout that remains reduced',
  );
  assert.match(
    checkoutCardsSource,
    /Availability changed while you were checking out\./,
    'the affected paid form must show the automatic adjustment warning',
  );
});

test('existing multi-show presentation remains grouped by authoritative show coverage', () => {
  assert.match(checkoutCardsSource, /const coveredIds = new Set\(ticket\.showIds\)/);
  assert.match(checkoutCardsSource, /eventShows\.filter\(\(show\) => coveredIds\.has\(show\.id\)\)/);
  assert.match(checkoutCardsSource, /'Both Shows'/);
});


test('free RSVP uses the no-payment KVRS reservation endpoint with idempotency', () => {
  assert.match(
    checkoutCardsSource,
    /return `\$\{kvrsClientConfig\(\)\.baseUrl\}\/api\/reservations`;/,
  );
  assert.match(checkoutCardsSource, /reservationTypeId: ticket\?\.id \|\| null/);
  assert.match(checkoutCardsSource, /partySize: safeQuantity/);
  assert.match(checkoutCardsSource, /crypto\.randomUUID\(\)/);
  assert.match(checkoutCardsSource, /'Idempotency-Key': idempotencyKey/);
  assert.match(
    checkoutCardsSource,
    /freeReservation\s*\?\s*kvrsFreeReservationEndpoint\(\)\s*:\s*kvrsCheckoutEndpoint\(\)/,
    'free RSVP must choose the reservation endpoint instead of Stripe checkout',
  );
});

test('RSVP-only events can render a free reservation form without a ticket product', () => {
  assert.match(
    checkoutCardsSource,
    /event\.saleStatus === 'rsvp_only'[\s\S]{0,180}return \[null\]/,
  );
  assert.match(
    checkoutCardsSource,
    /event\.saleStatus === 'rsvp_only'[\s\S]{0,180}'Free RSVP'/,
  );
});


test('timed free RSVP requires an authoritative show selection even for event-scoped RSVP', () => {
  assert.match(
    checkoutCardsSource,
    /ticketScope !== 'SHOWS'[\s\S]{0,120}freeReservation[\s\S]{0,120}Boolean\(event\.shows\?\.length\)/,
  );
  assert.match(
    checkoutCardsSource,
    /return isFreeReservationChoice\(event, ticket\)\s*\? availableShows\s*:\s*\[\]/,
  );
  assert.match(
    checkoutCardsSource,
    /requiresShowSelection[\s\S]{0,220}!showId \|\| !selectableShows\.some/,
  );
});
