# Website response to KVRS PR72 — October 23, 2026

Activation remains HOLD. This update changes Website source only. No event creation/import, provider or environment change, customer operation, private acceptance, Android repin or business write is authorized or performed here.

Backend target reviewed from updated handoff: main 0ea641754b8b4d901a20b48168504430f17b07c5, Production dpl_EypwtQzHBGzAEJQPX5g5tfMzuizm, immutable https://kv-reservationservice-km30kk603-katy-vibes.vercel.app. Customer API remains https://admin.katyvibes.com. TableService's PR70 target remains separate.

## Changes

1. Required one explicit KV_WEBSITE_M1_CUSTOMER_ORIGIN, exactly one of the three source-approved HTTPS origins. Booking, owner status/recovery and callback routes render only on that origin's exact host; event marketing exposes M1 links only there. Default-off read/sales behavior remains. No origin has been selected or configured in Vercel by this update. Keep the chosen origin and read gate intact after sales stop so existing obligations can still be read/recovered.
2. Shared one eligibility check between marketing and direct booking. M1 currently refuses every SHOWS product, all products on events with multiple show records, products with show links while labeled EVENT, and event-wide products alongside a linked two-show bundle. An approved pair cannot bypass these checks. Ordinary full-price checkout and its shared show inventory remain unchanged.
3. Fresh customer payments also refuse SHOW admission scopes. Existing owner reads and original-Session recovery remain separate, and no existing payment is replaced. This is a Website refusal boundary, not a fix for the backend shared-capacity allocator.
4. QR remains bodyless authenticated POST, now confirmed by corrected KVRS documentation.

## Real 4DaSoul scope

The new owner screenshot matrix supplies prices and displayed quantities. VIP totals already include the $125 table charge. Website does not derive table totals, additional fees or inventory from GA pricing, and does not create a duplicate October24 event from screenshots. Saved Events Manager source/import identity is still unverified in the supplied handoff. No genuine event:product pair is approved here.

Before M1 multishow support, KVRS must reconcile the ordinary shared SHOWS allocator with M1 creation/expiry/settlement, plus represent the exact both-shows entitlement. Source/contract evidence is required before removing Website refusals. Owner decisions still needed by that lane: combo table retention, turnover/arrival terms, unpaid deadline and sale windows. Do not infer 12 physical VIP tables from the four-per-option products.

## Verification and remaining evidence

90 tests pass, including executable checks for exact-origin alias refusal, reads preserved when sales/allowlist stop, show-scoped refusal, disguised multishow refusal, immutable payment commands, status refusal and QR separation. Strict TypeScript and optimized Next build pass. Local HTTP checks confirm owner/return routes return200 on the configured host with sales disabled, return404 on the alternate approved aliases, retain no-store/no-referrer, keep booking disabled, and preserve ordinary /reserve200 on the alternate host. These local host-header checks are not a real DNS/origin or browser acceptance. Browser interaction remains unverified because Chromium was unavailable and its download failed in the prior readiness step. No live financial acceptance is claimed.

Owner action: open https://admin.katyvibes.com/api/admin/m1/customer-readiness while signed in as OWNER and return its sanitized JSON to the KVRS lane for actual deployed-key account, callback/origin and flag review. Do not paste keys, signing secrets or authentication cookies. No report readback is claimed by this Website source update. Required provider account binding, genuine signed delivery and worker/operator readiness remain KVRS launch requirements.
