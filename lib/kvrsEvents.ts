export type PublicSaleStatus =
  | 'on_sale'
  | 'coming_soon'
  | 'sold_out'
  | 'sales_closed'
  | 'canceled'
  | 'postponed'
  | 'free_entry'
  | 'rsvp_only';

export type PublicFlyerImageKey =
  | 'default'
  | 'portrait'
  | 'square'
  | 'tall'
  | 'wide'
  | 'landscape';

export type PublicFlyerImages = Partial<Record<PublicFlyerImageKey, string | null>>;

export type PublicTicketSummary = {
  isTicketed: boolean;
  saleStatus: PublicSaleStatus;
  priceDisplay: string | null;
  lowestPriceCents: number;
  hasTables: boolean;
  hasVip: boolean;
  checkoutUrl: string | null;
};

export type PublicTicketAction = {
  label?: string | null;
  url?: string | null;
  enabled?: boolean;
  status?: string | null;
  reason?: string | null;
};

export type PublicTicketType = {
  id: string;
  name: string;
  publicLabel: string;
  description: string;
  type: 'general_admission' | 'table' | 'vip_table' | 'patio' | 'free_rsvp' | 'other';
  priceCents: number;
  currency: string;
  guestCount: number;
  minQuantity: number;
  maxQuantity: number;
  quantityAvailable: number;
  status: string;
  checkoutEnabled?: boolean;
  checkoutUrl?: string | null;
  actionLabel?: string | null;
  action?: PublicTicketAction | null;
};

export type PublicWebsiteButtons = {
  products?: PublicTicketType[] | null;
  ticketTypes?: PublicTicketType[] | null;
};

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  shortTitle: string | null;
  shortDescription: string | null;
  fullDescription: string | null;
  startsAt: string;
  endsAt: string | null;
  doorsAt: string | null;
  timezone: string;
  venueName: string;
  venueAddress: string | null;
  category: string;
  tags: string[];
  featured: boolean;
  status: string;
  visibility: string;
  isTicketed: boolean;
  isReservationEnabled: boolean;
  isTableReservationEnabled: boolean;
  isFreeEvent: boolean;
  ageRestriction: string | null;
  coverText: string | null;
  priceDisplay: string | null;
  flyerImages?: PublicFlyerImages | null;
  flyerImageUrl: string | null;
  flyerAlt: string | null;
  heroImageUrl: string | null;
  heroAlt: string | null;
  thumbnailImageUrl: string | null;
  thumbnailAlt: string | null;
  galleryImages: string[];
  socialShareImageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  publicEventUrl: string;
  checkoutUrl: string | null;
  saleStatus: PublicSaleStatus;
  ticketSummary?: PublicTicketSummary;
  ticketTypes?: PublicTicketType[];
  products?: PublicTicketType[];
  websiteButtons?: PublicWebsiteButtons | null;
};

export type PublicCalendarEvent = {
  id: string;
  slug: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  category: string;
  status: string;
  flyerImages?: PublicFlyerImages | null;
  thumbnailImageUrl: string | null;
  isTicketed: boolean;
  saleStatus: PublicSaleStatus;
  publicEventUrl: string;
  checkoutUrl: string | null;
};

export type PublicCalendarDay = {
  date: string;
  events: PublicCalendarEvent[];
};

type EventsResponse = {
  ok: boolean;
  events?: PublicEvent[];
};

type EventResponse = {
  ok: boolean;
  event?: PublicEvent;
};

type CalendarResponse = {
  ok: boolean;
  month: string | null;
  timezone: string;
  days?: PublicCalendarDay[];
};

export type PublicEventsQuery = {
  limit?: number;
  includePast?: boolean;
};

const flyerImageKeys: PublicFlyerImageKey[] = [
  'default',
  'portrait',
  'square',
  'tall',
  'wide',
  'landscape',
];

const flyerVariantFallbacks: Record<PublicFlyerImageKey, PublicFlyerImageKey[]> = {
  default: ['default', 'square', 'tall', 'portrait', 'landscape', 'wide'],
  portrait: ['portrait', 'tall', 'default', 'square', 'landscape', 'wide'],
  square: ['square', 'default', 'tall', 'portrait', 'landscape', 'wide'],
  tall: ['tall', 'portrait', 'default', 'square', 'landscape', 'wide'],
  wide: ['wide', 'landscape', 'default', 'square', 'tall', 'portrait'],
  landscape: ['landscape', 'wide', 'default', 'square', 'tall', 'portrait'],
};

