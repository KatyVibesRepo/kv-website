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
  const salesEnabled = readEnabled && env.KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED === 'true' && valid;
  return {
    origin,
    readEnabled,
    salesEnabled,
    // Prepared SHOWS wiring is separately held until the coordinated review.
    showSalesEnabled: salesEnabled && env.KV_WEBSITE_M1_CUSTOMER_SHOWS_ENABLED === 'true',
    approvedPairs: valid ? pairs : [],
  };
}

// Fixed backend callbacks require one exact Website origin. Other aliases cannot
// render booking, owner or return flows, even if they are in the source universe.
export function customerReleaseForHost(host: string | null, env: Record<string, string | undefined> = process.env) {
  const release = customerRelease(env);
  const matches = Boolean(release.origin && host === new URL(release.origin).host);
  return { ...release, readEnabled: release.readEnabled && matches, salesEnabled: release.salesEnabled && matches,
    showSalesEnabled: release.showSalesEnabled && matches };
}

// Public links identify candidate coverage. Only the authoritative quote resolves
// ALL_LINKED_SHOWS versus a retained manual product requiring a show selection.
export function customerProductSelection(event: PublicEvent, product: PublicTicketType, now = Date.now()) {
  const shows = event.shows || [];
  const ids = product.showIds || [];
  if (product.scope === 'EVENT') {
    const start = Date.parse(event.startsAt);
    if (!Number.isFinite(start) || start <= now || ids.length || shows.length > 1 ||
      (event.ticketTypes || []).some(p => (p.showIds || []).length > 1)) return null;
    return { shows: [], showSelection: 'EVENT' as const };
  }
  if (product.scope !== 'SHOWS' || !ids.length || new Set(ids).size !== ids.length) return null;
  const covered = ids.map(id => shows.filter(show => show.id === id));
  if (covered.some(matches => matches.length !== 1)) return null;
  const selected = covered.map(matches => matches[0]);
  if (selected.some(show => show.status?.toUpperCase() !== 'SCHEDULED' ||
    show.definitionState?.toUpperCase() !== 'ACTIVE' || show.isVisible !== true || show.transactionEnabled !== true ||
    typeof show.startsAt !== 'string' || !Number.isFinite(Date.parse(show.startsAt)) || !show.endsAt || !Number.isFinite(Date.parse(show.endsAt)) ||
    Date.parse(show.endsAt) <= Date.parse(show.startsAt) || Date.parse(show.startsAt) <= now)) return null;
  selected.sort((a, b) => a.startsAt.localeCompare(b.startsAt) || a.id.localeCompare(b.id));
  const time = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', dateStyle: 'medium', timeStyle: 'short' });
  return { shows: selected.map(show => ({ id: show.id, label: `${show.name} · ${time.format(new Date(show.startsAt))} Central` })),
    showSelection: selected.length === 1 ? 'SELECTED_SHOW' as const : 'RESOLVE_LINKED_SHOWS' as const };
}

export function customerProductEligible(
  event: PublicEvent, product: PublicTicketType,
  release: Pick<ReturnType<typeof customerRelease>, 'salesEnabled' | 'approvedPairs'> & { showSalesEnabled?: boolean },
  now = Date.now(),
) {
  const text = `${event.id} ${event.slug} ${event.title} ${product.id} ${product.name} ${product.publicLabel}`;
  // Ordinary full checkout continues to use its existing source/allocator.
  const eligible = release.salesEnabled && release.approvedPairs.includes(`${event.id}:${product.id}`) &&
    !/synthetic|fixture|not.for.sale|(?:^|[\s_:-])(?:qa|syn|test|lab)(?:[\s_:-]|$)/i.test(text) &&
    event.visibility === 'PUBLIC' && ['LIVE', 'PUBLISHED'].includes(event.status) &&
    event.isTicketed && event.isReservationEnabled &&
    [3, 4, 8].includes(product.guestCount) && product.currency === 'USD' &&
    product.checkoutEnabled === true && ['ACTIVE', 'active'].includes(product.status);
  if (!eligible || product.scope === 'SHOWS' && release.showSalesEnabled !== true) return false;
  return customerProductSelection(event, product, now) !== null;
}
