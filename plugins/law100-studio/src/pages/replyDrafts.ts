import type { WpComment } from '../types';

type ReplyDraft = { text: string; revision: number; sending?: number; error?: string };
export type ReplyState = { comment: WpComment | null; drafts: Record<number, ReplyDraft> };
type ReplyAction =
  | { type: 'open'; comment: WpComment }
  | { type: 'close' }
  | { type: 'edit'; id: number; text: string }
  | { type: 'sending' | 'sent'; id: number; revision: number }
  | { type: 'failed'; id: number; revision: number; message: string };

export const initialReplyState: ReplyState = { comment: null, drafts: {} };

// Page-local state only. Revisions distinguish later edits even when text matches again.
export function replyReducer(state: ReplyState, action: ReplyAction): ReplyState {
  if (action.type === 'open') return { ...state, comment: action.comment };
  if (action.type === 'close') return { ...state, comment: null };
  const draft = state.drafts[action.id];
  const drafts = { ...state.drafts };
  if (action.type === 'edit') {
    drafts[action.id] = { ...draft, text: action.text, revision: (draft?.revision || 0) + 1, error: undefined };
  } else if (action.type === 'sending') {
    if (!draft || draft.sending !== undefined || draft.revision !== action.revision) return state;
    drafts[action.id] = { ...draft, sending: action.revision, error: undefined };
  } else {
    if (!draft || draft.sending !== action.revision) return state;
    if (action.type === 'sent' && draft.revision === action.revision) {
      delete drafts[action.id];
      return { comment: state.comment?.id === action.id ? null : state.comment, drafts };
    }
    drafts[action.id] = { ...draft, sending: undefined, error: action.type === 'failed' ? action.message : undefined };
  }
  return { ...state, drafts };
}
