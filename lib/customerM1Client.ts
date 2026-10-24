// Genuine customer transport. No staging fallback, cookies, provider keys or database access.
import type { G8Choice, G8Quote, G8Created, G8Status, G8CustomerQr } from './g8PreviewClient';

export type PaymentChoice = G8Choice;
export type CustomerShowEntry = { showId: string; entryScopeKey: string; startsAt: string; endsAt: string };
export type CustomerExactCoverage = {
  contract: 'kvrs.m1.show-coverage.v1'; type: 'EVENT' | 'SHOWS';
  selection: 'EVENT' | 'SELECTED_SHOW' | 'ALL_LINKED_SHOWS'; eventId: string;
  entryScopeKey: string; showIds: string[]; entries: CustomerShowEntry[];
  reservationStartsAt: string; salesCutoffAt: string; departureRequiredBefore: string | null;
};
export type CustomerLegacyCoverage = { contract?: never; type: 'EVENT' | 'SHOW'; showIds: string[]; entryScopeKey: string };
export type CustomerCoverage = CustomerExactCoverage | CustomerLegacyCoverage;
export type CustomerShowAdmission = G8Status['coverage'] & { entryScopeKey: string; guestUnits: number };

export type CustomerPaymentTiming = {
  contract: 'kvrs.m1.reservation-payment-timing.v1'; anchor: 'RESERVATION_START';
  newPaymentDeadline: string; inFlightCompletion: 'ORIGINAL_PREPARED_CHECKOUT_ONLY';
};
export type CustomerQuote = Omit<G8Quote, 'gracePolicy'> & {
  admissionScope: CustomerExactCoverage;
  paymentTiming: CustomerPaymentTiming;
  gracePolicy: { minutes: null; version: 1; anchor: 'RESERVATION_START'; expiresAt: string };
};
export type CustomerStatus = G8Status & {
  admissionScope: CustomerCoverage;
  showAdmissions?: CustomerShowAdmission[];
  paymentTiming?: CustomerPaymentTiming;
  onlinePaymentInitiationAllowed?: boolean;
  onlinePaymentPending: boolean;
  reconciliationRequired: boolean;
  checkoutHistory: Array<{ checkoutRef: string; state: string; amountCents: number }>;
  payment: G8Status['payment'] & { packagePaidCents: number; packageBalanceCents: number };
};
export type QuoteInput = {
  eventId: string; productId: string; showId?: string; quantity: 1;
  paymentChoice: PaymentChoice; plannedOnlineGuestCount?: number; proposedInstallmentCents?: number;
};
export type ReservationInput = {
  quoteToken: string; customerName: string; customerEmail: string; customerPhone: string;
  paymentChoice: PaymentChoice; acceptUnpaidPaymentTerms: true;
};
export type PaymentInput = { publicReservationRef: string } & (
  { contributionMode: 'GUEST_SHARE'; guestShareRef: string } |
  { contributionMode: 'PACKAGE_BALANCE'; installmentAmountCents: number }
);
export type Command<T> = Readonly<{ key: string; body: Readonly<T> }>;
export type Checkout = {
  ok: true; publicReservationRef: string; checkoutRef: string; checkoutUrl: string;
  amountCents: number; currency: 'USD'; paymentState: 'PENDING'; coverageGranted: false;
  paymentTiming?: CustomerPaymentTiming; providerExpiresAt?: string;
};
export type RecoveredCheckout = {
  ok: true; checkoutRef: string; state: string; providerStatus: string;
  checkoutUrl: string | null; amountCents: number; currency: 'USD';
  newPaymentCreated: false; coverageGranted: false; freshStatusRequired: true;
};

export const validCustomerRef = (value: string) => /^kvr_[a-f0-9]{40}$/.test(value);
export const validCustomerToken = (value: string) => /^kvrs_ra1_[A-Za-z0-9_-]{43}$/.test(value);
export const validCheckoutRef = (value: string) => /^kvc_[a-f0-9]{32}$/.test(value);
const idempotencyPattern = /^[A-Za-z0-9._:-]{16,160}$/;
const websiteOrigins = new Set(['https://www.katyvibes.com', 'https://katyvibes.com', 'https://kv-website-ten.vercel.app']);

