import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const defaultLocalKvrsBaseUrl = 'http://localhost:3001';
const kvrsUploadAssetPathPattern = /^\/uploads\/(?:events-manager|site-media)\//;

function cleanBaseUrl(value?: string | null) {
  return (value || '').trim().replace(/\/$/, '');
}

function isWebsiteLocalhostOrigin(value: string) {
  try {
    const url = new URL(value);
    return (url.hostname === 'localhost' || url.hostname === '127.0.0.1') && url.port === '3000';
  } catch {
    return false;
  }
}


function baseUrlFromPublicApi(value?: string | null) {
  const cleaned = cleanBaseUrl(value);
  if (!cleaned) return null;

  try {
    const url = new URL(cleaned);
    url.pathname = url.pathname.replace(/\/api\/public\/?$/, '').replace(/\/$/, '');
    url.search = '';
    url.hash = '';
    return cleanBaseUrl(url.toString());
  } catch {
    return null;
  }
}

function baseUrlFromCheckoutApi(value?: string | null) {
  const cleaned = cleanBaseUrl(value);
  if (!cleaned) return null;

  try {
    const url = new URL(cleaned);
    url.pathname = url.pathname.replace(/\/api\/checkout\/?$/, '').replace(/\/$/, '');
    url.search = '';
    url.hash = '';
    return cleanBaseUrl(url.toString());
  } catch {
    return null;
  }
}

function unique(values: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const value of values) {
    const cleaned = cleanBaseUrl(value);
    if (!cleaned || seen.has(cleaned)) continue;
    seen.add(cleaned);
    output.push(cleaned);
  }

  return output;
}

function kvrsAssetBaseCandidates() {
  return unique([
    baseUrlFromPublicApi(process.env.KVRS_PUBLIC_API_BASE_URL),
    baseUrlFromPublicApi(process.env.NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL),
    baseUrlFromCheckoutApi(process.env.KVRS_CHECKOUT_URL),
    baseUrlFromCheckoutApi(process.env.NEXT_PUBLIC_KVRS_CHECKOUT_URL),
    baseUrlFromCheckoutApi(process.env.NEXT_PUBLIC_KVRS_CHECKOUT_API_URL),
    process.env.KVRS_BASE_URL,
    process.env.KVRS_URL,
    process.env.NEXT_PUBLIC_KVRS_BASE_URL,
    process.env.NEXT_PUBLIC_KVRS_URL,
    defaultLocalKvrsBaseUrl,
  ]).filter((base) => !isWebsiteLocalhostOrigin(base));
}

function candidateAssetUrls(src: string) {
  const trimmed = src.trim();
  if (!trimmed) return [];

  try {
    const url = new URL(trimmed);

    if (!kvrsUploadAssetPathPattern.test(url.pathname)) {
      return [trimmed];
    }

    const pathAndSearch = `${url.pathname}${url.search}`;
    const bases = kvrsAssetBaseCandidates();

    return bases.map((base) => `${base}${pathAndSearch}`);
  } catch {
    if (!trimmed.startsWith('/')) return [trimmed];
    if (!kvrsUploadAssetPathPattern.test(trimmed)) return [trimmed];

    const bases = kvrsAssetBaseCandidates();

    return bases.map((base) => `${base}${trimmed}`);
  }
}

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get('src') || '';
  const candidates = candidateAssetUrls(src);

  if (!candidates.length) {
    return NextResponse.json({ ok: false, error: 'missing_asset_src' }, { status: 400 });
  }

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        cache: 'no-store',
        headers: { Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' },
      });

      if (!response.ok) continue;

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const body = await response.arrayBuffer();

      return new NextResponse(body, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
      });
    } catch {
      // Try the next candidate origin.
    }
  }

  return NextResponse.json(
    { ok: false, error: 'asset_not_found', tried: candidates.length },
    { status: 404, headers: { 'Cache-Control': 'no-store' } }
  );
}
