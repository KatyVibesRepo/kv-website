# Website timing/recovery response — October 24, 2026

Customer/SHOWS activation remains HOLD. Backend contract target: PR78 main76a305623f9d926590a38beaad44189a2797abbf, tree8cbf5a616e74dc0ae80c4102b841904d82b452d1, Production dpl_4n39TroGiRWY3F7SL6G62SSgWr8u. Stable API remains https://admin.katyvibes.com. This supersedes earlier Website timing-blocker reports: PR75 timing is now implemented in the Website draft against current PR78 source. No production setting, provider, database, event, credential, Android pin or Host polling change was made here.

## Implemented

- Production quotes accept nullable grace minutes with version1/RESERVATION_START/expiresAt, bound to paymentTiming and the exact reservation/show coverage. Old booking-minute quote policy is rejected for new creation.
- New payments require the server-owned onlinePaymentInitiationAllowed and valid kvrs.m1.reservation-payment-timing.v1. The local32-minute early cutoff is removed. Pending funding, review, stale status, lifecycle and one-payment-per-party checks remain. Historical owner reads and original-command/Session recovery remain compatible; missing/unreviewed timing never authorizes a fresh payment.
- The original command/key/body and original timing are stored before sending. Lost-response recovery reuses them after the local deadline; the request is never replaced with a new key, amount, target or Session. Backend preparation/provider retention rules remain authoritative.
- Validate paymentTiming and providerExpiresAt on the payment response, bind returned timing to the original preparation, and retain expiry as separate journal metadata. Show provider expiry only when actually supplied by the original response; the GET recovery route does not supply that field and the UI does not invent it.
- Customer copy distinguishes starting a new payment before reservation time from finishing the original prepared Checkout afterward. Original provider expiry does not extend reservation timing or show entitlement. Payment status always comes from fresh owner status, including success/cancel returns and uncertain responses.
- Preserve PR74 exact coverage/showAdmissions, bodyless QR POST, one configured customer origin and distinct guests versus show visits. Marketing/direct booking and fresh SHOWS payments remain held for coordinated activation review. Ordinary full checkout and reservation handlers are unchanged.

## Validation

104 automated tests pass; strict TypeScript and optimized Next build pass. Tests cover nullable/start-anchored quotes, exact deadline binding, last-millisecond server permission without an early cutoff, server refusal, pending original completion, conflicting timing, original-body/key retry, provider expiry separation and legacy read compatibility.

Three local Chromium153 browser scenarios pass with real Website client code and every API/provider request intercepted:

1. Mobile390x844: load owner access, start within5minutes of reservation time, simulate loss after preparation, advance beyond deadline, retry exact same body/key, reopen the same bound Session and return on the same origin. An untrusted success query does not mark paid; status stays PENDING and new payments stay unavailable.
2. Only fresh mocked authoritative status changes funds and guest coverage. QR uses a separate bodyless authenticated request and renders locally. No automatic second payment or admission appears.
3. Desktop1280x900: email request/verify recovery loads owner status without creating another payment or replacing the QR. No application page errors; no horizontal overflow at either viewport. The mobile timing-panel screenshot was visually inspected and is readable.

The browser harness is scripts/customer-timing-browser-mock.mjs. It requires an explicit local-mock guard and an installed Playwright-compatible Chromium. It intercepts all browser destinations, routes Website GETs only to its spawned loopback server, mocks public customer/provider requests and creates no real reservation, Session, payment or QR. Browser tooling was installed outside the application; package.json and lockfile are unchanged. A known shared-footer map is blocked by the protected customer frame policy; that does not grant it customer-page access.

These are local mocked-browser checks, not deployed financial, genuine Stripe settlement/signature, live recovery-email delivery or physical admission acceptance. The deployed Preview must still be checked at the exact reviewed source. Activation remains held.

## Reviewed configuration and real event

Backend has staged www.katyvibes.com and that exact origin's /reservations/group/return callbacks with all enable flags false. Matching Website preparation must use KV_WEBSITE_M1_CUSTOMER_ORIGIN=https://www.katyvibes.com, read=false, sales=false and no approved pairs until review. This document does not apply those settings or change domains. Do not mix apex/stable-Vercel booking with www callbacks.

Genuine event: kvrs_4dasoul_20261024 / 4dasoul-2026-10-24, DRAFT/PRIVATE. Exact shows: kvrs_4dasoul_20261024_show_1 and kvrs_4dasoul_20261024_show_2. Reviewed group product ID pattern: kvrs_4dasoul_20261024_<table3|table4|table8|vip8>_<first|second|both>. These are preparation identities, not approved sale pairs. All products remain hidden/checkout-disabled; no allowlist or visibility change was made. GA continues to use its ordinary path and does not guarantee seating. Prices, quantities, editable times, departure and cutoff rules are already supplied; no duplicate/source-link request is needed. No additional VIP fee or inventory multiplication is introduced.

## Coordinator next step

Website PR15 can now be reviewed against the delivered timing contract. Keep customer/SHOWS flags and the genuine draft off. Required live evidence remains fresh authenticated deployed account/readiness, correct shared key and snapshot webhook/signing-secret binding, callback/origin review, enabled empty-worker acceptance/monitor, Android show-v2/physical coordination and the owner's concrete first-activation decision. Retain reads, original Session recovery, signed settlement/reversal and outstanding-obligation workers when stopping new sales. No private acceptance replay, QR timer, Toast or Watch work.