export const customerFeatureDisabled = (code: string) => ['FEATURE_DISABLED', 'CUSTOMER_FEATURE_DISABLED'].includes(code);

export class CustomerRequestError extends Error {
  constructor(public code: string, public httpStatus: number) {
    super(customerFeatureDisabled(code) ? 'This reservation option is temporarily unavailable.' :
      httpStatus === 429 ? 'Too many attempts. Please try again shortly.' :
        'We could not confirm this request. Refresh your reservation status or contact Katy Vibes.');
  }
}

export function immutableCommand<T extends object>(body: T, key = crypto.randomUUID()): Command<T> {
  if (!idempotencyPattern.test(key)) throw new Error('Invalid operation reference.');
  // Inputs are flat contract objects; capture the exact quote/body before the first send.
  return Object.freeze({ key, body: Object.freeze({ ...body }) });
}

async function request<T>(path: string, options: {
  method?: 'GET' | 'POST'; token?: string; command?: Command<object>; body?: object;
} = {}): Promise<T> {
  if (typeof window === 'undefined' || !websiteOrigins.has(window.location.origin)) {
    throw new CustomerRequestError('WEBSITE_ORIGIN_UNAVAILABLE', 0);
  }
  if (!path.startsWith('/api/public/m1/') || path.includes('?') || path.includes('#')) {
    throw new Error('Invalid reservation route.');
  }
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.token) {
    if (!validCustomerToken(options.token)) throw new CustomerRequestError('ACCESS_INVALID', 401);
    headers.Authorization = 'Bearer ' + options.token;
  }
  const body = options.command?.body ?? options.body;
  if (body) headers['Content-Type'] = 'application/json';
  if (options.command) headers['Idempotency-Key'] = options.command.key;
  let response: Response;
  try {
    response = await fetch('https://admin.katyvibes.com' + path, {
      method: options.method ?? (body ? 'POST' : 'GET'), headers,
      ...(body ? { body: JSON.stringify(body) } : {}),
      credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', redirect: 'error',
    });
  } catch { throw new CustomerRequestError('REQUEST_UNCERTAIN', 0); }
  const result = await response.json().catch(() => null);
  if (!response.ok || !result || result.ok !== true) {
    // Never display/log arbitrary server text, request bodies, proof, tokens or QR values.
    const code = typeof result?.code === 'string' && /^[A-Z_]{1,80}$/.test(result.code)
      ? result.code : 'RESPONSE_UNAVAILABLE';
    throw new CustomerRequestError(code, response.status);
  }
  return result as T;
}

function assertRef(ref: string) {
  if (!validCustomerRef(ref)) throw new Error('Invalid reservation reference.');
}
export async function customerQuote(body: QuoteInput) {
  const result = await request<CustomerQuote>('/api/public/m1/quotes', { body });
  if (!result.event || result.event.id !== body.eventId ||
    result.admissionScope?.contract !== 'kvrs.m1.show-coverage.v1' ||
    !validCustomerCoverage(result.admissionScope, result.event.id) ||
    !validCustomerPaymentTiming(result.paymentTiming, result.admissionScope.reservationStartsAt) ||
    result.gracePolicy?.minutes !== null || result.gracePolicy.version !== 1 ||
    result.gracePolicy.anchor !== 'RESERVATION_START' || result.gracePolicy.expiresAt !== result.paymentTiming.newPaymentDeadline ||
    !Number.isFinite(Date.parse(result.quoteExpiresAt)) ||
    Date.parse(result.quoteExpiresAt) > Date.parse(result.admissionScope.salesCutoffAt) ||
    (body.showId ? result.admissionScope.selection !== 'SELECTED_SHOW' ||
      result.admissionScope.showIds[0] !== body.showId : result.admissionScope.selection === 'SELECTED_SHOW')) {
    throw new CustomerRequestError('QUOTE_UNAVAILABLE', 503);
  }
  return result;
}
export async function customerCreate(command: Command<ReservationInput>) {
  const result = await request<G8Created>('/api/public/m1/reservations', { command });
  if (!validCustomerRef(result.publicReservationRef) || !validCustomerToken(result.customerAccessToken) ||
    result.paymentChoice !== command.body.paymentChoice) throw new CustomerRequestError('RESPONSE_UNAVAILABLE', 0);
  return result;
}

