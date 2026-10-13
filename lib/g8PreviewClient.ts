// Isolated G8 browser client. It never reads the Website's production KVRS base URL.
// This exact staging target is intentionally pinned until a new backend checkpoint is approved.
export const G8_STAGING_API_BASE = 'https://kv-reservationservice-git-staging-g8-mixed-admission-katy-vibes.vercel.app';
export const G8_FIXTURE_EVENT_ID = 'kvrs_g8_syn_durable_event_20261012';
export const G8_FIXTURE_PRODUCT_ID = 'kvrs_g8_syn_durable_table8_20261012';
export const G8_FIXTURE_GUESTS = 8;

export type G8Choice = 'PAY_AT_DOOR' | 'PAY_PER_GUEST' | 'PACKAGE_INSTALLMENT';
export type G8ApiError = { ok: false; code?: string; message?: string };
export type G8Quote = {
  ok: true;
  quoteToken: string;
  quoteExpiresAt: string;
  capacityHeld: false;
  event: { id: string; slug: string; title: string; timezone: string };
  product: { id: string; name: string; kind: string; quantity: number; guestsPerProduct: number };
  guestCount: number;
  currency: string;
  totalCents: number;
  amountDueNowCents: number;
  amountDueLaterCents: number;
  eligiblePaymentChoices: string[];
  guestShares: Array<{ shareRef: string; ordinal: number; amountCents: number }>;
  gracePolicy: { minutes: number; version: number; anchor: string };
};
export type G8Created = {
  ok: true;
  publicReservationRef: string;
  customerAccessToken: string;
  accessExpiresAt: string;
  paymentChoice: G8Choice;
  guestCount: number;
  holdExpiresAt: string | null;
  capacityHeld: boolean;
  idempotentReplay: boolean;
};
export type G8Status = {
  ok: true;
  publicReservationRef: string;
  reservationState: string;
  canonicalReservationStatus: string;
  paymentState: string;
  admissionPlanState: string;
  statusRevision: number;
  asOf: string;
  event: { id: string; title: string; slug: string; timezone: string };
  product: { id: string; name: string; kind: string; quantity: number; guestsPerProduct: number };
  guestCount: number;
  capacityHeld: boolean;
  holdExpiresAt: string | null;
  coverage: {
    prepaid: number;
    manualAcknowledged: number;
    unpaidActive: number;
    releasedUnpaid: number;
    admitted: number;
    remainingCovered: number;
  };
  payment: {
    currency: string;
    totalCents: number;
    stripeSettledCents: number;
    manualAcknowledgedCents: number;
    pendingCents: number;
    outstandingCents: number;
  };
  guestShares: Array<{
    shareRef: string;
    ordinal: number;
    amountCents: number;
    coverage: string;
    lifecycle: string;
  }>;
  groupCredentialIssued: boolean;
  groupCredentialValue: null;
  nextAction: string;
};
export type G8Checkout = {
  ok: true;
  checkoutRef: string;
  checkoutUrl: string;
  amountCents: number;
  currency: string;
  paymentState: 'PENDING';
  coverageGranted: false;
};

const reservationRefPattern = /^kvr_[0-9a-f]{40}$/;
const customerTokenPattern = /^kvrs_ra1_[A-Za-z0-9_-]{43}$/;

export function isG8Fixture(eventId: string, productId?: string) {
  return eventId === G8_FIXTURE_EVENT_ID &&
    (!productId || productId === G8_FIXTURE_PRODUCT_ID);
}
export function validG8Ref(ref: string) { return reservationRefPattern.test(ref); }
export function validG8Token(token: string) { return customerTokenPattern.test(token); }

export function g8PreviewAllowed() {
  // Called on the server. Browser access is additionally limited by an
  // exact fixture allowlist and the separate staging backend Origin gate.
  return process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development';
}

function g8Url(path: string) {
  if (!path.startsWith('/api/public/m1/')) throw new Error('Unsupported reservation route.');
  return G8_STAGING_API_BASE + path;
}

export class G8RequestError extends Error {
  constructor(public code: string, message: string, public httpStatus: number) {
    super(message);
  }
}
function safeApiMessage(error: G8ApiError | null, status: number) {
  const message = error?.message;
  return typeof message === 'string' && message.length < 200 &&
    !/\b(?:SQL|Prisma|stack|debug|internal server error|database)\b|\/api\//i.test(message)
    ? message : status === 429 ? 'Too many attempts. Please try again shortly.'
    : 'This option is temporarily unavailable. Please try again.';
}

async function requestG8<T extends { ok: true }>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown; bearer?: string; idempotencyKey?: string } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.bearer) {
    if (!validG8Token(options.bearer)) throw new Error('Your secure reservation link is invalid.');
    headers.Authorization = 'Bearer ' + options.bearer;
  }
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey;
  const response = await fetch(g8Url(path), {
    method: options.method || (options.body === undefined ? 'GET' : 'POST'),
    headers,
    cache: 'no-store',
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  }).catch(() => {
    throw new G8RequestError('NETWORK_UNAVAILABLE',
      'Reservations are temporarily unavailable. Please try again.', 0);
  });
  const parsed = (await response.json().catch(() => null)) as T | G8ApiError | null;
  if (!response.ok || !parsed || parsed.ok !== true) {
    const err = parsed && parsed.ok === false ? parsed : null;
    throw new G8RequestError(err?.code || 'UNAVAILABLE', safeApiMessage(err, response.status), response.status);
  }
  return parsed as T;
}

