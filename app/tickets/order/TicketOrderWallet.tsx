'use client';

import { useEffect, useState } from 'react';
import styles from './TicketOrderWallet.module.css';

type TicketWalletEvent = {
  id?: string | null;
  slug?: string | null;
  title?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

type TicketWalletTicketType = {
  id?: string | null;
  name?: string | null;
  kind?: string | null;
};

type TicketWalletTicket = {
  id?: string | null;
  status?: string | null;
  checkedInAt?: string | null;
  code?: string | null;
  label?: string | null;
  ticketUrl?: string | null;
  qrValue?: string | null;
  svg?: string | null;
};

type TicketWalletReservation = {
  id?: string | null;
  status?: string | null;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guestCount?: number | null;
  reservationType?: string | null;
  ticketCount?: number | null;
  tickets?: TicketWalletTicket[] | null;
};

type TicketWalletOrder = {
  id?: string | null;
  status?: string | null;
  quantity?: number | null;
  guestCount?: number | null;
  amountTotalCents?: number | null;
  paidAt?: string | null;
  event?: TicketWalletEvent | null;
  ticketType?: TicketWalletTicketType | null;
  reservation?: TicketWalletReservation | null;
};

type OrderLookupResponse = {
  ok?: boolean;
  order?: TicketWalletOrder | null;
  error?: string | null;
  message?: string | null;
};

type LoadState =
  | { status: 'loading'; message: string }
  | { status: 'preparing'; message: string }
  | { status: 'ready'; order: TicketWalletOrder }
  | { status: 'error'; message: string };

const localKvrsBaseUrl = 'http://localhost:3001';
const maxPollingMs = 60_000;
const pollEveryMs = 2_000;

function kvrsOrderLookupEndpoint() {
  const explicit =
    process.env.NEXT_PUBLIC_KVRS_ORDER_LOOKUP_URL ||
    process.env.NEXT_PUBLIC_KVRS_ORDERS_BY_SESSION_URL;

  if (explicit?.trim()) {
    return explicit.trim().replace(/\/+$/, '');
  }

  const base =
    process.env.NEXT_PUBLIC_KVRS_BASE_URL ||
    process.env.NEXT_PUBLIC_KVRS_URL ||
    localKvrsBaseUrl;

  return `${base.trim().replace(/\/+$/, '')}/api/orders/by-session`;
}

function readSessionId() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('session_id')?.trim() || '';
}

function buildLookupUrl(sessionId: string) {
  // Use a same-origin public KV Website proxy by default so the customer wallet
  // does not depend on browser CORS behavior from a separate KVRS host. The proxy is
  // read-only and fetches the KVRS by-session endpoint server-side with no-store.
  if (process.env.NEXT_PUBLIC_KVRS_DIRECT_ORDER_LOOKUP !== 'true') {
    const params = new URLSearchParams({
      session_id: sessionId,
      _: String(Date.now()),
    });
    return `/api/tickets/order/by-session?${params.toString()}`;
  }

  const url = new URL(kvrsOrderLookupEndpoint());
  url.searchParams.set('session_id', sessionId);
  url.searchParams.set('_', String(Date.now()));
  return url.toString();
}

function orderTickets(order: TicketWalletOrder | null | undefined) {
  return Array.isArray(order?.reservation?.tickets) ? order.reservation.tickets.filter(Boolean) : [];
}

function isOrderReady(order: TicketWalletOrder | null | undefined) {
  return Boolean(order && orderTickets(order).length > 0);
}

function responseMessage(data: OrderLookupResponse | null, fallback: string) {
  const error = typeof data?.error === 'string' ? data.error.trim() : '';
  const message = typeof data?.message === 'string' ? data.message.trim() : '';
  return error || message || fallback;
}

