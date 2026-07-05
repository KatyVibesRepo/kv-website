import { liveHomepageHeroImages, liveHomepageGalleryImages } from '@/lib/liveHomepageImages';

const backdropImage = liveHomepageHeroImages[0] || liveHomepageGalleryImages[0] || null;

export function SiteBackdrop() {
  if (!backdropImage) return null;

  return (
    <div className="site-backdrop" aria-hidden="true">
      <img src={backdropImage.src} alt="" />
    </div>
  );
}
