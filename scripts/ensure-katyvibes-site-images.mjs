import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const ROOT = process.cwd();
const OUT_ROOT = path.join(ROOT, 'public', 'uploads', 'katyvibes-site');
const KINDS = ['food', 'drinks'];
const FALLBACK_DIR = path.join(OUT_ROOT, 'fallback');

function srcExists(src) {
  if (!src || typeof src !== 'string') return false;
  if (!src.startsWith('/')) return true;
  const cleanSrc = src.split('?')[0].replace(/^\/+/, '');
  return fs.existsSync(path.join(ROOT, 'public', cleanSrc));
}

function readManifest(kind) {
  const manifestPath = path.join(OUT_ROOT, kind, 'manifest.json');
  try {
    return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  } catch {
    return null;
  }
}

function hasRealDownloadedGallery(kind) {
  const manifest = readManifest(kind);
  if (!manifest || manifest.importStatus !== 'downloaded' || !Array.isArray(manifest.images)) return false;
  const validImages = manifest.images.filter((image) => srcExists(image?.src));
  return validImages.length >= 2;
}

function hasAnyDisplayableGallery(kind) {
  const manifest = readManifest(kind);
  if (manifest && Array.isArray(manifest.images) && manifest.images.some((image) => srcExists(image?.src))) return true;

  const dir = path.join(OUT_ROOT, kind);
  try {
    return fs.readdirSync(dir).some((filename) => /\.(jpe?g|png|webp|gif|svg)$/i.test(filename));
  } catch {
    return false;
  }
}

async function ensureBaseFolders() {
  await fsp.mkdir(path.join(OUT_ROOT, 'food'), { recursive: true });
  await fsp.mkdir(path.join(OUT_ROOT, 'drinks'), { recursive: true });
  await fsp.mkdir(FALLBACK_DIR, { recursive: true });
}

await ensureBaseFolders();

const missingReal = KINDS.filter((kind) => !hasRealDownloadedGallery(kind));

if (missingReal.length === 0) {
  console.log('[site-images] Food/drink website image galleries already imported.');
  process.exit(0);
}

console.log(`[site-images] Missing real downloaded gallery for: ${missingReal.join(', ')}.`);
console.log('[site-images] Running website image importer now. If SpotHopper blocks dynamic images, fallback gallery manifests will be kept so the site is not blank.');

const result = spawnSync(process.execPath, [path.join('scripts', 'import-katyvibes-site-images.mjs')], {
  cwd: ROOT,
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  console.warn(`[site-images] Import command exited with code ${result.status ?? 'unknown'}. The site will continue if fallback/gallery files exist.`);
}

const stillMissingDisplayable = KINDS.filter((kind) => !hasAnyDisplayableGallery(kind));
if (stillMissingDisplayable.length) {
  console.warn(`[site-images] WARNING: No displayable gallery images found for: ${stillMissingDisplayable.join(', ')}.`);
  console.warn('[site-images] Check public/uploads/katyvibes-site/fallback and run npm run import:site-images for details.');
} else {
  console.log('[site-images] Gallery images are ready for the homepage, food page, and drinks page.');
}
