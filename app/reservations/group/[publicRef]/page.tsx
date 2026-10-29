import { notFound } from 'next/navigation';
import { CustomerReservation } from '@/components/CustomerReservation';
import { validCustomerRef } from '@/lib/customerM1Client';
import { headers } from 'next/headers';
import { customerReleaseForHost } from '@/lib/customerM1Release';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your Reservation | Katy Vibes', robots: { index: false, follow: false } };
export default async function Page({ params }: { params: Promise<{ publicRef: string }> }) {
  const release = customerReleaseForHost((await headers()).get('host')); const { publicRef } = await params;
  if (!release.readEnabled || !validCustomerRef(publicRef)) notFound();
  return <CustomerReservation reservationRef={publicRef} salesEnabled={release.salesEnabled}
    approvedPairs={release.approvedPairs} showSalesEnabled={release.showSalesEnabled} />;
}
