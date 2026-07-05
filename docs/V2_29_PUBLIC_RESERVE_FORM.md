# v2.29 Public Reserve Form

## What changed

The public KV Website reserve page now contains a customer-facing reservation request form at `/reserve`. It no longer sends customers to a KVRS admin page.

The form submits to a KV Website proxy route:

```text
POST /api/reserve
```

That proxy forwards the request server-side to KV ReservationService:

```text
POST http://localhost:3001/api/public/reservations/request
```

## Architecture

KV Website remains the public frontend. KVRS remains the backend/admin/source of truth.

Flow:

```text
KV Website /reserve form
→ KV Website /api/reserve proxy
→ KVRS /api/public/reservations/request
→ KVRS creates pending manager-review reservation
→ Mo/team reviews later in KVRS /admin/reservations
```

## Environment variables

Local development:

```env
NEXT_PUBLIC_KVRS_URL=http://localhost:3001
```

Optional server-side override:

```env
KVRS_URL=http://localhost:3001
```

Production will likely use the final KVRS domain, such as:

```env
NEXT_PUBLIC_KVRS_URL=https://admin.katyvibes.com
KVRS_URL=https://admin.katyvibes.com
```

No secrets are required for this public request flow.

## Fallback behavior

If KVRS is offline or the public API fails, the website does not crash. The form displays a customer-safe message telling guests to call Katy Vibes at 832-437-2807.

## Notes

This form does not auto-confirm reservations. It creates a request for manager review.
