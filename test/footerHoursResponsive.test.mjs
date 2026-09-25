import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const footer = readFileSync(new URL('../components/SiteFooter.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/styles.css', import.meta.url), 'utf8');
const info = readFileSync(new URL('../lib/siteContent.ts', import.meta.url), 'utf8');
const scoped = css.split('/* footer-hours-card-responsive */')[1]?.split('/* end footer-hours-card-responsive */')[0] ?? '';

test('Hours card retains all existing venue hours and content', () => {
  assert.match(footer, /className="footer-column footer-hours-column"/);
  assert.match(footer, /katyVibesInfo\.hours\.map\(\(row\) =>/);
  assert.match(footer, /<dt>\{row\.day\}<\/dt>/);
  assert.match(footer, /<dd>\{row\.time\}<\/dd>/);
  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
    assert.match(info, new RegExp(`day: '${day}'`));
  }
});

test('Hours layout uses its card width and defaults to readable stacked rows', () => {
  assert.match(scoped, /\.site-footer \.footer-hours-column\s*\{[^}]*align-self:\s*start/s);
  assert.match(scoped, /\.site-footer \.footer-hours\s*\{[^}]*container:\s*footer-hours\s*\/\s*inline-size/s);
  assert.match(scoped, /\.site-footer \.footer-hours > div\s*\{[^}]*display:\s*grid\s*!important;[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*!important/s);
  assert.match(scoped, /@container footer-hours \(min-width:\s*34rem\)/);
  assert.match(scoped, /grid-template-columns:\s*minmax\(0,\s*1fr\) max-content\s*!important/);
});

test('day names never split inside words; times wrap naturally only when narrow', () => {
  assert.match(scoped, /\.site-footer \.footer-hours dt,\s*\.site-footer \.footer-hours dd\s*\{[^}]*overflow-wrap:\s*normal\s*!important;[^}]*word-break:\s*normal\s*!important;/s);
  assert.match(scoped, /\.site-footer \.footer-hours dt\s*\{[^}]*white-space:\s*nowrap/s);
  assert.match(scoped, /\.site-footer \.footer-hours dd\s*\{[^}]*text-align:\s*left\s*!important;[^}]*white-space:\s*normal/s);
  assert.match(scoped, /@container footer-hours \(max-width:\s*13rem\)/);
  assert.match(scoped, /white-space:\s*nowrap;/);
});
