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
        <span className="booking-sms-consent-copy">
          <strong>Text me my reservation details and reminders</strong>
          <small>Katy Vibes will text you booking confirmations, reminders and updates. Optional. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help.</small>
        </span>
      </label>
      <p>Read the <a href="/terms" target="_blank" rel="noreferrer">Terms</a> and{' '}
        <a href="/privacy" target="_blank" rel="noreferrer">Privacy Policy</a>.</p>
    </div>
  );
}
