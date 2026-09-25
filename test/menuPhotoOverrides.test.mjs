import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  indexMenuPhotoCatalog,
  selectedMenuPhotos,
  MENU_CATALOG_VERSION,
  MENU_SOURCE_REVISION,
} from '../lib/menuPhotoOverrides.mjs';

const mapping = JSON.parse(readFileSync(new URL('../data/kvrs-menu-item-keys.v1.json', import.meta.url), 'utf8'));
const foodSource = readFileSync(new URL('../lib/siteContent.ts', import.meta.url), 'utf8');
const drinkSource = readFileSync(new URL('../lib/drinkMenuContent.ts', import.meta.url), 'utf8');
const foodPage = readFileSync(new URL('../app/food/page.tsx', import.meta.url), 'utf8');
const drinkPage = readFileSync(new URL('../app/drinks/page.tsx', import.meta.url), 'utf8');
const menuComponent = readFileSync(new URL('../components/MenuSection.tsx', import.meta.url), 'utf8');
const fetchSource = readFileSync(new URL('../lib/kvrsMenuPhotos.ts', import.meta.url), 'utf8');

function reviewedRows(placement) {
  return mapping.items.filter(item => item.placement === placement);
}

function sourceRows(source, start, end, excludedSection) {
  const begin = source.indexOf(start);
  assert.ok(begin >= 0);
  const finish = end ? source.indexOf(end, begin + start.length) : source.length;
  assert.ok(finish >= 0);
  const body = source.slice(begin, finish);
  const headers = [...body.matchAll(/^    title: '([^']+)',/gm)];
  const rows = [];
  for (let i = 0; i < headers.length; i++) {
    const section = headers[i][1];
    const segment = body.slice(headers[i].index, headers[i + 1]?.index ?? body.length);
    const named = [...segment.matchAll(/\{\s*(?:(?:itemKey: '([^']+)',\s*)?)name:\s*(["'])(.*?)\2(?=\s*[,}])/g)];
    if (section === excludedSection) {
      assert.equal(named.length, 8);
      assert.ok(named.every(x => x[1] === undefined));
      continue;
    }
    for (const row of named) {
      rows.push({ sectionLabel: section, itemLabel: row[3], itemKey: row[1] });
    }
  }
  return rows;
}

const foodRows = sourceRows(
  foodSource,
  'export const foodSections: MenuSection[] = [',
  'export const drinkSections: MenuSection[] = [',
  'Happy Hour Drinks',
);
const drinkRows = sourceRows(
  drinkSource,
  'export const enhancedDrinkSections: MenuSection[] = [',
  null,
  null,
);

function sectionsFor(rows) {
  const sections = new Map();
  for (const row of rows) {
    if (!sections.has(row.sectionLabel)) sections.set(row.sectionLabel, []);
    sections.get(row.sectionLabel).push({ name: row.itemLabel, itemKey: row.itemKey });
  }
  return [...sections].map(([title, items]) => ({ title, items }));
}

function responseFor(placement, overrides = {}) {
  const items = reviewedRows(placement).map(({ itemKey, itemLabel, sectionLabel }) => ({
    itemKey,
    itemLabel,
    sectionLabel,
    override: overrides[itemKey] ?? null,
    fallbackImage: null,
    effectiveImage: overrides[itemKey] ?? null,
  }));
  return {
    ok: true,
    placement,
    catalogVersion: MENU_CATALOG_VERSION,
    sourceRevision: MENU_SOURCE_REVISION,
    counts: { totalItems: items.length, itemsWithPhotos: 0, publishedOverrides: Object.keys(overrides).length },
    items,
  };
}

test('checked-in keys exactly match KVRS reviewed identity for all 126 displayed rows', () => {
  assert.equal(mapping.catalogVersion, 'kv-website-menu-v1');
  assert.equal(mapping.sourceRevision, '1e99cd338d29dd34d8af0ef98bf5dce650da0486');
  assert.equal(foodRows.length, 75);
  assert.equal(drinkRows.length, 51);
  for (const [actual, placement] of [[foodRows, 'food_menu_photos'], [drinkRows, 'drink_menu_photos']]) {
    const expected = reviewedRows(placement).map(({ sectionLabel, itemLabel, itemKey }) => ({ sectionLabel, itemLabel, itemKey }));
    assert.deepEqual(actual, expected);
  }
  assert.equal(new Set(mapping.items.map(x => x.itemKey)).size, 126);
});

test('correct endpoints, server-only fetch, no-store and legacy fallback are preserved', () => {
  assert.match(fetchSource, /publicApiBaseUrl\}\/site-media/);
  assert.match(fetchSource, /url\.searchParams\.set\('placement', placement\)/);
  assert.match(fetchSource, /cache: 'no-store'/);
  assert.match(fetchSource, /return new Map\(\)/);
  assert.match(fetchSource, /AbortSignal\.timeout\(4000\)/);
  assert.match(foodPage, /getKvrsMenuPhotoCatalog\('food_menu_photos', visibleFoodSections\)/);
  assert.match(drinkPage, /getKvrsMenuPhotoCatalog\('drink_menu_photos', enhancedDrinkSections\)/);
  assert.match(foodPage, /photoItems=\{photoItems\}/);
  assert.match(drinkPage, /photoItems=\{photoItems\}/);
  assert.match(menuComponent, /getImagesForMenuItem\(item\.name, images\)/);
  assert.match(menuComponent, /selectedMenuPhotos\(item, localImages, photoItems\)/);
  assert.doesNotMatch(menuComponent, /effectiveImage|fallbackImage/);
});

