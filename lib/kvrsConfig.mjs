export const LOCAL_KVRS_ORIGIN = 'http://localhost:3001';
export const APPROVED_PRODUCTION_KVRS_ORIGIN = 'https://admin.katyvibes.com';

export const KVRS_ENV_KEYS = Object.freeze([
  'KVRS_BASE_URL',
  'NEXT_PUBLIC_KVRS_BASE_URL',
  'KVRS_URL',
  'KVRS_PUBLIC_URL',
  'NEXT_PUBLIC_KVRS_URL',
  'KVRS_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL',
  'KVRS_API_URL',
  'KVRS_CHECKOUT_URL',
  'NEXT_PUBLIC_KVRS_CHECKOUT_URL',
  'NEXT_PUBLIC_KVRS_CHECKOUT_API_URL',
  'KVRS_ORDER_LOOKUP_URL',
  'NEXT_PUBLIC_KVRS_ORDER_LOOKUP_URL',
  'NEXT_PUBLIC_KVRS_ORDERS_BY_SESSION_URL',
]);

const PUBLIC_ENV_KEYS = new Set(
  KVRS_ENV_KEYS.filter((key) => key.startsWith('NEXT_PUBLIC_')),
);

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function parseUrl(value) {
  const cleaned = clean(value);
  if (!cleaned) return null;

  try {
    return new URL(cleaned);
  } catch {
    return null;
  }
}

function urlOrigin(value) {
  return parseUrl(value)?.origin || null;
}

function rootOrigin(value) {
  return urlOrigin(value);
}

function normalizeEndpoint(value, suffix) {
  const cleaned = cleanTrailingSlash(clean(value));
  if (!cleaned) return null;

  const parsed = parseUrl(cleaned);
  if (!parsed) return null;

  const normalizedSuffix = suffix.startsWith('/') ? suffix : `/${suffix}`;
  const pathname = parsed.pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/') {
    return `${parsed.origin}${normalizedSuffix}`;
  }

  if (pathname.endsWith(normalizedSuffix)) {
    return `${parsed.origin}${pathname}${parsed.search}`;
  }

  return `${parsed.origin}${pathname}${parsed.search}`;
}

function firstValue(env, keys) {
  for (const key of keys) {
    const value = clean(env[key]);
    if (value) return value;
  }
  return '';
}

function configuredEntries(env, scope) {
  const entries = [];

  for (const key of KVRS_ENV_KEYS) {
    if (scope === 'client' && !PUBLIC_ENV_KEYS.has(key)) continue;
    const value = clean(env[key]);
    if (!value) continue;
    entries.push({ key, value, origin: urlOrigin(value) });
  }

  return entries;
}

function conflictGroups(entries) {
  const byOrigin = new Map();

  for (const entry of entries) {
    if (!entry.origin) continue;
    const keys = byOrigin.get(entry.origin) || [];
    keys.push(entry.key);
    byOrigin.set(entry.origin, keys);
  }

  if (byOrigin.size <= 1) return [];

  return [...byOrigin.entries()].map(([origin, keys]) => ({ origin, keys }));
}

function baseCandidate(env, scope) {
  const baseKeys =
    scope === 'client'
      ? ['NEXT_PUBLIC_KVRS_BASE_URL', 'NEXT_PUBLIC_KVRS_URL']
      : [
          'KVRS_BASE_URL',
          'NEXT_PUBLIC_KVRS_BASE_URL',
          'KVRS_URL',
          'KVRS_PUBLIC_URL',
          'NEXT_PUBLIC_KVRS_URL',
        ];

  const direct = firstValue(env, baseKeys);
  if (direct) return rootOrigin(direct);

  const endpointKeys =
    scope === 'client'
      ? [
          'NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL',
          'NEXT_PUBLIC_KVRS_CHECKOUT_URL',
          'NEXT_PUBLIC_KVRS_CHECKOUT_API_URL',
          'NEXT_PUBLIC_KVRS_ORDER_LOOKUP_URL',
          'NEXT_PUBLIC_KVRS_ORDERS_BY_SESSION_URL',
        ]
      : [
          'KVRS_PUBLIC_API_BASE_URL',
          'NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL',
          'KVRS_API_URL',
          'KVRS_CHECKOUT_URL',
          'NEXT_PUBLIC_KVRS_CHECKOUT_URL',
          'NEXT_PUBLIC_KVRS_CHECKOUT_API_URL',
          'KVRS_ORDER_LOOKUP_URL',
          'NEXT_PUBLIC_KVRS_ORDER_LOOKUP_URL',
          'NEXT_PUBLIC_KVRS_ORDERS_BY_SESSION_URL',
        ];

  const endpoint = firstValue(env, endpointKeys);
  return rootOrigin(endpoint) || LOCAL_KVRS_ORIGIN;
}

