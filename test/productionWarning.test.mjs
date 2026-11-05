import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
async function route(file) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace("import { NextResponse } from 'next/server';", 'const NextResponse = { json: (body, options) => Response.json(body, options) };')
    .replace("import { getKvrsServerConfig } from '@/lib/kvrsServerConfig';",
      "const getKvrsServerConfig = () => ({publicApiBaseUrl:'https://admin.katyvibes.com/api/public',reservationRequestUrl:'https://admin.katyvibes.com/api/public/reservations/request'});");
  return import('data:text/javascript;base64,' + Buffer.from(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText).toString('base64'));
}
const reserve = await route('../app/api/reserve/route.ts');
const evaluate = await route('../app/api/reserve/ticketed-warning/route.ts');
test('Production warning evaluation forwards Chicago selection and fails closed on unavailable backend', async () => {
  const oldFetch = globalThis.fetch; let calls = 0;
  const selection = { date: '2026-11-21', time: '17:00', partySize: 4 };
  globalThis.fetch = async (url, init) => {
    calls++; assert.equal(url, 'https://admin.katyvibes.com/api/public/reservations/ticketed-warning/evaluate');
    assert.deepEqual(JSON.parse(init.body), selection); assert.equal(init.cache, 'no-store');
    return calls === 1 ? Response.json({ok:true,requiresAcknowledgment:true,warnings:[{title:'CC Rider Band'}]}) : new Response('', {status:503});
  };
  const request = () => new Request('https://kv-website-ten.vercel.app/api/reserve/ticketed-warning', {method:'POST',body:JSON.stringify(selection)});
  try {
    const ok = await evaluate.POST(request()); assert.equal(ok.status, 200); assert.equal((await ok.json()).requiresAcknowledgment, true);
    assert.equal((await evaluate.POST(request())).status, 503);
    assert.equal((await evaluate.POST(new Request(request(), {body:'{}'}))).status, 400);
    assert.equal(calls, 2);
  } finally { globalThis.fetch = oldFetch; }
});
test('Production dining returns 409 warning intact, never resubmits and sends only affirmative acknowledgment', async () => {
  const oldFetch = globalThis.fetch; const sent = [];
  const warnings = [{eventId:'cmw3ig99m0001pn6dotdqn40f',title:'CC Rider Band',startsAt:'2026-11-22T00:00:00.000Z'}];
  globalThis.fetch = async (url, init) => { sent.push(JSON.parse(init.body));
    return Response.json({ok:false,code:'TICKETED_EVENT_ACK_REQUIRED',warnings}, {status:409}); };
  const request = acknowledged => new Request('https://kv-website-ten.vercel.app/api/reserve', {method:'POST',
    headers:{'Idempotency-Key':'dining-warning-original-123'}, body:JSON.stringify({guestName:'Local Test',guestEmail:'local@example.test',
      guestPhone:'2815550100',reservationDate:'2026-11-21',reservationTime:'17:00',guestCount:4,ticketedWarningAcknowledged:acknowledged})});
  try {
    const response = await reserve.POST(request(false)); assert.equal(response.status, 409);
    assert.deepEqual((await response.json()).warnings, warnings); assert.equal(sent.length, 1);
    assert.equal(sent[0].ticketedWarningAcknowledged, false);
    await reserve.POST(request(true)); assert.equal(sent.length, 2); assert.equal(sent[1].ticketedWarningAcknowledged, true);
    await reserve.POST(request('true')); assert.equal(sent[2].ticketedWarningAcknowledged, false);
  } finally { globalThis.fetch = oldFetch; }
});
