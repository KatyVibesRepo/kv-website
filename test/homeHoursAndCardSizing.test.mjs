import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const info = readFileSync(new URL('../lib/siteContent.ts', import.meta.url), 'utf8');
const specials = readFileSync(new URL('../app/specials/page.tsx', import.meta.url), 'utf8');
const reserve = readFileSync(new URL('../app/reserve/page.tsx', import.meta.url), 'utf8');
const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const homeCss = readFileSync(new URL('../app/home-independent-cards.css', import.meta.url), 'utf8');

test('public hours reflect November 2026 schedule with Monday closed', () => {
  const expected = [
    ['Monday', 'Closed'],
    ['Tuesday', '4:00 PM – 10:00 PM'],
    ['Wednesday', '4:00 PM – 12:00 AM'],
    ['Thursday', '4:00 PM – 12:00 AM'],
    ['Friday', '11:00 AM – 2:00 AM'],
    ['Saturday', '11:00 AM – 2:00 AM'],
    ['Sunday', '11:00 AM – 10:00 PM'],
  ];
  for (const [day, time] of expected) {
    assert.ok(info.includes(`{ day: '${day}', time: '${time}' }`), `wrong hours for ${day}`);
  }
  assert.match(info, /kicker: 'Friday through Sunday, 11 AM to 3 PM\.'/);
  assert.match(reserve, /Lunch starts at 11 AM Friday through Sunday\. Tuesday through Thursday doors open at 4 PM\./);
});

test('specials hours are sourced from shared site hours rather than a duplicate list', () => {
  assert.match(specials, /import \{ katyVibesInfo \} from '@\/lib\/siteContent'/);
  assert.match(specials, /katyVibesInfo\.hours\.find\(\(row\) => row\.day === day\.day\)\?\.time/);
  assert.doesNotMatch(specials, /^\s*hours: '.*',?$/m);
});

test('homepage About and Reservations cards size independently on desktop', () => {
  assert.match(home, /<section className="split-section home-independent-cards">/);
  assert.match(home, /import '\.\/home-independent-cards\.css';/);
  assert.match(homeCss, /align-items: start !important/);
  assert.match(homeCss, /height: auto !important/);
  assert.match(homeCss, /min-height: 0 !important/);
  assert.match(home, /About Katy Vibes/);
  assert.match(home, /<div className="eyebrow">Reservations<\/div>/);
});
