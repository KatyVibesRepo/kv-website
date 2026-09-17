'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LiveHomepageImage } from '@/lib/liveHomepageImages';

export function HomepageMediaExperience({
  heroImages,
  galleryImages,
  heroFallbackImages = [],
  galleryFallbackImages = [],
  showHero = true,
  showGallery = true,
  className = '',
}: {
  heroImages: LiveHomepageImage[];
  galleryImages: LiveHomepageImage[];
  heroFallbackImages?: LiveHomepageImage[];
  galleryFallbackImages?: LiveHomepageImage[];
  showHero?: boolean;
  showGallery?: boolean;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  const usableHeroImages = heroImages.length ? heroImages : galleryImages.slice(0, 4);
  const usableHeroFallbackImages = heroFallbackImages.length
    ? heroFallbackImages
    : galleryFallbackImages.slice(0, 4);

  const reelImages = useMemo(() => {
    const combined = [...galleryImages, ...heroImages];
    return combined.length ? [...combined, ...combined] : [];
  }, [galleryImages, heroImages]);

  const reelFallbackImages = useMemo(() => {
    const combined = [...galleryFallbackImages, ...heroFallbackImages];
    return combined.length ? [...combined, ...combined] : [];
  }, [galleryFallbackImages, heroFallbackImages]);

  const shouldShowHero = showHero && usableHeroImages.length > 0;
  const shouldShowGallery = showGallery && reelImages.length > 0;

  useEffect(() => {
    if (!shouldShowHero || usableHeroImages.length <= 1) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % usableHeroImages.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, [shouldShowHero, usableHeroImages.length]);

  if (!shouldShowHero && !shouldShowGallery) return null;

  return (
    <section
      className={`homepage-media-experience ${!shouldShowHero ? 'homepage-media-river-only' : ''} ${className}`.trim()}
      aria-label="Katy Vibes photo experience"
    >
      {shouldShowHero && (
        <div className="homepage-live-hero">
          {usableHeroImages.map((image, index) => {
            const fallbackImage = usableHeroFallbackImages.length
              ? usableHeroFallbackImages[index % usableHeroFallbackImages.length]
              : null;

            return (
              <img
                key={image.src}
                className={`homepage-live-hero-image ${index === activeIndex ? 'is-active' : ''}`}
                src={image.src}
                alt={image.alt}
                loading={index === 0 ? 'eager' : 'lazy'}
                onError={(event) => {
                  if (!fallbackImage || event.currentTarget.dataset.fallbackApplied === 'true') return;
                  event.currentTarget.dataset.fallbackApplied = 'true';
                  event.currentTarget.src = fallbackImage.src;
                }}
              />
            );
          })}

          <div className="homepage-live-hero-overlay">
            <div className="eyebrow">Katy Vibes</div>
            <h2>Eat. Drink. Dance. Repeat.</h2>
            <p>
              Live shows, DJs, sports, parties, and good food in Katy.
            </p>
            <div className="button-row">
              <a className="button hot" href="/events">Explore Events</a>
              <a className="button ghost" href="/reserve">Reserve Your Spot</a>
            </div>
          </div>
        </div>
      )}

      {shouldShowGallery && (
        <div className="homepage-image-river" aria-label="Katy Vibes photo gallery">
          <div className="homepage-image-river-track">
            {reelImages.map((image, index) => {
              const fallbackImage = reelFallbackImages.length
                ? reelFallbackImages[index % reelFallbackImages.length]
                : null;

              return (
                <figure className="homepage-image-river-card" key={`${image.src}-${index}`}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    onError={(event) => {
                      if (!fallbackImage || event.currentTarget.dataset.fallbackApplied === 'true') return;
                      event.currentTarget.dataset.fallbackApplied = 'true';
                      event.currentTarget.src = fallbackImage.src;
                    }}
                  />
                </figure>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
