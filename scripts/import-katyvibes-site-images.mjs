import fs from 'node:fs/promises';
import path from 'node:path';

const SITE_PAGES = [
  {
    kind: 'food',
    url: 'https://katyvibes.com/katy-katy-vibes-restaurant-and-bar-food-menu',
    maxImages: 24,
  },
  {
    kind: 'drinks',
    url: 'https://katyvibes.com/katy-katy-vibes-restaurant-and-bar-drink-menu',
    maxImages: 20,
  },
];

const FALLBACK_MANIFEST_IMAGES = {
  food: [
    { src: '/uploads/katyvibes-site/fallback/food-coconut-shrimp.svg', title: 'Coconut Shrimp' },
    { src: '/uploads/katyvibes-site/fallback/food-spinach-dip.svg', title: 'Spinach Dip' },
    { src: '/uploads/katyvibes-site/fallback/food-salmon-sliders.svg', title: 'Salmon Sliders' },
    { src: '/uploads/katyvibes-site/fallback/food-sampler-platter.svg', title: 'Sampler Platter' },
    { src: '/uploads/katyvibes-site/fallback/food-tex-mex-sampler.svg', title: 'Tex-Mex Sampler' },
    { src: '/uploads/katyvibes-site/fallback/food-crawfish-rice.svg', title: 'Crawfish Rice' },
  ],
  drinks: [
    { src: '/uploads/katyvibes-site/fallback/drink-old-fashioned.svg', title: 'Classic Old Fashioned' },
    { src: '/uploads/katyvibes-site/fallback/drink-hurricane.svg', title: 'Passion Fruit Hurricane' },
    { src: '/uploads/katyvibes-site/fallback/drink-lemon-drop.svg', title: 'Licor 43 Lemon Drop' },
    { src: '/uploads/katyvibes-site/fallback/drink-strawberry-kiwi.svg', title: 'Strawberry-Kiwi Lemonade' },
    { src: '/uploads/katyvibes-site/fallback/drink-cucumber-martini.svg', title: 'Cucumber Martini' },
  ],
};

const ROOT = process.cwd();
const OUT_ROOT = path.join(ROOT, 'public', 'uploads', 'katyvibes-site');