const coverageFields = ['prepaid', 'manualAcknowledged', 'unpaidActive', 'releasedUnpaid', 'admitted', 'remainingCovered'] as const;
const fundingFields = ['prepaid', 'manualAcknowledged', 'unpaidActive', 'releasedUnpaid'] as const;
const isoTime = (value: unknown): value is string => typeof value === 'string' &&
  Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
export function validCustomerPaymentTiming(value: unknown, reservationStart?: string): value is CustomerPaymentTiming {
  if (!value || typeof value !== 'object') return false;
  const timing = value as CustomerPaymentTiming;
  return timing.contract === 'kvrs.m1.reservation-payment-timing.v1' && timing.anchor === 'RESERVATION_START' &&
    timing.inFlightCompletion === 'ORIGINAL_PREPARED_CHECKOUT_ONLY' && isoTime(timing.newPaymentDeadline) &&
    (reservationStart === undefined || timing.newPaymentDeadline === reservationStart);
}

function validStatusPaymentTiming(result: CustomerStatus) {
  if (result.paymentTiming === undefined && result.onlinePaymentInitiationAllowed === undefined) return true; // historical owner reads
  return result.admissionScope.contract === 'kvrs.m1.show-coverage.v1' &&
    validCustomerPaymentTiming(result.paymentTiming, result.admissionScope.reservationStartsAt) &&
    typeof result.onlinePaymentInitiationAllowed === 'boolean' &&
    (result.holdExpiresAt === null || result.holdExpiresAt === result.paymentTiming.newPaymentDeadline);
}

const sameStrings = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

export function validCustomerCoverage(value: unknown, eventId: string): value is CustomerCoverage {
  if (!value || typeof value !== 'object') return false;
  const scope = value as CustomerCoverage;
  if (!Array.isArray(scope.showIds) || !scope.showIds.every(id => typeof id === 'string' && id.length > 0) ||
    new Set(scope.showIds).size !== scope.showIds.length || typeof scope.entryScopeKey !== 'string') return false;
  if (scope.contract === undefined) {
    return scope.type === 'EVENT' ? scope.showIds.length === 0 && scope.entryScopeKey === 'event:' + eventId :
      scope.type === 'SHOW' && scope.showIds.length === 1 && scope.entryScopeKey === 'show:' + scope.showIds[0];
  }
  if (scope.contract !== 'kvrs.m1.show-coverage.v1' || scope.eventId !== eventId ||
    !isoTime(scope.reservationStartsAt) || !isoTime(scope.salesCutoffAt) || scope.salesCutoffAt > scope.reservationStartsAt ||
    !Array.isArray(scope.entries) || scope.entries.some(entry => !entry || typeof entry.showId !== 'string' ||
      entry.entryScopeKey !== 'show:' + entry.showId || !isoTime(entry.startsAt) || !isoTime(entry.endsAt) || entry.endsAt <= entry.startsAt) ||
    !sameStrings(scope.showIds, scope.entries.map(entry => entry.showId).sort()) ||
    !sameStrings(scope.entries.map(entry => entry.showId), [...scope.entries].sort((a, b) =>
      a.startsAt.localeCompare(b.startsAt) || a.showId.localeCompare(b.showId)).map(entry => entry.showId))) return false;
  if (scope.type === 'EVENT') return scope.selection === 'EVENT' && scope.entries.length === 0 &&
    scope.entryScopeKey === 'event:' + eventId && scope.departureRequiredBefore === null;
  if (scope.type !== 'SHOWS' || scope.entries.length === 0 || scope.reservationStartsAt !== scope.entries[0].startsAt) return false;
  if (scope.selection === 'ALL_LINKED_SHOWS') return scope.entries.length >= 2 &&
    /^shows:[a-f0-9]{64}$/.test(scope.entryScopeKey) && scope.departureRequiredBefore === null;
  return scope.selection === 'SELECTED_SHOW' && scope.entries.length === 1 && scope.entryScopeKey === scope.entries[0].entryScopeKey &&
    (scope.departureRequiredBefore === null || isoTime(scope.departureRequiredBefore) && scope.departureRequiredBefore > scope.reservationStartsAt);
}