const fallbackKvrsBaseUrl =
  process.env.NEXT_PUBLIC_KVRS_URL ||
  process.env.NEXT_PUBLIC_KVRS_BASE_URL ||
  'http://localhost:3001';

const kvrsUploadAssetPathPattern = /^\/uploads\/(?:events-manager|site-media)\//;

function cleanBaseUrl(value: string) {
  return value.replace(/\/$/, '');
}

function baseUrlFromPublicApi(value?: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    url.pathname = url.pathname.replace(/\/api\/public\/?$/, '').replace(/\/$/, '');
    url.search = '';
    url.hash = '';
    return cleanBaseUrl(url.toString());
  } catch {
    return null;
  }
}

export function kvrsBaseUrl() {
  return cleanBaseUrl(fallbackKvrsBaseUrl);
}

function isWebsiteLocalhostBase(value: string) {
  try {
    const url = new URL(value);
    return (url.hostname === 'localhost' || url.hostname === '127.0.0.1') && url.port === '3000';
  } catch {
    return false;
  }
}

export function kvrsAssetBaseUrl() {
  const configuredBase = cleanBaseUrl(
    process.env.NEXT_PUBLIC_KVRS_URL || process.env.NEXT_PUBLIC_KVRS_BASE_URL || ''
  );

  return (
    (configuredBase && !isWebsiteLocalhostBase(configuredBase) ? configuredBase : null) ||
    baseUrlFromPublicApi(process.env.KVRS_PUBLIC_API_BASE_URL) ||
    baseUrlFromPublicApi(process.env.NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL) ||
    kvrsBaseUrl()
  );
}

export function kvrsApiBaseUrl() {
  return cleanBaseUrl(
    process.env.KVRS_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL ||
      `${kvrsBaseUrl()}/api/public`
  );
}

