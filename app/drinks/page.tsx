import { MenuSection } from '@/components/MenuSection';
import { enhancedDrinkSections } from '@/lib/drinkMenuContent';
import { getCuratedDrinkGalleryImages } from '@/lib/siteImages';
import { balanceMenuSectionsIntoColumns } from '@/lib/menuColumnLayout';

export default function DrinksPage() {
  const images = getCuratedDrinkGalleryImages();

  const columns = balanceMenuSectionsIntoColumns(enhancedDrinkSections, 3);

  return (
    <section className="stack menu-page menu-page-compact drinks-page">
      <div className="hero page-hero">
        <div className="eyebrow">Our Drinks</div>
        <h1><span className="gradient-text">Sip, celebrate,</span><br />and keep the vibe moving.</h1>
        <p>Signature cocktails, specialty shots, wine, beer, seltzers, mocktails, soda, tea, and happy hour favorites.</p>
        <div className="button-row">
          <a className="button hot" href="/events">Find an Event</a>
          <a className="button ghost" href="/specials">View Specials</a>
        </div>
      </div>

      <div className="menu-section-columns menu-section-columns-three drinks-section-columns">
        {columns.map((column, columnIndex) => (
          <div className="menu-section-column" key={`drinks-column-${columnIndex}`}>
            {column.map((section) => (
              <MenuSection key={section.title} section={section} images={images} />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
