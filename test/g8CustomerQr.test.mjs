import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const [api, admission, reservation, vendor, styles, packageJson, config] = await Promise.all([
  'lib/g8PreviewClient.ts',
  'components/G8AdmissionQr.tsx',
  'components/G8ReservationPage.tsx',
  'lib/vendor/qrcodegen.ts',
  'app/styles.css',
  'package.json',
  'next.config.mjs',
].map(read));

test('customer QR uses only authenticated staging public endpoint, never access token in QR', () => {
  assert.match(api, /\/api\/public\/m1\/reservations\/\$\{ref\}\/qr/);
  assert.match(api, /method: 'POST', bearer/);
  assert.match(api, /customerTokenPattern = \/\^kvrs_ra1_/);
  assert.match(api, /groupScanPattern = \/\^kvrs_m1_/);
  assert.match(api, /result\.contract !== 'kvrs\.m1\.customer-group-qr\.v1'/);
  assert.match(api, /result\.publicReservationRef !== ref/);
  assert.match(api, /!validG8ScanValue\(result\.scanValue\)/);
  assert.match(api, /result\.guestCount !== expectedGuestCount/);
  assert.match(api, /result\.admissionConfirmed !== false/);
  assert.match(api, /result\.requiresAuthorizedHostCheckIn !== true/);
  assert.match(admission, /encodeText\(scanValue, qrcodegen\.QrCode\.Ecc\.MEDIUM\)/);
  assert.match(admission, /<AdmissionQrSymbol scanValue=\{qr\.scanValue\}/);
  assert.doesNotMatch(admission, /encodeText\(customerAccessToken|encodeText\(reservationRef|https:\/\/api\.qrserver|chart\.googleapis/);
  assert.doesNotMatch(api, /NEXT_PUBLIC_KVRS_BASE_URL|admin\.katyvibes\.com/);
});

test('private admission QR has high contrast, quiet zone, and clear staff/payment warning', () => {
  assert.match(admission, /const quietZone = 4/);
  assert.match(admission, /fill="#ffffff"/);
  assert.match(admission, /fill="#000000"/);
  assert.match(admission, /shapeRendering="crispEdges"/);
  assert.match(admission, /Admission subject to verified payment and staff check-in/);
  assert.match(admission, /A QR scan alone does not confirm entry/);
  assert.match(admission, /Retry Admission QR/);
  assert.match(styles, /\.g8-admission-qr-paper\s*\{/);
  assert.match(styles, /width: min\(100%, 350px\)/);
  assert.match(styles, /aspect-ratio: 1 \/ 1/);
  assert.match(config, /source: '\/g8\/:path\*'/);
  assert.match(config, /no-referrer/);
  assert.match(config, /no-store/);
});

test('original or recovered access and Stripe return load the same authenticated QR', () => {
  assert.match(reservation, /<G8AdmissionQr/);
  assert.match(reservation, /customerAccessToken=\{accessToken\}/);
  assert.match(reservation, /reservationRef=\{reservationRef\}/);
  assert.match(reservation, /guestCount=\{status\.guestCount\}/);
  assert.match(reservation, /enabled=\{Boolean\(accessToken\)\}/);
  assert.match(admission, /useEffect\(\(\) => \{/);
  assert.match(admission, /setQr\(null\)/);
  assert.match(admission, /g8CustomerQr\(reservationRef, customerAccessToken, guestCount\)/);
  assert.match(admission, /return \(\) => \{ active = false; \}/);
  assert.match(reservation, /takeCheckoutReturn\(\)/);
  assert.match(reservation, /history\.replaceState/);
  assert.doesNotMatch(admission, /localStorage|sessionStorage|document\.cookie|console\.log|dangerouslySetInnerHTML/);
});

test('bundled QR encoder is MIT-licensed, self-contained, and encodes expected module structure', () => {
  assert.match(vendor, /MIT License/);
  assert.match(vendor, /Copyright \(c\) Project Nayuki/);
  assert.match(vendor, /export \{ qrcodegen \}/);
  assert.doesNotMatch(vendor, /fetch\(|XMLHttpRequest|document\.cookie|localStorage/);
  const output = ts.transpileModule(vendor, { compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2020,
  } }).outputText;
  const module = { exports: {} };
  // Only the reviewed vendored source is evaluated; no user input or secrets.
  new Function('module', 'exports', output)(module, module.exports);
  const { qrcodegen } = module.exports;
  const sample = 'kvrs_m1_' + 'A'.repeat(43);
  const qr = qrcodegen.QrCode.encodeText(sample, qrcodegen.QrCode.Ecc.MEDIUM);
  assert.equal(qr.getModule(0, 0), true);
  assert.equal(qr.getModule(6, 0), true);
  assert.equal(qr.getModule(0, 6), true);
  // Finder separators are white; the finder center itself is black.
  assert.equal(qr.getModule(1, 1), false);
  assert.equal(qr.getModule(3, 3), true);
  assert.ok(qr.size >= 21 && qr.size <= 177);
  assert.ok(qr.getModule(0, qr.size - 1));
  assert.ok(qr.getModule(qr.size - 1, 0));
  assert.equal(JSON.parse(packageJson).dependencies['qrcode'], undefined);
});
