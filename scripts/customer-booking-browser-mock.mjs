// Bounded browser integration test: local source plus intercepted API/provider only.
// Uses the PR90 identities as contract data; creates no real reservation or charge.
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const { PNG } = require('pngjs');
const jsQR = require('jsqr');
if (process.env.CUSTOMER_BROWSER_MOCK_AUTHORIZED !== '1') throw Error('Isolated browser guard declined.');
const WEBSITE = process.env.CUSTOMER_BROWSER_ORIGIN || 'https://kv-website-ten.vercel.app', API = 'https://admin.katyvibes.com';
const draft = JSON.parse(readFileSync(new URL('../test/fixtures/nov21-launch-event.json', import.meta.url)));
const event = { ...draft, status: 'PUBLISHED', visibility: 'PUBLIC', ticketTypes: draft.ticketTypes.map(p =>
  ({ ...p, status: 'ACTIVE', checkoutEnabled: true, isVisible: true })) };
const product = event.ticketTypes.find(p => p.name === 'Both Shows - Table of 4');
const token = 'kvrs_ra1_' + 'b'.repeat(43), scanValue = 'kvrs_m1_' + 'b'.repeat(43);
const checkoutRef = 'kvc_' + 'b'.repeat(32);
const scope = { contract: 'kvrs.m1.show-coverage.v1', type: 'SHOWS', selection: 'ALL_LINKED_SHOWS', eventId: event.id,
  entryScopeKey: 'shows:' + 'b'.repeat(64), showIds: event.shows.map(s => s.id).sort(),
  entries: event.shows.map(s => ({ showId: s.id, entryScopeKey: 'show:' + s.id, startsAt: s.startsAt, endsAt: s.endsAt })),
  reservationStartsAt: event.startsAt, salesCutoffAt: event.startsAt, departureRequiredBefore: null };
const timing = { contract: 'kvrs.m1.reservation-payment-timing.v1', anchor: 'RESERVATION_START',
  newPaymentDeadline: event.startsAt, inFlightCompletion: 'ORIGINAL_PREPARED_CHECKOUT_ONLY' };
