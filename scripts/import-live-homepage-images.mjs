import fs from 'fs/promises';
import path from 'path';

const homepageUrl = 'https://www.katyvibes.com/';
const outDir = path.join(process.cwd(), 'public/uploads/katyvibes-site/homepage-live');
const outTs = path.join(process.cwd(), 'lib/liveHomepageImages.ts');

function getAttr(tag, name) {
  const re = new RegExp(`${name}=["']([^"']+)["']`, 'i');
  return tag.match(re)?.[1] || '';
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&apos;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'homepage-image';
}

function extensionFromContentType(contentType) {
  if (contentType.includes('image/png')) return 'png';
  if (contentType.includes('image/webp')) return 'webp';
  if (contentType.includes('image/svg')) return 'svg';
  if (contentType.includes('image/gif')) return 'gif';
  return 'jpg';
}

function cleanCandidateUrl(rawUrl) {
  if (!rawUrl) return null;

  let value = decodeHtml(rawUrl.trim());

  if (!value || value.startsWith('data:')) return null;

  if (value.includes(',')) {
    value = value.split(',')[0].trim().split(/\s+/)[0];
  }

  try {
    return new URL(value, homepageUrl).toString();
  } catch {
    return null;
  }
}

function shouldSkip(url, label) {
  const combined = `${url} ${label}`.toLowerCase();

  return (
    combined.includes('placeholder.png') ||
    combined.includes('spothopper logo') ||
    combined.includes('powered by') ||
    combined.includes('logo top') ||
    combined.includes('logo scroll') ||
    combined.includes('favicon') ||
    combined.includes('/icons/')
  );
}

const response = await fetch(homepageUrl);
if (!response.ok) {
  throw new Error(`Could not fetch ${homepageUrl}: ${response.status}`);
}

const html = await response.text();
await fs.mkdir(outDir, { recursive: true });

const candidates = [];

for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
  const tag = match[0];

  const alt = getAttr(tag, 'alt');
  const title = getAttr(tag, 'title');
  const label = decodeHtml(alt || title || 'Katy Vibes homepage image');

  const attrsToTry = [
    'src',
    'data-src',
    'data-original',
    'data-lazy-src',
    'data-bg',
    'data-background',
  ];

  for (const attr of attrsToTry) {
    const url = cleanCandidateUrl(getAttr(tag, attr));
    if (url && !shouldSkip(url, label)) {
      candidates.push({ url, label, source: attr });
    }
  }

  const srcset = getAttr(tag, 'srcset') || getAttr(tag, 'data-srcset');
  if (srcset) {
    const url = cleanCandidateUrl(srcset);
    if (url && !shouldSkip(url, label)) {
      candidates.push({ url, label, source: 'srcset' });
    }
  }
}

for (const match of html.matchAll(/url\(["']?([^"')]+)["']?\)/gi)) {
  const url = cleanCandidateUrl(match[1]);
  if (url && !shouldSkip(url, 'Katy Vibes homepage background image')) {
    candidates.push({
      url,
      label: 'Katy Vibes homepage background image',
      source: 'css-background',
    });
  }
}

const unique = [];
const seen = new Set();

for (const candidate of candidates) {
  if (seen.has(candidate.url)) continue;
  seen.add(candidate.url);
  unique.push(candidate);
}

const downloaded = [];

for (let index = 0; index < unique.length; index += 1) {
  const item = unique[index];

  try {
    const imageResponse = await fetch(item.url);
    if (!imageResponse.ok) {
      console.warn(`Skipping ${item.url}: ${imageResponse.status}`);
      continue;
    }

    const contentType = imageResponse.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      console.warn(`Skipping non-image ${item.url}: ${contentType}`);
      continue;
    }

    const ext = extensionFromContentType(contentType);
    const filename = `${String(index + 1).padStart(2, '0')}-${slugify(item.label)}.${ext}`;
    const filePath = path.join(outDir, filename);
    const arrayBuffer = await imageResponse.arrayBuffer();

    await fs.writeFile(filePath, Buffer.from(arrayBuffer));

    downloaded.push({
      src: `/uploads/katyvibes-site/homepage-live/${filename}`,
      alt: item.label,
      originalUrl: item.url,
    });

    console.log(`Downloaded ${filename}`);
  } catch (error) {
    console.warn(`Failed ${item.url}: ${error.message}`);
  }
}

const heroImages = downloaded.slice(0, 10);
const galleryImages = downloaded.slice(10);

const ts = `export type LiveHomepageImage = {
  src: string;
  alt: string;
  originalUrl: string;
};

export const liveHomepageHeroImages: LiveHomepageImage[] = ${JSON.stringify(heroImages, null, 2)};

export const liveHomepageGalleryImages: LiveHomepageImage[] = ${JSON.stringify(galleryImages, null, 2)};
`;

await fs.writeFile(outTs, ts);

console.log('');
console.log(`Saved ${downloaded.length} homepage images.`);
console.log(`Hero images: ${heroImages.length}`);
console.log(`Gallery images: ${galleryImages.length}`);
console.log(`Generated ${outTs}`);