function publicApiOverride(env, scope) {
  const keys =
    scope === 'client'
      ? ['NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL']
      : ['KVRS_PUBLIC_API_BASE_URL', 'NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL', 'KVRS_API_URL'];
  return firstValue(env, keys);
}

function checkoutOverride(env, scope) {
  const keys =
    scope === 'client'
      ? ['NEXT_PUBLIC_KVRS_CHECKOUT_URL', 'NEXT_PUBLIC_KVRS_CHECKOUT_API_URL']
      : ['KVRS_CHECKOUT_URL', 'NEXT_PUBLIC_KVRS_CHECKOUT_URL', 'NEXT_PUBLIC_KVRS_CHECKOUT_API_URL'];
  return firstValue(env, keys);
}

function orderLookupOverride(env, scope) {
  const keys =
    scope === 'client'
      ? ['NEXT_PUBLIC_KVRS_ORDER_LOOKUP_URL', 'NEXT_PUBLIC_KVRS_ORDERS_BY_SESSION_URL']
      : [
          'KVRS_ORDER_LOOKUP_URL',
          'NEXT_PUBLIC_KVRS_ORDER_LOOKUP_URL',
          'NEXT_PUBLIC_KVRS_ORDERS_BY_SESSION_URL',
        ];
  return firstValue(env, keys);
}

function describeConflict(groups) {
  return groups
    .map(({ origin, keys }) => `${origin} (${keys.join(', ')})`)
    .join(' vs ');
}

export function resolveKvrsConfig(env = {}, options = {}) {
  const scope = options.scope === 'client' ? 'client' : 'server';
  const throwOnConflict = options.throwOnConflict !== false;
  const throwOnInvalid = options.throwOnInvalid !== false;
  const entries = configuredEntries(env, scope);
  const invalidEntries = entries.filter((entry) => !entry.origin);
  const conflicts = conflictGroups(entries);

  if (throwOnInvalid && invalidEntries.length) {
    throw new Error(
      `Invalid KVRS URL configuration: ${invalidEntries.map((entry) => entry.key).join(', ')}`,
    );
  }

  if (throwOnConflict && conflicts.length) {
    throw new Error(`Conflicting KVRS origins: ${describeConflict(conflicts)}`);
  }

  const baseUrl = baseCandidate(env, scope) || LOCAL_KVRS_ORIGIN;
  const publicApiBaseUrl =
    normalizeEndpoint(publicApiOverride(env, scope), '/api/public') || `${baseUrl}/api/public`;
  const checkoutUrl =
    normalizeEndpoint(checkoutOverride(env, scope), '/api/checkout') || `${baseUrl}/api/checkout`;
  const orderLookupUrl =
    normalizeEndpoint(orderLookupOverride(env, scope), '/api/orders/by-session') ||
    `${baseUrl}/api/orders/by-session`;

  return {
    scope,
    baseUrl,
    assetBaseUrl: baseUrl,
    publicApiBaseUrl,
    checkoutUrl,
    orderLookupUrl,
    reservationRequestUrl: `${publicApiBaseUrl}/reservations/request`,
    jobApplicationsUrl: `${publicApiBaseUrl}/job-applications`,
    cateringRequestsUrl: `${publicApiBaseUrl}/catering-requests`,
    adminLoginUrl: `${baseUrl}/admin/login`,
    configured: entries,
    invalidEntries,
    conflicts,
  };
}

