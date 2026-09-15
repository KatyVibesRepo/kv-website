# v2.28 — Public Website Feed Integration

## Architecture

KV ReservationService remains the source of truth for events, ticket/table products, checkout, reservation flow, and published website media. KV Website remains a separate public Next.js application and consumes KVRS public read-only APIs.

## Shared KVRS configuration

The Website now resolves KVRS destinations through the shared resolver in `lib/kvrsConfig.mjs`.

Preferred local variables:

```env
NEXT_PUBLIC_KVRS_BASE_URL=http://localhost:3001
KVRS_BASE_URL=http://localhost:3001
```

Final Production values, only after coordinated KVRS cutover:

```env
NEXT_PUBLIC_KVRS_BASE_URL=https://admin.katyvibes.com
KVRS_BASE_URL=https://admin.katyvibes.com
```

Legacy aliases such as `NEXT_PUBLIC_KVRS_URL`, `KVRS_URL`, and endpoint-specific overrides are transition-only. They cannot silently redirect a different Website path to another KVRS host: conflicting origins are rejected.

## Feeds consumed by KV Website

Events:

```text
GET /api/public/events?limit=100&includePast=true
GET /api/public/events/featured?limit=24
GET /api/public/events/calendar
GET /api/public/events/[slug]
```

Site media:

```text
GET /api/public/site-media?placement=home_hero_gallery
GET /api/public/site-media?placement=home_secondary_gallery
GET /api/public/site-media?placement=home_community_panel
```

## Local dev setup

Start KVRS first:

```bash
cd "$HOME/Desktop/KV ReservationService"
PORT=3001 npm run dev
```

Then Website:

```bash
cd "$HOME/Desktop/KV Website"
PORT=3000 npm run dev
```

## URL and asset normalization

Known KVRS upload paths such as `/uploads/events-manager/...` and `/uploads/site-media/...` are normalized to the single resolved KVRS base. The Website no longer walks a list of possible KVRS hosts for an asset.

If KVRS is offline, public feed helpers may still return empty/fallback presentation data so the Website can render. A successful Next.js build therefore does not replace the explicit Production configuration verifier.

## Production rule

Run `npm run verify:kvrs-production` before a Website Production cutover. Production Website configuration must resolve every KVRS entry point to `https://admin.katyvibes.com` and must reject localhost, tunnels, `.vercel.app` KVRS hosts, and conflicting overrides.
