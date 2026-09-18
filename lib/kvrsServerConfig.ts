import { resolveKvrsConfig } from '@/lib/kvrsConfig.mjs';

function serverKvrsEnvironment() {
  return {
    KVRS_BASE_URL: process.env.KVRS_BASE_URL,
    NEXT_PUBLIC_KVRS_BASE_URL: process.env.NEXT_PUBLIC_KVRS_BASE_URL,
    KVRS_URL: process.env.KVRS_URL,
    KVRS_PUBLIC_URL: process.env.KVRS_PUBLIC_URL,
    NEXT_PUBLIC_KVRS_URL: process.env.NEXT_PUBLIC_KVRS_URL,
    KVRS_PUBLIC_API_BASE_URL: process.env.KVRS_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_KVRS_PUBLIC_API_BASE_URL,
    KVRS_API_URL: process.env.KVRS_API_URL,
    KVRS_CHECKOUT_URL: process.env.KVRS_CHECKOUT_URL,
    NEXT_PUBLIC_KVRS_CHECKOUT_URL: process.env.NEXT_PUBLIC_KVRS_CHECKOUT_URL,
    NEXT_PUBLIC_KVRS_CHECKOUT_API_URL: process.env.NEXT_PUBLIC_KVRS_CHECKOUT_API_URL,
    KVRS_ORDER_LOOKUP_URL: process.env.KVRS_ORDER_LOOKUP_URL,
    NEXT_PUBLIC_KVRS_ORDER_LOOKUP_URL: process.env.NEXT_PUBLIC_KVRS_ORDER_LOOKUP_URL,
    NEXT_PUBLIC_KVRS_ORDERS_BY_SESSION_URL: process.env.NEXT_PUBLIC_KVRS_ORDERS_BY_SESSION_URL,
  };
}

export function getKvrsServerConfig() {
  return resolveKvrsConfig(serverKvrsEnvironment(), {
    scope: 'server',
    throwOnConflict: true,
    throwOnInvalid: true,
  });
}
