import assert from 'node:assert/strict';
import test from 'node:test';
import { isNineBySixteenFlyer, selectHomeFlyer } from '../lib/homeFlyerSelection.mjs';

test('recognizes real 9:16 image dimensions, not a 5:6 portrait', () => {
  assert.equal(isNineBySixteenFlyer(1080, 1920), true);
  assert.equal(isNineBySixteenFlyer(720, 1280), true);
  assert.equal(isNineBySixteenFlyer(1500, 1800), false);
  assert.equal(isNineBySixteenFlyer(1500, 1500), false);
  assert.equal(isNineBySixteenFlyer(0, 1920), false);
});

test('prefers a later true 9:16 flyer over an earlier 5:6 variant with opaque URLs', () => {
  assert.deepEqual(selectHomeFlyer([
    { imageUrl: '/sha256/portrait-a.png', width: 1500, height: 1800 },
    { imageUrl: '/sha256/tall-b.png', width: 1080, height: 1920 },
  ]), { imageUrl: '/sha256/tall-b.png', frame: 'nine-sixteen' });
});

test('uses a 5:6 frame and its nearest source when a 9:16 flyer is unavailable', () => {
  assert.deepEqual(selectHomeFlyer([
    { imageUrl: '/sha256/square.png', width: 1500, height: 1500 },
    { imageUrl: '/sha256/portrait.png', width: 1500, height: 1800 },
  ]), { imageUrl: '/sha256/portrait.png', frame: 'five-six' });
});

test('keeps the fallback contained in 5:6 even if the only image is square', () => {
  assert.deepEqual(selectHomeFlyer([
    { imageUrl: '/sha256/square.png', width: 1200, height: 1200 },
  ]), { imageUrl: '/sha256/square.png', frame: 'five-six' });
});

test('ignores broken dimensions and returns null when no image loads', () => {
  assert.deepEqual(selectHomeFlyer([
    { imageUrl: '/broken.png', width: 0, height: 0 },
  ]), null);
});
