import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [middleware, handler, checkout, api] = await Promise.all([
  '../middleware.ts',
  '../components/G8CheckoutReturn.tsx',
  '../components/EventTicketCheckoutCards.tsx',
  '../lib/g8PreviewClient.ts',
].map((name) => readFile(new URL(name, import.meta.url), 'utf8')));

test('Stripe TEST legacy root callback is redirected to isolated G8 return only on preview', () => {
  assert.match(middleware, /process\.env\.VERCEL_ENV === 'preview'/);
  assert.match(middleware, /process\.env\.NODE_ENV === 'development'/);
  assert.match(middleware, /request\.nextUrl\.pathname === '\/'/);
  assert.match(middleware, /searchParams\.has\('g8Checkout'\)/);
  assert.match(middleware, /destination\.pathname = '\/g8\/return'/);
  assert.match(middleware, /destination\.search = ''/);
  assert.match(middleware, /NextResponse\.redirect\(destination, 307\)/);
  assert.match(middleware, /matcher: \['\/'\]/);
  assert.match(middleware, /return NextResponse\.next\(\)/);
});

test('return restores same-tab token fragment and never claims paid admission', () => {
  assert.match(handler, /takeCheckoutReturn\(\)/);
  assert.match(handler, /window\.location\.replace\(g8Link\(handoff\.ref, handoff\.token\)\)/);
  assert.match(handler, /Payments are only confirmed when they appear in your reservation status/);
  assert.match(api, /window\.sessionStorage\.removeItem\(handoffKey\)/);
  assert.match(api, /#access=/);
});

test('G8 return does not modify established full-checkout endpoint', () => {
  assert.match(checkout, /freeReservation\s*\?\s*kvrsFreeReservationEndpoint\(\)\s*:\s*kvrsCheckoutEndpoint\(\)/);
  assert.match(checkout, /if \(isG8Fixture\(event\.id\)\)/);
});
