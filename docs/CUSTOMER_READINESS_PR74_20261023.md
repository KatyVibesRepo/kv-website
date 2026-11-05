# Website response to KVRS PR74 — October 23, 2026

Customer activation remains HOLD. Backend checkpoint: main b2ddeeb92f3ba4735d311e9a58c049863a2ab1b7 / Production dpl_8UDaiJWk2eXCArt2y1MbHPLFP9ZE / source tree 32edb92281e50978caea9f790c43d0a952e71765. Stable customer API remains https://admin.katyvibes.com. PR15 remains draft. No environment/provider/database/customer/credential or Android mutation is part of this work.

## Implemented Website preparation

- Parse and validate kvrs.m1.show-coverage.v1 for EVENT, SELECTED_SHOW and ALL_LINKED_SHOWS. Require exact event identity, matching unique show IDs/entries, canonical times, chronological entries, reservation start and exclusive sale cutoff. Legacy EVENT/SHOW owner status remains readable; unknown coverage versions fail closed.
- Validate one showAdmissions bucket per exact covered show, unique matching entry keys, original guest count and consistent funding. Distinct-guest aggregate admission counts are preserved; show visits are never summed into paid guests, product totals or roster size. Missing/conflicting buckets fail closed.
- Render covered show times, reservation start, actual new-ticket cutoff, separate staff check-ins for each show and the authoritative departureRequiredBefore. No first-show admission is presented as second-show arrival, and no automatic table release is promised. Display uses America/Chicago and actual returned times rather than hardcoded defaults.
- Quote transport preserves omission of showId for server-resolved bundles and exact showId for selected-show requests. Reject a narrowed bundle response, identity mismatch or quote expiry beyond the server cutoff. Prepared booking UI uses SHOW_REQUIRED to request explicit manual selection after a read-only quote refusal, without automatic retry. Link count or product title alone never establishes a source-backed bundle.
- Preserve one configured Website origin, bodyless owner-authenticated QR POST, immutable original commands and provider Session recovery. Ordinary full checkout/reservation handlers are unchanged.

## Holds preserved

Marketing/direct booking still refuse SHOWS and multishow M1 products; fresh SHOWS payments remain refused. This is intentional until the reservation-time payment increment and coordinator reviews are complete. PR74 fixes backend shared show inventory; the old Website refusal is not removed merely because read parsing is now compatible.

Current PR74 quote/creation grace remains RESERVATION_CREATED, and the old 32/35-minute provider initiation restriction is not the owner's required payment-until-reservation-time behavior. Website does not delete safeguards, reinterpret old deadlines or advertise that requirement as implemented. The next reviewed backend contract must supply the actual deadline/payability and original in-flight recovery/settlement semantics before Website changes those guards or anchored terms.

No October24 event was created, imported, retagged or allowlisted here. Prices, capacities, defaults, departure and sale-cutoff decisions are already supplied by the owner and are not requested again. Saved/source-synchronized event identity still requires reconciliation in KVRS; do not repurpose June14 or create a duplicate from screenshots. No TableService PR70 repin, private acceptance replay, Watch or Toast work.

## Validation and limitations

100 tests pass, including malformed/bundled/selected coverage, contradictory show buckets, two visits without doubling distinct guests, partial-package zero admissions, omitted/exact quote selectors, no automatic retry, preserved legacy reads and rendered Central-time/departure/check-in copy. Strict TypeScript and optimized Next build pass. Runtime helper/render tests use local in-memory fixtures only; no backend reservation, provider Session or QR was issued.

These are automated transport/parser/server-render checks, not interactive browser, live financial or physical admission acceptance. Browser interaction remains unverified from the prior Chromium limitation. New Preview source/build pins must be recorded in PR15 after its deployment is READY. Customer gates remain off.

## KVRS follow-up

Continue the reservation-start deadline/provider-lifetime/original-command recovery increment with gates held. Return the final authoritative quote/status deadline and payability contract, delayed/in-flight settlement and expiry/reconciliation behavior, source/deployment pins and review evidence. The Website can then replace its old anchor/early-payment guard and review removing the SHOWS refusal. Account/webhook/callback binding and enabled-worker/operator readiness remain separate required evidence. An unauthenticated readiness401 is not account binding.
