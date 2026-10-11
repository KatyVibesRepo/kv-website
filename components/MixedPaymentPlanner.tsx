'use client';

import type { PublicTicketType } from '@/lib/kvrsEvents';

export type MixedPaymentMode = 'guest_split' | 'at_door';

type Props = {
  ticket: PublicTicketType;
  quantity: number;
  mode: MixedPaymentMode | null;
  onModeChange: (mode: MixedPaymentMode) => void;
  guestsPayingNow: number;
  onGuestsPayingNowChange: (count: number) => void;
};

export function MixedPaymentPlanner({
  ticket,
  quantity,
  mode,
  onModeChange,
  guestsPayingNow,
  onGuestsPayingNowChange,
}: Props) {
  const isTable = ticket.type === 'table' || ticket.type === 'vip_table';
  const guests = Math.max(1, ticket.guestCount);
  const singleUnit = quantity === 1;
  const canSplitGuests = isTable && singleUnit && guests > 1;
  const canPayAtDoor = singleUnit;
  const paidNow = Math.max(1, Math.min(guests - 1, guestsPayingNow));

  const choices: Array<{ value: MixedPaymentMode; label: string; eligible: boolean }> = [
    { value: 'guest_split', label: 'Pay Individually', eligible: canSplitGuests },
    { value: 'at_door', label: 'Pay at Door', eligible: canPayAtDoor },
  ];
  const eligible = choices.filter((choice) => choice.eligible);

  return (
    <div className="mixed-payment-planner">
      <p className="mixed-payment-intro">
        Choose the payment option that works for your group.
      </p>

      {eligible.length === 0 ? (
        <p className="mixed-payment-notice">
          For multiple tickets or tables, please call us to discuss payment options.
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
                Final amounts and terms are confirmed before payment.
              </p>
            </div>
          )}

          {mode === 'at_door' && canPayAtDoor && (
            <p className="mixed-payment-details">
              Pay at the venue, where this option is offered. Availability and payment
              terms depend on the event.
            </p>
          )}
        </>
      )}

      <p className="mixed-payment-notice">
        Any questions? Call <a href="tel:18324372807">(832) 437-2807</a>.
      </p>
    </div>
  );
}
