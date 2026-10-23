// Server-side release controls. Neither Preview nor NODE_ENV enables sales.
export const CUSTOMER_API_ORIGIN = 'https://admin.katyvibes.com';
export const CUSTOMER_WEBSITE_ORIGINS = [
  'https://www.katyvibes.com', 'https://katyvibes.com', 'https://kv-website-ten.vercel.app',
];

export function customerRelease(env: Record<string, string | undefined> = process.env) {
  const readEnabled = env.KV_WEBSITE_M1_CUSTOMER_READ_ENABLED === 'true';
  const raw = env.KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS || '';
  const pairs = raw ? raw.split(',').map(s => s.trim()) : [];
  const valid = pairs.length > 0 && pairs.length <= 20 && new Set(pairs).size === pairs.length &&
    pairs.every(pair => /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}:[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(pair) &&
      !/synthetic|fixture|not.for.sale|(?:^|[_:-])(?:qa|syn|test|lab)(?:[_:-]|$)/i.test(pair));
  return {
    readEnabled,
    salesEnabled: readEnabled && env.KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED === 'true' && valid,
    approvedPairs: valid ? pairs : [],
  };
}
