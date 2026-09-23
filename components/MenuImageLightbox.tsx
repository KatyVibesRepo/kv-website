'use client';

import { useEffect, useState } from 'react';

export function MenuImageLightbox({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="menu-image-lightbox-trigger"
        onClick={() => setIsOpen(true)}
        aria-label={`Enlarge ${alt}`}
      >
        <img src={src} alt={alt} loading="lazy" />
      </button>

      {isOpen ? (
        <div
          className="menu-image-lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`Enlarged image: ${alt}`}
          onClick={() => setIsOpen(false)}
        >
          <button
            type="button"
            className="menu-image-lightbox-close"
            onClick={() => setIsOpen(false)}
            aria-label="Close enlarged image"
          >
            ×
          </button>
          <img
            className="menu-image-lightbox-image"
            src={src}
            alt={alt}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      ) : null}
    </>
  );
}