function buildQuery(options: PublicEventsQuery = {}) {
  const params = new URLSearchParams();

  if (options.limit && options.limit > 0) {
    params.set('limit', String(options.limit));
  }

  if (options.includePast) {
    params.set('includePast', 'true');
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export function resolveKvrsAssetUrl(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  // Event flyers and admin site-media uploads live in KVRS, even when older KVRS
  // records accidentally stored them with the public website's localhost:3000 origin.
  const assetBaseUrl = kvrsAssetBaseUrl();

  try {
    const url = new URL(trimmed);
    const isKnownKvrsUpload = kvrsUploadAssetPathPattern.test(url.pathname);

    if (isKnownKvrsUpload) {
      return `${assetBaseUrl}${url.pathname}${url.search}`;
    }

    return trimmed;
  } catch {
    if (trimmed.startsWith('/')) return `${assetBaseUrl}${trimmed}`;
    return trimmed;
  }
}

function normalizeFlyerImages(images?: PublicFlyerImages | null): PublicFlyerImages {
  const normalized: PublicFlyerImages = {};

  for (const key of flyerImageKeys) {
    normalized[key] = resolveKvrsAssetUrl(images?.[key]);
  }

  return normalized;
}

function firstImage(...values: Array<string | null | undefined>) {
  return values.find((value): value is string => Boolean(value)) || null;
}

export function eventFlyerImage(
  event: PublicEvent,
  preferred: PublicFlyerImageKey = 'default'
) {
  const images = event.flyerImages || {};
  const orderedVariantUrls = flyerVariantFallbacks[preferred].map((key) => images[key]);

  return firstImage(
    ...orderedVariantUrls,
    event.flyerImageUrl,
    event.heroImageUrl,
    event.thumbnailImageUrl,
    event.socialShareImageUrl
  );
}

async function fetchKvrsJson<T>(path: string): Promise<T | null> {
  const url = `${kvrsApiBaseUrl()}${path}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      console.warn(`KVRS public feed returned ${response.status} for ${url}`);
      return null;
    }

    return (await response.json()) as T;
  } catch {
    console.warn(`KVRS public feed unavailable during build: ${url}`);
    return null;
  }
}

function normalizeTicketAction(action?: PublicTicketAction | null): PublicTicketAction | null {
  if (!action) return null;

  return {
    ...action,
    url: action.url ? resolveKvrsAssetUrl(action.url) : null,
  };
}

function normalizeTicketType(ticket: PublicTicketType): PublicTicketType {
  return {
    ...ticket,
    publicLabel: ticket.publicLabel || ticket.name || 'Ticket',
    description: ticket.description || '',
    type: ticket.type || 'other',
    priceCents: Number.isFinite(ticket.priceCents) ? ticket.priceCents : 0,
    currency: ticket.currency || 'USD',
    guestCount: Number.isFinite(ticket.guestCount) ? ticket.guestCount : 1,
    minQuantity: Number.isFinite(ticket.minQuantity) ? ticket.minQuantity : 1,
    maxQuantity: Number.isFinite(ticket.maxQuantity) ? ticket.maxQuantity : 1,
    quantityAvailable: Number.isFinite(ticket.quantityAvailable) ? ticket.quantityAvailable : 0,
    status: ticket.status || 'active',
    checkoutUrl: ticket.checkoutUrl ? resolveKvrsAssetUrl(ticket.checkoutUrl) : null,
    action: normalizeTicketAction(ticket.action),
  };
}

function uniqueTicketTypes(ticketGroups: Array<PublicTicketType[] | null | undefined>) {
  const seen = new Set<string>();
  const tickets: PublicTicketType[] = [];

  for (const group of ticketGroups) {
    if (!Array.isArray(group)) continue;

    for (const ticket of group) {
      if (!ticket) continue;
      const key = ticket.id || `${ticket.name}-${ticket.publicLabel}-${ticket.priceCents}`;
      if (seen.has(key)) continue;
      seen.add(key);
      tickets.push(normalizeTicketType(ticket));
    }
  }

  return tickets;
}

function normalizeEvent(event: PublicEvent): PublicEvent {
  const websiteButtonProducts = event.websiteButtons?.products || event.websiteButtons?.ticketTypes || [];
  const products = uniqueTicketTypes([event.products, websiteButtonProducts]);
  const ticketTypes = uniqueTicketTypes([event.ticketTypes, products]);

  return {
    ...event,
    tags: Array.isArray(event.tags) ? event.tags : [],
    galleryImages: Array.isArray(event.galleryImages)
      ? event.galleryImages.map((image) => resolveKvrsAssetUrl(image)).filter((image): image is string => Boolean(image))
      : [],
    flyerImages: normalizeFlyerImages(event.flyerImages),
    flyerImageUrl: resolveKvrsAssetUrl(event.flyerImageUrl),
    heroImageUrl: resolveKvrsAssetUrl(event.heroImageUrl),
    thumbnailImageUrl: resolveKvrsAssetUrl(event.thumbnailImageUrl),
    socialShareImageUrl: resolveKvrsAssetUrl(event.socialShareImageUrl),
    checkoutUrl: event.checkoutUrl ? resolveKvrsAssetUrl(event.checkoutUrl) : null,
    ticketSummary: event.ticketSummary
      ? {
          ...event.ticketSummary,
          checkoutUrl: event.ticketSummary.checkoutUrl
            ? resolveKvrsAssetUrl(event.ticketSummary.checkoutUrl)
            : null,
        }
      : undefined,
    ticketTypes,
    products,
    websiteButtons: event.websiteButtons
      ? {
          ...event.websiteButtons,
          products,
          ticketTypes,
        }
      : event.websiteButtons,
  };
}

function normalizeCalendarDay(day: PublicCalendarDay): PublicCalendarDay {
  return {
    ...day,
    events: (day.events || []).map((event) => ({
      ...event,
      flyerImages: normalizeFlyerImages(event.flyerImages),
      thumbnailImageUrl: resolveKvrsAssetUrl(event.thumbnailImageUrl),
      checkoutUrl: event.checkoutUrl ? resolveKvrsAssetUrl(event.checkoutUrl) : null,
    })),
  };
}

export async function getPublicEvents(options: PublicEventsQuery = { limit: 100 }) {
  const data = await fetchKvrsJson<EventsResponse>(`/events${buildQuery(options)}`);
  return (data?.events || []).map(normalizeEvent);
}

function eventStartTime(event: PublicEvent) {
  const value = new Date(event.startsAt).getTime();
  return Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}

function eventActiveUntilTime(event: PublicEvent) {
  const endValue = event.endsAt ? new Date(event.endsAt).getTime() : Number.NaN;
  if (Number.isFinite(endValue)) return endValue;

  const startValue = new Date(event.startsAt).getTime();
  if (Number.isFinite(startValue)) return startValue + 6 * 60 * 60 * 1000;

  return Number.MAX_SAFE_INTEGER;
}

export async function getUpcomingPublicEvents(options: PublicEventsQuery = { limit: 24 }) {
  const requestedLimit = options.limit && options.limit > 0 ? options.limit : 24;
  const fetchLimit = Math.max(requestedLimit, 100);
  const now = Date.now();

  const events = await getPublicEvents({
    ...options,
    includePast: false,
    limit: fetchLimit,
  });

  return events
    .filter((event) => eventActiveUntilTime(event) >= now)
    .sort((a, b) => eventStartTime(a) - eventStartTime(b))
    .slice(0, requestedLimit);
}

export async function getFeaturedPublicEvents(options: PublicEventsQuery = { limit: 24 }) {
  const data = await fetchKvrsJson<EventsResponse>(`/events/featured${buildQuery(options)}`);
  return (data?.events || []).map(normalizeEvent);
}

export async function getPublicEventCalendar() {
  const data = await fetchKvrsJson<CalendarResponse>('/events/calendar');

  return {
    month: data?.month || null,
    timezone: data?.timezone || 'America/Chicago',
    days: (data?.days || []).map(normalizeCalendarDay),
  };
}

export async function getPublicEvent(slug: string) {
  const encodedSlug = encodeURIComponent(slug);

  // Ask KVRS for ticket/product choices on detail pages. Some KVRS responses expose
  // these as ticketTypes, while others expose them as websiteButtons.products.
  const data = await fetchKvrsJson<EventResponse>(
    `/events/${encodedSlug}?includeTicketTypes=true&includeProducts=true`
  );

  if (!data?.event) return null;

  const detailEvent = normalizeEvent(data.event);

  if ((detailEvent.ticketTypes || []).length > 0) {
    return detailEvent;
  }

  // Older KVRS detail responses may omit products even when the list feed includes them.
  // Use the list feed as a safe read-only fallback so ticketed event pages do not collapse
  // to a single generic General Admission option.
  const listData = await fetchKvrsJson<EventsResponse>(
    '/events?limit=100&includePast=true&includeTicketTypes=true&includeProducts=true'
  );
  const matchingListEvent = (listData?.events || []).find((event) => event.slug === slug);

  if (!matchingListEvent) return detailEvent;

  const listEvent = normalizeEvent(matchingListEvent);

  if ((listEvent.ticketTypes || []).length === 0) {
    return detailEvent;
  }

  return normalizeEvent({
    ...detailEvent,
    ticketSummary: detailEvent.ticketSummary || listEvent.ticketSummary,
    checkoutUrl: detailEvent.checkoutUrl || listEvent.checkoutUrl,
    saleStatus: detailEvent.saleStatus || listEvent.saleStatus,
    ticketTypes: listEvent.ticketTypes,
    products: listEvent.products,
    websiteButtons: listEvent.websiteButtons,
  });
}

export function formatEventDateTime(startsAt: string, endsAt?: string | null) {
  const start = new Date(startsAt);
  const end = endsAt ? new Date(endsAt) : null;

  const dateText = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(start);

  const startTime = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
  }).format(start);

  const endTime = end
    ? new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        hour: 'numeric',
        minute: '2-digit',
      }).format(end)
    : null;

  return endTime ? `${dateText} • ${startTime} – ${endTime}` : `${dateText} • ${startTime}`;
}

export function formatShortEventDate(startsAt: string) {
  const start = new Date(startsAt);

  return {
    month: new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      month: 'short',
    }).format(start),
    day: new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      day: '2-digit',
    }).format(start),
    time: new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      hour: 'numeric',
      minute: '2-digit',
    }).format(start),
  };
}

export function moneyFromCents(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}
