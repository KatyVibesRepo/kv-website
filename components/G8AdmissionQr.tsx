'use client';

import { useEffect, useMemo, useState } from 'react';
import { g8CustomerQr, type G8CustomerQr } from '@/lib/g8PreviewClient';
import { qrcodegen } from '@/lib/vendor/qrcodegen';

type Props = {
  reservationRef: string;
  customerAccessToken: string;
  guestCount: number;
  enabled: boolean;
};

function AdmissionQrSymbol({ scanValue }: { scanValue: string }) {
  const matrix = useMemo(() => {
    // This encodes ONLY KVRS's separate admission credential, never the
    // durable customer-access token, Stripe URL, or reservation reference.
    const qr = qrcodegen.QrCode.encodeText(scanValue, qrcodegen.QrCode.Ecc.MEDIUM);
    const quietZone = 4;
    const pixels = qr.size + quietZone * 2;
    const darkModules: string[] = [];
    for (let y = 0; y < qr.size; y += 1) {
      for (let x = 0; x < qr.size; x += 1) {
        if (qr.getModule(x, y)) {
          darkModules.push(`M${x + quietZone} ${y + quietZone}h1v1h-1z`);
        }
      }
    }
    return { pixels, path: darkModules.join('') };
  }, [scanValue]);

  return (
    <svg
      className="g8-admission-qr-symbol"
      viewBox={`0 0 ${matrix.pixels} ${matrix.pixels}`}
      role="img"
      aria-label="Katy Vibes group admission QR code for authorized staff scanning"
      shapeRendering="crispEdges"
      focusable="false"
    >
      <rect width={matrix.pixels} height={matrix.pixels} fill="#ffffff" />
      <path d={matrix.path} fill="#000000" />
    </svg>
  );
}

export function G8AdmissionQr({
  reservationRef, customerAccessToken, guestCount, enabled,
}: Props) {
  const [retry, setRetry] = useState(0);
  const [qr, setQr] = useState<G8CustomerQr | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setQr(null);
    setLoading(true);
    setError(false);

    if (!enabled || !customerAccessToken) {
      setLoading(false);
      return () => { active = false; };
    }

    void g8CustomerQr(reservationRef, customerAccessToken, guestCount)
      .then((result) => {
        if (active) setQr(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [reservationRef, customerAccessToken, guestCount, enabled, retry]);

  if (!enabled) return null;

  return (
    <article className="card stack g8-admission-qr-card" aria-label="Your admission QR">
      <div className="eyebrow">Group admission</div>
      <h2>Your entry QR code</h2>
      {loading && <p role="status">Preparing your secure admission QR…</p>}
      {!loading && qr && (
        <div className="g8-admission-qr-display">
          <div className="g8-admission-qr-paper">
            <AdmissionQrSymbol scanValue={qr.scanValue} />
          </div>
          <p className="g8-admission-qr-instruction">
            Show this QR to Katy Vibes staff when you arrive.
          </p>
          <p className="g8-admission-qr-terms">
            <strong>Admission subject to verified payment and staff check-in.</strong>
          </p>
          <p className="muted">
            This QR identifies your group of {qr.guestCount}.
            Each guest must have a verified paid admission or authorized payment at the door.
            A QR scan alone does not confirm entry.
          </p>
        </div>
      )}
      {!loading && (!qr || error) && (
        <div className="stack g8-admission-qr-unavailable">
          <p role="alert">
            Your admission QR is not available right now.
            Please retry or call <a href="tel:18324372807">(832) 437-2807</a> for assistance.
          </p>
          <button
            type="button"
            className="button ghost"
            onClick={() => setRetry((count) => count + 1)}
          >
            Retry Admission QR
          </button>
        </div>
      )}
    </article>
  );
}
