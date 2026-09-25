import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const footer = readFileSync(new URL('../components/SiteFooter.tsx', import.meta.url), 'utf8');
const styles = readFileSync(new URL('../app/styles.css', import.meta.url), 'utf8');

test('footer embeds Google Maps using the shared Katy Vibes address', () => {
  assert.match(footer, /katyVibesInfo\.addressLines\.join\(', '\)/);
  assert.match(footer, /https:\/\/maps\.google\.com\/maps\?q=/);
  assert.match(footer, /encodeURIComponent\(venueMapQuery\)/);
  assert.match(footer, /output=embed/);
  assert.match(footer, /<iframe[\s\S]*?src=\{mapEmbedUrl\}[\s\S]*?title="Interactive Google Map showing Katy Vibes Restaurant & Bar"/);
  assert.match(footer, /loading="lazy"/);
  assert.match(footer, /allowFullScreen/);
});

test('footer keeps direct Google Maps and Contact links independently clickable', () => {
  assert.match(footer, /href="\/contact">Map & Contact<\/a>/);
  assert.match(footer, /https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=/);
  assert.match(footer, /href=\{mapPageUrl\}/);
  assert.match(footer, /target="_blank"/);
  assert.match(footer, /rel="noopener noreferrer"/);
  assert.match(footer, /Open in Google Maps/);
});

test('map has responsive size and no Google API key or new KVRS integration', () => {
  assert.match(styles, /\.site-footer \.footer-location-map-embed\s*\{[^}]*min-height:\s*220px/s);
  assert.match(styles, /@media \(min-width: 981px\)[\s\S]*grid-template-columns: minmax\(245px,/);
  assert.match(styles, /@media \(max-width: 620px\)[\s\S]*footer-location-map-embed/);
  assert.doesNotMatch(footer, /maps\/embed\/v1|GOOGLE_MAPS_API_KEY|process\.env\.GOOGLE/);
});
