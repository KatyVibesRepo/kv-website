import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const load = file => readFile(new URL('../' + file, import.meta.url), 'utf8');
const [form, page, legacy, evalRoute, stageRoute, stagingApi] = await Promise.all([
  'components/ReserveRequestForm.tsx', 'app/reserve/page.tsx',
  'app/api/reserve/route.ts', 'app/api/g8/ticketed-warning/evaluate/route.ts',
  'app/api/g8/reserve/route.ts', 'lib/g8PreviewClient.ts',
].map(load));

test('authoritative warning evaluation stays isolated on Website preview', () => {
  assert.match(page, /stagingWarningEnabled=\{process\.env\.VERCEL_ENV === 'preview' \|\| process\.env\.NODE_ENV === 'development'\}/);
  assert.match(form, /fetch\('\/api\/g8\/ticketed-warning\/evaluate'/);
  assert.match(form, /selectionKey: key, status: 'ready'/);
  assert.match(form, /needsAcknowledgment && !acknowledgedTicketNotice/);
  assert.match(form, /key === 'guestCount'\) setAcknowledgedTicketNotice\(false\)/);
  assert.match(form, /response\.status === 409 && data\?\.code === 'TICKETED_EVENT_ACK_REQUIRED'/);
  assert.match(form, /setAcknowledgedTicketNotice\(false\)/);
  assert.match(form, /ticketedWarningAcknowledged: needsAcknowledgment && acknowledgedTicketNotice/);
  assert.match(form, /fetch\(stagingWarningEnabled \? '\/api\/g8\/reserve' : '\/api\/reserve'/);
  assert.match(form, /!evaluated \|\| evaluated\.status !== 'ready'/);
  assert.match(form, /AbortController\(\)/);
});
test('staging proxy hard-pins staging origin and forwards authoritative warning state', () => {
  assert.match(evalRoute, /if \(!g8PreviewAllowed\(\)\)/);
  assert.match(evalRoute, /G8_STAGING_API_BASE \+ '\/api\/public\/reservations\/ticketed-warning\/evaluate'/);
  assert.match(evalRoute, /Cache-Control': 'no-store'/);
  assert.match(stageRoute, /if \(!g8PreviewAllowed\(\)\)/);
  assert.match(stageRoute, /G8_STAGING_API_BASE \+ '\/api\/public\/reservations\/request'/);
  assert.match(stageRoute, /ticketedWarningAcknowledged: input\.ticketedWarningAcknowledged === true/);
  assert.match(stageRoute, /result\.code === 'TICKETED_EVENT_ACK_REQUIRED'/);
  assert.match(stageRoute, /response\.status === 409/);
  assert.doesNotMatch(stageRoute + evalRoute, /admin\.katyvibes\.com/);
  assert.match(stagingApi, /G8_STAGING_API_BASE = 'https:\/\/kv-reservationservice-git-staging-g8-mixed-admission-katy-vibes\.vercel\.app'/);
});
test('legacy production dining reservations and full checkout stay unchanged', () => {
  assert.doesNotMatch(legacy, /G8_STAGING_API_BASE|ticketedWarningAcknowledged|kv-reservationservice-git-staging/);
  assert.match(legacy, /getKvrsServerConfig\(\)\.reservationRequestUrl/);
  assert.match(legacy, /bringingCake: false/);
  assert.match(form, /ticketedWindows = \[\]/);
  assert.match(form, /stagingWarningEnabled = false/);
});
