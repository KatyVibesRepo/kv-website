import styles from './LaunchFeedbackBanner.module.css';

// Temporary post-launch feedback notice. Remove after site verification is complete.
export function LaunchFeedbackBanner() {
  return (
    <aside className={styles.notice} aria-label="Website update notice">
      <span aria-hidden="true">☀️ </span>
      <strong>We&apos;re fine-tuning our new website!</strong>{' '}
      You may notice a few hiccups along the way. If something doesn&apos;t look or work quite right,
      please let us know at{' '}
      <a href="mailto:jibran@katyvibes.com?subject=Katy%20Vibes%20Website%20Feedback">
        jibran@katyvibes.com
      </a>
      .
    </aside>
  );
}
