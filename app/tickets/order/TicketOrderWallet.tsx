'use client';

import { useEffect, useState } from 'react';
import styles from './TicketOrderWallet.module.css';
import { KvrsPaymentStatus, type KvrsPublicPaymentSummary } from '@/components/KvrsPaymentStatus';

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
  paymentSummary?: KvrsPublicPaymentSummary | null;
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


type TicketReceiptDetails = {
  eventTitle: string;
  eventTime: string;
  ticketType: string;
  ticketLabel: string;
  ticketStatus: string;
  ticketCode: string;
  guestName: string;
  guestEmail?: string | null;
  guestPhone?: string | null;
  guests: string;
  paidAmount: string | null;
};

// The QR itself is always the original KVRS image. Receipt text is drawn
// AROUND it so staff can read a saved photo without changing its scan value.
function wrapReceiptLines(ctx: CanvasRenderingContext2D, value: string, width: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of value.trim().split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= width) {
      line = candidate;
      continue;
    }
    if (line) {
      lines.push(line);
      line = '';
    }
    // Long email addresses and ticket codes must wrap rather than be clipped.
    for (const character of word) {
      if (line && ctx.measureText(line + character).width > width) {
        lines.push(line);
        line = '';
      }
      line += character;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : ['—'];
}

function createTicketReceiptImage(qr: HTMLImageElement, details: TicketReceiptDetails) {
  const width = 720;
  const inset = 48;
  const textWidth = width - inset * 2;
  const scale = 2;
  const canvas = document.createElement('canvas');
  const measure = canvas.getContext('2d');
  if (!measure) throw new Error('Receipt image unavailable');

  // Measure once before allocating the canvas, allowing even long guest details
  // and event names to fit inside the exported PNG.
  function layout(ctx: CanvasRenderingContext2D, paint: boolean) {
    let y = 40;
    const printText = (value: string, font: string, step: number, color: string) => {
      ctx.font = font;
      const lines = wrapReceiptLines(ctx, value, textWidth);
      if (paint) {
        ctx.fillStyle = color;
        for (let i = 0; i < lines.length; i += 1) {
          ctx.fillText(lines[i], inset, y + step * (i + 1) - 6);
        }
      }
      y += lines.length * step;
    };
    const rule = () => {
      y += 18;
      if (paint) {
        ctx.fillStyle = '#d7dbe0';
        ctx.fillRect(inset, y, textWidth, 2);
      }
      y += 20;
    };
    const detail = (label: string, value?: string | null) => {
      if (!value?.trim()) return;
      printText(label, '700 15px Arial, sans-serif', 21, '#5d6570');
      printText(value, '600 23px Arial, sans-serif', 30, '#111827');
      y += 13;
    };

    printText('KATY VIBES', '900 35px Arial, sans-serif', 44, '#0f172a');
    printText('ADMISSION TICKET', '700 17px Arial, sans-serif', 25, '#445164');
    rule();
    printText(details.eventTitle, '800 30px Arial, sans-serif', 40, '#101827');
    printText(details.eventTime, '500 20px Arial, sans-serif', 29, '#334155');
    y += 14;
    detail('TICKET TYPE', details.ticketType);
    detail('TICKET', details.ticketLabel);

    const qrPanel = 418;
    y += 8;
    if (paint) {
      const left = (width - qrPanel) / 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(left, y, qrPanel, qrPanel);
      // Preserve full QR and a white quiet zone for reliable scanning.
      ctx.drawImage(qr, left + 29, y + 29, qrPanel - 58, qrPanel - 58);
    }
    y += qrPanel;
    rule();

    detail('NAME', details.guestName);
    detail('EMAIL', details.guestEmail);
    detail('PHONE', details.guestPhone);
    detail('ADMISSION', details.guests);
    detail('STATUS', details.ticketStatus);
    detail('TICKET CODE', details.ticketCode);
    detail('PAID', details.paidAmount);
    rule();
    printText('Present this ticket to Katy Vibes staff at the door.', '600 18px Arial, sans-serif', 27, '#273449');
    printText('Admission is subject to staff verification.', '500 17px Arial, sans-serif', 26, '#64748b');
    return y + 38;
  }

  const height = Math.ceil(layout(measure, false));
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Receipt image unavailable');
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  layout(ctx, true);
  return canvas.toDataURL('image/png');
}

