import { HomeEventsCarousel } from '@/components/HomeEventsCarousel';
import { HomepageMediaExperience } from '@/components/HomepageMediaExperience';
import { homeFeaturePanels, katyVibesInfo } from '@/lib/siteContent';
import { ReviewsSection } from '@/components/ReviewsSection';
import { liveHomepageGalleryImages, liveHomepageHeroImages } from '@/lib/liveHomepageImages';
import { getPublicEvents } from '@/lib/kvrsEvents';
import { getSiteMediaImages } from '@/lib/kvrsSiteMedia';

export const dynamic = 'force-dynamic';
export const revalidate = 0;


const homeSections = [
  { href: '/specials', eyebrow: 'Specials', title: 'Happy hour and weekly deals', text: 'Make weekdays easier with food and drink specials.', shape: 'edge' },
  { href: '/food', eyebrow: 'Food', title: 'Dinner, shareables, wings, seafood, burgers, and late-night bites', text: 'Build the night around great food before the music starts.', shape: 'middle' },
  { href: '/events', eyebrow: 'Events', title: 'Live music, karaoke, line dancing, comedy, DJs, and cultural nights', text: 'Flyers, tickets, tables, and free-event reservations all in one place.', shape: 'peak' },
  { href: '/drinks', eyebrow: 'Drinks', title: 'Cocktails, shots, beer, wine, seltzers, and mocktails', text: 'A full bar menu for date nights, groups, parties, and regulars.', shape: 'middle' },
  { href: '/jobs', eyebrow: 'Jobs', title: 'Work with Katy Vibes', text: 'Interested in joining the crew? Tell us about your experience and availability.', shape: 'edge' },
  { href: '/reserve', eyebrow: 'Reserve', title: 'Reserve a table or spot for upcoming events', text: 'Free events use reservations; ticketed events use checkout.', shape: 'low' },
  { href: '/parties', eyebrow: 'Parties', title: 'Birthdays, reunions, graduation parties, and company nights', text: 'Plan the night, reserve space, and let Katy Vibes help with the flow.', shape: 'tall' },
  { href: '/about', eyebrow: 'About Us', title: 'Where the community comes to shine', text: 'Learn the mission behind Katy Vibes: community, culture, connection, local talent, and unforgettable nights.', shape: 'peak' },
  { href: '/catering', eyebrow: 'Catering', title: 'Bring Katy Vibes food to your outside event', text: 'For corporate events, birthdays, holidays, weddings, and community gatherings.', shape: 'low' },
];

export default async function HomePage() {
  const [
    upcomingHomeEvents,
    kvrsHeroImages,
    kvrsSecondaryGalleryImages,
    kvrsCommunityPanelImages,
  ] = await Promise.all([
    getPublicEvents({ limit: 100 }),
    getSiteMediaImages('home_hero_gallery'),
    getSiteMediaImages('home_secondary_gallery'),
    getSiteMediaImages('home_community_panel'),
  ]);

  const homeHeroImages = kvrsHeroImages.length ? kvrsHeroImages : liveHomepageHeroImages;
  const homeSecondaryGalleryImages = kvrsSecondaryGalleryImages.length
    ? kvrsSecondaryGalleryImages
    : liveHomepageGalleryImages;
  const homeCommunityPanelImages = kvrsCommunityPanelImages.length
    ? kvrsCommunityPanelImages
    : [...homeHeroImages, ...homeSecondaryGalleryImages].slice(0, 12);
return (
    <section className="stack home-page-stack">
      
      <HomepageMediaExperience
        heroImages={homeHeroImages}
        galleryImages={homeSecondaryGalleryImages}
        showGallery={false}
      />

<div className="hero page-hero home-hero">
        <div className="eyebrow">Restaurant • Bar • Live Events</div>
        <h1><span className="gradient-text">Good food.</span><br />Real vibes.</h1>
        <p>
          Katy’s spot for dinner, drinks, live shows, parties, and game nights.
        </p>
        <div className="button-row">
          <a className="button hot" href="/events">Choose your vibe</a>
          <a className="button ghost" href="/reserve">Make a Reservation</a>
          <a className="button ghost" href="/parties">Plan a Party</a>
        </div>
      </div>

      <section className="quick-action-grid" aria-label="Quick actions">
        <a className="quick-action hot-card" href="/events"><span>Upcoming Events</span><strong>Tickets, tables, and reservations</strong></a>
        <a className="quick-action" href="/food"><span>Food Menu</span><strong>Shareables, wings, burgers, seafood</strong></a>
        <a className="quick-action" href="/drinks"><span>Drink Menu</span><strong>Cocktails, shots, beer, wine</strong></a>
        <a className="quick-action" href="/contact"><span>Visit Us</span><strong>{katyVibesInfo.addressLines.join(', ')}</strong></a>
      </section>


      <section className="feature-panel-grid" aria-label="Katy Vibes highlights">
        {homeFeaturePanels.map((panel) => (
          <a className="feature-panel card" href={panel.href} key={panel.title}>
            <div className="eyebrow">{panel.eyebrow}</div>
            <h3>{panel.title}</h3>
            <p>{panel.text}</p>
            <span className="button ghost small-button">{panel.action}</span>
          </a>
        ))}
      </section>

      <section className="home-events-section" aria-labelledby="home-events-title">
        {upcomingHomeEvents.length === 0 ? (
          <div className="card stack">
            <h3>No upcoming events yet</h3>
            <p>Upcoming events from KV ReservationService will appear here as soon as they are published.</p>
          </div>
        ) : (
          <HomeEventsCarousel
            events={upcomingHomeEvents}
          />
        )}
      </section>

      <section className="site-section-grid" aria-label="Katy Vibes website sections">
        {homeSections.map((card) => (
          <a className={`card stack website-section-card website-section-card--${card.shape}`} href={card.href} key={card.href}>
            <div className="eyebrow">{card.eyebrow}</div>
            <h3>{card.title}</h3>
            <p className="muted">{card.text}</p>
            <span className="button ghost small-button">Open {card.eyebrow}</span>
          </a>
        ))}
      </section>

      <HomepageMediaExperience
        heroImages={[]}
        galleryImages={homeSecondaryGalleryImages}
        showHero={false}
        showGallery
        className="homepage-gallery-after-jobs"
      />

      <ReviewsSection />

      <section className="split-section">
        <div className="card stack">
          <div className="eyebrow">About Katy Vibes</div>
          <h2>Unwind. Relax. Enjoy.</h2>
          <p className="muted">
            Katy Vibes is more than a restaurant, bar, or live music venue. It is a community destination built around food, music, culture, local talent, and unforgettable nights in Katy, Texas.
          </p>
          <a className="button ghost" href="/about">Read About Us</a>
        </div>
        <div className="card stack">
          <div className="eyebrow">Reservations</div>
          <h2>Free event? Reserve. Ticketed event? Checkout.</h2>
          <p className="muted">
            Reserve for free events or choose tickets and reserved tables for paid events. Event details are shown clearly before you confirm.
          </p>
          <a className="button hot" href="/reserve">Reserve Now</a>
        </div>
      </section>
    </section>
  );
}
