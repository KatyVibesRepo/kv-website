// The public menu keeps Website content and fallback photos authoritative.
// KVRS supplies only an optional, published image override joined by reviewed itemKey.
export const MENU_CATALOG_VERSION = 'kv-website-menu-v1';
export const MENU_SOURCE_REVISION = '1e99cd338d29dd34d8af0ef98bf5dce650da0486';

const expectedCount = {
  food_menu_photos: 75,
  drink_menu_photos: 51,
};

export function indexMenuPhotoCatalog(response, placement, sections) {
  const unavailable = new Map();
  if (!Object.hasOwn(expectedCount, placement)) return unavailable;
  const expected = new Map();

  for (const section of sections) {
    for (const item of section.items) {
      if (typeof item.itemKey !== 'string' || !item.itemKey || expected.has(item.itemKey)) {
        return unavailable;
      }
      expected.set(item.itemKey, { sectionLabel: section.title, itemLabel: item.name });
    }
  }

  // Fail closed to the local Website images on contract drift or incomplete feeds.
  if (expected.size !== expectedCount[placement] ||
    !response || response.ok !== true ||
    response.placement !== placement ||
    response.catalogVersion !== MENU_CATALOG_VERSION ||
    response.sourceRevision !== MENU_SOURCE_REVISION ||
    !Array.isArray(response.items) ||
    response.items.length !== expected.size ||
    response.counts?.totalItems !== expected.size) {
    return unavailable;
  }

  const indexed = new Map();
  for (const item of response.items) {
    const identity = expected.get(item?.itemKey);
    if (!identity || indexed.has(item.itemKey) ||
      item.sectionLabel !== identity.sectionLabel ||
      item.itemLabel !== identity.itemLabel) {
      return unavailable;
    }
    if (item.override !== null) {
      const url = item.override?.imageUrl;
      if (typeof url !== 'string' || !/^https:\/\//i.test(url)) return unavailable;
      try {
        if (new URL(url).protocol !== 'https:') return unavailable;
      } catch {
        return unavailable;
      }
    }
    indexed.set(item.itemKey, item);
  }

  return indexed.size === expected.size ? indexed : unavailable;
}

export function selectedMenuPhotos(item, localImages, indexedCatalog) {
  const publishedOverride = item.itemKey ? indexedCatalog.get(item.itemKey)?.override : null;
  if (publishedOverride) {
    return [{
      src: publishedOverride.imageUrl,
      title: item.name,
    }];
  }
  return localImages;
}
