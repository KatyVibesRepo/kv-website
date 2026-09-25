export type KvrsEnvironment = Record<string, string | undefined>;

export type KvrsConfiguredEntry = {
  key: string;
  value: string;
  origin: string | null;
};

export type KvrsConflictGroup = {
  origin: string;
  keys: string[];
};

export type KvrsResolvedConfig = {
  scope: 'server' | 'client';
  baseUrl: string;
  assetBaseUrl: string;
  publicApiBaseUrl: string;
  checkoutUrl: string;
  orderLookupUrl: string;
  reservationRequestUrl: string;
  jobApplicationsUrl: string;
  cateringRequestsUrl: string;
  adminLoginUrl: string;
  configured: KvrsConfiguredEntry[];
  invalidEntries: KvrsConfiguredEntry[];
  conflicts: KvrsConflictGroup[];
};

export const LOCAL_KVRS_ORIGIN: string;
export const APPROVED_PRODUCTION_KVRS_ORIGIN: string;
export const KVRS_ENV_KEYS: readonly string[];

export function resolveKvrsConfig(
  env?: KvrsEnvironment,
  options?: {
    scope?: 'server' | 'client';
    throwOnConflict?: boolean;
    throwOnInvalid?: boolean;
  },
): KvrsResolvedConfig;

export function validateProductionKvrsConfig(
  env?: KvrsEnvironment,
  approvedOrigin?: string,
): {
  ok: boolean;
  errors: string[];
  config: KvrsResolvedConfig;
};
