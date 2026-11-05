// One-shot, synthetic-only QR provisioning acceptance.
// No real event, real customer, production endpoint, Stripe charge or staff admission.
// Never log the durable access bearer, scanValue, quote token or personal details.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const HOST='https://kv-reservationservice-git-staging-g8-mixed-admission-katy-vibes.vercel.app';
const ORIGIN='https://kv-website-git-feat-g8-mixed-payment-preview-katy-vibes.vercel.app';
const EVENT='kvrs_g8_syn_durable_event_20261012';
const PRODUCT='kvrs_g8_syn_durable_table8_20261012';

if (process.env.G8_CUSTOMER_QR_SMOKE !== '1' || process.env.VERCEL_ENV === 'production' ||
    process.env.STRIPE_SECRET_KEY || process.env.STRIPE_LIVE_SECRET_KEY) {
  throw new Error('Synthetic QR staging acceptance requires explicit test-only authorization.');
}

async function request(path, { method='POST', bearer, body, idempotency }={}) {
  assert.match(path,/^\/api\/public\/m1\/(?:quotes|reservations(?:\/kvr_[0-9a-f]{40}\/(?:qr|status))?)$/);
  const response = await fetch(HOST+path,{method,cache:'no-store',redirect:'error',
    signal:AbortSignal.timeout(20000),
    headers:{Origin:ORIGIN,Accept:'application/json',
      ...(body?{'Content-Type':'application/json'}:{}),
      ...(bearer?{Authorization:'Bearer '+bearer}:{}),
      ...(idempotency?{'Idempotency-Key':idempotency}:{})},
    ...(body?{body:JSON.stringify(body)}:{})});
  const data=await response.json().catch(()=>null);
  return {status:response.status,data};
}
function expectOk(reply,stage) {
  if (reply.status<200||reply.status>=300||reply.data?.ok!==true) {
    // Only public error codes and status, never raw API data or secrets.
    throw new Error(stage+' failed (HTTP '+reply.status+', code '+
      (typeof reply.data?.code==='string'?reply.data.code:'UNAVAILABLE')+').');
  }
  return reply.data;
}
const quote=expectOk(await request('/api/public/m1/quotes',{
  body:{eventId:EVENT,productId:PRODUCT,quantity:1,paymentChoice:'PAY_AT_DOOR',
    plannedOnlineGuestCount:0},
}), 'Synthetic quote');
assert.equal(quote.event?.id,EVENT);
assert.equal(quote.product?.id,PRODUCT);
assert.equal(quote.totalCents,8000);
assert.equal(quote.guestCount,8);
assert.equal(quote.capacityHeld,false);
// Respect owner interactive testing: never consume the last available tables.
if ((quote.remainingTableInventoryUnits||0)<3) {
  throw new Error('Insufficient spare synthetic fixture inventory for an isolated QR test.');
}
const key='g8-website-qr-'+randomUUID();
const name='G8 QR Synthetic Only',email='g8-qr-'+randomUUID().slice(0,8)+'@example.invalid';
const body={quoteToken:quote.quoteToken,customerName:name,customerEmail:email,
  customerPhone:'8320000000',paymentChoice:'PAY_AT_DOOR',acceptUnpaidPaymentTerms:true};
const created=expectOk(await request('/api/public/m1/reservations',{
  body,idempotency:key,
}), 'Synthetic reservation creation');
assert.match(created.publicReservationRef,/^kvr_[a-f0-9]{40}$/);
assert.ok(/^kvrs_ra1_[A-Za-z0-9_-]{43}$/.test(created.customerAccessToken));
assert.equal(created.guestCount,8);
assert.equal(created.capacityHeld,true);
console.log('PASS: one isolated unpaid Table of 8 reservation created');

const url='/api/public/m1/reservations/'+created.publicReservationRef+'/qr';
const auth={bearer:created.customerAccessToken};
const results=await Promise.all([
  request(url,auth),
  request(url,auth),
]);
const first=expectOk(results[0],'Customer QR retrieval');
const second=expectOk(results[1],'Concurrent QR retrieval');
for(const value of [first,second]){
  assert.equal(value.contract,'kvrs.m1.customer-group-qr.v1');
  assert.equal(value.publicReservationRef,created.publicReservationRef);
  assert.ok(/^kvrs_m1_[A-Za-z0-9_-]{43}$/.test(value.scanValue));
  assert.equal(value.guestCount,8);
  assert.equal(value.groupCredentialIssued,true);
  assert.equal(value.admissionConfirmed,false);
  assert.equal(value.requiresAuthorizedHostCheckIn,true);
  assert.equal(value.oneScanAdmitsZeroWithoutHostConfirmation,true);
  if (value.scanValue===created.customerAccessToken) throw new Error('Admission QR reused an access credential.');
}
if (first.scanValue!==second.scanValue) throw new Error('Concurrent QR credentials differed.');
const reopened=expectOk(await request(url,auth),'Reopened customer QR');
if (reopened.scanValue!==first.scanValue) throw new Error('Reopened QR changed unexpectedly.');
console.log('PASS: concurrent provisioning and reopening reproduce one separate entry credential');

const state=expectOk(await request(
  '/api/public/m1/reservations/'+created.publicReservationRef+'/status',
  {method:'GET',bearer:created.customerAccessToken}), 'Unpaid reservation status');
assert.equal(state.coverage.prepaid,0);
assert.equal(state.coverage.unpaidActive,8);
assert.equal(state.coverage.admitted,0);
assert.equal(state.groupCredentialIssued,true);
console.log('PASS: QR is displayed for the group without granting unpaid guest admissions');

const otherRef='kvr_'+('0'.repeat(40));
const denied=await request('/api/public/m1/reservations/'+otherRef+'/qr',auth);
assert.ok(denied.status===401||denied.status===403||denied.status===404);
console.log('PASS: bearer cannot retrieve admission QR for another reservation');
console.log('No admission, checkout, Stripe charge, Production API or customer used.');
