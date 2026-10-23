import { notFound } from 'next/navigation';
import { CustomerCheckoutReturn } from '@/components/CustomerCheckoutReturn';
import { customerRelease } from '@/lib/customerM1Release';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Payment Update | Katy Vibes', robots: { index: false, follow: false } };
export default function Page() {
  if (!customerRelease().readEnabled) notFound();
  return <CustomerCheckoutReturn />;
}
