export type WebsiteEvent = {
  id: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string | null;
  badge: string;
  ctaLabel: string;
  actionUrl: string;
};

export const websiteEvents: WebsiteEvent[] = [
  {
    id: 'weekend-patio-hookah',
    slug: 'weekend-patio-hookah',
    title: 'Friday & Saturday Patio Hookah',
    description:
      'Ease into the weekend with patio hookah, food, drinks, music, sports, and Katy Vibes energy.',
    imageUrl: null,
    badge: 'Weekend Patio',
    ctaLabel: 'Plan Your Night',
    actionUrl: '/contact',
  },
  {
    id: 'karaoke-open-mic',
    slug: 'karaoke-open-mic',
    title: 'Karaoke & Open Mic Nights',
    description:
      'Grab the mic, bring your people, and enjoy one of Katy Vibes’ favorite recurring community nights.',
    imageUrl: null,
    badge: 'Karaoke / Open Mic',
    ctaLabel: 'View Events',
    actionUrl: '/events',
  },
  {
    id: 'sports-watch-parties',
    slug: 'sports-watch-parties',
    title: 'Sports & Watch Parties',
    description:
      'Catch the big games with food, drinks, surround sound, and the 24-foot projector screen experience.',
    imageUrl: null,
    badge: 'Watch Parties',
    ctaLabel: 'Watch With Us',
    actionUrl: '/events',
  },
  {
    id: 'live-music-djs',
    slug: 'live-music-djs',
    title: 'Live Music, DJs & Dancing',
    description:
      'From live bands to DJs and dance-floor nights, Katy Vibes brings the energy all week and all weekend.',
    imageUrl: null,
    badge: 'Live Entertainment',
    ctaLabel: 'Choose Your Vibe',
    actionUrl: '/events',
  },
];