export function g8Quote(choice: G8Choice, onlineGuests: number, fullTableCents?: number) {
  if (choice === 'PACKAGE_INSTALLMENT' &&
      (!Number.isSafeInteger(fullTableCents) || (fullTableCents ?? 0) <= 0)) {
    throw new Error('The full table price is unavailable.');
  }
  return requestG8<G8Quote>('/api/public/m1/quotes', {
    body: {
      eventId: G8_FIXTURE_EVENT_ID,
      productId: G8_FIXTURE_PRODUCT_ID,
      quantity: 1,
      paymentChoice: choice,
      ...(choice === 'PAY_PER_GUEST'
        ? { plannedOnlineGuestCount: onlineGuests }
        : choice === 'PACKAGE_INSTALLMENT'
          ? { proposedInstallmentCents: fullTableCents }
          : { plannedOnlineGuestCount: 0 }),
    },
  });
}

export function g8Create(
  quoteToken: string, choice: G8Choice,
  contact: { customerName: string; customerEmail: string; customerPhone: string },
  idempotencyKey: string,
) {
  return requestG8<G8Created>('/api/public/m1/reservations', {
    idempotencyKey,
    body: {
      quoteToken, ...contact, paymentChoice: choice,
      acceptUnpaidPaymentTerms: true,
    },
  });
}

export function g8Status(ref: string, token: string) {
  if (!validG8Ref(ref)) throw new Error('Invalid reservation reference.');
  return requestG8<G8Status>(`/api/public/m1/reservations/${ref}/status`, { bearer: token });
}

export function g8PayGuest(ref: string, token: string, shareRef: string, idempotencyKey: string) {
  if (!validG8Ref(ref) || !/^guest-[1-8]$/.test(shareRef))
    throw new Error('Invalid guest payment choice.');
  return requestG8<G8Checkout>('/api/public/m1/checkouts', {
    bearer: token, idempotencyKey,
    body: { publicReservationRef: ref, contributionMode: 'GUEST_SHARE', guestShareRef: shareRef },
  });
}

export function g8PayFullTable(ref: string, token: string, fullTableCents: number, idempotencyKey: string) {
  if (!validG8Ref(ref) || !Number.isSafeInteger(fullTableCents) || fullTableCents <= 0) {
    throw new Error('Invalid full table payment choice.');
  }
  // The backend names its full-balance operation PACKAGE_BALANCE. Only the
  // exact quoted full amount is passed; no partial-payment control is shown.
  return requestG8<G8Checkout>('/api/public/m1/checkouts', {
    bearer: token, idempotencyKey,
    body: {
      publicReservationRef: ref,
      contributionMode: 'PACKAGE_BALANCE',
      installmentAmountCents: fullTableCents,
    },
  });
}

export function g8RecoverRequest(ref: string, email: string) {
  if (!validG8Ref(ref)) throw new Error('Invalid reservation reference.');
  return requestG8<{ ok: true; notice: string }>('/api/public/m1/recover/request', {
    body: { publicReservationRef: ref, email },
  });
}

export function g8RecoverVerify(ref: string, email: string, proof: string) {
  if (!validG8Ref(ref)) throw new Error('Invalid reservation reference.');
  return requestG8<{
    ok: true; publicReservationRef: string;
    customerAccessToken: string; accessExpiresAt: string;
  }>('/api/public/m1/recover/verify', {
    body: { publicReservationRef: ref, email, proof },
  });
}

export function g8Link(ref: string, token: string) {
  if (!validG8Ref(ref) || !validG8Token(token)) throw new Error('Invalid secure reservation link.');
  if (typeof window === 'undefined') throw new Error('Open your reservation in the browser.');
  return `${window.location.origin}/g8/reservations/${ref}#access=${token}`;
}

const handoffKey = 'kv-g8-pending-checkout';
export function stashCheckoutReturn(ref: string, token: string) {
  // Tab-scoped, ephemeral return handoff; never localStorage or cookies.
  if (typeof window === 'undefined' || !validG8Ref(ref) || !validG8Token(token)) return;
  try { window.sessionStorage.setItem(handoffKey, JSON.stringify({ ref, token })); }
  catch { /* Customer can use their original secure link instead. */ }
}
export function takeCheckoutReturn(): { ref: string; token: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(handoffKey);
    window.sessionStorage.removeItem(handoffKey);
    if (!raw) return null;
    const value = JSON.parse(raw) as { ref?: string; token?: string };
    return value.ref && value.token && validG8Ref(value.ref) && validG8Token(value.token)
      ? { ref: value.ref, token: value.token } : null;
  } catch { return null; }
}