function validShowAdmissions(result: CustomerStatus) {
  const scope = result.admissionScope;
  const buckets = result.showAdmissions;
  if (scope.contract !== 'kvrs.m1.show-coverage.v1' || scope.type !== 'SHOWS') return buckets === undefined || Array.isArray(buckets) && buckets.length === 0;
  if (!Array.isArray(buckets) || buckets.length !== scope.entries.length ||
    new Set(buckets.map(bucket => bucket?.entryScopeKey)).size !== buckets.length || buckets.some(bucket =>
      !bucket || !scope.entries.some(entry => entry.entryScopeKey === bucket.entryScopeKey) || bucket.guestUnits !== result.guestCount ||
      !coverageFields.every(key => Number.isSafeInteger(bucket[key]) && bucket[key] >= 0 && bucket[key] <= result.guestCount) ||
      !fundingFields.every(key => bucket[key] === result.coverage[key]) ||
      bucket.remainingCovered > bucket.prepaid + bucket.manualAcknowledged)) return false;
  // Aggregate admissions count distinct guests; show buckets count visits in each show.
  return result.coverage.admitted >= Math.max(...buckets.map(bucket => bucket.admitted)) &&
    result.coverage.admitted <= buckets.reduce((sum, bucket) => sum + bucket.admitted, 0);
}

export function verifyCustomerStatus(result: CustomerStatus, ref: string): CustomerStatus {
  const cents = (value: unknown) => Number.isSafeInteger(value) && Number(value) >= 0;
  const count = (value: unknown) => cents(value) && Number(value) <= 8;
  if (!result || result.publicReservationRef !== ref || !count(result.guestCount) || result.guestCount < 1 ||
    !result.event?.id || !result.product?.id || typeof result.onlinePaymentPending !== 'boolean' ||
    typeof result.reconciliationRequired !== 'boolean' ||
    !validCustomerCoverage(result.admissionScope, result.event.id) || !result.payment ||
    result.payment.currency !== 'USD' || !Object.values(result.payment).filter(v => typeof v !== 'string').every(cents) ||
    !['totalCents', 'stripeSettledCents', 'manualAcknowledgedCents', 'pendingCents', 'outstandingCents',
      'packagePaidCents', 'packageBalanceCents'].every(k => cents(result.payment[k as keyof CustomerStatus['payment']])) ||
    !result.coverage || !['prepaid', 'manualAcknowledged', 'unpaidActive', 'releasedUnpaid', 'admitted', 'remainingCovered']
      .every(k => count(result.coverage[k as keyof CustomerStatus['coverage']])) ||
    !Array.isArray(result.checkoutHistory) || !result.checkoutHistory.every(h =>
      validCheckoutRef(h.checkoutRef) && typeof h.state === 'string' && cents(h.amountCents)) ||
    !Array.isArray(result.guestShares) || result.guestShares.length > 8 ||
    !result.guestShares.every(s => /^guest-[1-8]$/.test(s.shareRef) && cents(s.amountCents)) ||
    !Number.isFinite(Date.parse(result.asOf)) || typeof result.capacityHeld !== 'boolean' ||
    (result.holdExpiresAt !== null && !isoTime(result.holdExpiresAt)) ||
    !validShowAdmissions(result) || !validStatusPaymentTiming(result) || result.groupCredentialValue !== null) throw new CustomerRequestError('STATUS_UNAVAILABLE', 503);
  return result;
}

