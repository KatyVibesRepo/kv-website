import { notFound } from 'next/navigation';
import { CustomerCheckoutReturn } from '@/components/CustomerCheckoutReturn';
import { headers } from 'next/headers';
import { customerReleaseForHost } from '@/lib/customerM1Release';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Payment Update | Katy Vibes', robots: { index: false, follow: false } };
export default async function Page() {
  if (!customerReleaseForHost((await headers()).get('host')).readEnabled) notFound();
  return <CustomerCheckoutReturn />;
}
