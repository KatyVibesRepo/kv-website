'use client';

import { FormEvent, useMemo, useState } from 'react';
import type {
  PublicEvent,
  PublicEventShow,
  PublicSaleStatus,
  PublicTicketType,
} from '@/lib/kvrsEvents';
import { resolveKvrsConfig } from '@/lib/kvrsConfig.mjs';

type EventTicketCheckoutCardsProps = {
  event: PublicEvent;
  ticketTypes: PublicTicketType[];
};

type TicketChoice = PublicTicketType | null;

type TicketShowGroup = {
  key: string;
  title: string | null;
  detail: string | null;
  tone: string;
  order: number;
  tickets: TicketChoice[];
};

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

function kvrsClientConfig() {
  return resolveKvrsConfig(
    {
      NEXT_PUBLIC_KVRS_BASE_URL: process.env.NEXT_PUBLIC_KVRS_BASE_URL,
      NEXT_PUBLIC_KVRS_URL: process.env.NEXT_PUBLIC_KVRS_URL,
      NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL,
      NEXT_PUBLIC_KVRS_CHECKOUT_URL: process.env.NEXT_PUBLIC_KVRS_CHECKOUT_URL,
      NEXT_PUBLIC_KVRS_CHECKOUT_API_URL: process.env.NEXT_PUBLIC_KVRS_CHECKOUT_API_URL,
      NEXT_PUBLIC_KVRS_ORDER_LOOKUP_URL: process.env.NEXT_PUBLIC_KVRS_ORDER_LOOKUP_URL,
      NEXT_PUBLIC_KVRS_ORDERS_BY_SESSION_URL: process.env.NEXT_PUBLIC_KVRS_ORDERS_BY_SESSION_URL,
    },
    { scope: 'client', throwOnConflict: true, throwOnInvalid: true },
  );
}

function kvrsCheckoutEndpoint() {
  return kvrsClientConfig().checkoutUrl;
}

function kvrsFreeReservationEndpoint() {
  return `${kvrsClientConfig().baseUrl}/api/reservations`;
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

function ticketName(event: PublicEvent, ticket: TicketChoice) {
  if (ticket) return ticket.publicLabel || ticket.name || 'General Admission';

  if (
    event.saleStatus === 'rsvp_only'
    || (event.isFreeEvent && event.isReservationEnabled)
  ) {
    return 'Free RSVP';
  }

  return 'General Admission';
}

function ticketDescription(event: PublicEvent, ticket: TicketChoice) {
  return ticket?.description || event.shortDescription || event.subtitle || '';
}

function formatShowClockTime(value: string, timezone: string) {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) return null;

  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
  };

  try {
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      ...options,
      timeZone: 'America/Chicago',
    }).format(date);
  }
}

function formatShowTimeRange(show: PublicEventShow, eventTimezone: string) {
  const timezone = show.timezone || eventTimezone || 'America/Chicago';
  const start = formatShowClockTime(show.startsAt, timezone);

  if (!start) return null;

  if (!show.endsAt) return start;

  const end = formatShowClockTime(show.endsAt, timezone);

  return end ? `${start}–${end}` : start;
}

function ticketShowCoverage(event: PublicEvent, ticket: TicketChoice) {
  if (!ticket?.showIds?.length || !event.shows?.length) return null;

  const coveredIds = new Set(ticket.showIds);
  const coveredShows = event.shows.filter((show) => coveredIds.has(show.id));

  if (!coveredShows.length) return null;

  const showDetail = (show: PublicEventShow, includeBullet: boolean) => {
    const timeRange = formatShowTimeRange(show, event.timezone || 'America/Chicago');

    if (!timeRange) return show.name;

    return includeBullet
      ? `${show.name} • ${timeRange}`
      : `${show.name} ${timeRange}`;
  };

  const coversAllShows =
    coveredShows.length === event.shows.length &&
    event.shows.every((show) => coveredIds.has(show.id));

  if (coversAllShows && event.shows.length > 1) {
    const label = event.shows.length === 2 ? 'Both Shows' : 'All Shows';
    return `${label} • ${coveredShows.map((show) => showDetail(show, false)).join(' + ')}`;
  }

  if (coveredShows.length === 1) {
    return showDetail(coveredShows[0], true);
  }

  return `${coveredShows.length} Shows • ${coveredShows
    .map((show) => showDetail(show, false))
    .join(' + ')}`;
}