export async function customerStatus(ref: string, token: string) {
  assertRef(ref);
  return verifyCustomerStatus(await request<CustomerStatus>(`/api/public/m1/reservations/${ref}/status`, { token }), ref);
}

export function canStartCustomerPayment(status: CustomerStatus, now = Date.now()) {
  // New commands require the reviewed server timing decision, never a browser-derived 32-minute cutoff.
  // SHOWS remains held for coordinated activation review; original recovery bypasses this new-command check.
  return status.admissionScope?.type === 'EVENT' && status.admissionScope.showIds.length === 0 &&
    validCustomerPaymentTiming(status.paymentTiming) && status.onlinePaymentInitiationAllowed === true &&
    !status.onlinePaymentPending && status.payment.pendingCents === 0 &&
    !status.checkoutHistory.some(h => h.state === 'PENDING') &&
    !status.reconciliationRequired && status.nextAction !== 'CONTACT_VENUE' &&
    status.admissionPlanState === 'CONFIRMED' && status.capacityHeld && status.coverage.unpaidActive > 0 &&
    ['RESERVED', 'CHECKED_IN', 'SEATED'].includes(status.canonicalReservationStatus) &&
    now - Date.parse(status.asOf) < 30_000 && Date.parse(status.asOf) <= now + 5_000;
}

export function stripeDestination(value: string) {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com' ||
    url.port || url.username || url.password) throw new CustomerRequestError('CHECKOUT_UNAVAILABLE', 503);
  return url.toString();
}

export async function customerCheckout(token: string, command: Command<PaymentInput>, expectedCents: number, expectedTiming?: CustomerPaymentTiming) {
  assertRef(command.body.publicReservationRef);
  const result = await request<Checkout>('/api/public/m1/checkouts', { token, command });
  if (result.publicReservationRef !== command.body.publicReservationRef || !validCheckoutRef(result.checkoutRef) ||
    result.currency !== 'USD' || result.amountCents !== expectedCents ||
    result.paymentState !== 'PENDING' || result.coverageGranted !== false ||
    (expectedTiming !== undefined && (!validCustomerPaymentTiming(result.paymentTiming, expectedTiming.newPaymentDeadline))) ||
    (result.paymentTiming !== undefined && (!validCustomerPaymentTiming(result.paymentTiming) || !isoTime(result.providerExpiresAt))) ||
    (result.providerExpiresAt !== undefined && result.paymentTiming === undefined)) {
    throw new CustomerRequestError('CHECKOUT_UNCERTAIN', 0);
  }
  stripeDestination(result.checkoutUrl);
  return result;
}
export async function customerRecoverCheckout(token: string, checkoutRef: string) {
  if (!validCheckoutRef(checkoutRef)) throw new Error('Invalid checkout reference.');
  const result = await request<RecoveredCheckout>(`/api/public/m1/checkouts/${checkoutRef}`, { token });
  if (result.checkoutRef !== checkoutRef || result.newPaymentCreated !== false ||
    result.coverageGranted !== false || result.freshStatusRequired !== true || result.currency !== 'USD') {
    throw new CustomerRequestError('CHECKOUT_RECONCILIATION_REQUIRED', 409);
  }
  if (result.checkoutUrl) stripeDestination(result.checkoutUrl);
  return result;
}

export async function customerQr(ref: string, token: string, guestCount: number) {
  assertRef(ref);
  // PR74 retains owner-authenticated bodyless POST.
  const qr = await request<G8CustomerQr>(`/api/public/m1/reservations/${ref}/qr`, { method: 'POST', token });
  if (qr.contract !== 'kvrs.m1.customer-group-qr.v1' || qr.publicReservationRef !== ref ||
    !/^kvrs_m1_[A-Za-z0-9_-]{43}$/.test(qr.scanValue) || qr.guestCount !== guestCount ||
    qr.groupCredentialIssued !== true || qr.admissionConfirmed !== false ||
    qr.requiresAuthorizedHostCheckIn !== true || qr.oneScanAdmitsZeroWithoutHostConfirmation !== true) {
    throw new CustomerRequestError('QR_UNAVAILABLE', 503);
  }
  return qr;
}

