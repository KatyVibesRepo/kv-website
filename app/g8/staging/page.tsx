import { notFound } from 'next/navigation';
import { EventTicketCheckoutCards } from '@/components/EventTicketCheckoutCards';
import { g8PreviewAllowed, G8_FIXTURE_EVENT_ID, G8_FIXTURE_PRODUCT_ID } from '@/lib/g8PreviewClient';
import type { PublicEvent, PublicTicketType } from '@/lib/kvrsEvents';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reservations | Katy Vibes', robots: { index: false, follow: false } };

const syntheticTable: PublicTicketType = {
  id: G8_FIXTURE_PRODUCT_ID,
  name: 'Table of 8',
  publicLabel: 'Table of 8',
  description: 'Eight guest places. One table package.',
  type: 'table',
  priceCents: 8000,
  currency: 'USD',
  guestCount: 8,
  minQuantity: 1, maxQuantity: 1, quantityAvailable: 8,
  status: 'active', checkoutEnabled: true, scope: 'EVENT', showIds: [],
};
const pilotEvent: PublicEvent = {
  id: G8_FIXTURE_EVENT_ID, slug: 'g8-durable-staging',
  title: 'Reservation Experience', subtitle: null, shortTitle: null,
  shortDescription: null, fullDescription: null,
  // The synthetic staging page does not publish an actual event date.
  startsAt: '2026-10-13T18:00:00.000Z',
  endsAt: null, doorsAt: null, timezone: 'America/Chicago',
  shows: [], venueName: 'Katy Vibes', venueAddress: null,
  category: 'private', tags: [], featured: false,
  status: 'LIVE', visibility: 'PRIVATE', isTicketed: true,
  isReservationEnabled: true, isTableReservationEnabled: true,
  isFreeEvent: false, ageRestriction: null, coverText: null,
  priceDisplay: '$80', flyerImageUrl: null, flyerAlt: null,
  heroImageUrl: null, heroAlt: null, thumbnailImageUrl: null,
  thumbnailAlt: null, galleryImages: [], socialShareImageUrl: null,
  seoTitle: null, seoDescription: null, publicEventUrl: '',
  checkoutUrl: null, saleStatus: 'on_sale', ticketTypes: [syntheticTable],
};

export default function G8StagingPage() {
  if (!g8PreviewAllowed()) notFound();
  return (
    <section className="stack g8-staging-page">
      <div className="eyebrow">Reservation Testing</div>
      <h1>Explore reservation options</h1>
      <p className="muted">This page uses an isolated test event and test payments only. Do not enter real customer information.</p>
      <EventTicketCheckoutCards
        event={pilotEvent}
        ticketTypes={[syntheticTable]}
        previewMixedPayments
        g8PilotApproved
      />
    </section>
  );
}
