# KV Website event feed architecture

The public KV Website should not connect to the Windows Events Manager program directly.

Correct flow:

```txt
Windows Events Manager
  -> KV ReservationService private integration API
KV ReservationService
  -> public read-only event feed
KV Website
```

The website already reads the KVRS public event feed through `lib/kvrsEvents.ts`.

Recommended local `.env.local` for the website redesign:

```txt
NEXT_PUBLIC_KVRS_BASE_URL=http://localhost:3001
NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL=http://localhost:3001/api/public
```

When KVRS is deployed later, only these values should change. The website should still use public read-only endpoints such as:

```txt
GET /api/public/events
GET /api/public/events/featured
GET /api/public/events/calendar
GET /api/public/events/[slug]
```

The Events Manager API secret belongs only in KV ReservationService and the Windows Events Manager program. Do not add it to the public website.
