export type MenuPhotoPlacement = 'food_menu_photos' | 'drink_menu_photos';

export type PublishedMenuPhoto = {
  imageUrl: string;
  imageId?: string;
  title?: string;
  altText?: string | null;
  id?: string;
  assignmentId?: string;
};

export type PublicMenuPhotoItem = {
  itemKey: string;
  itemLabel: string;
  sectionLabel: string;
  override: PublishedMenuPhoto | null;
};

export type WebsiteMenuIdentitySection = {
  title: string;
  items: readonly { name: string; itemKey?: string }[];
};

export type WebsiteMenuImage = {
  src: string;
  title?: string;
  sourceUrl?: string;
  description?: string;
};

export const MENU_CATALOG_VERSION: string;
export const MENU_SOURCE_REVISION: string;

export function indexMenuPhotoCatalog(
  response: unknown,
  placement: MenuPhotoPlacement,
  sections: readonly WebsiteMenuIdentitySection[],
): Map<string, PublicMenuPhotoItem>;

export function selectedMenuPhotos(
  item: { name: string; itemKey?: string },
  localImages: WebsiteMenuImage[],
  indexedCatalog: ReadonlyMap<string, PublicMenuPhotoItem>,
): WebsiteMenuImage[];
