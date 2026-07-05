'use client';

import { FormEvent, useState } from 'react';

type Props = {
  title: string;
  submitLabel?: string;
  subjectHint: string;
};

export function InquiryForm({ title, submitLabel = 'Send Inquiry', subjectHint }: Props) {
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '');
    const phone = String(form.get('phone') ?? '');
    const email = String(form.get('email') ?? '');
    const details = String(form.get('details') ?? '');
    const subject = encodeURIComponent(`${subjectHint} - ${name || 'Katy Vibes Website Inquiry'}`);
    const body = encodeURIComponent(`Name: ${name}\nPhone: ${phone}\nEmail: ${email}\n\nDetails:\n${details}`);
    window.location.href = `mailto:info@katyvibes.com?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <article className="card stack reservation-card-wide">
      <div>
        <div className="eyebrow">Inquiry</div>
        <h3>{title}</h3>
        <p className="muted">Tell us what you’re planning and the best way to reach you. A Katy Vibes team member will review your request and follow up with details.</p>
      </div>
      <form className="reservation-form-grid" onSubmit={onSubmit}>
        <label>
          Name
          <input name="name" required placeholder="Your name" />
        </label>
        <label>
          Phone
          <input name="phone" required inputMode="tel" placeholder="(832) 437-2807" />
        </label>
        <label className="span-two">
          Email
          <input name="email" type="email" placeholder="guest@email.com" />
        </label>
        <label className="span-two">
          Details
          <textarea name="details" rows={5} required placeholder="Date, guest count, occasion, timing, menu requests, or anything we should know." />
        </label>
        {sent && <p className="available span-two">Your email app should open with your request ready to send.</p>}
        <button className="hot span-two">{submitLabel}</button>
      </form>
    </article>
  );
}
