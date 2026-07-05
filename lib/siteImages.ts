import fs from 'node:fs';
import path from 'node:path';

export type SiteGalleryImage = {
  src: string;
  title?: string;
  sourceUrl?: string;
  description?: string;
};

const VALID_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

function publicFileExistsForSrc(src: string) {
  if (!src.startsWith('/')) return true;
  const publicRoot = path.join(process.cwd(), 'public');
  const cleanSrc = src.split('?')[0].replace(/^\/+/, '');
  return fs.existsSync(path.join(publicRoot, cleanSrc));
}

function normalizeManifestImage(image: SiteGalleryImage): SiteGalleryImage | null {
  if (typeof image?.src !== 'string' || image.src.trim().length === 0) return null;
  const src = image.src.trim().startsWith('/') ? image.src.trim() : `/${image.src.trim()}`;
  if (!publicFileExistsForSrc(src)) return null;
  return { ...image, src };
}

function humanize(filename: string) {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/^image-\d+-?/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

export function getSiteGalleryImages(kind: 'food' | 'drinks'): SiteGalleryImage[] {
  const publicRoot = path.join(process.cwd(), 'public');
  const relDir = path.join('uploads', 'katyvibes-site', kind);
  const absDir = path.join(publicRoot, relDir);
  const manifestPath = path.join(absDir, 'manifest.json');

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as { images?: SiteGalleryImage[] };
    if (Array.isArray(manifest.images)) {
      const manifestImages = manifest.images
        .map((image) => normalizeManifestImage(image))
        .filter(Boolean) as SiteGalleryImage[];
      if (manifestImages.length > 0) return manifestImages;
    }
  } catch {
    // No manifest yet. Fall back to scanning the folder below.
  }

  try {
    return fs.readdirSync(absDir)
      .filter((filename) => VALID_EXTENSIONS.has(path.extname(filename).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((filename) => ({
        src: `/${relDir.replace(/\\/g, '/')}/${filename}`,
        title: humanize(filename),
      }));
  } catch {
    return [];
  }
}



const FALLBACK_FOOD_GALLERY_IMAGES: SiteGalleryImage[] = [
  {
    src: '/uploads/katyvibes-site/fallback/food-coconut-shrimp.svg',
    title: 'Coconut Shrimp',
    description: 'Jumbo shrimp breaded in coconut flakes and deep fried. Served with sweet chili sauce and red cabbage coleslaw.',
  },
  {
    src: '/uploads/katyvibes-site/fallback/food-spinach-dip.svg',
    title: 'Spinach Dip',
    description: 'A shareable Katy Vibes favorite served with crispy tortilla chips.',
  },
  {
    src: '/uploads/katyvibes-site/fallback/food-salmon-sliders.svg',
    title: 'Salmon Sliders',
    description: 'Tender salmon filet, Sriracha mayo, spinach, tomato, and red onions on mini brioche buns.',
  },
  {
    src: '/uploads/katyvibes-site/fallback/food-sampler-platter.svg',
    title: 'Sampler Platter',
    description: 'A crowd-ready platter built for sharing with friends before the music starts.',
  },
  {
    src: '/uploads/katyvibes-site/fallback/food-tex-mex-sampler.svg',
    title: 'Tex-Mex Sampler',
    description: 'Creamy jalapeño puffs, crispy chicken flautas, loaded nachos, and quesadillas.',
  },
  {
    src: '/uploads/katyvibes-site/fallback/food-crawfish-rice.svg',
    title: 'Crawfish Rice',
    description: 'New Orleans-style Cajun crawfish seasoned fried rice with bell peppers and onions.',
  },
];

const FALLBACK_DRINK_GALLERY_IMAGES: SiteGalleryImage[] = [
  {
    src: '/uploads/katyvibes-site/fallback/drink-old-fashioned.svg',
    title: 'Classic Old Fashioned',
    description: 'Maker’s Mark Bourbon and Angostura Bitters.',
  },
  {
    src: '/uploads/katyvibes-site/fallback/drink-hurricane.svg',
    title: 'Passion Fruit Hurricane',
    description: 'Malibu Passion Fruit Rum, passion fruit juice, orange and lime juice, and grenadine.',
  },
  {
    src: '/uploads/katyvibes-site/fallback/drink-lemon-drop.svg',
    title: 'Licor 43 Lemon Drop',
    description: 'Deep Eddy Lemon Vodka and Licor 43.',
  },
  {
    src: '/uploads/katyvibes-site/fallback/drink-strawberry-kiwi.svg',
    title: 'Strawberry-Kiwi Lemonade',
    description: 'Deep Eddy Vodka, Triple Sec, strawberry and kiwi syrup, and lemon juice.',
  },
  {
    src: '/uploads/katyvibes-site/fallback/drink-cucumber-martini.svg',
    title: 'Cucumber Martini',
    description: 'Effen Cucumber, Triple Sec, lemon juice, and lime juice.',
  },
];

const CURATED_FOOD_SELECTIONS = [
  { index: 1, title: 'Coconut Shrimp', description: 'Jumbo shrimp breaded in coconut flakes and deep fried. Served with sweet chili sauce and red cabbage coleslaw.' },
  { index: 6, title: 'Spinach Dip', description: 'A shareable Katy Vibes favorite served with crispy tortilla chips.' },
  { index: 7, title: 'Salmon Sliders', description: 'Tender salmon filet, Sriracha mayo, spinach, tomato, and red onions. Served on a mini brioche bun.' },
  { index: 10, title: 'Sampler Platter', description: 'A crowd-ready sampler built for sharing with friends.' },
  { index: 13, title: 'Tex-Mex Sampler', description: 'A platter with creamy jalapeño puffs, crispy chicken flautas, loaded nachos, and your choice of chicken or beef quesadillas.' },
  { index: 16, title: 'Crawfish Rice', description: 'New Orleans-style Cajun crawfish seasoned fried rice with bell peppers and onions.' },
];


const CURATED_DRINK_SELECTIONS = [
  { index: 1, title: 'Classic Old Fashioned', description: 'Maker’s Mark Bourbon and Angostura Bitters.' },
  { index: 4, title: 'Passion Fruit Hurricane', description: 'Malibu Passion Fruit Rum, passion fruit juice, orange and lime juice, and grenadine.' },
  { index: 7, title: 'Licor 43 Lemon Drop', description: 'Deep Eddy Lemon Vodka and Licor 43.' },
  { index: 10, title: 'Strawberry-Kiwi Lemonade', description: 'Deep Eddy Vodka, Triple Sec, strawberry and kiwi syrup, and lemon juice.' },
  { index: 13, title: 'Cucumber Martini', description: 'Effen Cucumber, Triple Sec, lemon juice, and lime juice.' },
];

export function getCuratedDrinkGalleryImages(): SiteGalleryImage[] {
  const allImages = getSiteGalleryImages('drinks');
  const selected = CURATED_DRINK_SELECTIONS
    .map(({ index, title, description }) => {
      const image = allImages[index];
      return image ? { ...image, title, description } : null;
    })
    .filter(Boolean) as SiteGalleryImage[];

  if (selected.length >= 3) return selected;
  if (allImages.length) return allImages;
  return FALLBACK_DRINK_GALLERY_IMAGES;
}

export function getCuratedFoodGalleryImages(): SiteGalleryImage[] {
  const allImages = getSiteGalleryImages('food');
  const selected = CURATED_FOOD_SELECTIONS
    .map(({ index, title, description }) => {
      const image = allImages[index];
      return image ? { ...image, title, description } : null;
    })
    .filter(Boolean) as SiteGalleryImage[];

  if (selected.length >= 3) return selected;
  if (allImages.length) return allImages;
  return FALLBACK_FOOD_GALLERY_IMAGES;
}
