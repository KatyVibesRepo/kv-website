'use client';

import type { PublicTicketType } from '@/lib/kvrsEvents';

export type MixedPaymentMode = 'full' | 'guest_split' | 'installment' | 'at_door';

type Props = {
  ticket: PublicTicketType;
  quantity: number;
  mode: MixedPaymentMode;
  onModeChange: (mode: MixedPaymentMode) => void;
  guestsPayingNow: number;
  onGuestsPayingNowChange: (count: number) => void;
  installmentAmount: string;
  onInstallmentAmountChange: (amount: string) => void;
};

function money(cents: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(cents / 100);
}

export function MixedPaymentPlanner({
  ticket,
  quantity,
  mode,
  onModeChange,
  guestsPayingNow,
  onGuestsPayingNowChange,
  installmentAmount,
  onInstallmentAmountChange,
}: Props) {
  const isTable = ticket.type === 'table' || ticket.type === 'vip_table';
  const guestCount = Math.max(1, ticket.guestCount) * Math.max(1, quantity);
  const fullPriceCents = ticket.priceCents * Math.max(1, quantity);
  const canSplitGuests = isTable && quantity === 1 && guestCount > 1;
  const canInstallment = isTable && quantity === 1;
  const paidNow = Math.max(1, Math.min(guestCount - 1, guestsPayingNow));
  const unpaid = guestCount - paidNow;
  const installmentCents = Math.round(Number(installmentAmount) * 100);
  const validInstallment =
    Number.isFinite(installmentCents)
    && installmentCents > 0
    && installmentCents < fullPriceCents;
  const choices: Array<{ value: MixedPaymentMode; name: string; detail: string; available: boolean }> = [
    {
      value: 'full',
      name: 'Pay in Full',
      detail: 'Complete secure online checkout with Stripe.',
      available: true,
    },
    {
      value: 'guest_split',
      name: 'Split by Guest',
      detail: 'Some guests pay online; others pay at the door.',
      available: canSplitGuests,
    },
    {
      value: 'installment',
      name: 'Pay Toward This Table',
      detail: 'Contribute toward the package balance, not individual guest admissions.',
      available: canInstallment,
    },
    {
      value: 'at_door',
      name: 'Pay at Door',
      detail: 'Request eligible admission holds and pay at the venue.',
      available: true,
    },
  ];

  return (
    <fieldset className="mixed-payment-planner">
      <legend>Choose how to pay</legend>
      <div className="mixed-payment-options">
        {choices.filter((choice) => choice.available).map((choice) => (
          <label className="mixed-payment-choice" key={choice.value}>
            <input
              type="radio"
              name="paymentChoice"
              value={choice.value}
              checked={mode === choice.value}
              onChange={() => onModeChange(choice.value)}
            />
            <span>
              <strong>{choice.name}</strong>
              <small>{choice.detail}</small>
            </span>
          </label>
        ))}
      </div>

      {mode === 'guest_split' && canSplitGuests && (
        <label className="mixed-payment-count">
          <span>Guests paying online (out of {guestCount})</span>
          <input
            type="number"
            min={1}
            max={guestCount - 1}
            value={paidNow}
            onChange={(event) => onGuestsPayingNowChange(
              Math.max(1, Math.min(guestCount - 1, Number(event.target.value) || 1)),
            )}
          />
        </label>
      )}

      {mode === 'installment' && canInstallment && (
        <label className="mixed-payment-count">
          <span>Proposed contribution toward your table ($)</span>
          <input
            type="number"
            inputMode="decimal"
            min="0.01"
            step="0.01"
            max={(fullPriceCents / 100).toFixed(2)}
            value={installmentAmount}
            onChange={(event) => onInstallmentAmountChange(event.target.value)}
            placeholder="Enter amount"
          />
        </label>
      )}

      <div className="mixed-payment-summary" aria-live="polite">
        <strong>Payment summary</strong>
        <p>Selected package total: {money(fullPriceCents, ticket.currency)} · {guestCount} guest admissions</p>
        {mode === 'full' && (
          <p>
            Due online: {money(fullPriceCents, ticket.currency)}. When KVRS confirms full
            payment, this package covers all {guestCount} admissions.
          </p>
        )}
        {mode === 'guest_split' && (
          <p>
            {paidNow} guest{paidNow === 1 ? '' : 's'} paying online · {unpaid} paying at the door.
            Individual share amounts, payment eligibility and hold deadlines require a
            KVRS quote; the table price alone is not a guest-share price.
          </p>
        )}
        {mode === 'installment' && (
          <p>
            {validInstallment
              ? money(installmentCents, ticket.currency) + ' proposed now; ' +
                money(fullPriceCents - installmentCents, ticket.currency) + ' remaining.'
              : 'Enter a partial contribution to view a proposed balance.'}
            {' '}A partial package payment does not automatically grant any individual paid admission.
          </p>
        )}
        {mode === 'at_door' && (
          <p>
            No online payment selected. All {guestCount} admissions would remain unpaid
            until KVRS records valid payment. The hold is not guaranteed or created here.
          </p>
        )}
      </div>

      {mode !== 'full' && (
        <p className="mixed-payment-notice" role="status">
          This choice is available for planning only. Online confirmation will open once
          Katy Vibes enables the corresponding reservation option. No hold or payment is
          created by selecting it. Call 832-437-2807 for assistance.
        </p>
      )}
      {mode === 'full' && (
        <p className="mixed-payment-footnote">
          Final pricing and availability are checked by KVRS at checkout.
        </p>
      )}
    </fieldset>
  );
}
