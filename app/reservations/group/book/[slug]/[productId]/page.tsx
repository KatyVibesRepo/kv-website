import { notFound } from 'next/navigation';
import { CustomerGroupBooking } from '@/components/CustomerGroupBooking';
import { customerRelease } from '@/lib/customerM1Release';
import { getPublicEvent } from '@/lib/kvrsEvents';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reserve Your Table | Katy Vibes', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ slug: string; productId: string }> }) {
  const release = customerRelease();
  if (!release.salesEnabled) notFound();
  const { slug, productId } = await params;
  const event = await getPublicEvent(slug);
  if (!event || !release.approvedPairs.includes(`${event.id}:${productId}`)) notFound();
  const product = event.ticketTypes?.find(p => p.id === productId);
  // Only public feed products, explicitly reviewed pair, real future event. The backend revalidates sale scope.
  const publicText = `${event.id} ${event.slug} ${event.title} ${product?.id} ${product?.name}`;
  if (!product || /synthetic|fixture|not.for.sale|(?:^|[\s_:-])(?:qa|syn|test|lab)(?:[\s_:-]|$)/i.test(publicText) ||
    event.visibility !== 'PUBLIC' || !['LIVE', 'PUBLISHED'].includes(event.status) ||
    Date.parse(event.startsAt) <= Date.now() || !event.isTicketed || !event.isReservationEnabled ||
    ![3, 4, 8].includes(product.guestCount) || product.currency !== 'USD' ||
    product.checkoutEnabled !== true || !['ACTIVE', 'active'].includes(product.status) ||
    !['EVENT', 'SHOWS'].includes(product.scope || '')) notFound();
  const shows = (event.shows || []).filter(s => product.showIds?.includes(s.id) && s.isVisible !== false &&
    s.status === 'SCHEDULED' && s.definitionState === 'ACTIVE').map(s => ({ id: s.id, label: s.name }));
  if (product.scope === 'SHOWS' && !shows.length) notFound();
  return <CustomerGroupBooking product={{ eventId: event.id, productId: product.id, eventTitle: event.title,
    productName: product.publicLabel || product.name, guestCount: product.guestCount, shows, showRequired: product.scope === 'SHOWS' }} />;
}
