# KV Website production KVRS URL setup

KV Website must not depend on temporary Cloudflare tunnel URLs. All KV ReservationService links, checkout calls, order wallet lookups, public feeds, and uploaded image assets should resolve from environment variables.

## Local development

Use this in `KV Website/.env.local` while KVRS is running locally on port 3001:

```bash
NEXT_PUBLIC_KVRS_BASE_URL=http://localhost:3001
KVRS_BASE_URL=http://localhost:3001
```

## Production

Use the stable KVRS/admin host. The expected production shape is:

```bash
NEXT_PUBLIC_KVRS_BASE_URL=https://admin.katyvibes.com
KVRS_BASE_URL=https://admin.katyvibes.com
```

`NEXT_PUBLIC_KVRS_BASE_URL` is used by browser-side customer actions such as checkout. `KVRS_BASE_URL` is used by server-side proxy routes such as the ticket wallet order lookup and KVRS asset proxy.

## Optional overrides

Only set these if the default endpoint paths change:

```bash
KVRS_PUBLIC_API_BASE_URL=https://admin.katyvibes.com/api/public
NEXT_PUBLIC_KVRS_CHECKOUT_URL=https://admin.katyvibes.com/api/checkout
KVRS_ORDER_LOOKUP_URL=https://admin.katyvibes.com/api/orders/by-session
```

## Rule

Do not hardcode Cloudflare tunnel URLs in KV Website. Tunnels are for temporary testing only and should not be treated as durable public infrastructure.