function formatEventDateTime(startsAt?: string | null, endsAt?: string | null) {
  if (!startsAt) return 'Date and time will appear on your ticket details.';

  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return 'Date and time will appear on your ticket details.';

  const end = endsAt ? new Date(endsAt) : null;
  const dateText = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(start);

  const startText = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    hour: 'numeric',
    minute: '2-digit',
  }).format(start);

  const endText = end && !Number.isNaN(end.getTime())
    ? new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        hour: 'numeric',
        minute: '2-digit',
      }).format(end)
    : null;

  return endText ? `${dateText} • ${startText} – ${endText}` : `${dateText} • ${startText}`;
}

function formatMoney(cents?: number | null) {
  if (!Number.isFinite(cents || 0)) return null;
  const safeCents = Math.max(0, Number(cents || 0));
  if (safeCents <= 0) return null;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(safeCents / 100);
}

function guestCountText(order: TicketWalletOrder) {
  const count = order.reservation?.guestCount || order.guestCount || order.quantity || orderTickets(order).length || 1;
  return count === 1 ? '1 guest' : `${count} guests`;
}

function ticketCountText(order: TicketWalletOrder) {
  const count = order.reservation?.ticketCount || orderTickets(order).length || order.quantity || 1;
  return count === 1 ? '1 ticket' : `${count} tickets`;
}

