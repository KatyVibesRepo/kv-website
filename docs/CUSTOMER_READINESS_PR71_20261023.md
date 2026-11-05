# Website customer readiness — October 23, 2026

Status: local implementation prepared; live activation HOLD. No environment, provider, database, Android or hosting setting changed. No live payment or private acceptance replay performed.

## Source and build

Website repository: KatyVibesRepo/kv-website. Branch: feat/customer-readiness-pr71. Base: e9476d203f95a68151ca6863dd70befd4a720343. The commit containing this report is the review pin; this is not a deployed release. No remote build/deployment pin has been verified in this work.

Backend reviewed at 2576e926f468bc2a866359526de811429b08c5c6 (PR71), including QR, status, Checkout and public error/runtime source. Stable customer API: https://admin.katyvibes.com.

## Prepared behavior

- Separate read/sales release gates, default off; explicit real event:product allowlist; synthetic/QA rejection. Fresh payments also require the reservation's exact approved pair. Existing full checkout and ordinary reservation handlers were not changed.
- Server quote, one-table reservation with unpaid terms, per-guest explicit Checkout and dollar-based package installments. Actual deadline displayed from status; no client capacity release.
- Owner access via fragment, removed from address bar after loading, and Authorization header. Same-tab sessionStorage handoff for Stripe return; no persistent localStorage, cookie or query bearer. QR is separate and rendered locally without third-party encoding services.
- After return, read server status; never infer payment from URL. Pending/review/stale/deadline conditions block new payments. Save exact original body/key before sending; retain it across uncertainty and tab reload. Recover only original provider Session, followed by fresh status.
- Email request/verify recovery uses existing endpoints. No automatic replacement of revoked QR. Private staging client remains separate.
- Protected customer pages: no-store, no-referrer, noindex, frame denial and restricted connection policy.

## Routes and backend inputs

Prepared return route: /reservations/group/return on the exact approved Website origin. Both KVRS_M1_CUSTOMER_CHECKOUT_SUCCESS_URL and KVRS_M1_CUSTOMER_CHECKOUT_CANCEL_URL must point there; their actual deployed values have NOT been inspected or changed. Same-tab return relies on the exact same Website origin as booking, because browser sessionStorage is origin scoped.

Website gates: KV_WEBSITE_M1_CUSTOMER_READ_ENABLED, KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED, KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS. Do not enable without the concrete reviewed real sale scope and backend activation review. Runtime environment values have not been verified here.

## Concrete contract correction

The handoff says GET /api/public/m1/reservations/{publicRef}/qr. PR71 route.ts exports OPTIONS and POST only. Website uses owner-authenticated POST with no body, matching source. KVRS should correct the handoff or supply a reviewed GET implementation; Website must not guess or fall back to private endpoints.

Backend disabled errors include CUSTOMER_FEATURE_DISABLED as well as FEATURE_DISABLED. Both are treated as feature unavailability, preserving ownership rather than clearing access on a disabled 404.

## Validation and limits

86 automated tests pass, including new executable tests for release gating, pending/review/stale/deadline refusal, immutable retry transport, bearer isolation, approved origins and Stripe destination validation. TypeScript and optimized Next build pass. Build emits an existing CSS autoprefixer warning and reports the unavailable local KVRS feed; it does not prove Production configuration or real-event rendering.

Still required: browser interaction/visual acceptance, approved-origin deployed build, verified live return configuration, genuine event/product, provider account/webhook binding and delivery, empty-worker acceptance, operator monitoring and owner activation decision. No end-to-end financial acceptance is claimed. No change to TableService's PR70 pin is requested.

## Follow-up readiness inspection

Vercel connector verified the Katy Vibes team and existing kv-website project prj_UdpZRjHsmae7unApHk1ARiZcmDQL. Project environment metadata contains no customer release gate variables (hiddenProductionEnvCount=0); default-off behavior applies. No environment values or settings were changed. Latest listed existing deployment was dpl_rmcj9uPKF46TaMJe8ExsPtbNf64f, READY, source e9476d203f95a68151ca6863dd70befd4a720343, older G8 feature branch.

Reduced visible status polling from 15 to 30 seconds: the pinned backend permits 60 status reads per 15 minutes; 15-second polling alone would consume all 60, leaving no allowance for manual/payment checks. New payment still requires fresh authoritative status.

Added executable mocked-transport tests for original-command storage across reload, one-use owner return handoff and bodyless owner-authenticated POST QR, including rejecting an owner bearer as a scan value. These are local mocks, not private fixture or financial acceptance.

Browser verification remains incomplete: the installed Playwright package has no Chromium executable, and its browser download returned an invalid/truncated archive. No screenshot, interactive browser result or deployed financial acceptance is claimed. Normal Git push lacks authentication here; use the connected GitHub tools to prepare the review branch and Preview build. Do not merge or promote this draft as a live release.
