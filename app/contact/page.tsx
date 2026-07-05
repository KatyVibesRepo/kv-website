import { katyVibesInfo } from '@/lib/siteContent';

export default function ContactPage() {
  return (
    <section className="stack">
      <div className="hero page-hero">
        <div className="eyebrow">Contact & Location</div>
        <h1><span className="gradient-text">Come catch</span><br />the vibe.</h1>
        <p>Find us on Katy Freeway for food, drinks, dancing, live events, private parties, catering, and community nights.</p>
      </div>

      <section className="contact-section card">
        <div className="stack">
          <div className="eyebrow">Location</div>
          <h2>Visit Katy Vibes</h2>
          <p className="muted">{katyVibesInfo.addressLines[0]}<br />{katyVibesInfo.addressLines[1]}</p>
          <p className="muted">
            Call <a className="inline-link" href={katyVibesInfo.phoneHref}>{katyVibesInfo.phoneDisplay}</a><br />
            Email <a className="inline-link" href={`mailto:${katyVibesInfo.email}`}>{katyVibesInfo.email}</a>
          </p>
          <div className="button-row">
            <a className="button hot" href="/reserve">Make a Reservation</a>
            <a className="button ghost" href="https://www.google.com/maps/search/?api=1&query=24757+Katy+Freeway+Katy+TX+77494">Open Map</a>
          </div>
        </div>
        <div className="hours-grid">
          {katyVibesInfo.hours.map((row) => (
            <div key={row.day}><strong>{row.day}</strong><span>{row.time}</span></div>
          ))}
        </div>
      </section>
    </section>
  );
}