function normalizeUrl(raw, pageUrl) {
  if (!raw) return null;
  let value = String(raw).trim();
  value = value
    .replaceAll('\\/', '/')
    .replaceAll('&amp;', '&')
    .replace(/^url\(["']?/, '')
    .replace(/["']?\)$/, '');
  if (!value || value.startsWith('data:') || value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('tel:')) return null;
  try {
    return new URL(value, pageUrl).toString();
  } catch {
    return null;
  }
}

function extensionFromContentType(contentType) {
  const type = (contentType || '').split(';')[0].trim().toLowerCase();
  if (type === 'image/jpeg') return '.jpg';
  if (type === 'image/png') return '.png';
  if (type === 'image/webp') return '.webp';
  if (type === 'image/gif') return '.gif';
  if (type === 'image/svg+xml') return '.svg';
  return '';
}

function extensionFromUrl(url) {
  try {
    const ext = path.extname(new URL(url).pathname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) return ext === '.jpeg' ? '.jpg' : ext;
  } catch {}
  return '';
}

function shouldKeep(url) {
  const lower = url.toLowerCase();
  const looksLikeImage = lower.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?|$)/) || lower.includes('static.spotapps.co') || lower.includes('cloudfront.net');
  if (!looksLikeImage) return false;
  const reject = [
    'placeholder', 'logo', 'favicon', 'icon', 'spothopper', 'spotapps-logo',
    'facebook', 'instagram', 'tiktok', 'google', 'yelp', 'tripadvisor', 'loader', 'spinner',
    'transparent', 'blank', 'pixel', 'sprite', 'app-store', 'play-store',
  ];
  return !reject.some((word) => lower.includes(word));
}

function collectCandidateUrls(html, pageUrl) {
  const found = new Set();
  const decoded = html.replaceAll('\\/', '/').replaceAll('&amp;', '&');

  const attrRegex = /(?:src|data-src|data-original|data-lazy|data-lazy-src|data-bg|data-background|href|content|poster|srcset)=(["'])(.*?)\1/gi;
  for (const match of decoded.matchAll(attrRegex)) {
    const value = match[2];
    const pieces = value.includes(',') ? value.split(',') : [value];
    for (const piece of pieces) {
      const candidate = piece.trim().split(/\s+/)[0];
      const url = normalizeUrl(candidate, pageUrl);
      if (url && shouldKeep(url)) found.add(url);
    }
  }

  const cssUrlRegex = /url\(["']?([^"')]+)["']?\)/gi;
  for (const match of decoded.matchAll(cssUrlRegex)) {
    const url = normalizeUrl(match[1], pageUrl);
    if (url && shouldKeep(url)) found.add(url);
  }

  const directRegex = /https?:\/\/[^\s"'<>]+?(?:\.(?:jpg|jpeg|png|webp|gif|svg)(?:\?[^\s"'<>]*)?|\/[^\s"'<>]*static\.spotapps\.co[^\s"'<>]*)/gi;
  for (const match of decoded.matchAll(directRegex)) {
    const url = normalizeUrl(match[0], pageUrl);
    if (url && shouldKeep(url)) found.add(url);
  }

  return [...found];
}

async function downloadImage(url, outDir, index) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 Chrome/125 Safari/537.36 KVReservationServiceImageImporter/1.1',
      'accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'referer': 'https://katyvibes.com/',
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.toLowerCase().startsWith('image/')) throw new Error(`Not an image: ${contentType}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < 4_000) throw new Error(`Skipped tiny image (${buffer.length} bytes)`);
  const ext = extensionFromUrl(url) || extensionFromContentType(contentType) || '.jpg';
  const filename = `image-${String(index).padStart(2, '0')}${ext}`;
  await fs.writeFile(path.join(outDir, filename), buffer);
  return { filename, bytes: buffer.length };
}

async function writeFallbackManifest(kind, outDir, reason) {
  await fs.mkdir(outDir, { recursive: true });
  const manifest = {
    sourcePage: 'fallback',
    importedAt: new Date().toISOString(),
    importStatus: 'fallback',
    message: reason,
    images: FALLBACK_MANIFEST_IMAGES[kind] || [],
  };
  await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
}

async function importPage({ kind, url, maxImages }) {
  const outDir = path.join(OUT_ROOT, kind);
  const tmpDir = path.join(OUT_ROOT, `${kind}.tmp-${Date.now()}`);
  await fs.mkdir(OUT_ROOT, { recursive: true });
  await fs.rm(tmpDir, { recursive: true, force: true });
  await fs.mkdir(tmpDir, { recursive: true });

  console.log(`\nReading ${kind} page: ${url}`);
  let html = '';
  try {
    const response = await fetch(url, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 Chrome/125 Safari/537.36 KVReservationServiceImageImporter/1.1',
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    html = await response.text();
  } catch (error) {
    await fs.rm(tmpDir, { recursive: true, force: true });
    console.log(`Could not read ${url}: ${error.message}`);
    await writeFallbackManifest(kind, outDir, `Could not read website page: ${error.message}`);
    console.log(`Using built-in ${kind} fallback gallery instead, so the carousel will not be empty.`);
    return;
  }

  const candidates = collectCandidateUrls(html, url);
  console.log(`Found ${candidates.length} candidate image URL(s).`);

  const manifest = { sourcePage: url, importedAt: new Date().toISOString(), importStatus: 'downloaded', images: [] };
  let count = 0;
  for (const candidate of candidates) {
    if (count >= maxImages) break;
    try {
      const saved = await downloadImage(candidate, tmpDir, count + 1);
      count += 1;
      const publicSrc = `/uploads/katyvibes-site/${kind}/${saved.filename}`;
      manifest.images.push({ src: publicSrc, title: `${kind === 'food' ? 'Food' : 'Drink'} photo ${count}`, sourceUrl: candidate, bytes: saved.bytes });
      console.log(`  ✓ ${saved.filename} (${Math.round(saved.bytes / 1024)} KB)`);
    } catch (error) {
      console.log(`  - skipped ${candidate}: ${error.message}`);
    }
  }

  if (!count) {
    await fs.rm(tmpDir, { recursive: true, force: true });
    await writeFallbackManifest(kind, outDir, 'No usable website images were downloaded. SpotHopper may be loading menu photos dynamically after page load.');
    console.log(`No usable ${kind} images were downloaded.`);
    console.log(`Using built-in ${kind} fallback gallery instead, so the carousel will not be empty.`);
    console.log(`You can also manually save real website photos into: ${outDir}`);
    return;
  }

  await fs.writeFile(path.join(tmpDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.rename(tmpDir, outDir);
  console.log(`Imported ${count} ${kind} image(s).`);
}

for (const page of SITE_PAGES) {
  await importPage(page);
}

console.log('\nDone. Restart npm run dev if it is already running, then refresh /, /food, and /drinks.');
