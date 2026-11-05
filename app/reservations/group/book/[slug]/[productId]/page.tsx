import { notFound, redirect } from 'next/navigation';
import { CustomerGroupBooking } from '@/components/CustomerGroupBooking';
import { headers } from 'next/headers';
import { customerPortalRedirect, customerReleaseForHost, customerProductEligible, customerProductSelection } from '@/lib/customerM1Release';
import { getPublicEvent } from '@/lib/kvrsEvents';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reserve Your Table | Katy Vibes', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ slug: string; productId: string }> }) {
  const host = (await headers()).get('host'); const { slug, productId } = await params;
  const destination = customerPortalRedirect(host, '/reservations/group/book/' + encodeURIComponent(slug) + '/' + encodeURIComponent(productId));
  if (destination) redirect(destination);
  const release = customerReleaseForHost(host);
  if (!release.salesEnabled) return <section className="card stack"><h1>Table reservations</h1>
    <p>Online booking for this event is not open yet. Please call us for help planning your visit.</p>
    <a className="button" href="tel:18324372807">Call (832) 437-2807</a></section>;
  const event = await getPublicEvent(slug);
  if (!event || !release.approvedPairs.includes(`${event.id}:${productId}`)) notFound();
  const product = event.ticketTypes?.find(p => p.id === productId);
  if (!product || !customerProductEligible(event, product, release)) notFound();
  const selection = customerProductSelection(event, product);
  if (!selection) notFound();
  return <CustomerGroupBooking product={{ eventId: event.id, productId: product.id, eventTitle: event.title,
    productName: product.publicLabel || product.name, guestCount: product.guestCount, priceCents: product.priceCents, ...selection }} />;
}
