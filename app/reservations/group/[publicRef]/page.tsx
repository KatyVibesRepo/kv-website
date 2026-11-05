import { notFound, redirect } from 'next/navigation';
import { CustomerReservation } from '@/components/CustomerReservation';
import { validCustomerRef } from '@/lib/customerM1Client';
import { headers } from 'next/headers';
import { customerPortalRedirect, customerReleaseForHost } from '@/lib/customerM1Release';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your Reservation | Katy Vibes', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ publicRef: string }> }) {
  const host = (await headers()).get('host'); const { publicRef } = await params;
  if (!validCustomerRef(publicRef)) notFound();
  const destination = customerPortalRedirect(host, '/reservations/group/' + publicRef);
  if (destination) redirect(destination);
  const release = customerReleaseForHost(host);
  if (!release.readEnabled || !validCustomerRef(publicRef)) notFound();
  return <CustomerReservation reservationRef={publicRef} salesEnabled={release.salesEnabled}
    approvedPairs={release.approvedPairs} showSalesEnabled={release.showSalesEnabled} />;
}
