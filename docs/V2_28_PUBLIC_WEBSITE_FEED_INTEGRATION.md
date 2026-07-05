# v2.28 — Public Website Feed Integration

## What changed

The public Katy Vibes website now has a safe KV ReservationService feed layer for public website data.

KV ReservationService remains the source of truth for events, ticket/table products, checkout URLs, reservation flow, and published website gallery images. KV Website stays its own Next.js app and consumes KVRS public read-only APIs.

## Required environment variable

Local development:

```env
NEXT_PUBLIC_KVRS_URL=http://localhost:3001
```

Production will likely use the production KV ReservationService/admin domain, for example:

```env
NEXT_PUBLIC_KVRS_URL=https://admin.katyvibes.com
```

Older environment variable names are still supported as fallbacks:

```env
NEXT_PUBLIC_KVRS_BASE_URL=http://localhost:3001
KVRS_PUBLIC_API_BASE_URL=http://localhost:3001/api/public
```

## Local dev setup

Start KV ReservationService first:

```bash
cd "$HOME/Desktop/KV ReservationService"
PORT=3001 npm run dev
```

Then start the public website:

```bash
cd "$HOME/Desktop/KV Website"
PORT=3000 npm run dev
```

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

## Homepage gallery behavior

The homepage uses KVRS published site-media feeds for:

- `home_hero_gallery`
- `home_secondary_gallery`
- `home_community_panel`

If KVRS is offline, missing, or returns no published images for a placement, the website falls back to the existing local hardcoded image arrays so the public website still renders.

## URL normalization

The KVRS public helper normalizes image URLs:

- absolute URLs are used as-is
- relative URLs like `/uploads/...` are prefixed with `NEXT_PUBLIC_KVRS_URL`
- local imported URLs that accidentally point to `localhost:3000` are rewritten to the configured KVRS base URL during split-app local development

## Production notes

- Do not add secrets to the public website.
- Keep admin/media management in KV ReservationService.
- Public site media APIs should only return published images.
- KV Website should display media/events, not own the database or transaction flow.
- Customer checkout/reservation/ticket flows should continue pointing into KV ReservationService routes/URLs returned by KVRS.
