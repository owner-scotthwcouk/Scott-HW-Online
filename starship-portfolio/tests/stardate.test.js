import test from 'node:test';
import assert from 'node:assert/strict';
import { currentStardate, sortByStardate } from '../src/portfolioData.js';

test('stardate follows the supplied local-date formula in common and leap years', () => {
  assert.equal(currentStardate(new Date(2000, 0, 1)), '2.73');
  assert.equal(currentStardate(new Date(2025, 0, 1)), '25002.74');
  assert.equal(currentStardate(new Date(2024, 0, 1, 12)), '24004.10');
});

test('numeric stardates sort newest first by default without changing stored order', () => {
  const items = ['9.9', '10.12', '', '10.2', '10.12'].map(stardate => ({ stardate }));
  const original = [...items];
  assert.deepEqual(sortByStardate(items).map(item => item.stardate), ['10.2', '10.12', '10.12', '9.9', '']);
  assert.deepEqual(sortByStardate(items, 'asc').map(item => item.stardate), ['9.9', '10.12', '10.12', '10.2', '']);
  assert.deepEqual(items, original);
});

test('existing quarter and range labels remain sortable', () => {
  const items = ['2025.Q1', '2024.08 - 2025.03', '2025.Q3'].map(stardate => ({ stardate }));
  assert.deepEqual(sortByStardate(items).map(item => item.stardate), ['2025.Q3', '2025.Q1', '2024.08 - 2025.03']);
});