function safeSvgImageSrc(svg?: string | null) {
  const trimmed = svg?.trim();
  if (!trimmed || !trimmed.toLowerCase().startsWith('<svg')) return null;

  // Render the KVRS-provided QR SVG as an image data URI instead of injecting it as HTML.
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(trimmed)}`;
}

function compactTicketStatus(status?: string | null) {
  if (!status) return 'Valid';
  return status
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function LoadingPanel({ message }: { message: string }) {
  return (
    <section className={styles.centerPanel} aria-live="polite">
      <div className={styles.spinner} aria-hidden="true" />
      <h1>Payment received.</h1>
      <p>{message}</p>
      <p className={styles.smallNote}>This usually takes just a few seconds. Please keep this page open.</p>
    </section>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <section className={styles.centerPanel} role="alert">
      <div className={styles.errorBadge}>Ticket status</div>
      <h1>We could not load your tickets yet.</h1>
      <p>{message}</p>
      <p className={styles.smallNote}>
        Refresh this page in a moment. If you still need help, call Katy Vibes at 832-437-2807.
      </p>
    </section>
  );
}

export function TicketOrderWallet() {
  const [state, setState] = useState<LoadState>({
    status: 'loading',
    message: 'Loading your ticket wallet…',
  });

  useEffect(() => {
    const id = readSessionId();
    if (!id) {
      setState({
        status: 'error',
        message: 'This ticket wallet link is missing required checkout information.',
      });
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const startedAt = Date.now();

    async function pollOrder() {
      if (cancelled) return;

      try {
        const response = await fetch(buildLookupUrl(id), {
          method: 'GET',
          cache: 'no-store',
        });

        const data = (await response.json().catch(() => null)) as OrderLookupResponse | null;

        if (response.ok && isOrderReady(data?.order)) {
          if (!cancelled) setState({ status: 'ready', order: data!.order! });
          return;
        }

        const elapsed = Date.now() - startedAt;
        if (elapsed >= maxPollingMs) {
          if (!cancelled) {
            setState({
              status: 'error',
              message: responseMessage(
                data,
                'Your payment may still be processing. Refresh this page in a moment to check again.',
              ),
            });
          }
          return;
        }

        if (!cancelled) {
          setState({
            status: 'preparing',
            message: 'Your QR tickets are being prepared.',
          });
          timer = setTimeout(pollOrder, pollEveryMs);
        }
      } catch {
        const elapsed = Date.now() - startedAt;
        if (elapsed >= maxPollingMs) {
          if (!cancelled) {
            setState({
              status: 'error',
              message: 'The ticket wallet service is taking too long to respond. Refresh this page in a moment.',
            });
          }
          return;
        }

        if (!cancelled) {
          setState({
            status: 'preparing',
            message: 'Payment received. Your QR tickets are being prepared.',
          });
          timer = setTimeout(pollOrder, pollEveryMs);
        }
      }
    }

    setState({
      status: 'preparing',
      message: 'Payment received. Your QR tickets are being prepared.',
    });
    void pollOrder();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (state.status === 'loading' || state.status === 'preparing') {
    return (
      <section className={styles.walletPage}>
        <LoadingPanel message={state.message} />
      </section>
    );
  }

  if (state.status === 'error') {
    return (
      <section className={styles.walletPage}>
        <ErrorPanel message={state.message} />
      </section>
    );
  }

  const { order } = state;
  const tickets = orderTickets(order);
  const eventTitle = order.event?.title || 'Katy Vibes Event';
  const customerName = order.reservation?.guestName || 'Guest';
  const ticketTypeName = order.ticketType?.name || order.reservation?.reservationType || 'Ticket';
  const paidAmount = formatMoney(order.amountTotalCents);

  return (
    <section className={styles.walletPage}>
      <section className={styles.heroCard}>
        <div className={styles.brandRow}>
          <img
            className={styles.logo}
            src="https://static.spotapps.co/website_images/ab_websites/71826_website_v1/logo.png"
            alt="Katy Vibes"
          />
          <span>Katy Vibes Ticket Wallet</span>
        </div>

        <div className={styles.heroGrid}>
          <div>
            <div className={styles.eyebrow}>Your tickets are ready</div>
            <h1>{eventTitle}</h1>
            <p className={styles.eventTime}>{formatEventDateTime(order.event?.startsAt, order.event?.endsAt)}</p>
          </div>

          <div className={styles.instructionCard}>
            <strong>Show this QR code at the door.</strong>
            <span>Screenshot this page or print it before you arrive.</span>
            <button className={styles.printButton} type="button" onClick={() => window.print()}>
              Print tickets
            </button>
          </div>
        </div>
      </section>

      <section className={styles.summaryGrid} aria-label="Order summary">
        <div>
          <span>Customer</span>
          <strong>{customerName}</strong>
        </div>
        <div>
          <span>Ticket / table type</span>
          <strong>{ticketTypeName}</strong>
        </div>
        <div>
          <span>Guests</span>
          <strong>{guestCountText(order)}</strong>
        </div>
        <div>
          <span>Tickets</span>
          <strong>{ticketCountText(order)}</strong>
        </div>
        {paidAmount && (
          <div>
            <span>Paid</span>
            <strong>{paidAmount}</strong>
          </div>
        )}
      </section>

      <section className={styles.ticketGrid} aria-label="QR tickets">
        {tickets.map((ticket, index) => {
          const qrImageSrc = safeSvgImageSrc(ticket.svg);
          const label = ticket.label || `Ticket ${index + 1} of ${tickets.length}`;
          const code = ticket.code || ticket.id || `Ticket ${index + 1}`;

          return (
            <article className={styles.ticketCard} key={ticket.id || `${code}-${index}`}>
              <div className={styles.ticketHeader}>
                <div>
                  <span>{label}</span>
                  <h2>{ticketTypeName}</h2>
                </div>
                <strong>{compactTicketStatus(ticket.status)}</strong>
              </div>

              <div className={styles.qrBox}>
                {qrImageSrc ? (
                  <img src={qrImageSrc} alt={`${label} QR code`} />
                ) : ticket.qrValue ? (
                  <a className={styles.qrFallbackLink} href={ticket.qrValue}>
                    Open ticket QR
                  </a>
                ) : (
                  <span className={styles.qrMissing}>QR code loading</span>
                )}
              </div>

              <div className={styles.codeBox}>
                <span>Ticket code</span>
                <strong>{code}</strong>
              </div>

              <p className={styles.doorNote}>Show this QR code at the door.</p>
            </article>
          );
        })}
      </section>

      <section className={styles.footerNote}>
        <h2>Before you arrive</h2>
        <p>Screenshot this page or print it so your QR code is easy to pull up at the door.</p>
      </section>
    </section>
  );
}
