import type { CustomerPaymentTiming as PaymentTiming } from '@/lib/customerM1Client';

const date = (value: string) => new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago', dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value)) + ' Central';

export function CustomerPaymentTiming({ timing, providerExpiresAt }: {
  timing: PaymentTiming; providerExpiresAt?: string;
}) {
  return <article className="card stack">
    <h2>Payment timing</h2>
    <p>Start a new payment before your reservation time: <strong>{date(timing.newPaymentDeadline)}</strong>.</p>
    <p>A payment started before this deadline may finish through its original Checkout afterward.
      Keep using the same payment request and wait for verified payment status.</p>
    {providerExpiresAt && <p>Original Checkout expires: <strong>{date(providerExpiresAt)}</strong>.
      This does not extend the deadline to start a new payment or change your show coverage.</p>}
    <p>Returning from Checkout does not confirm payment. Staff confirm admission and seating separately.</p>
  </article>;
}
