'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { PublicEvent } from '@/lib/kvrsEvents';
import { eventFlyerImage, resolveKvrsAssetUrl } from '@/lib/kvrsEvents';
import { selectHomeFlyer } from '@/lib/homeFlyerSelection.mjs';
import type { HomeFlyerCandidate, HomeFlyerSelection } from '@/lib/homeFlyerSelection.mjs';

function getCardsPerPage(width: number) {
  if (width >= 980) return 4;
  if (width >= 760) return 3;
  if (width >= 640) return 2;
  return 1;
}

function cleanImageCandidates(values: Array<string | null | undefined>) {
  const seen = new Set<string>();

  return values
    .map((value) => resolveKvrsAssetUrl(value))
    .filter((value): value is string => Boolean(value))
    .filter((value) => {
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
}

function homepageCarouselFlyerCandidates(event: PublicEvent): string[] {
  const flyerImages = event.flyerImages || {};

  return cleanImageCandidates([
    flyerImages.tall,
    flyerImages.portrait,
    flyerImages.default,
    event.flyerImageUrl,
    flyerImages.square,
    event.thumbnailImageUrl,
    event.socialShareImageUrl,
    event.heroImageUrl,
    flyerImages.landscape,
    flyerImages.wide,
    eventFlyerImage(event, 'tall'),
    eventFlyerImage(event, 'portrait'),
    eventFlyerImage(event, 'default'),
    eventFlyerImage(event, 'square'),
  ]);
}

function probeFlyerDimensions(imageUrl: string): Promise<HomeFlyerCandidate | null> {
  return new Promise((resolve) => {
    const image = new window.Image();
    image.onload = () => {
      resolve({
        imageUrl,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };
    image.onerror = () => resolve(null);
    image.src = imageUrl;
  });
}

function HomeEventCard({ event, flexBasis }: { event: PublicEvent; flexBasis: string }) {
  const imageCandidates = useMemo(() => homepageCarouselFlyerCandidates(event), [event]);
  const [activeImage, setActiveImage] = useState<HomeFlyerSelection | null>(() =>
    imageCandidates[0]
      ? { imageUrl: imageCandidates[0], frame: 'five-six' }
      : null
  );

  useEffect(() => {
    let cancelled = false;
    const loadedCandidates: HomeFlyerCandidate[] = [];

    // The first flyer renders on the server in a safe, contained 5:6 frame.
    // Check intrinsic dimensions on the client: SHA-based filenames do not
    // identify the 9:16 variant. Switch to it if KVRS supplies one.
    setActiveImage(imageCandidates[0]
      ? { imageUrl: imageCandidates[0], frame: 'five-six' }
      : null
    );

    async function findPreferredFlyer() {
      for (const imageUrl of imageCandidates) {
        const candidate = await probeFlyerDimensions(imageUrl);
        if (cancelled) return;
        if (!candidate) continue;

        loadedCandidates.push(candidate);
        const selection = selectHomeFlyer(loadedCandidates);
        setActiveImage(selection);

        if (selection?.frame === 'nine-sixteen') return;
      }

      if (!cancelled) setActiveImage(selectHomeFlyer(loadedCandidates));
    }

    void findPreferredFlyer();
    return () => { cancelled = true; };
  }, [imageCandidates]);

  const isTruePortrait = activeImage?.frame === 'nine-sixteen';
  const linkClassName = `home-event-flyer-only-link ${
    isTruePortrait ? 'home-event-flyer-portrait-link' : 'home-event-flyer-fallback-link'
  }`;
  const imageClassName = `home-event-flyer home-event-flyer-only-image ${
    isTruePortrait ? 'home-event-flyer-true-portrait' : 'home-event-flyer-fallback-contain'
  }`;

  return (
    <article className="home-event-card home-event-flyer-only-card" style={{ flexBasis }}>
      <a className={linkClassName} href={`/events/${event.slug}`} aria-label={`View ${event.title}`}>
        {activeImage ? (
          <img
            className={imageClassName}
            src={activeImage.imageUrl}
            alt={event.flyerAlt || `${event.title} flyer`}
            onError={() => setActiveImage(null)}
          />
        ) : (
          <div className="home-event-flyer home-event-flyer-placeholder home-event-flyer-only-placeholder">
            <span>Katy Vibes</span>
            <strong>{event.shortTitle || event.title}</strong>
          </div>
        )}
      </a>
    </article>
  );
}

export function HomeEventsCarousel({ events }: { events: PublicEvent[] }) {
  const shellRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayRef = useRef(false);
  const [cardsPerPage, setCardsPerPage] = useState(4);
  const [pageIndex, setPageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [isRecentlyMoved, setIsRecentlyMoved] = useState(false);

  const pageCount = Math.max(1, Math.ceil(events.length / cardsPerPage));
  const isPaused = isHovered || isPointerDown || isRecentlyMoved;
  const cardFlexBasis = `calc((100% - ${(cardsPerPage - 1) * 16}px) / ${cardsPerPage})`;

  function clearResumeTimer() {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
  }

  function pauseBriefly(ms = 6000) {
    setIsRecentlyMoved(true);
    clearResumeTimer();
    resumeTimerRef.current = setTimeout(() => {
      setIsRecentlyMoved(false);
      resumeTimerRef.current = null;
    }, ms);
  }

  function scrollToPage(nextIndex: number, pauseAfter = true) {
    const track = trackRef.current;
    if (!track || pageCount <= 1) return;

    const wrappedIndex = (nextIndex + pageCount) % pageCount;
    const maxScrollLeft = Math.max(0, track.scrollWidth - track.clientWidth);
    const targetLeft = Math.min(maxScrollLeft, wrappedIndex * track.clientWidth);

    autoplayRef.current = !pauseAfter;
    track.scrollTo({ left: targetLeft, behavior: 'smooth' });
    setPageIndex(wrappedIndex);

    window.setTimeout(() => {
      autoplayRef.current = false;
    }, 900);

    if (pauseAfter) pauseBriefly(6500);
  }

  function advancePage(pauseAfter = false) {
    scrollToPage(pageIndex + 1, pauseAfter);
  }

  useEffect(() => {
    const update = () => {
      const width = shellRef.current?.clientWidth || window.innerWidth;
      setCardsPerPage(getCardsPerPage(width));
    };

    update();
    window.addEventListener('resize', update);

    let observer: ResizeObserver | null = null;
    if (shellRef.current && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(update);
      observer.observe(shellRef.current);
    }

    return () => {
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => () => clearResumeTimer(), []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const resetToStart = () => {
      track.scrollLeft = 0;
      setPageIndex(0);
    };

    resetToStart();
    const frame = window.requestAnimationFrame(resetToStart);

    return () => window.cancelAnimationFrame(frame);
  }, [cardsPerPage, events.length]);

  useEffect(() => {
    if (pageIndex > pageCount - 1) scrollToPage(0, false);
  }, [cardsPerPage, pageCount, pageIndex]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const handleScroll = () => {
      const nextIndex = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
      setPageIndex(Math.min(pageCount - 1, Math.max(0, nextIndex)));
    };

    track.addEventListener('scroll', handleScroll, { passive: true });
    return () => track.removeEventListener('scroll', handleScroll);
  }, [pageCount]);

  useEffect(() => {
    if (pageCount <= 1 || isPaused) return;

    const interval = window.setInterval(() => {
      advancePage(false);
    }, 4300);

    return () => window.clearInterval(interval);
  }, [pageCount, isPaused, pageIndex]);

  if (!events.length) return null;

  return (
    <div
      className="home-events-carousel-shell home-events-kvrs-carousel home-events-flyer-only-carousel home-events-clean-carousel"
      ref={shellRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      onPointerDown={() => {
        setIsPointerDown(true);
        pauseBriefly(7000);
      }}
      onPointerUp={() => {
        setIsPointerDown(false);
        pauseBriefly(6000);
      }}
      onPointerCancel={() => {
        setIsPointerDown(false);
        pauseBriefly(6000);
      }}
      onTouchMove={() => pauseBriefly(7000)}
      onWheel={() => pauseBriefly(6000)}
    >
      <div className="home-events-carousel-heading-row">
        <div className="home-events-heading-copy">
          <div className="eyebrow">Upcoming Events</div>
          <h2 id="home-events-title">Choose Your Vibe</h2>
        </div>

        <div className="home-events-heading-actions" aria-label="Upcoming event carousel actions">
          <a className="button ghost small-button home-events-view-all-button" href="/events">View All Events</a>

          {pageCount > 1 && (
            <>
              <button type="button" className="button ghost carousel-button" onClick={() => scrollToPage(pageIndex - 1)} aria-label="Previous set of events">‹</button>
              <span className="carousel-count">{pageIndex + 1} of {pageCount}</span>
              <button type="button" className="button ghost carousel-button" onClick={() => scrollToPage(pageIndex + 1)} aria-label="Next set of events">›</button>
            </>
          )}
        </div>
      </div>

      <div className="home-event-slider-window" ref={trackRef} aria-label="Upcoming Katy Vibes event flyers carousel">
        <div className="home-event-scroll-track">
          {events.map((event) => (
            <HomeEventCard event={event} flexBasis={cardFlexBasis} key={event.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
