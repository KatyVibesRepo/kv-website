import type { Metadata } from 'next';
import { TicketOrderWallet } from './TicketOrderWallet';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Your Katy Vibes Tickets | QR Wallet',
  description: 'View your Katy Vibes QR tickets after checkout.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TicketOrderPage() {
  return <TicketOrderWallet />;
}
