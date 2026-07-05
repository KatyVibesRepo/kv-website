'use client';

import { FormEvent, useMemo, useState } from 'react';
import type { PublicEvent, PublicSaleStatus, PublicTicketType } from '@/lib/kvrsEvents';

type EventTicketCheckoutCardsProps = {
  event: PublicEvent;
  ticketTypes: PublicTicketType[];
};

type TicketChoice = PublicTicketType | null;

type FormMessage = {
  tone: 'success' | 'muted' | 'error';
  text: string;
};

const inactiveSaleStatuses: PublicSaleStatus[] = [
  'coming_soon',
  'sold_out',
  'sales_closed',
  'canceled',
  'postponed',
];

const localKvrsBaseUrl = 'http://localhost:3001';

function kvrsCheckoutEndpoint() {
  const raw =
    process.env.NEXT_PUBLIC_KVRS_CHECKOUT_URL ||
    process.env.NEXT_PUBLIC_KVRS_CHECKOUT_API_URL ||
    process.env.NEXT_PUBLIC_KVRS_BASE_URL ||
    process.env.NEXT_PUBLIC_KVRS_URL ||
    localKvrsBaseUrl;

  const trimmed = raw.trim().replace(/\/+$/, '');
  const endpoint = trimmed || localKvrsBaseUrl;
  if (endpoint.endsWith('/api/checkout')) return endpoint;
  return `${endpoint}/api/checkout`;
}

function formatMoney(cents: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

function titleCaseStatus(status: string) {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ticketKey(event: PublicEvent, ticket: TicketChoice) {
  return ticket?.id || `${event.id}-general-admission`;
}

function ticketName(ticket: TicketChoice) {
  return ticket?.publicLabel || ticket?.name || 'General Admission';
}

function ticketDescription(event: PublicEvent, ticket: TicketChoice) {
  return ticket?.description || event.shortDescription || event.subtitle || '';
}

function ticketPrice(event: PublicEvent, ticket: TicketChoice) {
  if (ticket) {
    return ticket.priceCents > 0 ? formatMoney(ticket.priceCents, ticket.currency) : 'Free';
  }

  const lowestPrice = event.ticketSummary?.lowestPriceCents || 0;
  if (lowestPrice > 0) return formatMoney(lowestPrice);
  return event.priceDisplay || event.coverText || 'See details';
}

function ticketGuestText(ticket: TicketChoice) {
  if (!ticket) return '1 guest';
  return ticket.guestCount > 1 ? `${ticket.guestCount} guests` : '1 guest';
}

function ticketAvailableText(ticket: TicketChoice) {
  if (!ticket) return 'Available while supplies last';
  if (ticket.quantityAvailable <= 0) return 'No remaining inventory listed';
  return `${ticket.quantityAvailable} available`;
}

function quantityMin(ticket: TicketChoice) {
  if (!ticket) return 1;
  return Math.max(1, ticket.minQuantity || 1);
}

function quantityMax(ticket: TicketChoice) {
  const min = quantityMin(ticket);
  if (!ticket) return 1;

  const configuredMax = Math.max(min, ticket.maxQuantity || min);
  if (ticket.quantityAvailable > 0) {
    return Math.max(min, Math.min(configuredMax, ticket.quantityAvailable));
  }

  return configuredMax;
}

function shouldShowQuantity(ticket: TicketChoice) {
  return quantityMax(ticket) > quantityMin(ticket);
}

function buttonLabel(event: PublicEvent, ticket: TicketChoice) {
  if (isCheckoutDisabled(event, ticket)) {
    if (!ticket?.id && (event.isTicketed || event.ticketSummary?.isTicketed)) return 'Ticket Unavailable';
    return titleCaseStatus(event.saleStatus);
  }

  return 'Checkout';
}

function isCheckoutDisabled(event: PublicEvent, ticket: TicketChoice) {
  if (!ticket?.id && (event.isTicketed || event.ticketSummary?.isTicketed)) return true;

  if (ticket) {
    if (['canceled', 'postponed'].includes(event.saleStatus)) return true;
    if (ticket.checkoutEnabled === false || ticket.action?.enabled === false) return true;
    if (ticket.quantityAvailable <= 0) return true;
    if (ticket.status && !['active', 'published', 'available', 'on_sale'].includes(ticket.status)) return true;
    return false;
  }

  if (inactiveSaleStatuses.includes(event.saleStatus)) return true;
  return false;
}

function readFormValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === 'string' ? value.trim() : '';
}

function checkoutErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object') {
    const maybeError = 'error' in data ? data.error : null;
    const maybeMessage = 'message' in data ? data.message : null;

    if (typeof maybeError === 'string' && maybeError.trim()) return maybeError;
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) return maybeMessage;
  }

  return fallback;
}

