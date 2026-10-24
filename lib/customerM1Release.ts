import type { PublicEvent, PublicTicketType } from './kvrsEvents';

// Server-side release controls. Neither Preview nor NODE_ENV enables sales.
export const CUSTOMER_API_ORIGIN = 'https://admin.katyvibes.com';
export const CUSTOMER_WEBSITE_ORIGINS = [
  'https://www.katyvibes.com', 'https://katyvibes.com', 'https://kv-website-ten.vercel.app',
];

export function customerRelease(env: Record<string, string | undefined> = process.env) {
  const origin = CUSTOMER_WEBSITE_ORIGINS.includes(env.KV_WEBSITE_M1_CUSTOMER_ORIGIN || '')
    ? env.KV_WEBSITE_M1_CUSTOMER_ORIGIN! : null;
  const readEnabled = Boolean(origin) && env.KV_WEBSITE_M1_CUSTOMER_READ_ENABLED === 'true';
  const raw = env.KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS || '';
  const pairs = raw ? raw.split(',').map(s => s.trim()) : [];
  const valid = pairs.length > 0 && pairs.length <= 20 && new Set(pairs).size === pairs.length &&
    pairs.every(pair => /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}:[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(pair) &&
      !/synthetic|fixture|not.for.sale|(?:^|[_:-])(?:qa|syn|test|lab)(?:[_:-]|$)/i.test(pair));
  return {
    origin,
    readEnabled,
    salesEnabled: readEnabled && env.KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED === 'true' && valid,
    approvedPairs: valid ? pairs : [],
  };
}

// Fixed backend callbacks require one exact Website origin. Other aliases cannot
// render booking, owner or return flows, even if they are in the source universe.
export function customerReleaseForHost(host: string | null, env: Record<string, string | undefined> = process.env) {
  const release = customerRelease(env);
  const matches = Boolean(release.origin && host === new URL(release.origin).host);
  return { ...release, readEnabled: release.readEnabled && matches, salesEnabled: release.salesEnabled && matches };
}

export function customerProductEligible(
  event: PublicEvent, product: PublicTicketType,
  release: Pick<ReturnType<typeof customerRelease>, 'salesEnabled' | 'approvedPairs'>,
  now = Date.now(),
) {
  const text = `${event.id} ${event.slug} ${event.title} ${product.id} ${product.name} ${product.publicLabel}`;
  // Shared inventory and timing are prepared. Retain SHOWS refusal until
  // coordinated customer, provider and operational activation review.
  // Refuse all show-scoped products, and never relabel a multishow bundle EVENT.
  // Ordinary full checkout continues to use its existing source/allocator.
  const shows = event.shows || [];
  const startsAt = Date.parse(event.startsAt);
  return release.salesEnabled && release.approvedPairs.includes(`${event.id}:${product.id}`) &&
    !/synthetic|fixture|not.for.sale|(?:^|[\s_:-])(?:qa|syn|test|lab)(?:[\s_:-]|$)/i.test(text) &&
    event.visibility === 'PUBLIC' && ['LIVE', 'PUBLISHED'].includes(event.status) &&
    Number.isFinite(startsAt) && startsAt > now && event.isTicketed && event.isReservationEnabled &&
    [3, 4, 8].includes(product.guestCount) && product.currency === 'USD' &&
    product.checkoutEnabled === true && ['ACTIVE', 'active'].includes(product.status) &&
    product.scope === 'EVENT' && !(product.showIds || []).length && shows.length <= 1 &&
    !(event.ticketTypes || []).some(p => (p.showIds || []).length > 1);
}
