'use client';

import type { PublicTicketType } from '@/lib/kvrsEvents';

export type MixedPaymentMode = 'guest_split' | 'installment' | 'at_door';

type Props = {
  ticket: PublicTicketType;
  quantity: number;
  mode: MixedPaymentMode | null;
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
  const guests = Math.max(1, ticket.guestCount);
  const singleUnit = quantity === 1;
  const canSplitGuests = isTable && singleUnit && guests > 1;
  const canInstallment = isTable && singleUnit;
  const canPayAtDoor = singleUnit;
  const paidNow = Math.max(1, Math.min(guests - 1, guestsPayingNow));
  const installmentCents = Math.round(Number(installmentAmount) * 100);
  const validInstallment = installmentAmount.trim() !== ''
    && Number.isFinite(installmentCents)
    && installmentCents > 0
    && installmentCents < ticket.priceCents;

  const choices: Array<{ value: MixedPaymentMode; label: string; eligible: boolean }> = [
    { value: 'guest_split', label: 'Pay Individually', eligible: canSplitGuests },
    { value: 'at_door', label: 'Pay at Door', eligible: canPayAtDoor },
    { value: 'installment', label: 'Partial Table Payment', eligible: canInstallment },
  ];
  const eligible = choices.filter((choice) => choice.eligible);

  return (
    <div className="mixed-payment-planner">
      <p className="mixed-payment-intro">
        Prefer to pay another way? Explore these options for a single ticket or table.
      </p>

      {eligible.length === 0 ? (
        <p className="mixed-payment-notice">
          Additional payment options are for one ticket or table at a time.
          The regular checkout above still supports multiple quantities.
        </p>
      ) : (
        <>
          <div className="mixed-payment-options" role="group" aria-label="Alternative payment methods">
            {eligible.map((choice) => (
              <label className="mixed-payment-choice" key={choice.value}>
                <input
                  type="radio"
                  name={`payment-choice-${ticket.id}`}
                  value={choice.value}
                  checked={mode === choice.value}
                  onChange={() => onModeChange(choice.value)}
                />
                <span>{choice.label}</span>
              </label>
            ))}
          </div>

          {mode === 'guest_split' && canSplitGuests && (
            <div className="mixed-payment-details">
              <label>
                <span>Guests paying online (out of {guests})</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={guests - 1}
                  value={paidNow}
                  onChange={(event) =>
                    onGuestsPayingNowChange(
                      Math.max(1, Math.min(guests - 1, Number(event.target.value) || 1)),
                    )
                  }
                />
              </label>
              <p>
                {paidNow} to pay online · {guests - paidNow} to pay at the door.
                KVRS will confirm each guest&apos;s share and payment deadline.
              </p>
            </div>
          )}

          {mode === 'at_door' && canPayAtDoor && (
            <p className="mixed-payment-details">
              All {guests} {guests === 1 ? 'admission remains' : 'admissions remain'} unpaid
              until payment is recorded. A reservation hold is subject to event eligibility
              and the confirmed payment deadline.
            </p>
          )}

          {mode === 'installment' && canInstallment && (
            <div className="mixed-payment-details">
              <label>
                <span>Proposed payment toward the table ($)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  value={installmentAmount}
                  onChange={(event) => onInstallmentAmountChange(event.target.value)}
                  placeholder="Enter amount"
                />
              </label>
              {validInstallment ? (
                <p>
                  {money(installmentCents, ticket.currency)} proposed toward
                  the listed {money(ticket.priceCents, ticket.currency)} table price;
                  {money(ticket.priceCents - installmentCents, ticket.currency)} remaining
                  before any applicable fees. Final amounts come from KVRS.
                </p>
              ) : (
                <p>Enter an amount below the listed table price to preview a balance.</p>
              )}
              <p>Partial table payments do not automatically cover individual guest admission.</p>
            </div>
          )}
        </>
      )}

      <p className="mixed-payment-notice">
        Additional methods are not yet available for online reservations.
        No payment or hold is created here. <a href="tel:18324372807">Call 832-437-2807</a> for help.
      </p>
    </div>
  );
}
