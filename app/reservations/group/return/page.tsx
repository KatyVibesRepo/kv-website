import { notFound, redirect } from 'next/navigation';
import { CustomerCheckoutReturn } from '@/components/CustomerCheckoutReturn';
import { headers } from 'next/headers';
import { customerPortalRedirect, customerReleaseForHost } from '@/lib/customerM1Release';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Payment Update | Katy Vibes', robots: { index: false, follow: false } };
export default async function Page() {
  const host = (await headers()).get('host');
  const destination = customerPortalRedirect(host, '/reservations/group/return');
  if (destination) redirect(destination);
  if (!customerReleaseForHost(host).readEnabled) notFound();
  return <CustomerCheckoutReturn />;
}
