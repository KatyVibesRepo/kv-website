import { fetchKvrsPublicJson, resolveKvrsPublicAssetUrl } from '@/lib/kvrsPublic';

export type SiteMediaPlacement =
  | 'home_hero_gallery'
  | 'home_secondary_gallery'
  | 'home_community_panel';

export type PublicSiteMediaImage = {
  id: string;
  title?: string | null;
  altText?: string | null;
  caption?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  width?: number | null;
  height?: number | null;
  placement?: string | null;
  sortOrder?: number | null;
};

type SiteMediaResponse = {
  ok: boolean;
  images?: PublicSiteMediaImage[];
};

export type HomepageFeedImage = {
  src: string;
  alt: string;
  originalUrl: string;
  title?: string;
  caption?: string;
  width?: number | null;
  height?: number | null;
};

function imageAltText(image: PublicSiteMediaImage) {
  return (
    image.altText?.trim() ||
    image.title?.trim() ||
    image.caption?.trim() ||
    'Katy Vibes gallery image'
  );
}

function normalizeSiteMediaImage(image: PublicSiteMediaImage): HomepageFeedImage | null {
  const src = resolveKvrsPublicAssetUrl(image.imageUrl);
  if (!src) return null;

  return {
    src,
    alt: imageAltText(image),
    originalUrl: src,
    title: image.title || undefined,
    caption: image.caption || undefined,
    width: image.width ?? null,
    height: image.height ?? null,
  };
}

export async function getSiteMediaImages(placement: SiteMediaPlacement) {
  const data = await fetchKvrsPublicJson<SiteMediaResponse>(
    `/site-media?placement=${encodeURIComponent(placement)}`
  );

  if (!data?.ok || !Array.isArray(data.images)) return [];

  return data.images
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(normalizeSiteMediaImage)
    .filter((image): image is HomepageFeedImage => Boolean(image));
}
