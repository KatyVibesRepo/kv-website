# KV Website production KVRS URL setup

KV Website and KV ReservationService remain separate applications. KV Website presents the public experience; KVRS remains authoritative for events, ticket/table products, inventory, reservation requests, orders, payments, ticket wallets/QR, and admin operations.

## Canonical origin

The approved final Production KVRS origin is:

```text
https://admin.katyvibes.com
```

Website Production must not be switched to that origin until the KVRS Production deployment and custom domain have been promoted and manager-reviewed.

## Local development

Use the split-app local setup:

```bash
NEXT_PUBLIC_KVRS_BASE_URL=http://localhost:3001
KVRS_BASE_URL=http://localhost:3001
```

Website runs on `http://localhost:3000`; KVRS runs on `http://localhost:3001`.

## Production after coordinated cutover

When the KVRS Production deployment is approved, Website Production should use:

```bash
NEXT_PUBLIC_KVRS_BASE_URL=https://admin.katyvibes.com
KVRS_BASE_URL=https://admin.katyvibes.com
```

`NEXT_PUBLIC_KVRS_BASE_URL` is the canonical browser-visible base. `KVRS_BASE_URL` is the canonical server-side base. They must resolve to the same host.

## Shared resolver

All Website KVRS integration paths use the shared resolver in `lib/kvrsConfig.mjs` through `lib/kvrsServerConfig.ts` on the server or the public resolver inputs in browser code.

The resolver supplies:

- public event/site-media API base: `<base>/api/public`
- checkout: `<base>/api/checkout`
- reservation request: `<base>/api/public/reservations/request`
- job applications: `<base>/api/public/job-applications`
- ticket-wallet order lookup: `<base>/api/orders/by-session`
- KVRS-hosted event/site-media assets: `<base>`
- Staff Login: `<base>/admin/login`

Legacy variables are accepted only as transition fallbacks. They do not outrank the canonical base variables. If configured variables resolve to conflicting hosts, the resolver throws instead of silently selecting different KVRS origins for different paths.

## Optional same-origin endpoint overrides

Only set these when the endpoint path intentionally differs from the default:

```bash
KVRS_PUBLIC_API_BASE_URL=https://admin.katyvibes.com/api/public
NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL=https://admin.katyvibes.com/api/public
NEXT_PUBLIC_KVRS_CHECKOUT_URL=https://admin.katyvibes.com/api/checkout
KVRS_ORDER_LOOKUP_URL=https://admin.katyvibes.com/api/orders/by-session
```

Any override must use the same KVRS origin as the canonical base.

## Production-readiness verifier

Run:

```bash
npm run verify:kvrs-production
```

The verifier fails when effective Website KVRS configuration contains:

- localhost or loopback destinations
- temporary tunnel hosts
- any `*.vercel.app` KVRS Production host
- conflicting configured origins
- any effective destination other than `https://admin.katyvibes.com`
- missing canonical `KVRS_BASE_URL` or `NEXT_PUBLIC_KVRS_BASE_URL`

The verifier validates configuration only; it does not mutate KVRS, create reservations/orders, deploy, or change Vercel/DNS configuration.

## Reservation architecture

The public reservation flow remains approval-first:

```text
KV Website /reserve
→ KV Website POST /api/reserve
→ KVRS POST /api/public/reservations/request
→ pending manager review in KVRS
```

The Website does not auto-confirm reservations and does not own authoritative reservation data.

## Free RSVP finding

A `free_rsvp` ticket product is handled through the same KVRS checkout/action contract as other selectable products; the Website now labels that action as `Reserve Your Spot` while still sending only the existing `ticketTypeId`, quantity, and customer contact payload to KVRS.

An event marked `rsvp_only` that does not include a selectable KVRS `free_rsvp` product still has no independent Website-side RSVP endpoint. Creating one would require a KVRS product/API contract decision, so the Website must not invent or store RSVP state locally.
