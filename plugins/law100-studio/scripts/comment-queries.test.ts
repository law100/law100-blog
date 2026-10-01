import { test } from 'node:test';
import assert from 'node:assert/strict';
import { commentFilters, commentQuery, commentsPerPage } from '../src/pages/commentQueries.ts';

test('each tab queries WordPress directly with its actual status', () => {
  const expected = ['all', 'hold', 'approve', 'spam', 'trash'];
  commentFilters.forEach((filter, i) => {
    const params = new URLSearchParams(commentQuery(filter).split('?')[1]);
    assert.equal(params.get('status'), expected[i]);
    assert.equal(params.get('context'), 'edit');
    assert.equal(params.get('per_page'), String(commentsPerPage));
  });
});

test('pagination and count queries retain the selected status', () => {
  const params = new URLSearchParams(commentQuery('spam', 6).split('?')[1]);
  assert.equal(params.get('page'), '6');
  assert.equal(params.get('status'), 'spam');
  assert.match(commentQuery('trash', 1, 1), /status=trash&per_page=1&page=1/);
});
