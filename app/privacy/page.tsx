import { katyVibesInfo } from '@/lib/siteContent';

export const metadata = {
  title: 'Privacy Policy | Katy Vibes',
  description:
    'Read how Katy Vibes handles customer information for website use, reservations, tickets, payments, communications, and optional SMS messages.',
};

export default function PrivacyPage() {
  return (
    <section className="stack legal-page">
      <div className="hero page-hero legal-hero">
        <div className="eyebrow">Privacy Policy</div>
        <h1>
          <span className="gradient-text">Privacy at</span>
          <br />
          Katy Vibes
        </h1>
        <p>
          This policy explains how Katy Vibes handles information connected with
          our website, reservations, tickets, customer communications, and related
          services.
        </p>
      </div>

      <article className="card stack legal-document">
        <p className="legal-meta">Last updated: September 16, 2026</p>

        <section>
          <h2>Information we collect</h2>
          <p>
            When you interact with Katy Vibes, you may provide information directly
            to us through our website, reservation and ticketing services, checkout,
            contact forms, job or event inquiries, and other customer-service
            interactions.
          </p>
          <p>This information may include:</p>
          <ul>
            <li>your name, email address, and phone number;</li>
            <li>reservation, party, ticket, table, and event information;</li>
            <li>
              transaction and payment-related information associated with a purchase
              or reservation;
            </li>
            <li>messages, requests, preferences, and other information you submit; and</li>
            <li>
              technical information reasonably needed to operate, secure, and support
              our online services.
            </li>
          </ul>
          <p>
            Payment information may be collected or processed by a payment service
            provider. Katy Vibes may receive transaction details such as payment
            status, amount, transaction identifiers, and related records needed to
            complete or manage the transaction.
          </p>
        </section>

        <section>
          <h2>How we use information</h2>
          <p>We may use customer information to:</p>
          <ul>
            <li>receive, review, confirm, and manage reservation requests;</li>
            <li>sell and manage tickets, tables, and event-related products;</li>
            <li>process and document payments and transactions;</li>
            <li>send confirmations and service or event-related communications;</li>
            <li>respond to customer questions and support requests;</li>
            <li>operate, maintain, secure, and improve our services; and</li>
            <li>maintain business, accounting, and operational records.</li>
          </ul>
        </section>

        <section>
          <h2>SMS and text-message information</h2>
          <p>
            When Katy Vibes offers an SMS opt-in, participation is optional. If you
            choose to opt in, we may record your mobile number, consent choice, and
            information about when and where that choice was made with the related
            reservation, order, or customer record.
          </p>
          <p>
            We may use that information to send transactional text messages about
            reservations, tickets, confirmations, event or service information, and
            customer-service-related matters, including catering-request follow-ups. Choosing not to opt in to SMS does not
            prevent you from purchasing a ticket, requesting a reservation, or
            otherwise doing business with Katy Vibes.
          </p>
          <p>
            <strong>
              Mobile information, including mobile phone numbers, SMS opt-in data,
              and SMS consent, is not sold, rented, or shared with third parties or
              affiliates for their marketing or promotional purposes.
            </strong>
          </p>
          <p>
            Service providers that help us deliver text messages may process mobile
            numbers, message content, delivery information, and related data as needed
            to provide those services on our behalf.
          </p>
          <p>
            Message frequency varies based on your reservations, tickets, and
            customer-service interactions. Message and data rates may apply.
          </p>
        </section>

        <section>
          <h2>Service providers and disclosures</h2>
          <p>
            Katy Vibes uses service providers to help operate customer-facing and
            business systems. Depending on the service, providers may support payment
            processing, hosting, email delivery, SMS delivery, ticketing, reservation
            operations, security, or other business functions. They may process
            information as reasonably needed to provide those services to Katy Vibes.
          </p>
          <p>
            We may also disclose information when reasonably necessary to comply with
            applicable law, respond to lawful requests, protect our rights or property,
            address fraud or security concerns, or protect customers and others.
          </p>
        </section>

        <section>
          <h2>Retention and security</h2>
          <p>
            We retain information for as long as reasonably needed for the purposes
            described in this policy, including providing customer services,
            maintaining reservation and transaction records, resolving issues, and
            meeting applicable business, accounting, or legal obligations. Retention
            periods may vary depending on the type of information and why it is kept.
          </p>
          <p>
            We use reasonable administrative and technical measures intended to
            protect information. No website, network, transmission, or storage system
            can be guaranteed to be completely secure.
          </p>
        </section>

        <section>
          <h2>Third-party services and links</h2>
          <p>
            Our website may link to or work with third-party services, including
            payment, ordering, ticketing, mapping, or social-media services. Their
            privacy practices are governed by their own policies when you interact
            directly with them.
          </p>
        </section>

        <section>
          <h2>Privacy questions</h2>
          <p>
            For questions about this policy or how Katy Vibes handles your
            information, contact us:
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

        <section>
          <h2>Updates to this policy</h2>
          <p>
            We may update this Privacy Policy as our services or practices change.
            When we make changes, we will update the date shown on this page.
          </p>
        </section>
      </article>
    </section>
  );
}
