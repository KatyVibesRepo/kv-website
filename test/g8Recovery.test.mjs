import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const [api, page, recovery] = await Promise.all([
  '../lib/g8PreviewClient.ts', '../components/G8ReservationPage.tsx',
  '../components/G8RecoveryPanel.tsx'
].map(p => readFile(new URL(p, import.meta.url), 'utf8')));

test('lost-link request and verification stay on isolated staging and never send bearer in query', () => {
  assert.match(api, /g8RecoverRequest\(ref: string, email: string\)/);
  assert.match(api, /g8RecoverVerify\(ref: string, email: string, proof: string\)/);
  assert.match(api, /'\/api\/public\/m1\/recover\/request'/);
  assert.match(api, /'\/api\/public\/m1\/recover\/verify'/);
  assert.match(recovery, /g8RecoverRequest\(reservationRef, email\.trim\(\)\)/);
  assert.match(recovery, /g8RecoverVerify\(reservationRef, email\.trim\(\), proof\.trim\(\)\)/);
  assert.match(recovery, /window\.location\.replace\(g8Link\(reservationRef, result\.customerAccessToken\)\)/);
  assert.match(api, /#access=/);
  assert.doesNotMatch(recovery, /localStorage|sessionStorage|document\.cookie|token=/);
});

test('revoked or expired customer access clears prior private status', () => {
  assert.match(page, /error\.httpStatus === 401 \|\| error\.httpStatus === 404/);
  assert.match(page, /setStatus\(null\);\s*setAccessToken\(''\)/);
  assert.match(page, /!accessToken && !status/);
  assert.match(page, /<G8RecoveryPanel reservationRef=\{reservationRef\}/);
  assert.match(recovery, /Recovering access replaces your previous link/);
});
