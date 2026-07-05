import type { MenuSection as MenuSectionType } from '@/lib/siteContent';
import type { SiteGalleryImage } from '@/lib/siteImages';

function normalizeMenuName(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const menuImageAliases: Record<string, string[]> = {
  'party sampler': ['sampler platter'],
  'tex mex sampler': ['tex mex sampler'],
  'classic old fashioned': ['old fashioned'],
  'licor 43 lemon drop': ['lemon drop'],
  'strawberry kiwi lemonade': ['lemonade', 'strawberry lemonade'],
};

const menuItemsWithoutImages = new Set([
  'licor 43 lemon drop shot',
  'lemonade',
]);

const exactOnlyMenuImageNames = new Set([
  // Prevent generic Sliders from borrowing the Salmon Sliders photo.
  'sliders',
]);

function menuSectionSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getImagesForMenuItem(itemName: string, images: SiteGalleryImage[]) {
  const normalizedItemName = normalizeMenuName(itemName);

  if (menuItemsWithoutImages.has(normalizedItemName)) {
    return [];
  }

  const aliasNames = menuImageAliases[normalizedItemName] || [];
  const acceptedNames = [normalizedItemName, ...aliasNames.map(normalizeMenuName)];

  if (exactOnlyMenuImageNames.has(normalizedItemName)) {
    return images.filter((image) => normalizeMenuName(image.title || '') === normalizedItemName);
  }

  return images.filter((image) => {
    const normalizedTitle = normalizeMenuName(image.title || '');

    if (!normalizedTitle) return false;

    return acceptedNames.some((acceptedName) => (
      normalizedTitle === acceptedName ||
      normalizedTitle.includes(acceptedName)
    ));
  });
}

export function MenuSection({
  section,
  images = [],
}: {
  section: MenuSectionType;
  images?: SiteGalleryImage[];
}) {
  return (
    <section className={`menu-section menu-section-${menuSectionSlug(section.title)} card stack`}>
      <div>
        <div className="eyebrow">Menu</div>
        <h2>{section.title}</h2>
        {section.kicker && <p className="muted">{section.kicker}</p>}
      </div>

      <div className="menu-item-grid">
        {section.items.map((item) => {
          const itemImages = getImagesForMenuItem(item.name, images);

          return (
            <article className="menu-item" key={`${section.title}-${item.name}`}>
              <div className="menu-item-copy">
                <div className="row-between menu-item-heading">
                  <h3>{item.name}</h3>
                  {item.price && <span className="price-chip">{item.price}</span>}
                </div>

                {item.badge && <span className="badge hot">{item.badge}</span>}
                {item.description && <p className="muted">{item.description}</p>}
              </div>

              {itemImages.length > 0 && (
                <div className="menu-item-media-grid" aria-label={`${item.name} photos`}>
                  {itemImages.map((image, index) => (
                    <figure className="menu-item-media" key={`${image.src}-${index}`}>
                      <img
                        src={image.src}
                        alt={image.title || `${item.name} photo`}
                        loading="lazy"
                      />
                      {image.title && <figcaption>{image.title}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
