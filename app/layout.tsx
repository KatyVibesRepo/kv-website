import './styles.css';
import { SiteBackdrop } from '@/components/SiteBackdrop';
import type { ReactNode } from 'react';
import { katyVibesInfo, primaryNav } from '@/lib/siteContent';
import { SiteFooter } from '@/components/SiteFooter';

export const metadata = {
  title: 'Katy Vibes | Events, Reservations, Food & Live Entertainment',
  description: 'Katy Vibes public website for events, reservations, food, drinks, parties, catering, jobs, and nightlife in Katy, TX.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteBackdrop />
        <header className="site-header">
          <a className="brand" href="/" aria-label="Katy Vibes home">
            <img
              className="brand-logo"
              src="https://static.spotapps.co/website_images/ab_websites/71826_website_v1/logo.png"
              alt="Katy Vibes"
            />
            <span className="brand-mark">
              <span className="brand-name">Katy Vibes</span>
              <span className="brand-subtitle">{katyVibesInfo.tagline}</span>
            </span>
          </a>
          <nav aria-label="Primary navigation">
            <a href="/">Home</a>
            {primaryNav.map((item) => (
              <a href={item.href} key={item.href}>{item.label}</a>
            ))}
          </nav>
        </header>
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
