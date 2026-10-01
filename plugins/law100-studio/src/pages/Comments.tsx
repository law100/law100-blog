import { useCallback, useEffect, useRef, useReducer, useState } from 'react';
import { api, apiResponse, json } from '../api';
import { Confirm, Dialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { Empty, ErrorState, Loading } from '../components/States';
import type { WpComment, WpPost } from '../types';
import { initialReplyState, replyReducer } from './replyDrafts';
import { commentFilters, commentQuery, commentsPerPage, type CommentFilter } from './commentQueries';

const statusText: Record<string, string> = { approved: '已批准', hold: '待审核', spam: '垃圾评论', trash: '回收站' };

export function Comments() {
  const [comments, setComments] = useState<WpComment[]>([]);
  const [posts, setPosts] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<CommentFilter>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const requestVersion = useRef(0);
  const [detail, setDetail] = useState<WpComment | null>(null);
  const [replies, dispatchReply] = useReducer(replyReducer, initialReplyState);
  const reply = replies.comment;
  const replyDraft = reply ? replies.drafts[reply.id] : undefined;
  const replyText = replyDraft?.text || '';
  const closeReply = () => dispatchReply({ type: 'close' });
  const [removing, setRemoving] = useState<WpComment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    const version = ++requestVersion.current;
    setLoading(true); setError('');
    Promise.all(commentFilters.map(async (value) => {
      const result = await apiResponse<WpComment[]>(commentQuery(value, 1, 1), { method: 'HEAD' });
      return [value, result.total] as const;
    })).then(async (entries) => {
      if (version !== requestVersion.current) return;
      const nextCounts = Object.fromEntries(entries);
      setCounts(nextCounts);
      const lastPage = Math.max(1, Math.ceil(nextCounts[filter] / commentsPerPage));
      if (page > lastPage) { setPage(lastPage); return; }
      const result = await apiResponse<WpComment[]>(commentQuery(filter, page));
      const postIds = [...new Set(result.data.map((comment) => comment.post))];
      const postList = await Promise.all(postIds.map((id) => api<WpPost>(`/wp/v2/posts/${id}?context=edit`).catch(() => null)));
      if (version !== requestVersion.current) return;
      setComments(result.data); setTotalPages(result.totalPages);
      setPosts(Object.fromEntries(postList.filter((post): post is WpPost => post !== null).map((post) => [post.id, plain(post.title.raw || post.title.rendered)])));
    }).catch((reason) => { if (version === requestVersion.current) setError(reason.message); })
      .finally(() => { if (version === requestVersion.current) setLoading(false); });
  }, [filter, page]);
  useEffect(() => { load(); return () => { requestVersion.current++; }; }, [load]);
  const filtered = comments;
  const update = async (comment: WpComment, status: string) => { await api(`/wp/v2/comments/${comment.id}`, { method: 'POST', ...json({ status }) }); load(); };
  const submitReply = async () => {
    if (!reply || !replyDraft || !replyText.trim() || replyDraft.sending !== undefined) return;
    const { id, post } = reply;
    const { revision, text } = replyDraft;
    dispatchReply({ type: 'sending', id, revision });
    try {
      await api('/wp/v2/comments', { method: 'POST', ...json({ post, parent: id, content: text }) });
      dispatchReply({ type: 'sent', id, revision });
      load();
    } catch (reason) {
      dispatchReply({ type: 'failed', id, revision, message: reason instanceof Error ? reason.message : '发布失败，回复草稿已保留。' });
    }
  };
  const remove = async () => { if (!removing) return; await api(`/wp/v2/comments/${removing.id}?force=${removing.status === 'trash' ? 'true' : 'false'}`, { method: 'DELETE' }); setRemoving(null); load(); };
  return <div className="studio-page comments-page">
    <header className="page-hero list-hero"><div><p className="page-kicker">交流</p><h1>评论</h1><p>先看清对方说了什么，再决定如何回应。</p></div></header>
    <div className="filter-tabs" role="tablist">{commentFilters.map((value) => <button key={value} role="tab" aria-selected={filter === value} className={filter === value ? 'is-active' : ''} onClick={() => { setFilter(value); setPage(1); }}>{value === 'all' ? '全部' : statusText[value]}<span>{counts[value] ?? '—'}</span></button>)}</div>
    {loading ? <Loading/> : error ? <ErrorState message={error} retry={load}/> : filtered.length ? <div className="comment-queue">{filtered.map((comment) => <article key={comment.id} className="comment-item">
      <header><div className="comment-avatar" aria-hidden="true">{comment.author_name.slice(0,1).toUpperCase()}</div><div><strong>{comment.author_name || '匿名访客'}</strong><span>在《{posts[comment.post] || '文章'}》</span></div><time>{formatDate(comment.date)}</time><span className={`status-label status-${comment.status}`}>{statusText[comment.status]}</span></header>
      <div className="comment-content" dangerouslySetInnerHTML={{ __html: comment.content.rendered }}/>
      <footer>{comment.status !== 'approved' && comment.status !== 'trash' && <button onClick={() => update(comment, 'approved')}><Icon name="check"/>批准</button>}{comment.status === 'approved' && <button onClick={() => update(comment, 'hold')}>取消批准</button>}<button onClick={() => dispatchReply({ type: 'open', comment })}>回复</button><button onClick={() => setDetail(comment)}>详细信息</button>{comment.status !== 'spam' && comment.status !== 'trash' && <button onClick={() => update(comment, 'spam')}>标为垃圾</button>}<button className="text-danger" onClick={() => setRemoving(comment)}>{comment.status === 'trash' ? '永久删除' : '移入回收站'}</button></footer>
    </article>)}</div> : <Empty title="这里没有评论" copy={filter === 'hold' ? '目前没有需要审核的内容。' : '切换其他状态查看评论。'}/>}
    {!loading && !error && totalPages > 1 && <nav className="comment-pagination" aria-label="评论分页"><button className="button-secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>上一页</button><span>第 {page} / {totalPages} 页 · 共 {counts[filter] ?? 0} 条</span><button className="button-secondary" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>下一页</button></nav>}
    {detail && <Dialog title="评论详细信息" onClose={() => setDetail(null)}><dl className="detail-list"><div><dt>评论者</dt><dd>{detail.author_name}</dd></div><div><dt>邮箱</dt><dd>{detail.author_email || '未提供'}</dd></div><div><dt>IP</dt><dd>{detail.author_ip || '未记录'}</dd></div><div><dt>浏览器</dt><dd>{detail.author_user_agent || '未记录'}</dd></div></dl></Dialog>}
    {reply && <Dialog title={`回复 ${reply.author_name}`} onClose={closeReply}><div className="dialog-form">{replyDraft?.error && <p className="inline-error" role="alert">{replyDraft.error}</p>}<label htmlFor="comment-reply">回应内容</label><textarea id="comment-reply" data-dialog-initial-focus value={replyText} onChange={(event) => dispatchReply({ type: 'edit', id: reply.id, text: event.target.value })} rows={6}/></div><footer className="dialog-actions"><button className="button-secondary" onClick={closeReply}>取消</button><button className="button-primary" disabled={!replyText.trim() || replyDraft?.sending !== undefined} onClick={submitReply}>{replyDraft?.sending !== undefined ? '正在发布…' : '发布回复'}</button></footer></Dialog>}
    {removing && <Confirm title={removing.status === 'trash' ? '永久删除评论' : '移入回收站'} message={removing.status === 'trash' ? '这条评论将无法恢复。' : '这条评论会进入回收站。'} confirmLabel={removing.status === 'trash' ? '永久删除' : '移入回收站'} danger onConfirm={remove} onClose={() => setRemoving(null)}/>}
  </div>;
}

function plain(value: string) { const div = document.createElement('div'); div.innerHTML = value; return div.textContent || ''; }
function formatDate(value: string) { return new Intl.DateTimeFormat('zh-CN', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }).format(new Date(value)); }
