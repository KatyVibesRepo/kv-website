# November 21 Website integration and domain transition

Prepared against KVRS PR90 / main f0308893fbaed664201156f4a420dc037c0ac8b1,
Production dpl_52UNfamyNetZjJb18Dc5pYh7ZK24. Reuses Website PR15's existing
69dfbc536801bd152cd8b6b539e7c59ad7abf81d implementation. Historical October
acceptance windows and fixtures are retained as historical regression evidence.

## Served origin and future domain

Current configured booking origin: https://kv-website-ten.vercel.app.
The Website Vercel project currently has this domain only. The existing
katyvibes.com / www marketing site and legacy booking access are preserved.

| Phase | Required KVRS allowed origin | Success URL | Cancel URL |
| --- | --- | --- | --- |
| Current preparation | https://kv-website-ten.vercel.app | https://kv-website-ten.vercel.app/reservations/group/return | https://kv-website-ten.vercel.app/reservations/group/return |
| Coordinated domain cutover | https://katyvibes.com | https://katyvibes.com/reservations/group/return | https://katyvibes.com/reservations/group/return |

KVRS currently allows www only. These current-origin backend settings must be
coordinated and accepted before a real browser payment. URL validity alone does
not establish served-route acceptance. No backend switches are changed here. The existing GA/ordinary checkout also
uses customerWebsiteBaseUrl(): KVRS must bind NEXT_PUBLIC_KV_WEBSITE_BASE_URL
(or its existing selected alias) to the same current/future origin and accept
KVRS_CHECKOUT_ALLOWED_ORIGINS. Its success route is /tickets/order?session_id=
{CHECKOUT_SESSION_ID}; cancellation remains the signed KVRS /api/checkout/cancel
route. Accept its actual provider/account and original-recovery behavior
separately; the dedicated M1 Stripe report does not prove ordinary GA Checkout.

`KV_WEBSITE_M1_CUSTOMER_ORIGIN` selects the single booking origin. Read UI is
enabled; new sales, SHOWS sales and approved pairs remain off/empty. When the
original domain is moved, set this to https://katyvibes.com in the same release
as KVRS origin/callback changes. Secure booking routes on known alternative
Website hosts temporarily redirect to that configured origin. Marketing pages
remain usable at the Vercel development URL, which can later be retired.
Unknown hosts never gain booking authority. Do not switch callback origins
while original Checkout handoffs are outstanding: same-tab session storage is
origin-bound. Reconcile/drain them and verify original recovery at the cutover.
No DNS change or public legacy-link replacement is included in this release.

## Real event binding

Event cmw3ig99m0001pn6dotdqn40f, slug
r-b-night-with-cc-rider-band-at-katy-vibes, November 21, 2026 America/Chicago.
Show 1 cmw3ig9aa0003pn6dv7fj0uod is 6–8 PM CST; show 2
cmw3ig9aq0005pn6dx862gkps is 9–11 PM CST. Both Shows is coverage of both IDs,
never a third performance. Its sale cutoff is the first show's start.

All 15 actual product IDs, prices, quantities and linked show IDs from PR90 are
recorded in test/fixtures/nov21-launch-event.json. The fixture remains
DRAFT/PRIVATE/PAUSED with checkout false. Prospective enabled states are local
test copies only. Twelve table products use the customer reservation flow;
the three GA products retain ordinary full checkout. The five existing event
flyer fields continue to come from the KVRS feed. There is no copied catalog,
flyer URL override, price source of truth or inventory implementation in runtime.

The reviewed prospective Website approved-pair value is exactly event ID plus
each of those 15 product IDs. Do not configure it as active until the final
coordinated activation decision. No October event/product IDs are reused.

## Customer behavior

Pay in Full sends the table's current authoritative total through the retained
backend PACKAGE_INSTALLMENT transport and requires amountDueNow=total and zero
later balance. The UI offers no partial amount. One PACKAGE_BALANCE Checkout
pays the full remaining balance; backend settlement covers every stated guest.
Split Payment per guest retains explicit guest-share payments. Pay at Door
creates no Stripe Checkout automatically. New commands re-read authoritative
status. Original uncertain commands retain their exact body/key and recovery.
A fresh status clears a saved payment only when its exact checkout is terminal
and no funding is pending or under review, allowing the next guest to pay.

Return pages ignore and scrub provider query markers, use the existing
same-tab handoff, and load current reservation status. Without a handoff they
offer reference-based recovery. Durable tokens remain fragment/Authorization
only with no persistent bearer store, no added login, and no invented expiry.
The backend-supplied lifetime remains authoritative. Confirmation requests its
QR automatically, encodes it locally with a four-module quiet zone, and removes
stale status/payment/QR UI after failed reads. No third-party QR service is used.

Production dining now evaluates KVRS's warning contract before submission and
forwards ticketedWarningAcknowledged only from an affirmative checkbox. A 409
keeps the authoritative warnings, unchecks the box and requires manual review
and resubmission. No automatic retry or ticket entitlement is inferred.

## Validation and remaining acceptance

117 unit/transport/route observations pass locally, with strict TypeScript.
New regression coverage checks the 15 real identities, 12 table quote scopes,
CST 6/9 PM boundaries, VIP totals, domain transition, acknowledgment forwarding
and no retry. The standard source workflow builds and runs isolated browser
tests for all three choices, actual QR decode, payment success/cancel returns,
fresh settlement status, lost response/original-key recovery past the deadline,
email access recovery, and removal of stale UI after failure. API/provider
requests in these tests are intercepted; they prove UI behavior, not genuine
Stripe settlement, inventory reconciliation or authentic webhook delivery.

Pending independent launch dependencies: KVRS allowed origin/callback binding;
authentic customer webhook-secret delivery; ordinary app-role/RLS/grants and
credential transition; current stable-ID legacy feed and sold/held capacity
reconciliation; enabled-empty worker/operator acceptance; TableService I85
installed startup/device acceptance; then exact event/product/capability
activation. Zero KVRS orders is not proof of zero legacy sales. Preserve all
legacy imports, reservations, holds and identities throughout preparation.

## Reproduce on the Mac

```bash
cd "$HOME/Desktop/KV Website"
git fetch origin
git checkout main
git pull --ff-only
npm ci
npm test
npm run typecheck
npm run build
```

Success: tests and typecheck exit zero, and the build lists the group booking,
return and confirmation routes. Hosting operations use the connected Vercel
integration; Vercel CLI authentication is not required.
