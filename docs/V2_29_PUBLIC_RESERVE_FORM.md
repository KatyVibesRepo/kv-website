# v2.29 Public Reserve Form

## Architecture

The public Website reservation page remains an approval-first request flow. It does not send customers to an admin page and it does not auto-confirm reservations.

```text
KV Website /reserve form
→ POST KV Website /api/reserve
→ POST KVRS /api/public/reservations/request
→ KVRS creates a pending manager-review reservation
→ manager/team reviews it in KVRS admin
```

KV Website remains the public frontend. KVRS remains the backend/admin/source of truth.

## Shared KVRS configuration

`/api/reserve` now obtains its destination from the same Website KVRS resolver used by feeds, assets, wallet lookup, job applications, checkout, and Staff Login.

Preferred local configuration:

```env
NEXT_PUBLIC_KVRS_BASE_URL=http://localhost:3001
KVRS_BASE_URL=http://localhost:3001
```

Final Production configuration after coordinated KVRS cutover:

```env
NEXT_PUBLIC_KVRS_BASE_URL=https://admin.katyvibes.com
KVRS_BASE_URL=https://admin.katyvibes.com
```

Legacy `KVRS_URL`, `KVRS_PUBLIC_URL`, and `NEXT_PUBLIC_KVRS_URL` aliases remain transition fallbacks only. They cannot silently override a conflicting canonical host.

No secrets are required for this public reservation-request flow.

## Fallback behavior

If KVRS is offline or the public API fails, the Website returns a customer-safe message directing guests to call Katy Vibes at 832-437-2807.

## Ownership

The Website does not store authoritative reservations, orders, payments, tickets, or event inventory. Reservation approval and persistence remain in KVRS.
