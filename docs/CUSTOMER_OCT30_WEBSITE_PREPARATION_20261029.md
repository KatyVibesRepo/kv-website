# October 30 customer Website preparation

This continues PR15 from `470000216f1c6c019c5e66640646199c4dd06874`. HOLD remains in force. The commit containing this document is the source review pin; it is not a Production release or a live financial/admission acceptance result.

## Authoritative event and contract

The supplied `KVRS_OCT30_EVENT_LAUNCH_HANDOFF_20261029.md` identifies `kvrs_4dasoul_20261030` / `4dasoul-2026-10-30`, **4DaSoul Live at Katy Vibes**, Friday October 30, 2026, America/Chicago. First show: `kvrs_4dasoul_20261030_show_1`, 6–8 PM CDT (23:00Z–01:00Z). Second show: `kvrs_4dasoul_20261030_show_2`, 9–11 PM CDT (02:00Z–04:00Z October 31).

The new fixture `test/fixtures/oct30-launch-event.json` transcribes the supplied preparation specification, with DRAFT/PRIVATE and all products hidden/checkout-disabled. It is consumed only by tests. It is neither a runtime event catalog nor a new database readback. All 15 exact products, 20 show links, five explicit combos, prices and shared per-show capacities are retained. VIP totals already include the $125 charge. October 24 identities remain historical and were not edited.

Backend source reviewed at `bc529cd80c44725c7af5ebd45e24b087eab3c90d`: `lib/admissionM1/m1ShowCoverage.mjs` and `lib/publicEvents.ts`. A single-show quote must send the exact linked show ID. An explicit combo omits `showId` (backend null), and the server quote must resolve ALL_LINKED_SHOWS over exactly those links. Retained manual multi-link products may instead return SHOW_REQUIRED; the existing explicit-selection fallback remains. Link count alone never grants a combo entitlement. Ordinary full checkout/GA continues through its existing handlers.

## Website changes

- Direct booking now receives exact linked shows rather than hard-coded EVENT/empty shows. Marketing and direct booking use the same eligibility function.
- Validate unique, present, active, visible, scheduled, transaction-enabled show records and valid start/end times. First-only and combo choices close at 6 PM; second-only choices remain eligible after event start until 9 PM. The backend quote remains authoritative for its own sales windows, inventory and prices.
- Fresh SHOWS payments require validated exact coverage and matching reservation-start payment timing, plus all existing fresh-status, lifecycle, pending-payment and review safeguards.
- A separate server-side `KV_WEBSITE_M1_CUSTOMER_SHOWS_ENABLED=true` control is now required in addition to read, sales, exact host and exact approved pairs. It defaults false. No remote environment variable was added or changed. This preserves the coordinated SHOWS hold while allowing the completed wiring to be reviewed.
- Turning off new sales or SHOWS does not gate the original stored command/Session recovery branch. The bodyless authenticated QR request, show-specific check-in display, distinct guest counts and reservation-start/provider-expiry distinction remain intact.

## Validation and limits

110 automated tests, strict TypeScript and optimized Next build passed during preparation. Tests exercise the genuine October 30 identities as a supplied fixture: all private/disabled options remain denied; prospective reviewed table choices preserve exact coverage; all three GA products stay on ordinary checkout; first/combo and second sales boundaries differ; missing/cross-event/duplicate/hidden/inactive show data is refused; quote transport preserves exact selectors and rejects a narrowed combo; fresh SHOWS payments remain denied without the separate control and fresh server permission. Existing timing, original-recovery, ordinary checkout, menu/media and reservation regressions also pass.

Those are source and mocked transport checks, not authentic Stripe signature/delivery, live funding, email delivery, native Host or physical admission acceptance. The existing protected deployed preview was independently read: `/reservations/group/return` returns 404 with no-store/no-referrer as expected with gates absent. The final preview pin and any further deployed evidence belong in the accompanying coordinator handoff.

## Release/domain state independently read October 29

Website project `prj_UdpZRjHsmae7unApHk1ARiZcmDQL`, team `team_4ZdkFkXXJta9MTfk0Rxo16n5` (`katy-vibes`). Only `kv-website-ten.vercel.app` is attached. Website environment metadata has no customer controls, including no configured customer origin; hiddenProductionEnvCount=0. Default-off applies.

`www.katyvibes.com` currently CNAMEs to `katyvibes.com`, resolving to `3.14.223.155`; DNS nameservers are GoDaddy `ns59.domaincontrol.com` / `ns60.domaincontrol.com`. Vercel reports it is not configured for this Website project. Its currently recommended project CNAME target is `bf231b4b3639122c.vercel-dns-017.com.`; re-read before an approved cutover. No domain attachment, DNS, redirect, deployment protection or public-site change was made.

Backend callbacks and allowed customer origin remain `https://www.katyvibes.com` and its `/reservations/group/return` route per the supplied handoff. A different alias cannot substitute for genuine same-origin acceptance. Prepare a gate-off release and approved domain/callback cutover, then verify the actual www browser flow. Do not enable customer reads/sales/SHOWS or publish this draft event merely to test an alias.

## Coordinated work still required

KVRS owns authentic live delivery/signature evidence, private event/product publication and approval scope, enabled-empty worker/scheduler evidence, monitoring/operator responsibility and settlement/reversal readiness. TableService owns future-day coherent source/read/display, durable finalization/release, exact show coverage and separate physical authority. Neither lane is approved by this Website increment.

Before first live issuance/payment/admission, review the exact Website/backend release and actual www origin with all parties. Present one concrete reservation/payment action and rollback to the owner only after the prerequisites are satisfied. New-sale shutdown must preserve owner reads, original Checkout recovery and settlement of later obligations; do not simply disable all capabilities once obligations exist. Never use Vercel CLI or request secret values.