function TicketReceiptImage({
  qrImageSrc,
  details,
  ticketNumber,
}: {
  qrImageSrc: string;
  details: TicketReceiptDetails;
  ticketNumber: number;
}) {
  const [receiptSrc, setReceiptSrc] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const qr = new window.Image();
    setReceiptSrc(null);
    setImageFailed(false);
    qr.onload = () => {
      try {
        const result = createTicketReceiptImage(qr, details);
        if (active) setReceiptSrc(result);
      } catch {
        if (active) setImageFailed(true);
      }
    };
    qr.onerror = () => {
      if (active) setImageFailed(true);
    };
    qr.src = qrImageSrc;
    return () => { active = false; };
  }, [
    qrImageSrc, details.eventTitle, details.eventTime, details.ticketType,
    details.ticketLabel, details.ticketStatus, details.ticketCode,
    details.guestName, details.guestEmail, details.guestPhone, details.guests,
    details.paidAmount,
  ]);

  return (
    <div className={styles.receiptImageWrap}>
      <img
        className={receiptSrc ? styles.receiptImage : styles.qrOnlyImage}
        src={receiptSrc || qrImageSrc}
        alt={receiptSrc
          ? `Katy Vibes admission receipt for ${details.guestName}, including QR code and ticket details`
          : `QR code for ${details.ticketLabel}`}
      />
      {receiptSrc ? (
        <a
          className={styles.saveReceiptLink}
          href={receiptSrc}
          download={`katy-vibes-ticket-${ticketNumber}.png`}
        >
          Save ticket image
        </a>
      ) : imageFailed ? (
        <div className={styles.receiptFallbackDetails}>
          <strong>{details.guestName}</strong>
          {details.guestEmail && <span>{details.guestEmail}</span>}
          {details.guestPhone && <span>{details.guestPhone}</span>}
          <span>{details.ticketType} · {details.ticketCode}</span>
          <small>Use a screenshot or Print tickets to keep these details with your QR.</small>
        </div>
      ) : (
        <span className={styles.receiptPreparing}>Preparing your ticket image…</span>
      )}
    </div>
  );
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
      <h1>Checking your ticket status.</h1>
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
            message: 'Checking your checkout status and preparing available tickets.',
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
            message: 'Checking your checkout status and preparing available tickets.',
          });
          timer = setTimeout(pollOrder, pollEveryMs);
        }
      }
    }

    setState({
      status: 'preparing',
      message: 'Checking your checkout status and preparing available tickets.',
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
  const paidAmount = order.paidAt ? formatMoney(order.amountTotalCents) : null;

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
            <div className={styles.eyebrow}>Your tickets</div>
            <h1>{eventTitle}</h1>
            <p className={styles.eventTime}>{formatEventDateTime(order.event?.startsAt, order.event?.endsAt)}</p>
          </div>

          <div className={styles.instructionCard}>
            <strong>Show your QR code to your host.</strong>
            <span>Katy Vibes staff will verify each guest's admission and any outstanding payment.</span>
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

      {/* Only render group coverage when KVRS returns a complete, validated public summary. */}
      <KvrsPaymentStatus summary={order.paymentSummary} />

      <section className={styles.ticketGrid} aria-label="QR tickets">
        {tickets.map((ticket, index) => {
          const qrImageSrc = safeSvgImageSrc(ticket.svg);
          const label = ticket.label || `Ticket ${index + 1} of ${tickets.length}`;
          const code = ticket.code || ticket.id || `Ticket ${index + 1}`;
          const ticketPageUrl = ticket.ticketUrl || ticket.qrValue;

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
                  <TicketReceiptImage
                    qrImageSrc={qrImageSrc}
                    ticketNumber={index + 1}
                    details={{
                      eventTitle,
                      eventTime: formatEventDateTime(order.event?.startsAt, order.event?.endsAt),
                      ticketType: ticketTypeName,
                      ticketLabel: label,
                      ticketStatus: compactTicketStatus(ticket.status),
                      ticketCode: code,
                      guestName: customerName,
                      guestEmail: order.reservation?.guestEmail,
                      guestPhone: order.reservation?.guestPhone,
                      guests: guestCountText(order),
                      paidAmount,
                    }}
                  />
                ) : ticketPageUrl ? (
                  <a className={styles.qrFallbackLink} href={ticketPageUrl}>
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

              {qrImageSrc && ticketPageUrl ? <a className={styles.qrFallbackLink} href={ticketPageUrl}>Open ticket</a> : null}
              <p className={styles.doorNote}>Show this QR code at the door.</p>
            </article>
          );
        })}
      </section>

      <section className={styles.footerNote}>
        <h2>Before you arrive</h2>
        <p>Save or print your QR code so it is ready when you arrive. Your host will check in your group and confirm your table. Any unpaid guests must complete payment before entry.</p>
      </section>
    </section>
  );
}
