import { notFound } from 'next/navigation';
import { CustomerGroupBooking } from '@/components/CustomerGroupBooking';
import { headers } from 'next/headers';
import { customerReleaseForHost, customerProductEligible, customerProductSelection } from '@/lib/customerM1Release';
import { getPublicEvent } from '@/lib/kvrsEvents';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reserve Your Table | Katy Vibes', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ slug: string; productId: string }> }) {
  const release = customerReleaseForHost((await headers()).get('host'));
  if (!release.salesEnabled) notFound();
  const { slug, productId } = await params;
  const event = await getPublicEvent(slug);
  if (!event || !release.approvedPairs.includes(`${event.id}:${productId}`)) notFound();
  const product = event.ticketTypes?.find(p => p.id === productId);
  if (!product || !customerProductEligible(event, product, release)) notFound();
  const selection = customerProductSelection(event, product);
  if (!selection) notFound();
  return <CustomerGroupBooking product={{ eventId: event.id, productId: product.id, eventTitle: event.title,
    productName: product.publicLabel || product.name, guestCount: product.guestCount, ...selection }} />;
}
