import { NextResponse } from 'next/server';
import { getKvrsServerConfig } from '@/lib/kvrsServerConfig';

export const runtime = 'nodejs';

type ReservationRequestPayload = {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  reservationDate?: string;
  reservationTime?: string;
  guestCount?: number | string;
  reservationType?: string;
  eventId?: string;
  seatingPreference?: string;
  occasion?: string;
  notes?: string;
};

function cleanString(value: unknown) {
  if (typeof value !== 'string') return '';
  return value.trim();
}

function cleanOptionalString(value: unknown) {
  const cleaned = cleanString(value);
  return cleaned.length ? cleaned : undefined;
}

function cleanGuestCount(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 1;
  return Math.max(1, Math.min(100, Math.round(numeric)));
}

const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9._:-]{16,160}$/;

function cleanIdempotencyKey(request: Request) {
  const key = request.headers.get('idempotency-key')?.trim() || '';
  return IDEMPOTENCY_KEY_PATTERN.test(key) ? key : '';
}

function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(request: Request) {
  let body: ReservationRequestPayload;

  try {
    body = await request.json();
  } catch {
    return jsonError('Please check the form and try again.');
  }

  const guestName = cleanString(body.guestName);
  const guestEmail = cleanString(body.guestEmail);
  const guestPhone = cleanString(body.guestPhone);
  const reservationDate = cleanString(body.reservationDate);
  const reservationTime = cleanString(body.reservationTime);
  const guestCount = cleanGuestCount(body.guestCount);
  const idempotencyKey = cleanIdempotencyKey(request);

  if (!guestName) return jsonError('Please enter your name.');
  if (!guestEmail) return jsonError('Please enter your email.');
  if (!guestPhone) return jsonError('Please enter your phone number.');
  if (!reservationDate) return jsonError('Please choose a reservation date.');
  if (!reservationTime) return jsonError('Please choose a reservation time.');
  if (!idempotencyKey) {
    return jsonError('Please retry your reservation request from the form.', 400);
  }

  const payload = {
    eventId: cleanOptionalString(body.eventId) || null,
    reservationType:
      cleanOptionalString(body.reservationType)
      || 'General reservation',
    date: reservationDate,
    time: reservationTime,
    guestName,
    guestEmail,
    guestPhone,
    partySize: guestCount,
    seatingPreference: cleanOptionalString(body.seatingPreference) || null,
    occasion: cleanOptionalString(body.occasion) || null,
    bringingCake: false,
    notes: cleanOptionalString(body.notes) || null,
  };

  try {
    const response = await fetch(getKvrsServerConfig().reservationRequestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    let data: unknown = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const errorMessage =
        data
        && typeof data === 'object'
        && 'error' in data
        && typeof (data as { error?: unknown }).error === 'string'
          ? (data as { error: string }).error
          : null;
      const legacyMessage =
        data
        && typeof data === 'object'
        && 'message' in data
        && typeof (data as { message?: unknown }).message === 'string'
          ? (data as { message: string }).message
          : null;

      return jsonError(
        errorMessage
        || legacyMessage
        || 'We could not submit your request right now. Please call Katy Vibes at 832-437-2807.',
        response.status >= 400 && response.status < 600
          ? response.status
          : 502,
      );
    }

    const successMessage =
      data
      && typeof data === 'object'
      && 'message' in data
      && typeof (data as { message?: unknown }).message === 'string'
        ? (data as { message: string }).message
        : 'Your reservation request was received. Our team will review it and follow up to confirm.';

    return NextResponse.json({
      ok: true,
      message: successMessage,
      data,
    });
  } catch {
    return jsonError('The reservation system is temporarily unavailable. Please call Katy Vibes at 832-437-2807.', 503);
  }
}
