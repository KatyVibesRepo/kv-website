import { NextResponse } from 'next/server';
import { getKvrsServerConfig } from '@/lib/kvrsServerConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: {
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
  } });
}

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); }
  catch { return json({ ok: false, error: 'Please check the date, time and guest count.' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ ok: false, error: 'Invalid request.' }, 400);
  const input = body as Record<string, unknown>;
  if (Object.keys(input).sort().join(',') !== 'date,partySize,time' ||
      typeof input.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
      typeof input.time !== 'string' || !/^\d{2}:\d{2}$/.test(input.time) ||
      !Number.isInteger(input.partySize) || Number(input.partySize) < 1 || Number(input.partySize) > 100)
    return json({ ok: false, error: 'Please select a valid date, time and guest count.' }, 400);
  try {
    const response = await fetch(getKvrsServerConfig().publicApiBaseUrl + '/reservations/ticketed-warning/evaluate', {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(12000),
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok || !data || typeof data !== 'object' ||
        !('ok' in data) || data.ok !== true ||
        !('warnings' in data) || !Array.isArray(data.warnings)) {
      return json({ ok: false, error: 'Ticket admission requirements cannot be verified right now.' }, 503);
    }
    return json(data);
  } catch {
    return json({ ok: false, error: 'Ticket admission requirements cannot be verified right now.' }, 503);
  }
}
