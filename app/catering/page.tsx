import { InquiryForm } from '@/components/InquiryForm';
import { katyVibesInfo } from '@/lib/siteContent';
import { getCuratedFoodGalleryImages } from '@/lib/siteImages';

export const metadata = {
  title: 'Catering in Katy, TX | Katy Vibes',
  description:
    'Request catering from Katy Vibes for birthdays, office lunches, holidays, weddings, school events, community gatherings, and custom celebrations in Katy, TX.',
};

const cateringOccasions = [
  'Office lunches and team celebrations',
  'Birthdays, graduations, and family parties',
  'Holiday parties and seasonal gatherings',
  'Wedding weekends and rehearsal meals',
  'School, church, and community events',
  'Game-day spreads and watch-party groups',
];

const menuIdeas = [
  {
    title: 'Shareable starters',
    text: 'Spinach dip, chips and queso, fried pickles, sampler platters, Tex-Mex favorites, and easy table snacks.',
  },
  {
    title: 'Crowd-pleasing mains',
    text: 'Wings, sliders, burgers, fajitas, tacos, seafood favorites, and other Katy Vibes menu hits built around your guest count.',
  },
  {
    title: 'Lunch-friendly options',
    text: 'Simple, satisfying packages for offices, daytime celebrations, school events, and groups that need a smoother lunch plan.',
  },
  {
    title: 'Custom event menus',
    text: 'Tell us the occasion, timing, and style of service you want. Our team can help shape the right mix for your event.',
  },
];

const planningSteps = [
  {
    step: '01',
    title: 'Tell us the basics',
    text: 'Send the date, time, location, guest count, occasion, and any must-have menu items.',
  },
  {
    step: '02',
    title: 'Build the food plan',
    text: 'We will review the details and help narrow down portions, menu direction, and setup needs.',
  },
  {
    step: '03',
    title: 'Confirm the details',
    text: 'Once the plan is clear, the team will confirm availability, timing, and next steps directly with you.',
  },
];

export default function CateringPage() {
  const foodImages = getCuratedFoodGalleryImages().slice(0, 4);
  const featuredImage = foodImages[0];
  const supportingImages = foodImages.slice(1, 4);

  return (
    <section className="stack catering-page">
      <div className="hero catering-hero">
        <div className="catering-hero-copy stack">
          <div className="eyebrow">Katy Vibes Catering</div>
          <h1><span className="gradient-text">Feed the crowd</span><br />without losing the vibe.</h1>
          <p>
            Bring Katy Vibes flavor to birthdays, office lunches, holiday parties, wedding weekends,
            school events, community gatherings, and custom celebrations around Katy.
          </p>
          <div className="button-row">
            <a className="button hot" href="#catering-form">Request Catering</a>
            <a className="button ghost" href={katyVibesInfo.phoneHref}>Call {katyVibesInfo.phoneDisplay}</a>
            <a className="button ghost" href="/food">View Menu</a>
          </div>
        </div>

        <div className="catering-hero-visual" aria-label="Katy Vibes catering food preview">
          {featuredImage && (
            <figure className="catering-main-photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredImage.src} alt={featuredImage.title || 'Katy Vibes catering food'} />
              <figcaption>
                <span>Party-ready food</span>
                <strong>Built for groups</strong>
              </figcaption>
            </figure>
          )}
          <div className="catering-photo-stack">
            {supportingImages.map((image, index) => (
              <figure className="catering-small-photo" key={`${image.src}-${index}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.src} alt={image.title || `Katy Vibes catering option ${index + 1}`} />
              </figure>
            ))}
          </div>
        </div>
      </div>

      <section className="catering-top-grid">
        <article className="card catering-callout-card stack">
          <div className="eyebrow">Made for groups</div>
          <h2>Food that fits the moment.</h2>
          <p className="muted">
            Catering should be easy to understand, easy to serve, and good enough that people remember it.
            We can help you plan shareables, trays, lunch-friendly options, and custom spreads based on the
            kind of event you are hosting.
          </p>
          <div className="catering-pill-row" aria-label="Catering strengths">
            <span>Party trays</span>
            <span>Office meals</span>
            <span>Family events</span>
            <span>Custom menus</span>
          </div>
        </article>

        <article className="card catering-good-for-card stack">
          <div className="eyebrow">Great for</div>
          <div className="catering-check-grid">
            {cateringOccasions.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </article>
      </section>

      <section className="card stack catering-menu-preview">
        <div className="section-heading-row">
          <div>
            <div className="eyebrow">Menu direction</div>
            <h2>Start with the favorites. Customize from there.</h2>
          </div>
          <p className="muted">
            Every catering request is reviewed by the team so the final plan matches your guest count,
            timing, and event style.
          </p>
        </div>

        <div className="catering-menu-grid">
          {menuIdeas.map((item) => (
            <article className="catering-menu-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="catering-process-grid" aria-label="Catering request process">
        {planningSteps.map((item) => (
          <article className="card catering-step-card stack" key={item.step}>
            <span className="catering-step-number">{item.step}</span>
            <h3>{item.title}</h3>
            <p className="muted">{item.text}</p>
          </article>
        ))}
      </section>

      <section className="card catering-ready-strip">
        <div>
          <div className="eyebrow">Ready to plan?</div>
          <h2>Send the details. We’ll help shape the order.</h2>
          <p className="muted">
            Include the event date, pickup or service needs, guest count, budget range if you have one,
            and any allergies or dietary notes we should review.
          </p>
        </div>
        <div className="button-row">
          <a className="button hot" href="#catering-form">Start Request</a>
          <a className="button ghost" href={katyVibesInfo.phoneHref}>Call Now</a>
        </div>
      </section>

      <div id="catering-form" className="catering-form-anchor">
        <InquiryForm title="Request catering information" subjectHint="Catering Inquiry" submitLabel="Request Catering" />
      </div>
    </section>
  );
}
