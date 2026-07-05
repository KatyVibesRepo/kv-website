import { InquiryForm } from '@/components/InquiryForm';
import { partyPackages } from '@/lib/siteContent';

export default function PartiesPage() {
  return (
    <section className="stack">
      <div className="hero page-hero">
        <div className="eyebrow">Groups & Parties</div>
        <h1><span className="gradient-text">We host.</span><br />You party.</h1>
        <p>Birthdays, reunions, office functions, graduation dinners, family gatherings, watch parties, and special occasions with Katy Vibes energy.</p>
        <div className="button-row">
          <a className="button hot" href="#party-form">Request Party Info</a>
          <a className="button ghost" href="/events">Add an Event Night</a>
        </div>
      </div>

      <section className="split-section">
        <div className="card stack">
          <div className="eyebrow">Party Options</div>
          <h2>Celebrate with us</h2>
          <p className="muted">Tell us what you’re celebrating, your preferred date, guest count, and any food, music, or seating needs. Our team will review your request and help plan the right setup.</p>
        </div>
        <div className="card stack">
          <div className="eyebrow">What we can help with</div>
          <div className="feature-list">
            {partyPackages.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </section>

      <div id="party-form">
        <InquiryForm title="Tell us about your party" subjectHint="Party Inquiry" submitLabel="Request Party Info" />
      </div>
    </section>
  );
}