function isLocalHostname(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function isTunnelHostname(hostname) {
  const value = hostname.toLowerCase();
  return (
    value.endsWith('.trycloudflare.com') ||
    value.endsWith('.ngrok.io') ||
    value.endsWith('.ngrok-free.app') ||
    value.endsWith('.loca.lt') ||
    value.endsWith('.localtunnel.me') ||
    value.endsWith('.localhost.run')
  );
}

function baseVariableHasPath(value) {
  const parsed = parseUrl(value);
  if (!parsed) return false;
  const pathname = parsed.pathname.replace(/\/+$/, '');
  return Boolean(pathname && pathname !== '/');
}

export function validateProductionKvrsConfig(
  env = {},
  approvedOrigin = APPROVED_PRODUCTION_KVRS_ORIGIN,
) {
  const errors = [];
  const config = resolveKvrsConfig(env, {
    scope: 'server',
    throwOnConflict: false,
    throwOnInvalid: false,
  });
  const approved = parseUrl(approvedOrigin);

  if (!approved || approved.protocol !== 'https:') {
    errors.push(`Approved Production KVRS origin is invalid: ${approvedOrigin}`);
    return { ok: false, errors, config };
  }

  for (const requiredKey of ['KVRS_BASE_URL', 'NEXT_PUBLIC_KVRS_BASE_URL']) {
    if (!clean(env[requiredKey])) {
      errors.push(`${requiredKey} must be set for Website Production.`);
    }
  }

  for (const entry of config.invalidEntries) {
    errors.push(`${entry.key} is not a valid absolute URL.`);
  }

  if (config.conflicts.length) {
    errors.push(`KVRS URL overrides resolve to conflicting origins: ${describeConflict(config.conflicts)}`);
  }

  for (const key of ['KVRS_BASE_URL', 'NEXT_PUBLIC_KVRS_BASE_URL']) {
    const value = clean(env[key]);
    if (value && baseVariableHasPath(value)) {
      errors.push(`${key} must contain the KVRS origin only, without an endpoint path.`);
    }
  }

  for (const entry of config.configured) {
    if (!entry.origin) continue;
    const parsed = parseUrl(entry.value);
    if (!parsed) continue;

    if (parsed.protocol !== 'https:') {
      errors.push(`${entry.key} must use HTTPS in Production.`);
    }
    if (isLocalHostname(parsed.hostname)) {
      errors.push(`${entry.key} points to a local host and is not valid for Production.`);
    }
    if (isTunnelHostname(parsed.hostname)) {
      errors.push(`${entry.key} points to a temporary tunnel host and is not valid for Production.`);
    }
    if (parsed.hostname.endsWith('.vercel.app')) {
      errors.push(`${entry.key} points to a Vercel alias; Production KVRS must use ${approved.origin}.`);
    }
    if (entry.origin !== approved.origin) {
      errors.push(`${entry.key} resolves to ${entry.origin}; expected ${approved.origin}.`);
    }
  }

  for (const [label, value] of Object.entries({
    baseUrl: config.baseUrl,
    publicApiBaseUrl: config.publicApiBaseUrl,
    checkoutUrl: config.checkoutUrl,
    orderLookupUrl: config.orderLookupUrl,
    reservationRequestUrl: config.reservationRequestUrl,
    jobApplicationsUrl: config.jobApplicationsUrl,
    cateringRequestsUrl: config.cateringRequestsUrl,
    adminLoginUrl: config.adminLoginUrl,
  })) {
    const origin = urlOrigin(value);
    if (origin !== approved.origin) {
      errors.push(`Effective ${label} resolves to ${origin || value}; expected ${approved.origin}.`);
    }
  }

  return { ok: errors.length === 0, errors: [...new Set(errors)], config };
}
