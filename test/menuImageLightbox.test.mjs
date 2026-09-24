import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const viewer = readFileSync(new URL('../components/MenuImageLightbox.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/styles.css', import.meta.url), 'utf8');

test('menu pages share one lightbox rather than independently mounted card overlays', () => {
  assert.match(layout, /<MenuImageLightboxProvider>\{children\}<\/MenuImageLightboxProvider>/);
  assert.match(viewer, /createContext<OpenMenuImage \| null>/);
  assert.match(viewer, /activeImage && createPortal\(/);
  assert.match(viewer, /document\.body\s*\)/);
  assert.match(viewer, /onClick=\{\(event\) => openImage\(\{ src, alt \}, event\.currentTarget\)\}/);
  assert.doesNotMatch(viewer, /const \[isOpen, setIsOpen\]/);
});

test('viewer prevents background interaction and restores keyboard and scroll behavior', () => {
  assert.match(viewer, /aria-modal="true"/);
  assert.match(viewer, /event\.key === 'Escape'/);
  assert.match(viewer, /event\.key === 'Tab'/);
  assert.match(viewer, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(viewer, /document\.body\.style\.overflow = previousOverflow/);
  assert.match(viewer, /openerRef\.current\.focus\(\)/);
  assert.match(viewer, /event\.target === event\.currentTarget/);
  assert.match(css, /\.menu-image-lightbox-backdrop\s*\{[^}]*z-index:\s*2147483647\s*!important/s);
  assert.match(css, /\.menu-image-lightbox-dialog \.menu-image-lightbox-image\s*\{[^}]*object-fit:\s*contain\s*!important/s);
});
