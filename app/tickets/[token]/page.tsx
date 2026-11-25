import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getKvrsServerConfig} from '@/lib/kvrsServerConfig';
import {validPublicTicketToken,validTicketProjection,publicTicketQrImage,ticketPagePath} from '@/lib/publicTicketPage.mjs';
import PrintTicketButton from './PrintTicketButton';
import styles from './PublicTicket.module.css';
export const dynamic='force-dynamic';
export const revalidate=0;
export const metadata:Metadata={title:'Your Katy Vibes Ticket',robots:{index:false,follow:false,noarchive:true},referrer:'no-referrer'};
type Sibling={token:string;code:string;label:string};
type Ticket={code:string;eventTitle:string;eventDate:string;guestName:string;guestCount:number;ticketType:string;tableAssignment:string|null;freeRsvp:boolean;amountPaidCents:number;paymentStatus:string;ticketIndex:number;ticketCount:number;admissionPermitted:boolean;awaitingApproval:boolean;refunded:boolean;label:string;checkedInAt:string|null;qrSvg:string|null;siblings:Sibling[]};
async function readTicket(token:string):Promise<{kind:'ready';ticket:Ticket}|{kind:'missing'|'unavailable'}>{
 try{
  // The configured server-side backend is independent of the public URL.
  const url=new URL('/api/public/tickets/'+encodeURIComponent(token),getKvrsServerConfig().baseUrl);
  const response=await fetch(url,{cache:'no-store',redirect:'error',headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
  if(response.status===404)return {kind:'missing'};
  if(!response.ok)return {kind:'unavailable'};
  const body=await response.json();
  if(body?.ok!==true||!validTicketProjection(body.ticket)||body.ticket.code!==token.slice(-8).toUpperCase())return {kind:'unavailable'};
  return {kind:'ready',ticket:body.ticket as Ticket};
 }catch{return {kind:'unavailable'};}
}
function checkedInAt(value:string|null){
 if(!value||Number.isNaN(Date.parse(value)))return 'Not checked in';
 return new Date(value).toLocaleString('en-US',{timeZone:'America/Chicago',weekday:'short',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
}
export default async function PublicTicketPage({params}:{params:Promise<{token:string}>}){
 const {token}=await params;
 if(!validPublicTicketToken(token))notFound();
 const result=await readTicket(token);
 if(result.kind==='missing')notFound();
 if(result.kind!=='ready')return <section className={styles.page}><div className={styles.card}><h1>Ticket temporarily unavailable</h1><p>Please refresh this page. Your ticket and payment records have not changed.</p><a href="https://admin.katyvibes.com/tickets/recover">Recover tickets</a><p>Need help? Call <a href="tel:18324372807">832-437-2807</a>.</p></div></section>;
 const t=result.ticket;
 const qr=publicTicketQrImage(t);
 const statusNote=t.awaitingApproval?'Payment or reservation information has been received. Management approval is required before this ticket is valid for entry.':!t.admissionPermitted?t.refunded?'This ticket has been refunded and is not valid for entry. It remains available here for your records.':'This ticket is no longer valid for entry. It remains available here for your records.':t.freeRsvp?'Your free RSVP is confirmed. Show this QR code at the door.':'Show this QR code at the door. Staff can scan it or search the ticket code manually.';
 const amount=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(t.amountPaidCents/100);
 return <section className={styles.page}>
  <header className={styles.heading}><div><span className={styles.eyebrow}>{t.freeRsvp?'Katy Vibes RSVP':'Katy Vibes ticket'}</span><h1>{t.eventTitle}</h1><p>{statusNote}</p></div><div className={styles.actions}><a href={t.freeRsvp?'/events':'https://admin.katyvibes.com/tickets/recover'}>{t.freeRsvp?'Browse events':'Recover other tickets'}</a><PrintTicketButton/></div></header>
  <article className={styles.card} data-ticket-admission={t.admissionPermitted?'permitted':'blocked'}>
   <div className={styles.status} data-state={t.admissionPermitted?'valid':'closed'}><div><span className={styles.eyebrow}>Ticket status</span><strong>{t.label}</strong></div><span>{t.admissionPermitted?t.checkedInAt?'Checked in '+checkedInAt(t.checkedInAt):'Not checked in yet':t.awaitingApproval?'Not valid until management approves':'Not valid for entry'}</span></div>
   <div className={styles.ticketMain}><div><span className={styles.eyebrow}>{t.freeRsvp?'RSVP code':'Ticket code'}</span><h2 className={styles.code}>{t.code}</h2><p>{t.eventTitle}</p><p>Ticket {t.ticketIndex} of {t.ticketCount}</p><p>Reservation for {t.guestCount} guest{t.guestCount===1?'':'s'}</p></div>
    {qr?<div className={styles.qr}><img src={qr} width={300} height={300} alt="Your ticket QR code"/></div>:<div className={styles.disabledQr}><strong>{t.admissionPermitted?'QR temporarily unavailable':'QR disabled'}</strong><span>{t.admissionPermitted?'Refresh the page or show your ticket code to staff':t.label}</span></div>}
   </div>
   <div className={styles.details}><div><span className={styles.eyebrow}>Guest</span><strong>{t.guestName}</strong><span>Primary guest</span></div><div><span className={styles.eyebrow}>Event</span><strong>{t.eventDate}</strong><span>{t.ticketType}</span><span>{t.tableAssignment||'No table assigned'}</span></div><div><span className={styles.eyebrow}>{t.freeRsvp?'RSVP':'Payment'}</span><strong>{t.freeRsvp?'Free':amount}</strong><span>{t.freeRsvp?'Free RSVP':t.paymentStatus}</span></div><div><span className={styles.eyebrow}>Check-in</span><strong>{checkedInAt(t.checkedInAt)}</strong><span>{t.label}</span><span>Show this page to Katy Vibes staff</span></div></div>
   {t.siblings.length>1?<section className={styles.siblings}><h3>Other tickets in this reservation</h3>{t.siblings.map(s=>{const href=ticketPagePath(s.token);return href?<a key={s.token} href={href}><strong>{s.code}</strong><span>{s.label}</span></a>:null})}</section>:null}
  </article>
  <p className={styles.note}>Keep this page available on your phone. When your reservation is approved and active, the QR code is valid only for this Katy Vibes ticket/reservation.</p>
 </section>;
}
