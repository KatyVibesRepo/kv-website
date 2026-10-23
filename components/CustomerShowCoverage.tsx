import type { CustomerExactCoverage, CustomerShowAdmission } from '@/lib/customerM1Client';
import styles from './CustomerReservations.module.css';

const date = (value: string) => new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago', dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value)) + ' Central';

export function CustomerShowCoverage({ scope, admissions }: {
  scope: CustomerExactCoverage; admissions?: CustomerShowAdmission[];
}) {
  return <article className="card stack">
    <h2>{scope.type === 'SHOWS' ? 'Shows included with your reservation' : 'Reservation details'}</h2>
    {scope.selection === 'ALL_LINKED_SHOWS' && <p>{scope.entries.length === 2 ? 'Includes both shows listed below.' : 'Includes all shows listed below.'}
      {' '}Your guest count and purchase total cover the complete selection.</p>}
    <p>Reservation starts: <strong>{date(scope.reservationStartsAt)}</strong>.</p>
    <p>New ticket sales close: <strong>{date(scope.salesCutoffAt)}</strong>.</p>
    {scope.entries.map(entry => {
      const admission = admissions?.find(bucket => bucket.entryScopeKey === entry.entryScopeKey);
      return <div className={styles.row} key={entry.entryScopeKey}>
        <div><strong>{date(entry.startsAt)}</strong><span>Ends {date(entry.endsAt)}</span></div>
        {admission && <div><span>Checked in by staff: {admission.admitted} of {admission.guestUnits} guests</span>
          <span>Covered guests awaiting this show&apos;s check-in: {admission.remainingCovered}</span></div>}
      </div>;
    })}
    {scope.departureRequiredBefore && <p className={styles.notice}>Please leave before <strong>{date(scope.departureRequiredBefore)}</strong>
      {' '}unless you hold a combo ticket or separately purchase an available ticket for the next show.</p>}
    {scope.type === 'SHOWS' && <p>Each show requires its own staff check-in. Payment and a previous show&apos;s check-in do not confirm arrival or seating for another show.</p>}
  </article>;
}
