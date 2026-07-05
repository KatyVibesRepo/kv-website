import { MenuSection } from '@/components/MenuSection';
import { foodSections } from '@/lib/siteContent';
import { getCuratedFoodGalleryImages } from '@/lib/siteImages';
import { balanceMenuSectionsIntoColumns } from '@/lib/menuColumnLayout';
import type { MenuSection as MenuSectionType } from '@/lib/siteContent';

function shouldHideFoodSection(section: MenuSectionType) {
  const title = section.title.toLowerCase();

  return (
    title.includes('happy hour drinks') ||
    title.includes('happy hour drink') ||
    title.includes('happy hour beverages') ||
    title.includes('happy hour cocktails')
  );
}

export default function FoodPage() {
  const images = getCuratedFoodGalleryImages();
  const visibleFoodSections = foodSections.filter((section) => !shouldHideFoodSection(section));

  const columns = balanceMenuSectionsIntoColumns(visibleFoodSections, 3);

  return (
    <section className="stack menu-page menu-page-compact food-page">
      <div className="hero page-hero">
        <div className="eyebrow">Our Food</div>
        <h1><span className="gradient-text">Kitchen favorites</span><br />for every vibe.</h1>
        <p>Shareables, wings, burgers, Tex-Mex, seafood, salads, entrées, and desserts for lunch, dinner, parties, and late-night groups.</p>
        <div className="button-row">
          <a className="button hot" href="/reserve">Reserve a Table</a>
          <a className="button ghost" href="/order">Order Online</a>
        </div>
      </div>

      <div className="menu-section-columns menu-section-columns-three food-section-columns">
        {columns.map((column, columnIndex) => (
          <div className="menu-section-column" key={`food-column-${columnIndex}`}>
            {column.map((section) => (
              <MenuSection key={section.title} section={section} images={images} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