function buildTicketShowGroups(event: PublicEvent, choices: TicketChoice[]): TicketShowGroup[] {
  const eventShows = event.shows || [];

  if (eventShows.length === 0) {
    return [
      {
        key: 'event-options',
        title: 'Tickets & Tables',
        detail: null,
        tone: 'all',
        order: 0,
        tickets: choices,
      },
    ];
  }

  if (eventShows.length === 1) {
    const show = eventShows[0];

    return [
      {
        key: `show:${show.id}`,
        title: show.name || 'Tickets & Tables',
        detail: formatShowTimeRange(
          show,
          event.timezone || 'America/Chicago',
        ),
        tone: 'show-0',
        order: 0,
        tickets: choices,
      },
    ];
  }

  const groups = new Map<string, TicketShowGroup>();
  const showIndexes = new Map(eventShows.map((show, index) => [show.id, index]));

  const ensureGroup = (group: Omit<TicketShowGroup, 'tickets'>) => {
    const existing = groups.get(group.key);

    if (existing) return existing;

    const created: TicketShowGroup = {
      ...group,
      tickets: [],
    };

    groups.set(group.key, created);
    return created;
  };

  for (const ticket of choices) {
    if (!ticket?.showIds?.length) {
      ensureGroup({
        key: 'other',
        title: 'Other Ticket Options',
        detail: 'Additional ticket and table options for this event.',
        tone: 'other',
        order: 1000,
      }).tickets.push(ticket);

      continue;
    }

    const coveredIds = new Set(ticket.showIds);
    const coveredShows = eventShows.filter((show) => coveredIds.has(show.id));

    if (!coveredShows.length) {
      ensureGroup({
        key: 'other',
        title: 'Other Ticket Options',
        detail: 'Additional ticket and table options for this event.',
        tone: 'other',
        order: 1000,
      }).tickets.push(ticket);

      continue;
    }

    const coversAllShows =
      coveredShows.length === eventShows.length &&
      eventShows.every((show) => coveredIds.has(show.id));

    if (coversAllShows) {
      const title = eventShows.length === 2 ? 'Both Shows' : 'All Shows';

      const detail = coveredShows
        .map((show) => {
          const time = formatShowTimeRange(
            show,
            event.timezone || 'America/Chicago',
          );

          return time ? `${show.name} ${time}` : show.name;
        })
        .join(' + ');

      ensureGroup({
        key: 'all-shows',
        title,
        detail,
        tone: 'all',
        order: 0,
      }).tickets.push(ticket);

      continue;
    }

    if (coveredShows.length === 1) {
      const show = coveredShows[0];
      const showIndex = showIndexes.get(show.id) ?? 0;

      ensureGroup({
        key: `show:${show.id}`,
        title: show.name,
        detail: formatShowTimeRange(
          show,
          event.timezone || 'America/Chicago',
        ),
        tone: `show-${showIndex % 3}`,
        order: 10 + showIndex,
      }).tickets.push(ticket);

      continue;
    }

    const coveredIndexes = coveredShows.map(
      (show) => showIndexes.get(show.id) ?? 999,
    );

    const firstIndex = Math.min(...coveredIndexes);

    ensureGroup({
      key: `shows:${coveredShows.map((show) => show.id).join('|')}`,
      title: coveredShows.map((show) => show.name).join(' + '),
      detail: coveredShows
        .map((show) => {
          const time = formatShowTimeRange(
            show,
            event.timezone || 'America/Chicago',
          );

          return time ? `${show.name} ${time}` : show.name;
        })
        .join(' + '),
      tone: `show-${firstIndex % 3}`,
      order: 100 + firstIndex,
    }).tickets.push(ticket);
  }

  return Array.from(groups.values()).sort((a, b) => a.order - b.order);
}

function ticketSelectableShows(event: PublicEvent, ticket: TicketChoice) {
  if (
    !ticket
    || String(ticket.scope || 'EVENT').toUpperCase() !== 'SHOWS'
    || !ticket.showIds?.length
    || !event.shows?.length
  ) {
    return [];
  }

  const coveredIds = new Set(ticket.showIds);

  return event.shows.filter(
    (show) => coveredIds.has(show.id) && show.transactionEnabled !== false,
  );
}

