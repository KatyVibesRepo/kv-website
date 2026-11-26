export function validPublicTicketToken(token: unknown): token is string;
export function ticketPagePath(token: unknown): string | null;
export function publicTicketQrImage(ticket: unknown): string | null;
export function validTicketProjection(ticket: unknown): boolean;
