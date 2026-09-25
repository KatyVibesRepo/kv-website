import { getKvrsServerConfig } from '@/lib/kvrsServerConfig';
import {
  indexMenuPhotoCatalog,
  type MenuPhotoPlacement,
  type PublicMenuPhotoItem,
  type WebsiteMenuIdentitySection,
} from '@/lib/menuPhotoOverrides.mjs';

/**
 * Read-only public KVRS catalog. A failed or incompatible response must never
 * prevent Food or Drinks from rendering their existing Website content/photos.
 */
export async function getKvrsMenuPhotoCatalog(
  placement: MenuPhotoPlacement,
  sections: readonly WebsiteMenuIdentitySection[],
): Promise<Map<string, PublicMenuPhotoItem>> {
  try {
    const url = new URL(`${getKvrsServerConfig().publicApiBaseUrl}/site-media`);
    url.searchParams.set('placement', placement);

    const response = await fetch(url.toString(), {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(4000),
    });

    if (!response.ok) {
      console.warn(`KVRS menu photos unavailable for ${placement}: HTTP ${response.status}`);
      return new Map();
    }

    const payload: unknown = await response.json();
    return indexMenuPhotoCatalog(payload, placement, sections);
  } catch {
    console.warn(`KVRS menu photos unavailable for ${placement}; using Website photos`);
    return new Map();
  }
}
