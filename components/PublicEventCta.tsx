import type { PublicEvent, PublicSaleStatus } from '@/lib/kvrsEvents';

function labelForSaleStatus(status: PublicSaleStatus, event: PublicEvent) {
  if (status === 'on_sale') {
    if (event.ticketSummary?.hasTables || event.isTableReservationEnabled) return 'Tickets & Tables';
    return 'Buy Tickets';
  }

  if (status === 'rsvp_only') return 'Reserve Your Spot';
  if (status === 'free_entry') return 'Plan Your Visit';
  if (status === 'sold_out') return 'Sold Out';
  if (status === 'coming_soon') return 'Coming Soon';
  if (status === 'sales_closed') return 'Sales Closed';
  if (status === 'canceled') return 'Canceled';
  if (status === 'postponed') return 'Postponed';

  return 'View Details';
}

function canOpenEventDetails(status: PublicSaleStatus) {
  return status === 'on_sale' || status === 'rsvp_only' || status === 'free_entry';
}

function eventActionHref(event: PublicEvent) {
  if (event.saleStatus === 'on_sale') return `/events/${event.slug}#event-ticket-options`;
  return `/events/${event.slug}`;
}

export function saleStatusLabel(status: PublicSaleStatus) {
  return status.replace(/_/g, ' ');
}

export function PublicEventCta({
  event,
  className = 'button hot',
}: {
  event: PublicEvent;
  className?: string;
}) {
  const label = labelForSaleStatus(event.saleStatus, event);

  if (canOpenEventDetails(event.saleStatus)) {
    return (
      <a className={className} href={eventActionHref(event)}>
        {label}
      </a>
    );
  }

  return (
    <span className={`${className} disabled-button`} aria-disabled="true">
      {label}
    </span>
  );
}
