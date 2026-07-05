'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { SiteGalleryImage } from '@/lib/siteImages';

export function SiteImageCarousel({
  eyebrow,
  title,
  intro,
  images,
  displayMode = 'feature',
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  images: SiteGalleryImage[];
  displayMode?: 'feature' | 'thumbnailLightbox';
}) {
  const usableImages = useMemo(() => images.filter((image) => image?.src), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearResumeTimer() {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  function pauseBriefly(ms = 5000) {
    setIsPaused(true);
    clearResumeTimer();
    resumeTimerRef.current = setTimeout(() => {
      setIsPaused(false);
      resumeTimerRef.current = null;
    }, ms);
  }

  useEffect(() => () => clearResumeTimer(), []);

  useEffect(() => {
    if (usableImages.length <= 1 || isPaused || displayMode === 'thumbnailLightbox') return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % usableImages.length);
    }, 4600);

    return () => window.clearInterval(interval);
  }, [usableImages.length, isPaused, displayMode]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setLightboxIndex(null);
      }
      if (event.key === 'ArrowLeft') {
        setLightboxIndex((current) => {
          if (current === null) return current;
          return (current - 1 + usableImages.length) % usableImages.length;
        });
      }
      if (event.key === 'ArrowRight') {
        setLightboxIndex((current) => {
          if (current === null) return current;
          return (current + 1) % usableImages.length;
        });
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightboxIndex, usableImages.length]);

  if (!usableImages.length) return null;

  const active = usableImages[Math.min(activeIndex, usableImages.length - 1)];
  const lightboxImage = lightboxIndex === null ? null : usableImages[Math.min(lightboxIndex, usableImages.length - 1)];

  function go(delta: number) {
    pauseBriefly();
    setActiveIndex((current) => (current + delta + usableImages.length) % usableImages.length);
  }

  function openLightbox(index: number) {
    pauseBriefly(6500);
    setActiveIndex(index);
    setLightboxIndex(index);
  }

  function moveLightbox(delta: number) {
    pauseBriefly(6500);
    setLightboxIndex((current) => {
      const next = ((current ?? activeIndex) + delta + usableImages.length) % usableImages.length;
      setActiveIndex(next);
      return next;
    });
  }

  return (
    <section
      className={`site-image-carousel card stack ${displayMode === 'thumbnailLightbox' ? 'thumbnail-lightbox-mode' : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onPointerDown={() => pauseBriefly(6500)}
      onTouchMove={() => pauseBriefly(6500)}
      onWheel={() => pauseBriefly(5000)}
    >
      <div className="carousel-heading-row">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2>{title}</h2>
          {intro && <p className="muted">{intro}</p>}
        </div>
        {usableImages.length > 1 && displayMode !== 'thumbnailLightbox' && (
          <div className="carousel-controls" aria-label={`${eyebrow} carousel controls`}>
            <button type="button" className="button ghost carousel-button" onClick={() => go(-1)} aria-label={`Previous ${eyebrow.toLowerCase()} photo`}>‹</button>
            <button type="button" className="button ghost carousel-button" onClick={() => go(1)} aria-label={`Next ${eyebrow.toLowerCase()} photo`}>›</button>
          </div>
        )}
      </div>

      {displayMode !== 'thumbnailLightbox' && (
        <div className="carousel-feature-card">
          <figure className="carousel-main-frame">
            <div className="carousel-fade-stage" aria-live="polite">
              {usableImages.map((image, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={`${image.src}-${index}`}
                  className={`carousel-fade-image ${index === activeIndex ? 'active' : ''}`}
                  src={image.src}
                  alt={index === activeIndex ? (image.title || `${eyebrow} photo ${index + 1}`) : ''}
                  aria-hidden={index === activeIndex ? undefined : true}
                  loading={index === activeIndex ? 'eager' : 'lazy'}
                />
              ))}
            </div>
          </figure>

          <div className="carousel-feature-copy">
            <div className="carousel-count">{activeIndex + 1} of {usableImages.length}</div>
            <h3>{active.title || `${eyebrow} ${activeIndex + 1}`}</h3>
            {active.description ? (
              <p>{active.description}</p>
            ) : (
              <p>A featured Katy Vibes menu item from the current website gallery.</p>
            )}
          </div>
        </div>
      )}

      {(displayMode === 'thumbnailLightbox' ? usableImages.length >= 1 : usableImages.length > 1) && (
        <div className="carousel-thumbnails" aria-label={`${eyebrow} photo choices`}>
          {usableImages.map((image, index) => (
            <button
              type="button"
              key={`${image.src}-${index}`}
              className={`carousel-thumb ${index === activeIndex ? 'active' : ''}`}
              onClick={() => displayMode === 'thumbnailLightbox' ? openLightbox(index) : (pauseBriefly(), setActiveIndex(index))}
              aria-label={`${displayMode === 'thumbnailLightbox' ? 'Enlarge' : 'Show'} ${image.title || `${eyebrow.toLowerCase()} photo ${index + 1}`}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.src} alt="" loading="lazy" />
              <span>{image.title || `Photo ${index + 1}`}</span>
            </button>
          ))}
        </div>
      )}

      {displayMode === 'thumbnailLightbox' && lightboxImage && typeof document !== 'undefined' && createPortal(
        <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={`${eyebrow} enlarged photo`} onClick={() => setLightboxIndex(null)}>
          <div className="image-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <button type="button" className="image-lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Close enlarged photo">×</button>
            <div className="image-lightbox-frame">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={lightboxImage.src} alt={lightboxImage.title || `${eyebrow} enlarged photo`} />
            </div>
            <div className="image-lightbox-footer">
              <button type="button" className="button ghost carousel-button" onClick={() => moveLightbox(-1)} aria-label={`Previous ${eyebrow.toLowerCase()} photo`}>‹</button>
              <div>
                <div className="carousel-count">{(lightboxIndex ?? 0) + 1} of {usableImages.length}</div>
                <h3>{lightboxImage.title || `${eyebrow} photo ${(lightboxIndex ?? 0) + 1}`}</h3>
                {lightboxImage.description && <p>{lightboxImage.description}</p>}
              </div>
              <button type="button" className="button ghost carousel-button" onClick={() => moveLightbox(1)} aria-label={`Next ${eyebrow.toLowerCase()} photo`}>›</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
}
