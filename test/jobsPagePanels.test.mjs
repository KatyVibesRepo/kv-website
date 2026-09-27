import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../app/styles.css', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/jobs/page.tsx', import.meta.url), 'utf8');
const rules = css.split('/* jobs-page-panel-contrast */')[1]?.split('/* end jobs-page-panel-contrast */')[0] ?? '';

test('Jobs hero has a solid dark card surface and readable copy', () => {
  assert.match(page, /className="page-hero compact-page-hero jobs-hero"/);
  assert.match(rules, /\.jobs-page \.jobs-hero\s*\{[^}]*border:\s*1px solid[^;]+;[^}]*background:\s*linear-gradient/s);
  assert.match(rules, /\.jobs-page \.jobs-hero h1\s*\{[^}]*color:\s*#fff/s);
  assert.match(rules, /\.jobs-page \.jobs-hero > p\s*\{[^}]*color:\s*rgba\(/s);
});

test('Now accepting applications has a distinct dark, responsive panel', () => {
  assert.match(page, /className="section-heading jobs-section-heading"/);
  assert.match(page, /Now accepting applications/);
  assert.match(page, /Tell us where you fit best/);
  assert.match(rules, /\.jobs-page \.jobs-hiring-section \.jobs-section-heading\s*\{[^}]*width:\s*min\(100%, 980px\);[^}]*border:\s*1px solid[^;]+;[^}]*border-radius:\s*28px;[^}]*background:\s*linear-gradient/s);
  assert.match(rules, /\.jobs-page \.jobs-section-heading > p:last-child\s*\{[^}]*max-width:\s*760px;/s);
  assert.match(rules, /@media \(max-width: 640px\)[\s\S]*\.jobs-page \.jobs-hiring-section \.jobs-section-heading/);
});

test('role cards and application form remain part of the Jobs page', () => {
  for (const name of ['Front of House', 'Kitchen Team', 'Events & Nightlife']) {
    assert.ok(page.includes(name));
  }
  assert.match(page, /<JobApplicationForm\s*\/>/);
  assert.doesNotMatch(rules, /job-application-form|job-sms-consent|jobs-highlight-card/);
});