export function customerRecoverRequest(ref: string, email: string) {
  assertRef(ref);
  return request<{ ok: true; notice: string }>('/api/public/m1/recover/request', {
    body: { publicReservationRef: ref, email },
  });
}
export async function customerRecoverVerify(ref: string, email: string, proof: string) {
  assertRef(ref);
  const result = await request<{ ok: true; publicReservationRef: string; customerAccessToken: string }>(
    '/api/public/m1/recover/verify', { body: { publicReservationRef: ref, email, proof } });
  if (result.publicReservationRef !== ref || !validCustomerToken(result.customerAccessToken)) {
    throw new CustomerRequestError('ACCESS_INVALID', 401);
  }
  return result;
}

export function customerLink(ref: string, token: string) {
  assertRef(ref);
  if (!validCustomerToken(token)) throw new Error('Invalid secure reservation link.');
  return `/reservations/group/${ref}#access=${token}`;
}
const returnKey = 'kv-customer-checkout-return-v1';
export function saveCustomerReturn(ref: string, token: string) {
  assertRef(ref);
  if (!validCustomerToken(token)) throw new Error('Invalid secure reservation link.');
  // Same approved tab-scoped handoff as G8; no persistent bearer store.
  window.sessionStorage.setItem(returnKey, JSON.stringify({ ref, token }));
}
export function takeCustomerReturn(): { ref: string; token: string } | null {
  try {
    const raw = window.sessionStorage.getItem(returnKey);
    window.sessionStorage.removeItem(returnKey);
    const item = raw ? JSON.parse(raw) : null;
    return item && validCustomerRef(item.ref) && validCustomerToken(item.token) ? item : null;
  } catch { return null; }
}

export function centsFromDollars(value: string): number | null {
  if (!/^\d{1,7}(?:\.\d{1,2})?$/.test(value.trim())) return null;
  const [dollars, fraction = ''] = value.trim().split('.');
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, '0'));
  return Number.isSafeInteger(cents) && cents > 0 ? cents : null;
}

export type CustomerOperation =
  | { kind: 'reservation'; command: Command<ReservationInput>; eventId: string; productId: string }
  | { kind: 'checkout'; command: Command<PaymentInput>; expectedCents: number; checkoutRef?: string; paymentTiming?: CustomerPaymentTiming; providerExpiresAt?: string };
const operationKey = 'kv-customer-original-operation-v1';
export function saveCustomerOperation(operation: CustomerOperation) {
  // Persist the exact original command before sending, without an owner bearer or QR.
  // If browser storage is unavailable, do not send a financial/reservation action.
  window.sessionStorage.setItem(operationKey, JSON.stringify(operation));
}
export function loadCustomerOperation(): CustomerOperation | null {
  const raw = window.sessionStorage.getItem(operationKey);
  if (!raw) return null;
  try {
    const item = JSON.parse(raw) as CustomerOperation;
    if (!item.command || !idempotencyPattern.test(item.command.key) || !item.command.body) throw new Error();
    if (item.kind === 'reservation' && item.eventId && item.productId &&
      typeof item.command.body.quoteToken === 'string' && item.command.body.acceptUnpaidPaymentTerms === true) return item;
    if (item.kind === 'checkout' && validCustomerRef(item.command.body.publicReservationRef) &&
      Number.isSafeInteger(item.expectedCents) && item.expectedCents > 0 &&
      (!item.checkoutRef || validCheckoutRef(item.checkoutRef)) &&
      (item.paymentTiming === undefined || validCustomerPaymentTiming(item.paymentTiming)) &&
      (item.providerExpiresAt === undefined || isoTime(item.providerExpiresAt))) return item;
  } catch { /* Preserve unreadable journal; refuse another operation. */ }
  throw new Error('Your earlier request needs assistance. Please contact Katy Vibes before trying again.');
}
export function clearCustomerOperation() { window.sessionStorage.removeItem(operationKey); }
