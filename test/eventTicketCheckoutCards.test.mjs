import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const checkoutCardsSource = await readFile(
  new URL('../components/EventTicketCheckoutCards.tsx', import.meta.url),
  'utf8',
);

test('show-scoped checkout submits the authoritative show ID', () => {
  assert.match(
    checkoutCardsSource,
    /showId:\s*showId \|\| null/,
    'checkout payload must carry the selected authoritative showId',
  );
  assert.match(
    checkoutCardsSource,
    /name="showId" value=\{selectableShows\[0\]\.id\}/,
    'single-show products must submit their only authoritative showId',
  );
  assert.match(
    checkoutCardsSource,
    /<select name="showId"[^>]*required/,
    'shared multi-show products must require a show selection',
  );
  assert.match(
    checkoutCardsSource,
    /coveredIds\.has\(show\.id\) && show\.transactionEnabled !== false/,
    'show choices must come only from authoritative product coverage and transaction-enabled event shows',
  );
});

test('non-GA paid products submit one inventory unit per checkout', () => {
  assert.match(
    checkoutCardsSource,
    /if \(!ticket \|\| !isGeneralAdmissionTicket\(ticket\)\) return 1;/,
    'table, VIP, patio, and other non-GA products must be fixed to quantity 1',
  );
  assert.match(
    checkoutCardsSource,
    /return isGeneralAdmissionTicket\(ticket\) && quantityMax\(ticket\) > quantityMin\(ticket\);/,
    'only GA products may expose a variable paid checkout quantity',
  );
});

test('existing multi-show presentation remains grouped by authoritative show coverage', () => {
  assert.match(checkoutCardsSource, /const coveredIds = new Set\(ticket\.showIds\)/);
  assert.match(checkoutCardsSource, /eventShows\.filter\(\(show\) => coveredIds\.has\(show\.id\)\)/);
  assert.match(checkoutCardsSource, /'Both Shows'/);
});
