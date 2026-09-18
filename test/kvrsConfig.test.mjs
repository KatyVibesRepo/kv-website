import assert from 'node:assert/strict';
import test from 'node:test';
import {
  APPROVED_PRODUCTION_KVRS_ORIGIN,
  LOCAL_KVRS_ORIGIN,
  resolveKvrsConfig,
  validateProductionKvrsConfig,
} from '../lib/kvrsConfig.mjs';

test('local defaults preserve Website 3000 -> KVRS 3001 split', () => {
  const config = resolveKvrsConfig({}, { scope: 'server' });

  assert.equal(config.baseUrl, LOCAL_KVRS_ORIGIN);
  assert.equal(config.publicApiBaseUrl, `${LOCAL_KVRS_ORIGIN}/api/public`);
  assert.equal(config.checkoutUrl, `${LOCAL_KVRS_ORIGIN}/api/checkout`);
  assert.equal(config.reservationRequestUrl, `${LOCAL_KVRS_ORIGIN}/api/public/reservations/request`);
  assert.equal(config.jobApplicationsUrl, `${LOCAL_KVRS_ORIGIN}/api/public/job-applications`);
  assert.equal(config.orderLookupUrl, `${LOCAL_KVRS_ORIGIN}/api/orders/by-session`);
  assert.equal(config.adminLoginUrl, `${LOCAL_KVRS_ORIGIN}/admin/login`);
});

test('canonical Production variables resolve every Website KVRS path to admin.katyvibes.com', () => {
  const env = {
    KVRS_BASE_URL: APPROVED_PRODUCTION_KVRS_ORIGIN,
    NEXT_PUBLIC_KVRS_BASE_URL: APPROVED_PRODUCTION_KVRS_ORIGIN,
  };
  const config = resolveKvrsConfig(env, { scope: 'server' });

  assert.equal(config.baseUrl, APPROVED_PRODUCTION_KVRS_ORIGIN);
  assert.equal(config.assetBaseUrl, APPROVED_PRODUCTION_KVRS_ORIGIN);
  assert.equal(config.publicApiBaseUrl, `${APPROVED_PRODUCTION_KVRS_ORIGIN}/api/public`);
  assert.equal(config.checkoutUrl, `${APPROVED_PRODUCTION_KVRS_ORIGIN}/api/checkout`);
  assert.equal(config.orderLookupUrl, `${APPROVED_PRODUCTION_KVRS_ORIGIN}/api/orders/by-session`);
  assert.equal(config.reservationRequestUrl, `${APPROVED_PRODUCTION_KVRS_ORIGIN}/api/public/reservations/request`);
  assert.equal(config.adminLoginUrl, `${APPROVED_PRODUCTION_KVRS_ORIGIN}/admin/login`);
});

test('legacy aliases cannot silently override the canonical base', () => {
  const env = {
    KVRS_BASE_URL: APPROVED_PRODUCTION_KVRS_ORIGIN,
    NEXT_PUBLIC_KVRS_BASE_URL: APPROVED_PRODUCTION_KVRS_ORIGIN,
    KVRS_URL: 'https://legacy.example.com',
  };

  assert.throws(() => resolveKvrsConfig(env, { scope: 'server' }), /Conflicting KVRS origins/);

  const inspected = resolveKvrsConfig(env, {
    scope: 'server',
    throwOnConflict: false,
  });
  assert.equal(inspected.baseUrl, APPROVED_PRODUCTION_KVRS_ORIGIN);
  assert.equal(inspected.conflicts.length, 2);
});

test('same-origin endpoint overrides are allowed and normalized', () => {
  const env = {
    KVRS_BASE_URL: APPROVED_PRODUCTION_KVRS_ORIGIN,
    NEXT_PUBLIC_KVRS_BASE_URL: APPROVED_PRODUCTION_KVRS_ORIGIN,
    KVRS_PUBLIC_API_BASE_URL: `${APPROVED_PRODUCTION_KVRS_ORIGIN}/api/public`,
    NEXT_PUBLIC_KVRS_CHECKOUT_URL: `${APPROVED_PRODUCTION_KVRS_ORIGIN}/api/checkout`,
    KVRS_ORDER_LOOKUP_URL: `${APPROVED_PRODUCTION_KVRS_ORIGIN}/api/orders/by-session`,
  };
  const config = resolveKvrsConfig(env, { scope: 'server' });

  assert.equal(config.publicApiBaseUrl, `${APPROVED_PRODUCTION_KVRS_ORIGIN}/api/public`);
  assert.equal(config.checkoutUrl, `${APPROVED_PRODUCTION_KVRS_ORIGIN}/api/checkout`);
  assert.equal(config.orderLookupUrl, `${APPROVED_PRODUCTION_KVRS_ORIGIN}/api/orders/by-session`);
});

test('client resolver detects public override conflicts', () => {
  const env = {
    NEXT_PUBLIC_KVRS_BASE_URL: APPROVED_PRODUCTION_KVRS_ORIGIN,
    NEXT_PUBLIC_KVRS_CHECKOUT_URL: 'https://old-kvrs.example.com/api/checkout',
  };

  assert.throws(() => resolveKvrsConfig(env, { scope: 'client' }), /Conflicting KVRS origins/);
});

test('Production verifier accepts only the approved canonical origin', () => {
  const result = validateProductionKvrsConfig({
    KVRS_BASE_URL: APPROVED_PRODUCTION_KVRS_ORIGIN,
    NEXT_PUBLIC_KVRS_BASE_URL: APPROVED_PRODUCTION_KVRS_ORIGIN,
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
});

test('Production verifier rejects localhost, Vercel aliases, tunnels, and mismatched hosts', () => {
  const cases = [
    {
      KVRS_BASE_URL: 'http://localhost:3001',
      NEXT_PUBLIC_KVRS_BASE_URL: 'http://localhost:3001',
    },
    {
      KVRS_BASE_URL: 'https://kv-reservationservice.vercel.app',
      NEXT_PUBLIC_KVRS_BASE_URL: 'https://kv-reservationservice.vercel.app',
    },
    {
      KVRS_BASE_URL: 'https://example.trycloudflare.com',
      NEXT_PUBLIC_KVRS_BASE_URL: 'https://example.trycloudflare.com',
    },
    {
      KVRS_BASE_URL: 'https://kvrs.example.com',
      NEXT_PUBLIC_KVRS_BASE_URL: 'https://kvrs.example.com',
    },
  ];

  for (const env of cases) {
    const result = validateProductionKvrsConfig(env);
    assert.equal(result.ok, false);
    assert.ok(result.errors.length > 0);
  }
});

test('Production verifier rejects conflicting legacy and endpoint overrides', () => {
  const result = validateProductionKvrsConfig({
    KVRS_BASE_URL: APPROVED_PRODUCTION_KVRS_ORIGIN,
    NEXT_PUBLIC_KVRS_BASE_URL: APPROVED_PRODUCTION_KVRS_ORIGIN,
    KVRS_PUBLIC_API_BASE_URL: 'https://old-kvrs.example.com/api/public',
  });

  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), /conflicting origins/i);
});