test('no published overrides retain the same local photographs and no-image rows', () => {
  const catalog = indexMenuPhotoCatalog(responseFor('food_menu_photos'), 'food_menu_photos', sectionsFor(foodRows));
  assert.equal(catalog.size, 75);
  const local = [{ src: '/uploads/katyvibes-site/food/image-02.jpg', title: 'Coconut Shrimp' }];
  const item = foodRows.find(row => row.itemLabel === 'Coconut Shrimp');
  assert.strictEqual(selectedMenuPhotos({ name: item.itemLabel, itemKey: item.itemKey }, local, catalog), local);
  const noImage = foodRows.find(row => row.itemLabel === 'Crab Stuffed Mushrooms');
  assert.deepEqual(selectedMenuPhotos({ name: noImage.itemLabel, itemKey: noImage.itemKey }, [], catalog), []);
});

test('publish, unpublish and remove affect only exact key and restore original Website photo', () => {
  const main = foodRows.find(row => row.sectionLabel === 'Bites & Shareables' && row.itemLabel === 'Spinach Dip');
  const duplicate = foodRows.find(row => row.sectionLabel === 'Happy Hour Food' && row.itemLabel === 'Spinach Dip');
  assert.notEqual(main.itemKey, duplicate.itemKey);
  const local = [{ src: '/uploads/katyvibes-site/food/image-07.jpg', title: 'Spinach Dip' }];
  const image = { imageUrl: 'https://admin.katyvibes.com/uploads/photos/approved.jpg', imageId: 'controlled' };
  const published = indexMenuPhotoCatalog(responseFor('food_menu_photos', { [main.itemKey]: image }), 'food_menu_photos', sectionsFor(foodRows));
  assert.deepEqual(selectedMenuPhotos({ name: main.itemLabel, itemKey: main.itemKey }, local, published), [{ src: image.imageUrl, title: main.itemLabel }]);
  assert.strictEqual(selectedMenuPhotos({ name: duplicate.itemLabel, itemKey: duplicate.itemKey }, local, published), local);
  const unpublished = indexMenuPhotoCatalog(responseFor('food_menu_photos'), 'food_menu_photos', sectionsFor(foodRows));
  assert.strictEqual(selectedMenuPhotos({ name: main.itemLabel, itemKey: main.itemKey }, local, unpublished), local);
  const removed = indexMenuPhotoCatalog(responseFor('food_menu_photos'), 'food_menu_photos', sectionsFor(foodRows));
  assert.strictEqual(selectedMenuPhotos({ name: main.itemLabel, itemKey: main.itemKey }, local, removed), local);
  assert.equal(published.size, 75);
  assert.equal(unpublished.size, 75);
});

test('published photo may add a picture to a previously no-image row', () => {
  const item = foodRows.find(row => row.itemLabel === 'Crab Stuffed Mushrooms');
  const image = { imageUrl: 'https://admin.katyvibes.com/uploads/photos/new.jpg' };
  const catalog = indexMenuPhotoCatalog(responseFor('food_menu_photos', { [item.itemKey]: image }), 'food_menu_photos', sectionsFor(foodRows));
  assert.deepEqual(selectedMenuPhotos({ name: item.itemLabel, itemKey: item.itemKey }, [], catalog), [{ src: image.imageUrl, title: item.itemLabel }]);
});

test('drinks use their own 51 keys without touching Food or legacy drinkSections', () => {
  const item = drinkRows.find(row => row.itemLabel === 'Classic Old Fashioned');
  const image = { imageUrl: 'https://admin.katyvibes.com/uploads/photos/old-fashioned.jpg' };
  const catalog = indexMenuPhotoCatalog(responseFor('drink_menu_photos', { [item.itemKey]: image }), 'drink_menu_photos', sectionsFor(drinkRows));
  assert.equal(catalog.size, 51);
  assert.deepEqual(selectedMenuPhotos({ name: item.itemLabel, itemKey: item.itemKey }, [], catalog), [{ src: image.imageUrl, title: item.itemLabel }]);
});

test('contract drift, incomplete feed, bad URL and outage response fail safely to local images', () => {
  const identitySections = sectionsFor(foodRows);
  const valid = responseFor('food_menu_photos');
  for (const invalid of [
    null,
    { ok: false },
    { ...valid, sourceRevision: 'stale-website' },
    { ...valid, placement: 'drink_menu_photos' },
    { ...valid, catalogVersion: 'unreviewed' },
    { ...valid, items: valid.items.slice(1) },
    { ...valid, items: [valid.items[0], ...valid.items.slice(0, -1)] },
    { ...valid, items: valid.items.map((x, i) => i === 1 ? { ...x, sectionLabel: 'Wrong' } : x) },
    responseFor('food_menu_photos', { [foodRows[0].itemKey]: { imageUrl: 'javascript:alert(1)' } }),
  ]) {
    const indexed = indexMenuPhotoCatalog(invalid, 'food_menu_photos', identitySections);
    assert.equal(indexed.size, 0);
    const local = [{ src: '/original.jpg', title: 'Original' }];
    assert.strictEqual(selectedMenuPhotos({ name: foodRows[0].itemLabel, itemKey: foodRows[0].itemKey }, local, indexed), local);
  }
});
