'use client';

export function BookingSmsConsent({ checked, onChange }: {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <div className="booking-sms-consent">
      <label className="booking-sms-consent-choice">
        <input type="checkbox" name="smsConsent" value="on" checked={checked}
          onChange={onChange ? event => onChange(event.target.checked) : undefined} />
        <span>I agree to receive optional transactional text messages from Katy Vibes about this reservation or ticket booking, including confirmations, changes and customer assistance. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. SMS consent is not required to reserve or purchase tickets.</span>
      </label>
      <p>Read the <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and{' '}
        <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
    </div>
  );
}
