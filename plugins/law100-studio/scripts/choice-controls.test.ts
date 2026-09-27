import assert from 'node:assert/strict';
import test from 'node:test';
import { positionPopup } from '../src/components/popupPosition.ts';

test('popup opens below when enough room exists', () => {
  const result = positionPopup({ top: 100, right: 260, bottom: 144, left: 120, width: 140, height: 44 }, { width: 180, height: 220 }, 1000, 800);
  assert.equal(result.placement, 'bottom');
  assert.equal(result.top, 152);
  assert.equal(result.left, 120);
});

test('popup flips above and stays inside the viewport', () => {
  const result = positionPopup({ top: 700, right: 990, bottom: 744, left: 850, width: 140, height: 44 }, { width: 240, height: 240 }, 1000, 780);
  assert.equal(result.placement, 'top');
  assert.equal(result.left, 748);
  assert.equal(result.top, 452);
  assert.ok(result.maxHeight <= 360);
});
