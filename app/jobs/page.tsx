import { JobApplicationForm } from '@/components/JobApplicationForm';

export const metadata = {
  title: 'Jobs | Katy Vibes',
  description:
    'Apply to join the Katy Vibes team in Katy, Texas. Submit your restaurant, bar, kitchen, server, host, or events application for manager review.',
};

const hiringHighlights = [
  {
    title: 'Front of House',
    text: 'Servers, hosts, runners, bartenders, and guest-facing team members who bring great energy.',
  },
  {
    title: 'Kitchen Team',
    text: 'Line cooks, prep support, dish, and food-focused teammates who care about consistency.',
  },
  {
    title: 'Events & Nightlife',
    text: 'Support for live music, DJs, karaoke, private parties, watch parties, and busy weekend nights.',
  },
];

export default function JobsPage() {
  return (
    <main className="page-shell jobs-page">
      <section className="page-hero compact-page-hero jobs-hero">
        <div className="eyebrow">Careers at Katy Vibes</div>
        <h1>Join the Katy Vibes Team</h1>
        <p>
          We are looking for dependable, upbeat people who can help create a
          great restaurant, bar, patio, and live entertainment experience for Katy.
        </p>
      </section>

      <section className="section jobs-hiring-section">
        <div className="section-heading jobs-section-heading">
          <p className="eyebrow">Now accepting applications</p>
          <h2>Tell us where you fit best</h2>
          <p>
            This is a job application request, not a reservation form. Submit your
            availability, experience, and preferred position so our team can review it.
          </p>
        </div>

        <div className="jobs-highlight-grid" aria-label="Katy Vibes hiring areas">
          {hiringHighlights.map((item) => (
            <article className="jobs-highlight-card" key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section jobs-application-section" id="apply">
        <div className="jobs-application-layout">
          <aside className="jobs-application-intro">
            <p className="eyebrow">Application form</p>
            <h2>Apply to Work with Katy Vibes</h2>
            <p>
              Fill this out once. Your application will be sent to the Katy Vibes
              management team for review.
            </p>
            <div className="jobs-review-note">
              <strong>What happens next?</strong>
              <span>
                We will review your application and reach out if there is a good fit.
                Submitting this form does not guarantee an interview or job offer.
              </span>
            </div>
          </aside>

          <JobApplicationForm />
        </div>
      </section>
    </main>
  );
}
