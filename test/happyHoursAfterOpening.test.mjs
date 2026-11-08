import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const specials = readFileSync(new URL('../app/specials/page.tsx', import.meta.url), 'utf8');
const site = readFileSync(new URL('../lib/siteContent.ts', import.meta.url), 'utf8');

function dayBlock(day) {
  return specials.split("    day: '" + day + "',")[1]?.split("\n  },")[0] ?? '';
}

test('Tuesday through Thursday happy hour begins no earlier than the 4 PM venue opening', () => {
  const tue = dayBlock('Tuesday');
  const wed = dayBlock('Wednesday');
  const thu = dayBlock('Thursday');
  assert.match(tue, /Tuesday 4:00 PM – 10:00 PM/);
  assert.match(tue, /time: '4:00 PM – 7:00 PM'/);
  assert.match(wed, /Food & Drinks 4:00 PM – 7:00 PM/);
  assert.match(thu, /Food & Drinks 4:00 PM – 7:00 PM/);
  for (const block of [tue, wed, thu]) {
    assert.doesNotMatch(block, /Food 3:00 PM|Drinks 2:00 PM|time: '3:00 PM – 7:00 PM'/);
  }
});

test('Friday earlier happy hour times remain unchanged', () => {
  assert.match(dayBlock('Friday'), /Food 3:00 PM – 7:00 PM · Drinks 2:00 PM – 7:00 PM/);
});

test('specials page and shared food/drink metadata explain each weekday schedule', () => {
  assert.match(specials, /Tuesday: food 4–7 PM, drinks 4 PM–close/);
  assert.match(specials, /Wednesday and Thursday: food and drinks 4–7 PM/);
  assert.match(specials, /Friday: food 3–7 PM, drinks 2–7 PM/);
  assert.match(specials, /Tue–Thu 4–7 PM · Fri 3–7 PM/);
  assert.match(site, /Tuesday through Thursday, 4–7 PM\. Friday, 3–7 PM\./);
  assert.match(site, /Tuesday, 4 PM–close\. Wednesday and Thursday, 4–7 PM\. Friday, 2–7 PM\./);
});
