import { NextRequest, NextResponse } from 'next/server';
import { getKvrsServerConfig } from '@/lib/kvrsServerConfig';

type Payload = {
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  eventDate?: string;
  guestCount?: number | null;
  occasion?: string;
  serviceType?: string;
  eventLocation?: string;
  budgetRange?: string;
  menuRequests?: string;
  details?: string;
};

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}
export async function POST(request: NextRequest) {
  let raw: Payload;
  try {
    const length = Number(request.headers.get('content-length') || 0);
    if (length > 16000) {
      return NextResponse.json({ ok: false, error: 'Request is too large.' }, { status: 413 });
    }
    raw = await request.json() as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: 'Please check the form and try again.' }, { status: 400 });
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ ok: false, error: 'Please check the form and try again.' }, { status: 400 });
  }
  const contactName = clean(raw.contactName);
  const contactPhone = clean(raw.contactPhone);
  const details = clean(raw.details);
  const contactEmail = clean(raw.contactEmail);
  if (contactName.length < 2 || contactName.length > 160) {
    return NextResponse.json({ ok: false, error: 'Please enter your name.' }, { status: 400 });
  }
  if (contactPhone.length < 7 || contactPhone.length > 40) {
    return NextResponse.json({ ok: false, error: 'Please enter your phone number.' }, { status: 400 });
  }
  if (details.length < 10 || details.length > 4000) {
    return NextResponse.json({ ok: false, error: 'Please include more details about your catering request.' }, { status: 400 });
  }
  if (contactEmail && !/^\S+@\S+\.\S+$/.test(contactEmail)) {
    return NextResponse.json({ ok: false, error: 'Please enter a valid email address.' }, { status: 400 });
  }
  const payload = {
    contactName,
    contactPhone,
    contactEmail,
    eventDate: clean(raw.eventDate),
    guestCount: raw.guestCount ?? null,
    occasion: clean(raw.occasion),
    serviceType: clean(raw.serviceType) || 'UNDECIDED',
    eventLocation: clean(raw.eventLocation),
    budgetRange: clean(raw.budgetRange),
    menuRequests: clean(raw.menuRequests),
    details,
  };
  try {
    const response = await fetch(getKvrsServerConfig().cateringRequestsUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json().catch(() => null) as { ok?: boolean; requestId?: string; error?: string } | null;
    if (!response.ok || !result?.ok) {
      return NextResponse.json({
        ok: false,
        error: result?.error || 'We could not submit your catering request. Please try again.',
      }, { status: response.status >= 400 && response.status < 600 ? response.status : 502 });
    }
    return NextResponse.json({ ok: true, requestId: result.requestId || null });
  } catch {
    return NextResponse.json({
      ok: false, error: 'We could not reach the catering request system. Please try again shortly or call Katy Vibes.',
    }, { status: 502 });
  }
}