function isFreeReservationChoice(event: PublicEvent, ticket: TicketChoice) {
  return Boolean(
    event.saleStatus === 'rsvp_only'
    || event.isFreeEvent
    || ticket?.type === 'free_rsvp'
    || (ticket && ticket.priceCents <= 0),
  );
}

function ticketPrice(event: PublicEvent, ticket: TicketChoice) {
  if (ticket) {
    return ticket.priceCents > 0 ? formatMoney(ticket.priceCents, ticket.currency) : 'Free';
  }

  if (isFreeReservationChoice(event, ticket)) return 'Free';

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

function isGeneralAdmissionTicket(ticket: TicketChoice) {
  return ticket?.type === 'general_admission';
}

function quantityMin(event: PublicEvent, ticket: TicketChoice) {
  if (isFreeReservationChoice(event, ticket)) {
    return Math.max(1, ticket?.minQuantity || 1);
  }

  if (!ticket || !isGeneralAdmissionTicket(ticket)) return 1;
  return Math.max(1, ticket.minQuantity || 1);
}

function quantityMax(event: PublicEvent, ticket: TicketChoice) {
  const min = quantityMin(event, ticket);

  if (isFreeReservationChoice(event, ticket)) {
    const configuredMax = Math.min(
      50,
      Math.max(min, ticket?.maxQuantity || 50),
    );

    if (ticket && ticket.quantityAvailable > 0) {
      return Math.max(
        min,
        Math.min(configuredMax, ticket.quantityAvailable),
      );
    }

    return configuredMax;
  }

  if (!ticket || !isGeneralAdmissionTicket(ticket)) return 1;

  const configuredMax = Math.max(min, ticket.maxQuantity || min);

  if (ticket.quantityAvailable > 0) {
    return Math.max(min, Math.min(configuredMax, ticket.quantityAvailable));
  }

  return configuredMax;
}

function shouldShowQuantity(event: PublicEvent, ticket: TicketChoice) {
  return quantityMax(event, ticket) > quantityMin(event, ticket);
}

function buttonLabel(event: PublicEvent, ticket: TicketChoice) {
  if (isCheckoutDisabled(event, ticket)) {
    if (!ticket?.id && (event.isTicketed || event.ticketSummary?.isTicketed)) return 'Ticket Unavailable';
    return titleCaseStatus(event.saleStatus);
  }

  return isFreeReservationChoice(event, ticket)
    ? 'Reserve Your Spot'
    : 'Checkout';
}

function isCheckoutDisabled(event: PublicEvent, ticket: TicketChoice) {
  if (!ticket?.id && (event.isTicketed || event.ticketSummary?.isTicketed)) return true;

  if (ticket) {
    if (['canceled', 'postponed'].includes(event.saleStatus)) return true;
    if (ticket.checkoutEnabled === false || ticket.action?.enabled === false) return true;
    if (ticket.quantityAvailable <= 0) return true;
    if (ticket.status && !['active', 'published', 'available', 'on_sale'].includes(ticket.status)) return true;

    if (
      String(ticket.scope || 'EVENT').toUpperCase() === 'SHOWS'
      && ticketSelectableShows(event, ticket).length === 0
    ) {
      return true;
    }

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
  const [pendingSubmissions, setPendingSubmissions] = useState<
    Record<string, { key: string; serializedPayload: string }>
  >({});

  const choices = useMemo<TicketChoice[]>(() => {
    if (ticketTypes.length > 0) return ticketTypes;
    if (event.isTicketed || event.ticketSummary?.isTicketed) return [null];
    if (
      event.saleStatus === 'rsvp_only'
      || (event.isFreeEvent && event.isReservationEnabled)
    ) {
      return [null];
    }
    return [];
  }, [
    event.isFreeEvent,
    event.isReservationEnabled,
    event.isTicketed,
    event.saleStatus,
    event.ticketSummary?.isTicketed,
    ticketTypes,
  ]);

  const showGroups = useMemo(
    () => buildTicketShowGroups(event, choices),
    [event, choices],
  );

  if (!choices.length) return null;

  async function handleSubmit(ticket: TicketChoice, formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();

    const key = ticketKey(event, ticket);
    const freeReservation = isFreeReservationChoice(event, ticket);

    if (isCheckoutDisabled(event, ticket)) {
      setMessages((current) => ({
        ...current,
        [key]: {
          tone: 'muted',
          text: !ticket?.id
            ? freeReservation
              ? 'This RSVP option is not available online right now. Please call 832-437-2807 and we can help.'
              : 'This event is missing a selectable ticket type. Please call 832-437-2807 and we can help you finish booking.'
            : `${ticketName(event, ticket)} is currently marked ${titleCaseStatus(event.saleStatus)}.`,
        },
      }));
      return;
    }

    const formData = new FormData(formEvent.currentTarget);
    const quantity = Number(readFormValue(formData, 'quantity'))
      || quantityMin(event, ticket);
    const min = quantityMin(event, ticket);
    const max = quantityMax(event, ticket);
    const safeQuantity = Math.max(min, Math.min(max, quantity));
    const showId = readFormValue(formData, 'showId');
    const selectableShows = ticketSelectableShows(event, ticket);

    if (
      ticket
      && String(ticket.scope || 'EVENT').toUpperCase() === 'SHOWS'
      && (!showId || !selectableShows.some((show) => show.id === showId))
    ) {
      setMessages((current) => ({
        ...current,
        [key]: {
          tone: 'error',
          text: 'Please choose an available show for this ticket or table option.',
        },
      }));
      return;
    }

    const guestName = readFormValue(formData, 'customerName');
    const guestEmail = readFormValue(formData, 'customerEmail');
    const guestPhone = readFormValue(formData, 'customerPhone');

    const payload = freeReservation
      ? {
          eventId: event.id,
          reservationTypeId: ticket?.id || null,
          showId: showId || null,
          guestName,
          guestEmail,
          guestPhone,
          partySize: safeQuantity,
          notes: readFormValue(formData, 'notes') || null,
          sourceDetail: 'Katy Vibes Website event RSVP',
        }
      : {
          ticketTypeId: ticket?.id,
          showId: showId || null,
          quantity: safeQuantity,
          customerName: guestName,
          customerEmail: guestEmail,
          customerPhone: guestPhone,
        };

    if (!freeReservation && !ticket?.id) {
      setMessages((current) => ({
        ...current,
        [key]: {
          tone: 'error',
          text: 'This ticket option is missing its KVRS ticket type ID. Please refresh or call 832-437-2807.',
        },
      }));
      return;
    }

    const serializedPayload = JSON.stringify(payload);
    const priorSubmission = pendingSubmissions[key];
    const idempotencyKey = freeReservation
      ? priorSubmission?.serializedPayload === serializedPayload
        ? priorSubmission.key
        : crypto.randomUUID()
      : null;

    if (idempotencyKey) {
      setPendingSubmissions((current) => ({
        ...current,
        [key]: {
          key: idempotencyKey,
          serializedPayload,
        },
      }));
    }

    setPending((current) => ({ ...current, [key]: true }));
    setMessages((current) => ({
      ...current,
      [key]: {
        tone: 'muted',
        text: freeReservation
          ? 'Submitting your RSVP request…'
          : 'Opening secure checkout…',
      },
    }));

    try {
      const response = await fetch(
        freeReservation
          ? kvrsFreeReservationEndpoint()
          : kvrsCheckoutEndpoint(),
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...(idempotencyKey
              ? { 'Idempotency-Key': idempotencyKey }
              : {}),
          },
          body: serializedPayload,
        },
      );

      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        url?: string | null;
        message?: string | null;
        error?: string | null;
      } | null;

      if (response.ok && data?.ok && freeReservation) {
        setPendingSubmissions((current) => {
          const next = { ...current };
          delete next[key];
          return next;
        });
        setMessages((current) => ({
          ...current,
          [key]: {
            tone: 'success',
            text:
              data.message
              || 'Your RSVP request was received. Katy Vibes management will review it before confirmation.',
          },
        }));
        formEvent.currentTarget.reset();
        return;
      }

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
            freeReservation
              ? 'Your RSVP could not be submitted. Please check your information or call 832-437-2807.'
              : 'Checkout could not be started. Please check your information or call 832-437-2807.',
          ),
        },
      }));
    } catch {
      setMessages((current) => ({
        ...current,
        [key]: {
          tone: 'error',
          text: freeReservation
            ? 'The RSVP service is unavailable right now. Please try again or call 832-437-2807.'
            : 'Checkout service is unavailable right now. Please try again or call 832-437-2807.',
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
            Pick an option, enter your contact information, and complete checkout or submit your RSVP request.
          </p>
        </div>
      </div>

      <div className="event-ticket-show-groups">
        {showGroups.map((group) => (
          <section
            className="event-ticket-show-group"
            data-show-tone={group.tone}
            key={group.key}
          >
            {group.title && (
              <div className="event-ticket-show-group-header">
                <div>
                  <div className="eyebrow">Ticket Options</div>
                  <h3>{group.title}</h3>
                  {group.detail && <p>{group.detail}</p>}
                </div>

                <span className="event-ticket-show-group-count">
                  {group.tickets.length}{' '}
                  {group.tickets.length === 1 ? 'option' : 'options'}
                </span>
              </div>
            )}

            <div className="event-ticket-option-grid">
              {group.tickets.map((ticket) => {
          const key = ticketKey(event, ticket);
          const disabled = isCheckoutDisabled(event, ticket);
          const message = messages[key];
          const isPending = Boolean(pending[key]);
          const minQuantity = quantityMin(event, ticket);
          const maxQuantity = quantityMax(event, ticket);
          const showCoverage = ticketShowCoverage(event, ticket);
          const selectableShows = ticketSelectableShows(event, ticket);
          const showScoped = Boolean(
            ticket
            && String(ticket.scope || 'EVENT').toUpperCase() === 'SHOWS',
          );
          const freeReservation = isFreeReservationChoice(event, ticket);

          return (
            <article className="event-ticket-purchase-card card" key={key}>
              <div className="ticket-purchase-card-top">
                <div>
                  <h3>{ticketName(event, ticket)}</h3>
                  {ticketDescription(event, ticket) && <p>{ticketDescription(event, ticket)}</p>}
                </div>
                <strong className="ticket-purchase-price">{ticketPrice(event, ticket)}</strong>
              </div>

              <div className="ticket-purchase-meta" aria-label="Ticket details">
                {showCoverage && <span>{showCoverage}</span>}
                <span>{ticketGuestText(ticket)}</span>
                <span>{ticketAvailableText(ticket)}</span>
                {ticket?.type && <span>{ticket.type.replace(/_/g, ' ')}</span>}
              </div>

              <form className="ticket-purchase-form" onSubmit={(formEvent) => handleSubmit(ticket, formEvent)}>
                <input type="hidden" name="eventId" value={event.id} />
                <input type="hidden" name="eventSlug" value={event.slug} />
                <input type="hidden" name="ticketTypeId" value={ticket?.id || ''} />
                <input type="hidden" name="ticketTypeName" value={ticketName(event, ticket)} />

                {showScoped && selectableShows.length === 1 ? (
                  <input type="hidden" name="showId" value={selectableShows[0].id} />
                ) : null}

                {showScoped && selectableShows.length > 1 ? (
                  <label>
                    <span>Choose Show</span>
                    <select name="showId" defaultValue="" required>
                      <option value="" disabled>Select a show</option>
                      {selectableShows.map((show) => {
                        const time = formatShowTimeRange(
                          show,
                          event.timezone || 'America/Chicago',
                        );

                        return (
                          <option key={show.id} value={show.id}>
                            {time ? `${show.name} — ${time}` : show.name}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                ) : null}

                {showScoped && selectableShows.length === 0 ? (
                  <p className="ticket-form-message error">
                    No eligible show is currently available for this option.
                  </p>
                ) : null}

                {shouldShowQuantity(event, ticket) ? (
                  <label>
                    <span>{freeReservation ? 'Party Size' : 'Quantity'}</span>
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

                {freeReservation ? (
                  <label>
                    <span>Notes (optional)</span>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Anything our team should know?"
                    />
                  </label>
                ) : null}

                <button className="button" type="submit" disabled={disabled || isPending}>
                  {isPending
                    ? freeReservation
                      ? 'Submitting RSVP…'
                      : 'Opening Checkout…'
                    : buttonLabel(event, ticket)}
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
        ))}
      </div>
    </section>
  );
}
