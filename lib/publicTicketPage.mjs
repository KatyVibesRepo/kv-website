export function validPublicTicketToken(token){
 return typeof token==='string'&&/^ticket_[a-f0-9]{48}$/.test(token);
}
export function ticketPagePath(token){
 return validPublicTicketToken(token)?'/tickets/'+encodeURIComponent(token):null;
}
export function publicTicketQrImage(ticket){
 const svg=ticket?.qrSvg;
 if(ticket?.admissionPermitted!==true||typeof svg!=='string'||svg.length>250000||!svg.trim().startsWith('<svg'))return null;
 // SVG is displayed in image context, not injected into page markup.
 return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
export function validTicketProjection(ticket){
 return Boolean(ticket&&typeof ticket==='object'&&typeof ticket.admissionPermitted==='boolean'&&typeof ticket.awaitingApproval==='boolean'&&typeof ticket.refunded==='boolean'&&typeof ticket.freeRsvp==='boolean'&&/^[A-F0-9]{8}$/.test(ticket.code)&&typeof ticket.eventTitle==='string'&&typeof ticket.eventDate==='string'&&typeof ticket.guestName==='string'&&Number.isSafeInteger(ticket.guestCount)&&typeof ticket.ticketType==='string'&&typeof ticket.label==='string'&&typeof ticket.paymentStatus==='string'&&Number.isSafeInteger(ticket.amountPaidCents)&&Number.isSafeInteger(ticket.ticketIndex)&&Number.isSafeInteger(ticket.ticketCount)&&Array.isArray(ticket.siblings));
}
