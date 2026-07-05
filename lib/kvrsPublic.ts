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
  const raw =
    process.env.NEXT_PUBLIC_KVRS_URL ||
    process.env.NEXT_PUBLIC_KVRS_BASE_URL ||
    'http://localhost:3001';

  return cleanBaseUrl(raw);
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

export function kvrsPublicApiBaseUrl() {
  const raw =
    process.env.KVRS_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL ||
    `${kvrsBaseUrl()}/api/public`;

  return cleanBaseUrl(raw);
}

export function resolveKvrsPublicAssetUrl(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

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

export async function fetchKvrsPublicJson<T>(path: string): Promise<T | null> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${kvrsPublicApiBaseUrl()}${normalizedPath}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      ...(process.env.NODE_ENV === 'development'
        ? { cache: 'no-store' as const }
        : { next: { revalidate: 120 } }),
    });

    if (!response.ok) {
      console.warn(`KVRS public API returned ${response.status} for ${url}`);
      return null;
    }

    return (await response.json()) as T;
  } catch {
    console.warn(`KVRS public API unavailable: ${url}`);
    return null;
  }
}
