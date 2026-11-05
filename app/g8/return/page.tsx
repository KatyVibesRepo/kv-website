import { notFound } from 'next/navigation';
import { G8CheckoutReturn } from '@/components/G8CheckoutReturn';
import { g8PreviewAllowed } from '@/lib/g8PreviewClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Payment Update | Katy Vibes', robots: { index: false, follow: false } };
export default function G8ReturnPage() {
  if (!g8PreviewAllowed()) notFound();
  return <G8CheckoutReturn />;
}
