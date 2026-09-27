import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialReplyState, replyReducer, type ReplyState } from '../src/pages/replyDrafts.ts';
import type { WpComment } from '../src/types.ts';

const a = { id: 1, post: 25, author_name: 'A' } as WpComment;
const b = { id: 2, post: 28, author_name: 'B' } as WpComment;
function draftA(): ReplyState {
  return replyReducer(replyReducer(initialReplyState, { type: 'open', comment: a }), { type: 'edit', id: a.id, text: 'A 草稿' });
}

test('closing and reopening retains only the selected comment draft', () => {
  let state = replyReducer(draftA(), { type: 'close' });
  assert.equal(state.comment, null);
  state = replyReducer(state, { type: 'open', comment: b });
  assert.equal(state.drafts[b.id], undefined);
  state = replyReducer(state, { type: 'edit', id: b.id, text: 'B 草稿' });
  state = replyReducer(state, { type: 'open', comment: a });
  assert.equal(state.drafts[a.id].text, 'A 草稿');
  assert.equal(state.drafts[b.id].text, 'B 草稿');
  assert.deepEqual(initialReplyState, { comment: null, drafts: {} });
});

test('sent reply clears its own unchanged draft and closes only its dialog', () => {
  let state = replyReducer(draftA(), { type: 'sending', id: a.id, revision: 1 });
  state = replyReducer(state, { type: 'sent', id: a.id, revision: 1 });
  assert.equal(state.comment, null);
  assert.equal(state.drafts[a.id], undefined);
});

test('old response cannot close another comment or clear its draft', () => {
  let state = replyReducer(draftA(), { type: 'sending', id: a.id, revision: 1 });
  state = replyReducer(state, { type: 'open', comment: b });
  state = replyReducer(state, { type: 'edit', id: b.id, text: 'B 新回复' });
  state = replyReducer(state, { type: 'sent', id: a.id, revision: 1 });
  assert.equal(state.comment?.id, b.id);
  assert.equal(state.drafts[b.id].text, 'B 新回复');
  assert.equal(state.drafts[a.id], undefined);
});

test('later edits survive a sent response, even after editing back to the same text', () => {
  let state = replyReducer(draftA(), { type: 'sending', id: a.id, revision: 1 });
  state = replyReducer(state, { type: 'edit', id: a.id, text: '新的文字' });
  state = replyReducer(state, { type: 'edit', id: a.id, text: 'A 草稿' });
  state = replyReducer(state, { type: 'sent', id: a.id, revision: 1 });
  assert.equal(state.comment?.id, a.id);
  assert.equal(state.drafts[a.id].text, 'A 草稿');
  assert.equal(state.drafts[a.id].revision, 3);
  assert.equal(state.drafts[a.id].sending, undefined);
});

test('failed response preserves text and scopes the error to its comment', () => {
  let state = replyReducer(draftA(), { type: 'sending', id: a.id, revision: 1 });
  state = replyReducer(state, { type: 'open', comment: b });
  state = replyReducer(state, { type: 'failed', id: a.id, revision: 1, message: '模拟失败' });
  assert.equal(state.comment?.id, b.id);
  assert.equal(state.drafts[a.id].text, 'A 草稿');
  assert.equal(state.drafts[a.id].error, '模拟失败');
  state = replyReducer(state, { type: 'edit', id: a.id, text: '继续修改' });
  assert.equal(state.drafts[a.id].error, undefined);
});

test('pending send and stale completion cannot overwrite the current request', () => {
  const pending = replyReducer(draftA(), { type: 'sending', id: a.id, revision: 1 });
  assert.equal(replyReducer(pending, { type: 'sending', id: a.id, revision: 1 }), pending);
  assert.equal(replyReducer(pending, { type: 'sent', id: a.id, revision: 2 }), pending);
  assert.equal(replyReducer(initialReplyState, { type: 'sent', id: a.id, revision: 1 }), initialReplyState);
});