const fixture = http.createServer((req, res) => {
  assert.equal(req.method, 'GET');
  res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ok:true, event, events:[event] }));
});
await new Promise(resolve => fixture.listen(3001, resolve));
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', '3199'], {
  env: { ...process.env, KVRS_BASE_URL: 'http://localhost:3001', NEXT_PUBLIC_KVRS_BASE_URL: 'http://localhost:3001',
    KV_WEBSITE_M1_CUSTOMER_ORIGIN: WEBSITE, KV_WEBSITE_M1_CUSTOMER_READ_ENABLED: 'true',
    KV_WEBSITE_M1_CUSTOMER_SALES_ENABLED: 'true', KV_WEBSITE_M1_CUSTOMER_SHOWS_ENABLED: 'true',
    KV_WEBSITE_M1_CUSTOMER_APPROVED_PAIRS: event.ticketTypes.map(p => `${event.id}:${p.id}`).join(',') },
  stdio: ['ignore','pipe','pipe'],
});
const local = req => new Promise((resolve, reject) => {
  const url = new URL(req.url());
  const outgoing = http.request({hostname:'127.0.0.1',port:3199,path:url.pathname+url.search,method:req.method(),
    headers:{...req.headers(),host:url.host,'accept-encoding':'identity'}}, response => {
      const chunks=[]; response.on('data', c=>chunks.push(c)); response.on('end',()=>resolve({status:response.statusCode,
        headers:Object.fromEntries(Object.entries(response.headers).filter(([key])=>!['transfer-encoding','content-length','content-encoding','set-cookie'].includes(key))),
        body:Buffer.concat(chunks)}));
    });
  outgoing.setTimeout(15000,()=>outgoing.destroy(Error('Local response timeout'))); outgoing.on('error',reject);
  if(req.postData()) outgoing.write(req.postData()); outgoing.end();
});
let browser;
let serverErrors = ''; server.stderr.on('data', c => { serverErrors += c.toString(); });
try {
  await new Promise((resolve,reject)=>{
    let log=''; const timeout=setTimeout(()=>reject(Error('Website startup timeout')),20000);
    server.stdout.on('data',c=>{log+=c; if(log.includes('Ready')){clearTimeout(timeout);resolve();}});
    server.on('exit',()=>{clearTimeout(timeout);reject(Error('Website exited'));});
  });
  browser=await chromium.launch({headless:true});
  for(const [index,choice] of ['PACKAGE_INSTALLMENT','PAY_AT_DOOR','PAY_PER_GUEST'].entries()) {
    const ref='kvr_'+String(index+1).repeat(40), path='/reservations/group/'+ref;
    let state='READY', createCount=0, checkoutCount=0, qrCount=0, readCount=0, failedRead=false;
    const errors=[];
    const ctx=await browser.newContext({viewport:index===0?{width:390,height:844}:{width:1280,height:900},serviceWorkers:'block'});
    const page=await ctx.newPage(); page.on('pageerror',e=>errors.push(e.message));
    function status() {
      const paid=state==='SETTLED', pending=state==='PENDING', covered=paid?(choice==='PACKAGE_INSTALLMENT'?4:1):0;
      const amount=choice==='PACKAGE_INSTALLMENT'?10000:2500;
      const coverage={prepaid:covered,manualAcknowledged:0,unpaidActive:4-covered,releasedUnpaid:0,admitted:0,remainingCovered:covered};
      return {ok:true,publicReservationRef:ref,event:{id:event.id,title:event.title,slug:event.slug,timezone:event.timezone},
        product:{id:product.id,name:product.name,kind:'TABLE',quantity:1,guestsPerProduct:4},guestCount:4,
        reservationState:'RESERVED',canonicalReservationStatus:'RESERVED',admissionPlanState:'CONFIRMED',
        paymentState:paid?(covered===4?'FULLY_PAID':'PARTIALLY_PAID'):'AWAITING_PAYMENT',statusRevision:1,asOf:new Date().toISOString(),
        capacityHeld:true,holdExpiresAt:paid&&covered===4?null:event.startsAt,admissionScope:scope,paymentTiming:timing,
        onlinePaymentInitiationAllowed:!pending&&!paid,onlinePaymentPending:pending,reconciliationRequired:false,coverage,
        showAdmissions:scope.entries.map(e=>({...coverage,entryScopeKey:e.entryScopeKey,guestUnits:4})),
        payment:{currency:'USD',totalCents:10000,stripeSettledCents:paid?amount:0,manualAcknowledgedCents:0,
          pendingCents:pending?amount:0,outstandingCents:paid?10000-amount:10000,
          packagePaidCents:choice==='PACKAGE_INSTALLMENT'&&paid?amount:0,packageBalanceCents:choice==='PACKAGE_INSTALLMENT'?(paid?0:10000):0},
        guestShares:choice==='PACKAGE_INSTALLMENT'?[]:[1,2,3,4].map(n=>({shareRef:'guest-'+n,ordinal:n,amountCents:2500,
          coverage:paid&&n===1?'PREPAID':'UNPAID',lifecycle:'ACTIVE'})),
        checkoutHistory:state==='READY'?[]:[{checkoutRef,state:paid?'SETTLED':'PENDING',amountCents:amount}],
        groupCredentialIssued:qrCount>0,groupCredentialValue:null,nextAction:paid?'READY_FOR_ENTRY':'PAYMENT_REQUIRED'};
    }
    await ctx.route('**/*',async route=>{
      const req=route.request(), url=new URL(req.url());
      if(url.origin===WEBSITE || url.origin==='https://kv-website-ten.vercel.app')return route.fulfill(await local(req));
      if(url.origin==='https://checkout.stripe.com')return route.fulfill({contentType:'text/html',body:
        `<h1>Isolated payment provider</h1><a href="${WEBSITE}/reservations/group/return?result=success&session_id=untrusted">Return to reservation</a><a href="${WEBSITE}/reservations/group/return?result=cancel">Cancel and return</a>`});
      if(url.origin!==API)return route.fulfill({body:'',status:204});
      const headers={'Access-Control-Allow-Origin':WEBSITE,'Access-Control-Allow-Headers':'Accept,Content-Type,Authorization,Idempotency-Key',
        'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Cache-Control':'no-store'};
      if(req.method()==='OPTIONS')return route.fulfill({status:204,headers});
      const json=(body,status=200)=>route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(body)});
      if(url.pathname.endsWith('/quotes')) {
        const body=req.postDataJSON(); assert.equal(body.productId,product.id); assert.equal(body.eventId,event.id);
        assert.equal(body.showId,undefined); assert.equal(body.paymentChoice,choice);
        assert.equal(body.proposedInstallmentCents,choice==='PACKAGE_INSTALLMENT'?10000:undefined);
        return json({ok:true,quoteToken:'isolated-quote',quoteExpiresAt:new Date(Date.now()+240000).toISOString(),capacityHeld:false,
          event:{id:event.id},product:{id:product.id,quantity:1},guestCount:4,currency:'USD',totalCents:10000,
          amountDueNowCents:choice==='PACKAGE_INSTALLMENT'?10000:choice==='PAY_PER_GUEST'?2500:0,
          amountDueLaterCents:choice==='PACKAGE_INSTALLMENT'?0:choice==='PAY_PER_GUEST'?7500:10000,
          guestShares:[1,2,3,4].map(n=>({shareRef:'guest-'+n,ordinal:n,amountCents:2500})),eligiblePaymentChoices:[choice],
          admissionScope:scope,paymentTiming:timing,gracePolicy:{minutes:null,version:1,anchor:'RESERVATION_START',expiresAt:event.startsAt}});
      }
      if(url.pathname==='/api/public/m1/reservations') {
        createCount++; assert.equal(req.postDataJSON().acceptUnpaidPaymentTerms,true);
        return json({ok:true,publicReservationRef:ref,customerAccessToken:token,paymentChoice:choice,
          accessExpiresAt:'2026-12-22T05:00:00.000Z',guestCount:4,holdExpiresAt:event.startsAt,capacityHeld:true});
      }
      assert.equal(req.headers().authorization,'Bearer '+token);
      if(url.pathname.endsWith('/status')) {readCount++;return failedRead?json({ok:false,code:'STATUS_UNAVAILABLE'},503):json(status());}
      if(url.pathname.endsWith('/qr')) {qrCount++;return json({ok:true,contract:'kvrs.m1.customer-group-qr.v1',publicReservationRef:ref,
        scanValue,guestCount:4,groupCredentialIssued:true,admissionConfirmed:false,requiresAuthorizedHostCheckIn:true,oneScanAdmitsZeroWithoutHostConfirmation:true});}
      if(url.pathname==='/api/public/m1/checkouts') {
        checkoutCount++; const body=req.postDataJSON(), amount=choice==='PACKAGE_INSTALLMENT'?10000:2500;
        assert.equal(body.publicReservationRef,ref);
        assert.equal(body.contributionMode,choice==='PACKAGE_INSTALLMENT'?'PACKAGE_BALANCE':'GUEST_SHARE');
        if(choice==='PACKAGE_INSTALLMENT')assert.equal(body.installmentAmountCents,10000);
        state='PENDING';return json({ok:true,publicReservationRef:ref,checkoutRef,checkoutUrl:'https://checkout.stripe.com/c/pay/isolated',
          amountCents:amount,currency:'USD',paymentState:'PENDING',coverageGranted:false,paymentTiming:timing,
          providerExpiresAt:new Date(Date.now()+1800000).toISOString()});
      }
      if(url.pathname==='/api/public/m1/checkouts/'+checkoutRef)return json({ok:true,checkoutRef,state:'PENDING',providerStatus:'open',
        checkoutUrl:'https://checkout.stripe.com/c/pay/isolated',amountCents:choice==='PACKAGE_INSTALLMENT'?10000:2500,currency:'USD',
        newPaymentCreated:false,coverageGranted:false,freshStatusRequired:true});
      throw Error('Unexpected isolated API request');
    });
    if(WEBSITE==='https://katyvibes.com') {
      await page.goto('https://kv-website-ten.vercel.app/reservations/group/return?result=success');
      await page.getByRole('heading',{name:'Find your reservation',exact:true}).waitFor();
      assert.equal(page.url(),WEBSITE+'/reservations/group/return');
    }
    await page.goto(WEBSITE+'/reservations/group/book/'+event.slug+'/'+product.id);
    try { await page.getByLabel('Payment option',{exact:true}).waitFor({timeout:15000}); }
    catch { throw Error('Booking form unavailable: '+await page.locator('main').innerText()+'; server: '+serverErrors.slice(-1500)); }
    const choices=await page.getByLabel('Payment option',{exact:true}).locator('option').allTextContents();
    assert.deepEqual(choices,['Pay in Full','Pay at Door','Split Payment per guest']);
    await page.getByLabel('Payment option',{exact:true}).selectOption(choice);
    await page.getByRole('button',{name:'Review Reservation Quote'}).click();
    await page.getByLabel('Name',{exact:true}).fill('Isolated Website Guest');
    await page.getByLabel('Email',{exact:true}).fill('isolated@example.test');
    await page.getByLabel('Phone',{exact:true}).fill('2815550100');
    await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Create Reservation',exact:true}).click();
    await page.waitForURL(WEBSITE+path);
    const qr=page.getByRole('img',{name:'Group admission QR for authorized Katy Vibes staff'});
    await qr.waitFor();assert.equal(createCount,1);assert.ok(readCount>=1);
    const png=PNG.sync.read(await qr.screenshot());
    const decoded=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);
    assert.equal(decoded?.data,scanValue);
    assert.equal(new URL(page.url()).hash,'');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    if(choice!=='PAY_AT_DOOR') {
      await page.getByRole('button',{name:choice==='PACKAGE_INSTALLMENT'?'Pay in Full · $100.00':'Pay This Guest',exact:true}).first().click();
      await page.waitForURL(url=>url.hostname==='checkout.stripe.com');
      await page.getByRole('link',{name:choice==='PACKAGE_INSTALLMENT'?'Return to reservation':'Cancel and return',exact:true}).click();
      await page.getByText(/is pending\. Please wait/).waitFor();assert.equal(checkoutCount,1);
      assert.equal(new URL(page.url()).search,'');assert.equal(new URL(page.url()).hash,'');
      state='SETTLED';await page.getByRole('button',{name:'Refresh Payment Status',exact:true}).click();
      await page.getByText(choice==='PACKAGE_INSTALLMENT'?'Payment status: fully paid':'Payment status: partially paid',{exact:true}).waitFor();
      if(choice==='PACKAGE_INSTALLMENT')await page.getByText(/Currently covered: 4 guests/).waitFor();
    } else assert.equal(checkoutCount,0);
    failedRead=true;await page.getByRole('button',{name:'Refresh Payment Status',exact:true}).click();
    await qr.waitFor({state:'detached'}); assert.equal(createCount,1); assert.equal(checkoutCount,choice==='PAY_AT_DOOR'?0:1);
    assert.deepEqual(errors,[]);
    console.log('PASS: '+choices[['PACKAGE_INSTALLMENT','PAY_AT_DOOR','PAY_PER_GUEST'].indexOf(choice)]+': quote, create, fresh status, decoded QR, return/settlement or no Checkout, stale-status removal');
    await ctx.close();
  }
} catch(error) {
  throw Error(String(error?.message??error).replace(/kvrs_(?:ra1|m1)_[A-Za-z0-9_-]{43}/g,'[PRIVATE_CAPABILITY]'));
} finally {
  if(browser)await browser.close().catch(()=>{});server.kill('SIGTERM');fixture.close();
}
