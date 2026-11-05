import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const loaded = { exports: {} };
const compiled = ts.transpileModule(readFileSync(new URL('../components/CustomerShowCoverage.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText;
runInNewContext(compiled, { module: loaded, exports: loaded.exports,
  require: id => id.endsWith('.css') ? { row: 'row', notice: 'notice' } : require(id) });
const { CustomerShowCoverage } = loaded.exports;
const entries = [
  { showId: 'first', entryScopeKey: 'show:first', startsAt: '2026-10-24T23:00:00.000Z', endsAt: '2026-10-25T01:00:00.000Z' },
  { showId: 'second', entryScopeKey: 'show:second', startsAt: '2026-10-25T02:00:00.000Z', endsAt: '2026-10-25T04:00:00.000Z' },
];
const scope = { contract: 'kvrs.m1.show-coverage.v1', type: 'SHOWS', selection: 'ALL_LINKED_SHOWS', entries,
  reservationStartsAt: entries[0].startsAt, salesCutoffAt: entries[0].startsAt, departureRequiredBefore: null };
const render = props => renderToStaticMarkup(React.createElement(CustomerShowCoverage, props));

test('combo display separates show check-ins while retaining the original guest count', () => {
  const html = render({ scope, admissions: entries.map(entry => ({ entryScopeKey: entry.entryScopeKey, guestUnits: 4, admitted: 2, remainingCovered: 2 })) });
  assert.match(html, /Includes both shows/);
  assert.equal((html.match(/Checked in by staff: 2 of 4 guests/g) || []).length, 2);
  assert.doesNotMatch(html, /of 8 guests/);
  assert.match(html, /Each show requires its own staff check-in/);
  assert.match(html, /6:00 PM Central/);
  assert.match(html, /9:00 PM Central/);
});

test('first-only departure uses the next show start without promising automatic table release', () => {
  const html = render({ scope: { ...scope, selection: 'SELECTED_SHOW', entries: [entries[0]], departureRequiredBefore: entries[1].startsAt } });
  assert.match(html, /Please leave before/);
  assert.match(html, /9:00 PM Central/);
  assert.match(html, /separately purchase an available ticket for the next show/);
  assert.doesNotMatch(html, /automatically|Includes both shows|Checked in by staff/);
});

test('second-only display uses its actual edited time and independent sales cutoff', () => {
  const edited = { ...entries[1], startsAt: '2026-10-25T02:30:00.000Z' };
  const html = render({ scope: { ...scope, selection: 'SELECTED_SHOW', entries: [edited], reservationStartsAt: edited.startsAt, salesCutoffAt: edited.startsAt } });
  assert.match(html, /9:30 PM Central/);
  assert.doesNotMatch(html, /6:00 PM Central|Please leave before/);
});

const timingModule = { exports: {} };
runInNewContext(ts.transpileModule(readFileSync(new URL('../components/CustomerPaymentTiming.tsx', import.meta.url), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText, { module: timingModule, exports: timingModule.exports, require });

test('payment display separates reservation initiation deadline from original provider expiration', () => {
  const html = renderToStaticMarkup(React.createElement(timingModule.exports.CustomerPaymentTiming, {
    timing: { contract: 'kvrs.m1.reservation-payment-timing.v1', anchor: 'RESERVATION_START',
      newPaymentDeadline: '2026-10-24T23:00:00.000Z', inFlightCompletion: 'ORIGINAL_PREPARED_CHECKOUT_ONLY' },
    providerExpiresAt: '2026-10-24T23:31:00.000Z',
  }));
  assert.match(html, /Start a new payment before your reservation time/);
  assert.match(html, /6:00 PM Central/);
  assert.match(html, /Original Checkout expires/);
  assert.match(html, /6:31 PM Central/);
  assert.match(html, /original Checkout afterward/);
  assert.match(html, /does not extend the deadline/);
  assert.doesNotMatch(html, /60 minutes|null minutes|RESERVATION_CREATED/);
});
