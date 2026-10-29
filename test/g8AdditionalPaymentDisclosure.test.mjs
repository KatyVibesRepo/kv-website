import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const checkout = await readFile(
  new URL('../components/EventTicketCheckoutCards.tsx', import.meta.url),
  'utf8',
);
const planner = await readFile(
  new URL('../components/MixedPaymentPlanner.tsx', import.meta.url),
  'utf8',
);
const styles = await readFile(
  new URL('../app/styles.css', import.meta.url),
  'utf8',
);
const detail = await readFile(
  new URL('../app/events/[slug]/page.tsx', import.meta.url),
  'utf8',
);

test('ticket cards default to their existing compact full-checkout layout', () => {
  assert.match(checkout, /<form className="ticket-purchase-form"/);
  assert.match(checkout, /: buttonLabel\(event, ticket\)/);
  assert.doesNotMatch(checkout, /Pay in Full — Secure Checkout/);
  assert.doesNotMatch(checkout, /ticket-purchase-coverage-note/);
  assert.match(checkout, /<\/form>[\s\S]*?Additional Payment Options/);
});

test('additional payment controls are collapsed by default and independently toggled', () => {
  assert.match(checkout, /const \[additionalPaymentOpen, setAdditionalPaymentOpen\] = useState<Record<string, boolean>>\(\{\}\)/);
  assert.match(checkout, /aria-expanded=\{Boolean\(additionalPaymentOpen\[key\]\)\}/);
  assert.match(checkout, /onClick=\{\(\) => \{/);
  assert.match(checkout, /setAdditionalPaymentOpen\(\(current\) => \(\{/);
  assert.match(checkout, /hidden=\{!additionalPaymentOpen\[key\]\}/);
  assert.match(checkout, /additionalPaymentOpen\[key\] && \([\s\S]*?<MixedPaymentPlanner/);
  assert.match(styles, /\.ticket-additional-payment-panel\[hidden\]\s*\{\s*display: none !important;/);
});

test('additional payment controls do not submit payment or alter legacy checkout', () => {
  assert.match(checkout, /freeReservation\s*\? kvrsFreeReservationEndpoint\(\)\s*:\s*kvrsCheckoutEndpoint\(\)/);
  assert.match(checkout, /ticketTypeId: ticket\?\.id/);
  assert.match(checkout, /quantity: safeQuantity/);
  assert.match(checkout, /selectedPaymentMode === 'at_door' \|\| selectedPaymentMode === 'guest_split'/);
  assert.match(checkout, /Never send alternative payment selections through production full checkout/);
  assert.match(checkout, /!g8PilotApproved \|\| !isG8Fixture\(event\.id, ticket\?\.id\)/);
  assert.match(checkout, /isG8Fixture\(event\.id\)/);
  assert.match(checkout, /const quote = await g8Quote\(choice, onlineGuests, choice === 'PACKAGE_INSTALLMENT' \? ticket.priceCents : undefined\)/);
  assert.match(checkout, /await g8Create\(quote\.quoteToken, choice, contact, stableId\)/);
  assert.doesNotMatch(planner, /fetch\(/);
  assert.doesNotMatch(planner, /<form\b/);
});

test('eligible alternative choices stay within the initial one-unit G8 contract', () => {
  assert.match(planner, /const singleUnit = quantity === 1;/);
  assert.match(planner, /const canSplitGuests = isTable && singleUnit && guests > 1;/);
  assert.match(planner, /const canPayAtDoor = singleUnit;/);
  assert.match(planner, /Pay Individually/);
  assert.match(planner, /Pay at Door/);
  assert.doesNotMatch(planner, /Partial Table Payment|installment|PACKAGE_INSTALLMENTS/i);
  assert.doesNotMatch(checkout, /installmentAmounts|onInstallmentAmountChange/);
});

test('production never renders preview-only alternative payment controls', () => {
  assert.match(detail, /process\.env\.NODE_ENV === 'development' \|\| process\.env\.VERCEL_ENV === 'preview'/);
  assert.match(checkout, /previewMixedPayments && ticket && !freeReservation/);
  assert.doesNotMatch(planner, /These options can&apos;t be booked online yet/);
  assert.doesNotMatch(planner, /These options can't be booked online yet/);
  assert.doesNotMatch(planner, /KVRS will|development|debug|prototype|preview-only|No payment or hold is created here/i);
  assert.doesNotMatch(checkout, /missing its KVRS|missing a selectable ticket type/);
  assert.match(checkout, /selectedPaymentMode === 'at_door'\s*\? 'Reserve Tickets'/);
  assert.match(checkout, /if \(additionalPaymentOpen\[key\]\)/);
  assert.match(checkout, /delete next\[key\]/);
  assert.doesNotMatch(checkout, /guest_split'\s*\? 'Reserve Tickets'/);
});
