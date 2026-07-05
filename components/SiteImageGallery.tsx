import type { SiteGalleryImage } from '@/lib/siteImages';

export function SiteImageGallery({
  eyebrow,
  title,
  intro,
  images,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  images: SiteGalleryImage[];
}) {
  if (!images.length) return null;

  return (
    <section className="site-image-gallery card stack">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        {intro && <p className="muted">{intro}</p>}
      </div>
      <div className="site-image-grid">
        {images.map((image, index) => (
          <figure className="site-image-card" key={`${image.src}-${index}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt={image.title || `${eyebrow} photo ${index + 1}`} loading="lazy" />
            {image.title && <figcaption>{image.title}</figcaption>}
          </figure>
        ))}
      </div>
    </section>
  );
}
