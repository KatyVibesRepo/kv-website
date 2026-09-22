import { NextResponse } from 'next/server';
import { getPublicEvent } from '@/lib/kvrsEvents';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function noStoreJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');

  return NextResponse.json(body, {
    ...init,
    headers,
  });
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { slug } = await params;
  const event = await getPublicEvent(slug);

  if (!event) {
    return noStoreJson(
      {
        ok: false,
        error: 'event_not_found',
      },
      { status: 404 },
    );
  }

  return noStoreJson({
    ok: true,
    eventId: event.id,
    saleStatus: event.saleStatus,
    ticketTypes: (event.ticketTypes || []).map((ticket) => ({
      id: ticket.id,
      minQuantity: ticket.minQuantity,
      maxQuantity: ticket.maxQuantity,
      quantityAvailable: ticket.quantityAvailable,
      availabilityStatus: ticket.availabilityStatus || null,
      status: ticket.status,
      checkoutEnabled: ticket.checkoutEnabled !== false,
      action: ticket.action
        ? {
            enabled: ticket.action.enabled !== false,
            status: ticket.action.status || null,
            reason: ticket.action.reason || null,
          }
        : null,
    })),
  });
}
