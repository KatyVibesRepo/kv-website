'use client';

import { FormEvent, useMemo, useState } from 'react';

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

function stringValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

export function JobApplicationForm() {
  const [status, setStatus] = useState<SubmissionState>('idle');
  const [message, setMessage] = useState('');

  const isSubmitting = status === 'submitting';

  const statusClassName = useMemo(() => {
    if (status === 'success') return 'job-application-alert success';
    if (status === 'error') return 'job-application-alert error';
    return 'job-application-alert';
  }, [status]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      applicantName: stringValue(formData, 'applicantName'),
      applicantEmail: stringValue(formData, 'applicantEmail'),
      applicantPhone: stringValue(formData, 'applicantPhone'),
      desiredPosition: stringValue(formData, 'desiredPosition'),
      experienceLevel: stringValue(formData, 'experienceLevel'),
      availability: stringValue(formData, 'availability'),
      preferredStartDate: stringValue(formData, 'preferredStartDate'),
      isOver18: formData.get('isOver18') === 'on',
      hasFoodHandlerCard: formData.get('hasFoodHandlerCard') === 'on',
      hasTabcCertification: formData.get('hasTabcCertification') === 'on',
      previousRestaurantExperience: stringValue(formData, 'previousRestaurantExperience'),
      message: stringValue(formData, 'message'),
    };

    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/jobs/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.error || 'We could not submit your application. Please try again.');
      }

      setStatus('success');
      setMessage('Thanks for applying. We received your application and our team will review it.');
      form.reset();
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'We could not submit your application. Please try again.');
    }
  }

  return (
    <form className="job-application-form" onSubmit={handleSubmit}>
      {message ? (
        <div className={statusClassName} role="status" aria-live="polite">
          {message}
        </div>
      ) : null}

      <fieldset>
        <legend>About You</legend>
        <div className="job-form-grid">
          <label>
            <span>Full name *</span>
            <input name="applicantName" type="text" autoComplete="name" required placeholder="Your full name" />
          </label>

          <label>
            <span>Email *</span>
            <input name="applicantEmail" type="email" autoComplete="email" required placeholder="you@example.com" />
          </label>

          <label>
            <span>Phone *</span>
            <input name="applicantPhone" type="tel" autoComplete="tel" required placeholder="Best phone number" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Position</legend>
        <div className="job-form-grid">
          <label>
            <span>Position interested in *</span>
            <select name="desiredPosition" required defaultValue="">
              <option value="" disabled>Select a position</option>
              <option>Server</option>
              <option>Bartender</option>
              <option>Host / Hostess</option>
              <option>Busser / Runner</option>
              <option>Line Cook</option>
              <option>Prep Cook</option>
              <option>Dishwasher</option>
              <option>Event Support</option>
              <option>DJ / Entertainment Support</option>
              <option>Manager / Shift Lead</option>
              <option>Open to Any Role</option>
            </select>
          </label>

          <label>
            <span>Experience level</span>
            <select name="experienceLevel" defaultValue="">
              <option value="">Select experience level</option>
              <option>No restaurant experience yet</option>
              <option>Less than 1 year</option>
              <option>1–2 years</option>
              <option>3–5 years</option>
              <option>5+ years</option>
            </select>
          </label>
        </div>

        <label>
          <span>Previous restaurant, bar, kitchen, or hospitality experience</span>
          <textarea
            name="previousRestaurantExperience"
            rows={4}
            placeholder="Tell us where you worked, what you did, and any skills we should know about."
          />
        </label>
      </fieldset>

      <fieldset>
        <legend>Availability</legend>
        <div className="job-form-grid">
          <label>
            <span>Availability *</span>
            <textarea
              name="availability"
              rows={4}
              required
              placeholder="Example: weekdays after 5 PM, weekends open, Sunday unavailable, etc."
            />
          </label>

          <label>
            <span>Preferred start date</span>
            <input name="preferredStartDate" type="date" />
          </label>
        </div>

        <div className="job-check-grid" aria-label="Applicant certifications and eligibility">
          <label className="job-check-card">
            <input name="isOver18" type="checkbox" />
            <span>I am 18 or older</span>
          </label>

          <label className="job-check-card">
            <input name="hasFoodHandlerCard" type="checkbox" />
            <span>I have a food handler card</span>
          </label>

          <label className="job-check-card">
            <input name="hasTabcCertification" type="checkbox" />
            <span>I have TABC certification</span>
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Tell Us More</legend>
        <label>
          <span>Why do you want to work at Katy Vibes?</span>
          <textarea
            name="message"
            rows={5}
            placeholder="Tell us about your work style, energy, goals, or anything else that helps us get to know you."
          />
        </label>
      </fieldset>

      <button className="button hot job-submit-button" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting Application…' : 'Submit Application'}
      </button>
    </form>
  );
}
