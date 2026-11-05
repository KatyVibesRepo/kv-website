import { notFound } from 'next/navigation';
import { G8ReservationPage } from '@/components/G8ReservationPage';
import { g8PreviewAllowed, validG8Ref } from '@/lib/g8PreviewClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Your Reservation | Katy Vibes', robots: { index: false, follow: false } };

export default async function ReservationPage({ params }: { params: Promise<{ publicRef: string }> }) {
  const { publicRef } = await params;
  if (!g8PreviewAllowed() || !validG8Ref(publicRef)) notFound();
  return <G8ReservationPage reservationRef={publicRef} />;
}