export function EventTicketCheckoutCards({ event, ticketTypes }: EventTicketCheckoutCardsProps) {
  const [messages, setMessages] = useState<Record<string, FormMessage>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});

  const choices = useMemo<TicketChoice[]>(() => {
    if (ticketTypes.length > 0) return ticketTypes;
    if (event.isTicketed || event.ticketSummary?.isTicketed) return [null];
    return [];
  }, [event.isTicketed, event.ticketSummary?.isTicketed, ticketTypes]);

  if (!choices.length) return null;

  async function handleSubmit(ticket: TicketChoice, formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    const key = ticketKey(event, ticket);

    if (isCheckoutDisabled(event, ticket)) {
      setMessages((current) => ({
        ...current,
        [key]: {
          tone: 'muted',
          text: !ticket?.id
            ? 'This event is missing a selectable ticket type. Please call 832-437-2807 and we can help you finish booking.'
            : `${ticketName(ticket)} is currently marked ${titleCaseStatus(event.saleStatus)}.`,
        },
      }));
      return;
    }

    const formData = new FormData(formEvent.currentTarget);
    const quantity = Number(readFormValue(formData, 'quantity')) || quantityMin(ticket);
    const min = quantityMin(ticket);
    const max = quantityMax(ticket);
    const safeQuantity = Math.max(min, Math.min(max, quantity));

    const payload = {
      ticketTypeId: ticket?.id,
      quantity: safeQuantity,
      customerName: readFormValue(formData, 'customerName'),
      customerEmail: readFormValue(formData, 'customerEmail'),
      customerPhone: readFormValue(formData, 'customerPhone'),
    };

    if (!payload.ticketTypeId) {
      setMessages((current) => ({
        ...current,
        [key]: {
          tone: 'error',
          text: 'This ticket option is missing its KVRS ticket type ID. Please refresh or call 832-437-2807.',
        },
      }));
      return;
    }

    setPending((current) => ({ ...current, [key]: true }));
    setMessages((current) => ({
      ...current,
      [key]: { tone: 'muted', text: 'Opening secure checkout…' },
    }));

    try {
      const response = await fetch(kvrsCheckoutEndpoint(), {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json().catch(() => null)) as { ok?: boolean; url?: string | null } | null;

      if (response.ok && data?.ok && data.url) {
        window.location.href = data.url;
        return;
      }

      setMessages((current) => ({
        ...current,
        [key]: {
          tone: 'error',
          text: checkoutErrorMessage(
            data,
            'Checkout could not be started. Please check your information or call 832-437-2807.',
          ),
        },
      }));
    } catch {
      setMessages((current) => ({
        ...current,
        [key]: {
          tone: 'error',
          text: 'Checkout service is unavailable right now. Please try again or call 832-437-2807.',
        },
      }));
    } finally {
      setPending((current) => ({ ...current, [key]: false }));
    }
  }

  return (
    <section className="event-ticket-options-section stack" id="event-ticket-options" aria-label="Ticket options">
      <div className="row-between event-ticket-options-heading">
        <div>
          <div className="eyebrow">Tickets & Tables</div>
          <h2>Choose your spot.</h2>
          <p className="muted">
            Pick an option, enter your contact information, and continue to secure checkout.
          </p>
        </div>
      </div>

      <div className="event-ticket-option-grid">
        {choices.map((ticket) => {
          const key = ticketKey(event, ticket);
          const disabled = isCheckoutDisabled(event, ticket);
          const message = messages[key];
          const isPending = Boolean(pending[key]);
          const minQuantity = quantityMin(ticket);
          const maxQuantity = quantityMax(ticket);

          return (
            <article className="event-ticket-purchase-card card" key={key}>
              <div className="ticket-purchase-card-top">
                <div>
                  <h3>{ticketName(ticket)}</h3>
                  {ticketDescription(event, ticket) && <p>{ticketDescription(event, ticket)}</p>}
                </div>
                <strong className="ticket-purchase-price">{ticketPrice(event, ticket)}</strong>
              </div>

              <div className="ticket-purchase-meta" aria-label="Ticket details">
                <span>{ticketGuestText(ticket)}</span>
                <span>{ticketAvailableText(ticket)}</span>
                {ticket?.type && <span>{ticket.type.replace(/_/g, ' ')}</span>}
              </div>

              <form className="ticket-purchase-form" onSubmit={(formEvent) => handleSubmit(ticket, formEvent)}>
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="eventSlug" value={event.slug} />
                <input type="hidden" name="ticketTypeId" value={ticket?.id || ''} />
                <input type="hidden" name="ticketTypeName" value={ticketName(ticket)} />

                {shouldShowQuantity(ticket) ? (
                  <label>
                    <span>Quantity</span>
                    <input
                      name="quantity"
                      type="number"
                      inputMode="numeric"
                      min={minQuantity}
                      max={maxQuantity}
                      defaultValue={minQuantity}
                      required
                    />
                  </label>
                ) : (
                  <input type="hidden" name="quantity" value={minQuantity} />
                )}

                <label>
                  <span>Name</span>
                  <input name="customerName" type="text" autoComplete="name" required />
                </label>

                <label>
                  <span>Email</span>
                  <input name="customerEmail" type="email" autoComplete="email" required />
                </label>

                <label>
                  <span>Phone Number</span>
                  <input name="customerPhone" type="tel" autoComplete="tel" required />
                </label>

                <button className="button" type="submit" disabled={disabled || isPending}>
                  {isPending ? 'Opening Checkout…' : buttonLabel(event, ticket)}
                </button>

                {message && (
                  <p
                    className={`ticket-form-message ${
                      message.tone === 'success' ? 'success' : message.tone === 'error' ? 'error' : ''
                    }`}
                  >
                    {message.text}
                  </p>
                )}
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}
