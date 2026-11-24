import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
test('SMS consent is optional and separate from booking submission', () => {
 const component = read('components/BookingSmsConsent.tsx');
 assert.match(component, /type="checkbox" name="smsConsent"/);
 assert.doesNotMatch(component, /<input[^>]*\brequired\b/);
 assert.match(component, /Message frequency varies/);
 assert.match(component, /Reply STOP to opt out or HELP/);
 assert.match(component, /SMS consent is not required to reserve or purchase tickets/);
 assert.match(component, /href="\/privacy"/);
 assert.match(component, /href="\/terms"/);
});
test('dining request defaults to no consent and proxy forwards true only', () => {
 const form = read('components/ReserveRequestForm.tsx');
 const proxy = read('app/api/reserve/route.ts');
 assert.match(form, /smsConsent: false/);
 assert.match(form, /smsConsent: !stagingWarningEnabled && values.smsConsent === true/);
 assert.match(proxy, /body\.smsConsent === true \? \{ smsConsent: true \} : \{\}/);
});
test('ordinary event RSVP and paid ticket checkout forward optional choice; G8 excluded', () => {
 const form = read('components/EventTicketCheckoutCards.tsx');
 assert.match(form, /formData\.get\('smsConsent'\) === 'on'/);
 assert.match(form, /guestPhone,\s+smsConsent,\s+partySize/);
 assert.match(form, /customerPhone: guestPhone,\s+smsConsent/);
 assert.match(form, /!isG8Fixture\(event\.id\) && <BookingSmsConsent/);
});
