'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

type ActiveMenuImage = {
  src: string;
  alt: string;
};

type OpenMenuImage = (image: ActiveMenuImage, opener: HTMLButtonElement) => void;

const MenuLightboxContext = createContext<OpenMenuImage | null>(null);

/**
 * Exactly one viewer for the entire page. Its portal escapes menu cards,
 * their overflow clipping, and any ancestor stacking contexts.
 */
export function MenuImageLightboxProvider({ children }: { children: ReactNode }) {
  const [activeImage, setActiveImage] = useState<ActiveMenuImage | null>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const openImage = useCallback<OpenMenuImage>((image, opener) => {
    openerRef.current = opener;
    setActiveImage(image);
  }, []);

  const closeImage = useCallback(() => setActiveImage(null), []);

  useEffect(() => {
    if (!activeImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeImage();
      } else if (event.key === 'Tab') {
        // The Close button is the viewer's only focusable control.
        event.preventDefault();
        closeRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (openerRef.current?.isConnected) openerRef.current.focus();
    };
  }, [activeImage, closeImage]);

  return (
    <MenuLightboxContext.Provider value={openImage}>
      {children}
      {activeImage && createPortal(
        <div
          className="menu-image-lightbox-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeImage();
          }}
        >
          <div
            className="menu-image-lightbox-dialog"
            role="dialog"
            aria-modal="true"
            aria-label={`Enlarged image: ${activeImage.alt}`}
          >
            <button
              ref={closeRef}
              type="button"
              className="menu-image-lightbox-close"
              onClick={closeImage}
              aria-label="Close enlarged image"
            >
              ×
            </button>
            <img
              className="menu-image-lightbox-image"
              src={activeImage.src}
              alt={activeImage.alt}
            />
          </div>
        </div>,
        document.body
      )}
    </MenuLightboxContext.Provider>
  );
}

export function MenuImageLightbox({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const openImage = useContext(MenuLightboxContext);

  if (!openImage) {
    throw new Error('MenuImageLightbox must be used inside MenuImageLightboxProvider');
  }

  return (
    <button
      type="button"
      className="menu-image-lightbox-trigger"
      onClick={(event) => openImage({ src, alt }, event.currentTarget)}
      aria-haspopup="dialog"
      aria-label={`Enlarge ${alt}`}
    >
      <img src={src} alt={alt} loading="lazy" />
    </button>
  );
}
