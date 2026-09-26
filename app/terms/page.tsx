import { katyVibesInfo } from '@/lib/siteContent';

export const metadata = {
  title: 'Terms | Katy Vibes',
  description:
    'Read the Katy Vibes website, reservation, ticketing, payment, and optional transactional SMS terms.',
};

export default function TermsPage() {
  return (
    <section className="stack legal-page">
      <div className="hero page-hero legal-hero">
        <div className="eyebrow">Terms</div>
        <h1>
          <span className="gradient-text">Katy Vibes</span>
          <br />
          Terms
        </h1>
        <p>
          These terms describe the basic rules for using the Katy Vibes website and
          customer-facing reservation, ticketing, payment, and communication services.
        </p>
      </div>

      <article className="card stack legal-document">
        <p className="legal-meta">Last updated: September 16, 2026</p>

        <section>
          <h2>Using our website and services</h2>
          <p>
            By using the Katy Vibes website or submitting information through our
            customer-facing services, you agree to use those services lawfully and not
            to interfere with, misuse, or attempt unauthorized access to our systems.
          </p>
          <p>
            Website content is provided to help customers learn about Katy Vibes,
            events, food and drinks, reservations, tickets, private events, and related
            services. Information may be updated as schedules, availability, pricing,
            or event details change.
          </p>
        </section>

        <section>
          <h2>Reservations</h2>
          <p>
            Submitting a reservation request does not by itself create a confirmed
            reservation. Unless the applicable flow clearly states otherwise, a
            reservation request remains pending until Katy Vibes reviews and confirms
            it.
          </p>
          <p>
            Please provide accurate contact and party information so our team can
            review the request and communicate about the reservation. Event-specific,
            table-specific, or reservation-specific conditions presented during the
            request or confirmation process may also apply.
          </p>
        </section>

        <section>
          <h2>Tickets, tables, events, and checkout</h2>
          <p>
            Ticket, table, and event-product availability may be limited. A purchase
            is completed only after the applicable checkout is successfully completed
            and a confirmation is issued.
          </p>
          <p>
            Prices, schedules, performers, seating options, entry requirements, and
            other event details may vary by event. Review the event page, checkout,
            confirmation, and any event-specific terms that are shown for your
            transaction.
          </p>
          <p>
            If an event or checkout presents a specific cancellation, refund,
            transfer, seating, age, or admission policy, that event-specific policy
            applies to the applicable transaction. Contact Katy Vibes before
            purchasing if you have questions about a policy that affects your order.
          </p>
        </section>

        <section>
          <h2>Payments</h2>
          <p>
            Online payments may be processed through third-party payment providers.
            Those providers may have additional terms and privacy practices that apply
            when they process your payment. Do not send payment-card information by
            text message or ordinary email.
          </p>
        </section>

        <section>
          <h2>Transactional SMS terms</h2>
          <p>
            Katy Vibes offers an optional Katy Vibes Customer Request Messaging
            Program for transactional reservation, ticket, catering, and job-application communications. SMS participation is
            voluntary and is not a condition of purchasing a ticket, making a
            reservation, submitting a job application, or otherwise doing business with Katy Vibes.
          </p>
          <p>
            If you choose to opt in, messages may relate to reservation requests,
            separate reservation confirmations after management approval, tickets,
            order confirmations, event or service information, and
            customer-service-related transactional communications, including catering inquiries and job-application follow-ups. Message frequency
            may vary based on your interactions with Katy Vibes.
          </p>
          <p>
            A text message acknowledging receipt of a reservation request does not
            confirm the reservation. Reservation confirmation is a separate explicit
            action by Katy Vibes management.
          </p>
          <ul>
            <li>Message and data rates may apply.</li>
            <li>
              Reply <strong>STOP</strong> to opt out of SMS messages.
            </li>
            <li>
              Reply <strong>HELP</strong> for assistance, call{' '}
              <a className="inline-link" href={katyVibesInfo.phoneHref}>
                {katyVibesInfo.phoneDisplay}
              </a>
              , or email{' '}
              <a className="inline-link" href={`mailto:${katyVibesInfo.email}`}>
                {katyVibesInfo.email}
              </a>
              .
            </li>
          </ul>
          <p>
            Opting out of SMS does not cancel an existing ticket, order, or
            reservation. It also does not prevent Katy Vibes from using other contact
            methods when reasonably needed to provide a service you requested.
          </p>
          <p>
            <strong>Carriers are not liable for any delayed or undelivered messages.</strong>
          </p>
        </section>

        <section>
          <h2>Customer information</h2>
          <p>
            Our collection and use of customer information is also described in the{' '}
            <a className="inline-link" href="/privacy">
              Katy Vibes Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2>Third-party services and links</h2>
          <p>
            The Website may link to third-party services such as payment, ordering,
            mapping, ticketing, or social-media services. Katy Vibes does not control
            the content or terms of third-party services, and your use of those
            services may be governed by their own terms and policies.
          </p>
        </section>

        <section>
          <h2>Website content</h2>
          <p>
            Katy Vibes names, branding, website copy, graphics, photographs, and other
            content may be owned by Katy Vibes or used with permission. Do not copy,
            republish, or commercially reuse protected content without the applicable
            permission.
          </p>
        </section>

        <section>
          <h2>Changes to these terms</h2>
          <p>
            We may update these Terms as our website, services, or customer programs
            change. When we make changes, we will update the date shown on this page.
          </p>
        </section>

        <section>
          <h2>Contact Katy Vibes</h2>
          <p>
            Questions about these Terms, a reservation, a ticket, or the SMS program
            can be directed to:
          </p>
          <p>
            <strong>{katyVibesInfo.name}</strong>
            <br />
            {katyVibesInfo.addressLines[0]}
            <br />
            {katyVibesInfo.addressLines[1]}
            <br />
            Phone:{' '}
            <a className="inline-link" href={katyVibesInfo.phoneHref}>
              {katyVibesInfo.phoneDisplay}
            </a>
            <br />
            Email:{' '}
            <a className="inline-link" href={`mailto:${katyVibesInfo.email}`}>
              {katyVibesInfo.email}
            </a>
          </p>
        </section>
      </article>
    </section>
  );
}
