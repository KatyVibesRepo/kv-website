import { NextResponse } from 'next/server';
import { g8PreviewAllowed, G8_STAGING_API_BASE } from '@/lib/g8PreviewClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const previewOrigin = 'https://kv-website-git-feat-g8-mixed-payment-preview-katy-vibes.vercel.app';
const idempotencyPattern = /^[A-Za-z0-9._:-]{16,160}$/;

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: {
    'Cache-Control': 'no-store',
    'Referrer-Policy': 'no-referrer',
  } });
}

export async function POST(req: Request) {
  if (!g8PreviewAllowed()) return json({ ok: false, message: 'Unavailable.' }, 404);
  const key = req.headers.get('idempotency-key') || '';
  if (!idempotencyPattern.test(key)) return json({ ok: false, message: 'Please retry your request.' }, 400);
  let body: unknown;
  try { body = await req.json(); }
  catch { return json({ ok: false, message: 'Please check the form and try again.' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body))
    return json({ ok: false, message: 'Please check the form and try again.' }, 400);
  const input = body as Record<string, unknown>;
  const text = (key: string) => typeof input[key] === 'string' ? String(input[key]).trim() : '';
  const size = Number(input.guestCount);
  if (!text('guestName') || !text('guestEmail') || !text('guestPhone') ||
      !/^\d{4}-\d{2}-\d{2}$/.test(text('reservationDate')) ||
      !/^\d{2}:\d{2}$/.test(text('reservationTime')) ||
      !Number.isInteger(size) || size < 1 || size > 100 ||
      typeof input.ticketedWarningAcknowledged !== 'boolean') {
    return json({ ok: false, message: 'Please complete the reservation information.' }, 400);
  }
  const payload = {
    eventId: null,
    reservationType: text('reservationType') || 'Dinner reservation',
    date: text('reservationDate'),
    time: text('reservationTime'),
    guestName: text('guestName'),
    guestEmail: text('guestEmail'),
    guestPhone: text('guestPhone'),
    partySize: size,
    seatingPreference: text('seatingPreference') || null,
    occasion: text('occasion') || null,
    bringingCake: false,
    notes: text('notes') || null,
    ticketedWarningAcknowledged: input.ticketedWarningAcknowledged === true,
  };
  try {
    const response = await fetch(G8_STAGING_API_BASE + '/api/public/reservations/request', {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(15000),
      headers: { Accept: 'application/json', 'Content-Type': 'application/json',
        Origin: previewOrigin, 'Idempotency-Key': key },
      body: JSON.stringify(payload),
    });
    const data: unknown = await response.json().catch(() => null);
    if (!data || typeof data !== 'object') return json({ ok: false, message: 'Reservation could not be submitted.' }, 503);
    const result = data as Record<string, unknown>;
    if (response.status === 409 && result.code === 'TICKETED_EVENT_ACK_REQUIRED') {
      return json({
        ok: false, code: 'TICKETED_EVENT_ACK_REQUIRED',
        message: 'Please review the ticketed-show admission notice before submitting.',
        warnings: Array.isArray(result.warnings) ? result.warnings : [],
      }, 409);
    }
    if (!response.ok || result.ok !== true) {
      return json({ ok: false, message: 'Reservation could not be submitted. Please try again.' },
        response.status >= 400 && response.status <= 599 ? response.status : 502);
    }
    return json({ ok: true,
      message: typeof result.message === 'string' ? result.message : 'Your request was received for review.',
    });
  } catch {
    return json({ ok: false, message: 'Reservation service is temporarily unavailable.' }, 503);
  }
}
