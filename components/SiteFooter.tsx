import { katyVibesInfo, primaryNav } from '@/lib/siteContent';

const footerLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Events', href: '/events' },
  { label: 'Reserve', href: '/reserve' },
  { label: 'Parties', href: '/parties' },
  { label: 'Catering', href: '/catering' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Order Online', href: '/order' },
];

export function SiteFooter() {
  const kvrsAdminBaseUrl = (process.env.NEXT_PUBLIC_KVRS_BASE_URL || 'https://kv-reservationservice.vercel.app').replace(/\/$/, '');
  const adminLoginHref = `${kvrsAdminBaseUrl}/admin/login`;

  return (
    <footer className="site-footer">
      <div className="footer-glow" />
      <div className="footer-inner">
        <section className="footer-brand-panel">
          <img
            className="footer-logo"
            src="https://static.spotapps.co/website_images/ab_websites/71826_website_v1/logo.png"
            alt="Katy Vibes"
          />
          <div>
            <div className="eyebrow">Stay in touch</div>
            <h2>Food, drinks, events, and community — all in one place.</h2>
            <p>
              Katy Vibes is a restaurant, bar, and live events venue in Katy, Texas built around music, culture, celebrations, and local talent.
            </p>
            <div className="footer-button-row">
              <a className="button hot" href="/events">View Events</a>
              <a className="button ghost" href="/reserve">Reserve</a>
              <a className="button ghost" href={katyVibesInfo.phoneHref}>{katyVibesInfo.phoneDisplay}</a>
            </div>
          </div>
        </section>

        <section className="footer-grid">
          <div className="footer-column">
            <h3>Location</h3>
            <p>{katyVibesInfo.addressLines[0]}<br />{katyVibesInfo.addressLines[1]}</p>
            <a className="footer-link" href="/contact">Map & contact</a>
          </div>

          <div className="footer-column">
            <h3>Hours</h3>
            <dl className="footer-hours">
              {katyVibesInfo.hours.map((row) => (
                <div key={row.day}>
                  <dt>{row.day}</dt>
                  <dd>{row.time}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="footer-column">
            <h3>Explore</h3>
            <div className="footer-link-list">
              {primaryNav.map((item) => (
                <a href={item.href} key={item.href}>{item.label}</a>
              ))}
            </div>
          </div>

          <div className="footer-column">
            <h3>Book the vibe</h3>
            <div className="footer-link-list">
              {footerLinks.map((item) => (
                <a href={item.href} key={item.href}>{item.label}</a>
              ))}
            </div>
          </div>

          <div className="footer-column">
            <h3>Find us on</h3>
            <div className="footer-link-list social-list">
              {katyVibesInfo.socials.map((item) => (
                <a href={item.href} key={item.href} target="_blank" rel="noreferrer">{item.label}</a>
              ))}
            </div>
            <h3 className="footer-contact-heading">Contact us</h3>
            <a className="footer-link" href={katyVibesInfo.phoneHref}>{katyVibesInfo.phoneDisplay}</a>
            <a className="footer-link" href={`mailto:${katyVibesInfo.email}`}>{katyVibesInfo.email}</a>
          </div>
        </section>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Katy Vibes. All rights reserved.</span>
          <span>Good food. Good music. Great vibes.</span>
        </div>

        <div className="footer-admin-row" aria-label="Katy Vibes staff access">
          <a href={adminLoginHref} rel="nofollow noreferrer">Staff Login</a>
        </div>
      </div>
    </footer>
  );
}
