import { NextRequest, NextResponse } from 'next/server';
import { getKvrsServerConfig } from '@/lib/kvrsServerConfig';

export const dynamic = 'force-dynamic';

const kvrsUploadAssetPathPattern = /^\/uploads\/(?:events-manager|site-media)\//;

function candidateAssetUrls(src: string) {
  const trimmed = src.trim();
  if (!trimmed) return [];

  try {
    const url = new URL(trimmed);

    if (!kvrsUploadAssetPathPattern.test(url.pathname)) {
      return [trimmed];
    }

    const pathAndSearch = `${url.pathname}${url.search}`;
    return [`${getKvrsServerConfig().assetBaseUrl}${pathAndSearch}`];
  } catch {
    if (!trimmed.startsWith('/')) return [trimmed];
    if (!kvrsUploadAssetPathPattern.test(trimmed)) return [trimmed];

    return [`${getKvrsServerConfig().assetBaseUrl}${trimmed}`];
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
      // A single canonical KVRS origin is intentional. Do not fall through to stale hosts.
    }
  }

  return NextResponse.json(
    { ok: false, error: 'asset_not_found', tried: candidates.length },
    { status: 404, headers: { 'Cache-Control': 'no-store' } },
  );
}
