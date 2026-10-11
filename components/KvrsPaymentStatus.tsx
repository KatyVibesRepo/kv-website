import type { ReactNode } from 'react';

export type KvrsPublicPaymentSummary = {
  state:
    | 'received'
    | 'held'
    | 'awaiting_payment'
    | 'partially_paid'
    | 'fully_paid'
    | 'expired_or_released'
    | 'cancelled'
    | 'admitted'
    | 'checked_in';
  guestCount: number;
  onlinePaidAdmissions: number;
  venueAcknowledgedAdmissions: number;
  unpaidAdmissions: number;
  admittedAdmissions: number;
  packagePaidCents?: number | null;
  packageRemainingCents?: number | null;
  currency?: string | null;
  holdExpiresAt?: string | null;
};

const labels: Record<KvrsPublicPaymentSummary['state'], string> = {
  received: 'Reservation received',
  held: 'Reservation held',
  awaiting_payment: 'Awaiting payment',
  partially_paid: 'Partially paid',
  fully_paid: 'Fully paid',
  expired_or_released: 'Unpaid hold expired or released',
  cancelled: 'Cancelled',
  admitted: 'Guest admission in progress',
  checked_in: 'Checked in',
};

function validCount(value: unknown) {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function money(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(cents / 100);
}

function Row({ title, value }: { title: string; value: ReactNode }) {
  return <div className="kvrs-payment-status-row"><span>{title}</span><strong>{value}</strong></div>;
}

export function KvrsPaymentStatus({ summary }: { summary?: KvrsPublicPaymentSummary | null }) {
  if (!summary || !(summary.state in labels)) return null;
  if (![
    summary.guestCount,
    summary.onlinePaidAdmissions,
    summary.venueAcknowledgedAdmissions,
    summary.unpaidAdmissions,
    summary.admittedAdmissions,
  ].every(validCount)) return null;

  const totalPaid = summary.onlinePaidAdmissions + summary.venueAcknowledgedAdmissions;
  const remainingAdmissions = Math.max(0, summary.guestCount - summary.admittedAdmissions);
  const expiresAt = summary.holdExpiresAt ? new Date(summary.holdExpiresAt) : null;
  const hasDeadline = expiresAt && Number.isFinite(expiresAt.getTime());

  return (
    <section className="kvrs-payment-status" aria-label="Current reservation payment and admission status">
      <h2>{labels[summary.state]}</h2>
      <p>Payment and admission status confirmed by Katy Vibes.</p>
      <div className="kvrs-payment-status-grid">
        <Row title="Included guests" value={summary.guestCount} />
        <Row title="Paid admissions" value={totalPaid} />
        <Row title="Paid online" value={summary.onlinePaidAdmissions} />
        <Row title="Paid at the venue" value={summary.venueAcknowledgedAdmissions} />
        <Row title="Still unpaid" value={summary.unpaidAdmissions} />
        <Row title="Admitted / remaining" value={String(summary.admittedAdmissions) + ' / ' + String(remainingAdmissions)} />
        {validCount(summary.packagePaidCents) && (
          <Row title="Table package contributions" value={money(summary.packagePaidCents!, summary.currency || 'USD')} />
        )}
        {validCount(summary.packageRemainingCents) && (
          <Row title="Remaining table balance" value={money(summary.packageRemainingCents!, summary.currency || 'USD')} />
        )}
      </div>
      {hasDeadline && (
        <p>
          Unpaid hold deadline: {new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Chicago',
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(expiresAt)}
        </p>
      )}
      {summary.unpaidAdmissions > 0 && (
        <p>Unpaid guests must complete eligible payment before they can be admitted.
          Paid guest admissions remain separate from any expired unpaid hold.</p>
      )}
    </section>
  );
}
