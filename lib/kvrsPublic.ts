import { getKvrsServerConfig } from '@/lib/kvrsServerConfig';

const kvrsUploadAssetPathPattern = /^\/uploads\/(?:events-manager|site-media)\//;

export function kvrsBaseUrl() {
  return getKvrsServerConfig().baseUrl;
}

export function kvrsAssetBaseUrl() {
  return getKvrsServerConfig().assetBaseUrl;
}

export function kvrsPublicApiBaseUrl() {
  return getKvrsServerConfig().publicApiBaseUrl;
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
