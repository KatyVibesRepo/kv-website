import { NextResponse } from 'next/server';

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

function kvrsBaseUrl() {
  return (
    process.env.KVRS_URL ||
    process.env.KVRS_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_KVRS_URL ||
    process.env.NEXT_PUBLIC_KVRS_BASE_URL ||
    'http://localhost:3001'
  ).replace(/\/$/, '');
}

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
  return Math.max(1, Math.min(500, Math.round(numeric)));
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

  if (!guestName) return jsonError('Please enter your name.');
  if (!guestEmail) return jsonError('Please enter your email.');
  if (!guestPhone) return jsonError('Please enter your phone number.');
  if (!reservationDate) return jsonError('Please choose a reservation date.');
  if (!reservationTime) return jsonError('Please choose a reservation time.');

  const payload = {
    guestName,
    guestEmail,
    guestPhone,
    reservationDate,
    reservationTime,
    guestCount,
    reservationType: cleanOptionalString(body.reservationType) || 'General Reservation',
    eventId: cleanOptionalString(body.eventId),
    seatingPreference: cleanOptionalString(body.seatingPreference),
    occasion: cleanOptionalString(body.occasion),
    notes: cleanOptionalString(body.notes),
  };

  try {
    const response = await fetch(`${kvrsBaseUrl()}/api/public/reservations/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
      const message =
        data && typeof data === 'object' && 'message' in data && typeof (data as { message?: unknown }).message === 'string'
          ? (data as { message: string }).message
          : 'We could not submit your request right now. Please call Katy Vibes at 832-437-2807.';

      return jsonError(message, response.status >= 400 && response.status < 600 ? response.status : 502);
    }

    return NextResponse.json({
      ok: true,
      message: 'Your reservation request was received. Our team will review it and follow up to confirm.',
      data,
    });
  } catch {
    return jsonError('The reservation system is temporarily unavailable. Please call Katy Vibes at 832-437-2807.', 503);
  }
}
