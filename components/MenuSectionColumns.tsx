import { MenuSection } from '@/components/MenuSection';
import type { MenuSection as MenuSectionType } from '@/lib/siteContent';
import type { SiteGalleryImage } from '@/lib/siteImages';

export function MenuSectionColumns({
  sections,
  images = [],
}: {
  sections: MenuSectionType[];
  images?: SiteGalleryImage[];
}) {
  const leftSections = sections.filter((_, index) => index % 2 === 0);
  const rightSections = sections.filter((_, index) => index % 2 === 1);

  return (
    <div className="menu-section-columns">
      <div className="menu-section-column">
        {leftSections.map((section) => (
          <MenuSection key={section.title} section={section} images={images} />
        ))}
      </div>

      <div className="menu-section-column">
        {rightSections.map((section) => (
          <MenuSection key={section.title} section={section} images={images} />
        ))}
      </div>
    </div>
  );
}
