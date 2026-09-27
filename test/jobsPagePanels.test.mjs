import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const css = readFileSync(new URL('../app/styles.css', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/jobs/page.tsx', import.meta.url), 'utf8');
const parties = readFileSync(new URL('../app/parties/page.tsx', import.meta.url), 'utf8');
const rules = css.split('/* jobs-hero-matches-parties */')[1]?.split('/* end jobs-hero-matches-parties */')[0] ?? '';

test('Jobs uses the exact shared Groups & Parties hero surface and gradient heading', () => {
  assert.match(parties, /className="hero page-hero"/);
  assert.match(page, /className="hero page-hero compact-page-hero jobs-hero"/);
  assert.match(page, /<h1><span className="gradient-text">Join the Katy Vibes<\/span>/);
  assert.match(css, /\.hero\s*\{[^}]*background:\s*linear-gradient/s);
  assert.match(css, /\.hero::before\s*\{[^}]*linear-gradient/s);
  assert.doesNotMatch(css, /\.jobs-page \.jobs-hero\s*\{[^}]*background:/s);
  assert.doesNotMatch(css, /jobs-page-panel-contrast/);
});

test('Jobs hero uses working calls to action without modifying the application form', () => {
  assert.match(page, /className="button hot" href="#apply">Apply Now<\/a>/);
  assert.match(page, /className="button ghost" href="#hiring-areas">Explore Hiring Areas<\/a>/);
  assert.match(page, /className="section jobs-hiring-section" id="hiring-areas"/);
  assert.match(page, /className="section jobs-application-section" id="apply"/);
  assert.match(rules, /scroll-margin-top:\s*110px/);
});

test('Now accepting applications is a simple heading rather than a separate card', () => {
  assert.match(page, /className="section-heading jobs-section-heading"/);
  assert.match(page, /Now accepting applications/);
  assert.match(page, /Tell us where you fit best/);
  assert.doesNotMatch(rules, /\.jobs-hiring-section \.jobs-section-heading\s*\{/);
  assert.doesNotMatch(rules, /(?:border|background|box-shadow|border-radius):/);
  assert.match(rules, /\.jobs-page \.jobs-section-heading > p:last-child/);
});

test('all role cards, explanatory copy and the existing form remain present', () => {
  for (const name of ['Front of House', 'Kitchen Team', 'Events & Nightlife']) {
    assert.ok(page.includes(name));
  }
  assert.match(page, /This is a job application request, not a reservation form/);
  assert.match(page, /<JobApplicationForm\s*\/>/);
  assert.doesNotMatch(rules, /job-application-form|job-sms-consent|jobs-highlight-card/);
});
