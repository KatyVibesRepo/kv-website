// Loaded only by the intercepted browser integration test's child Website.
// Preserve the real November 21 show times without making CI date-dependent.
if (process.env.CUSTOMER_BROWSER_MOCK_AUTHORIZED !== '1') throw Error('Isolated clock guard declined.');
const observedAt = Date.parse('2026-11-05T12:00:00.000Z');
const RealDate = Date;
global.Date = class extends RealDate {
  constructor(...args) { super(...(args.length ? args : [observedAt])); }
  static now() { return observedAt; }
};
