import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const localKvrsBaseUrl = 'http://localhost:3001';

function kvrsOrderLookupEndpoint() {
  const explicit =
    process.env.KVRS_ORDER_LOOKUP_URL ||
    process.env.NEXT_PUBLIC_KVRS_ORDER_LOOKUP_URL ||
    process.env.NEXT_PUBLIC_KVRS_ORDERS_BY_SESSION_URL;

  if (explicit?.trim()) {
    return explicit.trim().replace(/\/+$/, '');
  }

  const base =
    process.env.KVRS_BASE_URL ||
    process.env.KVRS_URL ||
    process.env.NEXT_PUBLIC_KVRS_BASE_URL ||
    process.env.NEXT_PUBLIC_KVRS_URL ||
    localKvrsBaseUrl;

  return `${base.trim().replace(/\/+$/, '')}/api/orders/by-session`;
}

function noStoreJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  return NextResponse.json(body, { ...init, headers });
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')?.trim();

  if (!sessionId) {
    return noStoreJson(
      { ok: false, error: 'missing_session_id', message: 'Missing checkout session information.' },
      { status: 400 },
    );
  }

  const lookupUrl = new URL(kvrsOrderLookupEndpoint());
  lookupUrl.searchParams.set('session_id', sessionId);
  lookupUrl.searchParams.set('_', String(Date.now()));

  try {
    const response = await fetch(lookupUrl.toString(), {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    const text = await response.text();
    let data: unknown = null;

    if (text.trim()) {
      try {
        data = JSON.parse(text);
      } catch {
        data = {
          ok: false,
          error: 'invalid_kvrs_response',
          message: 'The ticket wallet service returned an unreadable response.',
        };
      }
    }

    return noStoreJson(data ?? { ok: false, error: 'empty_kvrs_response' }, {
      status: response.status,
    });
  } catch (error) {
    return noStoreJson(
      {
        ok: false,
        error: 'kvrs_order_lookup_unavailable',
        message: 'The ticket wallet service is not available yet. Please refresh this page in a moment.',
      },
      { status: 502 },
    );
  }
}
