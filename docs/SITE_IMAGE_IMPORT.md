# KatyVibes.com Food/Drink Image Import

Run this from the KV ReservationService project folder on the Mac:

```bash
npm run import:site-images
```

The script reads the current KatyVibes.com food and drink menu pages, looks for public image URLs, downloads usable food/drink images, and saves them locally here:

```text
public/uploads/katyvibes-site/food/
public/uploads/katyvibes-site/drinks/
```

Then the `/food` and `/drinks` pages automatically display those images.

If the current SpotHopper website only exposes placeholder images to non-browser requests, manually save the desired photos from the website into those two folders. The pages will display any `.jpg`, `.jpeg`, `.png`, `.webp`, or `.gif` files in those folders.


## Fallback behavior

If the real KatyVibes.com images have not been imported yet, the Food and Drink pages and the home page still show built-in Katy Vibes styled fallback carousel images. After `npm run import:site-images` successfully downloads real photos, the real uploaded photos automatically take priority.

## Automatic startup behavior

As of v59, `npm run dev` and `npm run build` automatically run:

```bash
node scripts/ensure-katyvibes-site-images.mjs
```

before starting Next.js. This helper checks whether real downloaded food/drink gallery images exist. If they do not, it runs the website importer automatically. If SpotHopper/KatyVibes.com does not expose usable images, the importer writes fallback gallery manifests so the Food Gallery and Drink Gallery do not render blank.

Manual import is still available:

```bash
npm run import:site-images
```

