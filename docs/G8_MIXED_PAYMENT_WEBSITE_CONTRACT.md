# KV Website ↔ KVRS G8 mixed-payment public contract request

Date: 2026-10-10
Owner: KV Website
Backend reference: KVRS staging G8-P24, `43af3e21a1bdc04b39c7cd9b9e6d1f1f705b6608`
Website feature branch: `feat/g8-mixed-payment-preview`

## Status and deployment boundaries

- G8 staging proved mixed settled payments and one-at-a-time group admission through authenticated `/api/admin/m1/*` routes.
- **Those routes are not customer APIs. Do not proxy or call them from public pages.**
- Existing full-price KVRS `/api/checkout`, read-only events/ticket inventory, free RSVP behavior and conventional pending dining requests remain unchanged.
- The website preview demonstrates prospective payment choices; only Pay in Full sends the existing checkout request. Other choices never create a hold, charge a card, or confirm payment.
- Production environment does not render the preview-only payment picker. Changes must not be merged or promoted without approval.

## Required guest-safe KVRS endpoints and response semantics

Endpoint names below are **proposed responsibilities**, not claims that these routes exist. KVRS coordinator should choose canonical routes and specify exact schemas.

### 1. Quote and eligibility (read-only)

Request: public event ID or slug, show selection or all-shows entitlement, product ID, table quantity, payment mode (`full`, `guest_share`, `package_installment`, `pay_at_door`), proposed guest-pay-now count or installment amount as appropriate, and optional reservation context.

Response should include:
- Server-confirmed event/show identity, show IDs, product type, included guest count, selected table inventory units, remaining capacity and price/currency.
- Backend-defined payment-plan ID or opaque quote token, idempotent expiry and validity; eligible payment modes for this product and event.
- Server-computed amount due now, amount due later, any payable per-guest shares, package balance and fee/tax semantics; no client-calculated guest share prices.
- Current unpaid-hold policy, authoritative starts-at and expires-at, event-specific grace duration (60-minute default), and whether capacity has actually been held.
- Distinct guest-admission coverage vs package installment balance. Installments must not imply that a particular guest has a paid ticket.
- Sold-out/closed/stale-quote/expired-quote structured errors.

### 2. Reserve / create payment plan (idempotent write)

Request: quote token; customer contact; chosen payment mode; selected guest share allocations or package installment, if eligible; user consent to applicable deadline and payment terms; Idempotency-Key.

Response: opaque customer-safe reservation reference, plan reference, authoritative hold status, guest counts (paid/unpaid/pending), package contribution and remaining balance, hold expiration, and next permissible action. Table of 8 consumes **one table inventory unit**, regardless of eight admissions. Preserve paid portions if an unpaid hold is released.

No individual guest invitations or payment links should be generated in the website until KVRS supplies an explicit secure invite/token mechanism and its privacy protections.

### 3. Stripe Checkout by selected contribution

Request: server-issued quote/plan + explicit selected guest-share IDs, or package installment allocation; never both modes on one plan. Include Idempotency-Key and allowed success/cancel destinations.

Response: short-lived Stripe-hosted Checkout URL plus safe opaque order/plan identifiers. Only selected shares/installment contribution may be charged. The old full-price contract must not be repurposed for splits.

Returning from Stripe is not payment confirmation. KVRS must verify provider settlement/webhook before publishing paid coverage.

### 4. Customer-safe reservation status

Require an authenticated or scoped expiring access token, never an enumerable internal ID alone. Provide canonical states:
`received/held`, `awaiting_payment`, `partially_paid`, `fully_paid`,
`expired_or_released`, `cancelled`, `admitted/checked_in`.

Include covered admissions, online-paid admissions, venue-acknowledged admissions, unpaid admissions, checked-in admissions, remaining check-ins; separately expose package amount paid/balance and any guest share allocations. Explicitly distinguish **one group QR credential** from **eight covered guest admissions**; physical table assignment is operational and not implied by purchase.

A QR value/URL may only be delivered by KVRS through a customer-safe, authorization-checked response. No frontend QR generation.

### 5. Ticketed-event dining reservation evaluation

Provide a guest-safe evaluation API for a requested venue-local date/time and party size. The response must include applicable ticketed-event title, public slug, show ID and time, whether admission is required, server-defined 60-minute initial pre-event warning window and any event overrides.

Most importantly, **KVRS must independently re-evaluate admission requirements when** `POST /api/public/reservations/request` **is submitted**, not trust a website warning or cached event feed. Specify whether it rejects, requires acknowledgment, or returns an actionable warning/review-needed state. Do not convert an ordinary dining reservation into a ticket/table purchase.

Until this contract is live, the website warning is advisory, using public event/show times (and a 60-minute pre-event window); it must not claim admission has been purchased or checked.

### 6. Inventory, expiry, cancellation and failed payment

- Backend must establish all reservation/hold transitions and preserve already-settled guest coverage.
- Hold expiry is server-authoritative; no browser timer and no website writes to inventory.
- Automated release is **not** accepted as production-ready solely because G8 staging completed; staging capacity release remains disabled.
- Stale quote, out-of-stock, checkout cancellation, pending Stripe fulfillment and inconsistent payment states need explicit machine-readable safe responses.
- Multi-show `scope` and `showIds` must survive every quote, payment and admission response, including Both Shows.
- Replayed payment/creation/check-in requests must not duplicate charges, reservations or admissions.

## Frontend implementation boundary

- Production checkout stays on the existing public KVRS checkout contract.
- New website UI reuses `EventTicketCheckoutCards`; it does not create Stripe Checkout sessions in website code.
- The preview picker is enabled only in development/Vercel preview. Non-full options display proposed guest counts or package balances **without claiming an authoritative quote**, and offer phone assistance rather than submitting.
- The regular reservations page derives **provisional** event warnings from public KVRS events; submission still uses the existing approval-first endpoint.

## Acceptance matrix / tests to be performed with KVRS public contracts

1. GA Pay in Full covers one admission, not a table.
2. Table of 8 Pay in Full covers 8 admissions, consumes 1 table inventory unit.
3. Table of 8: 3 Stripe-paid guests and 5 Pay at Door, with correct per-guest amount and status.
4. Partial table-package installment leaves explicit package balance; no fictitious admission coverage.
5. Unpaid admission cannot enter; paid admission preserves status even after unpaid hold release.
6. One group QR consumes admissions individually; duplicate scan and ninth scan denied.
7. Expiry exactly follows returned KVRS deadline, including event overrides and nonautomatic capacity release stage.
8. Two-show event and Both Shows ticket preserve show scope, counts and availability.
9. Cancelled/pending Stripe session never yields a false paid confirmation.
10. Dinner reservation within ticketed show or 60 minutes before triggers alert, with backend submission revalidation.
11. Mobile and desktop responsive behavior, zero unauthorized admin requests and no writes on preview-only controls.
12. Sold-out and mid-checkout inventory changes are handled without overbooking.

**Coordinator response requested:** publish the chosen guest-safe endpoint paths, request/response payloads, auth/CSRF/rate limits, quote TTL, idempotency rules, allowed payment modes, deadline semantics and staging fixture identifiers. Do not change production during the contract review.
