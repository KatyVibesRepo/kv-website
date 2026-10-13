import { NextResponse, type NextRequest } from 'next/server';

// KVRS staging Stripe TEST currently returns to "/?g8Checkout=...".
// Route that marker to the isolated G8 same-tab handoff without allowing the
// query value (or any other query params) to reach the reservation page.
// This does not change normal homepage traffic or Production checkout.
export function middleware(request: NextRequest) {
  if (
    (process.env.VERCEL_ENV === 'preview' || process.env.NODE_ENV === 'development') &&
    request.nextUrl.pathname === '/' &&
    request.nextUrl.searchParams.has('g8Checkout')
  ) {
    const destination = request.nextUrl.clone();
    destination.pathname = '/g8/return';
    destination.search = '';
    destination.hash = '';
    const response = NextResponse.redirect(destination, 307);
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  }

  return NextResponse.next();
}

export const config = { matcher: ['/'] };
