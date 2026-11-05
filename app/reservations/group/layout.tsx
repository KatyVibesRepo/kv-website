import type { ReactNode } from 'react';

export default function SecureBookingLayout({ children }: { children: ReactNode }) {
  return <div className="secure-booking-area">{children}</div>;
}
