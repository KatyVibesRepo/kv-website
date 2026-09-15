import {
  APPROVED_PRODUCTION_KVRS_ORIGIN,
  validateProductionKvrsConfig,
} from '../lib/kvrsConfig.mjs';

const result = validateProductionKvrsConfig(process.env);

console.log(`Approved Production KVRS origin: ${APPROVED_PRODUCTION_KVRS_ORIGIN}`);
console.log(`Effective base: ${result.config.baseUrl}`);
console.log(`Effective public API: ${result.config.publicApiBaseUrl}`);
console.log(`Effective checkout: ${result.config.checkoutUrl}`);
console.log(`Effective reservation requests: ${result.config.reservationRequestUrl}`);
console.log(`Effective order lookup: ${result.config.orderLookupUrl}`);
console.log(`Effective Staff Login: ${result.config.adminLoginUrl}`);

if (!result.ok) {
  console.error('\nKV Website Production KVRS configuration is NOT ready:');
  for (const error of result.errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nKV Website Production KVRS configuration is ready.');
