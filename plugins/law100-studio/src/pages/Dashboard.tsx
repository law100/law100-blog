import { useEffect, useState } from 'react';
import { api } from '../api';
import { StudioLink } from '../router';
import type { DashboardData } from '../types';
import { Icon } from '../components/Icon';
import { Empty, ErrorState, Loading } from '../components/States';

const statusText: Record<string, string> = { publish: '已发布', draft: '草稿', pending: '待审核', future: '已定时', private: '私密' };

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');
  const load = () => { setError(''); api<DashboardData>('/law100-studio/v1/dashboard').then(setData).catch((reason) => setError(reason.message)); };
  useEffect(load, []);
  if (error) return <Page><ErrorState message={error} retry={load}/></Page>;
  if (!data) return <Page><Loading/></Page>;
  const today = new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }).format(new Date());
  return <Page>
    <header className="page-hero dashboard-hero"><div><p className="page-date">{today}</p><h1>law100 内容工作台</h1><p>从最近留下的地方继续。</p></div><StudioLink to="/posts/new" className="button-primary"><Icon name="write"/>写文章</StudioLink></header>
    <div className="count-line" aria-label="内容统计"><span><strong>{data.counts.posts}</strong> 篇文章</span><i/><span><strong>{data.counts.drafts}</strong> 份草稿</span><i/><span><strong>{data.counts.pages}</strong> 个页面</span><i/><span><strong>{data.counts.pendingComments}</strong> 条待审</span></div>
    <section className="manuscript-section"><div className="section-heading"><div><p>最近写下的</p><h2>继续编辑</h2></div><StudioLink to="/posts">全部文章 <Icon name="chevron"/></StudioLink></div>
      {data.recent.length ? <div className="manuscript-track">{data.recent.map((item) => <StudioLink key={`${item.type}-${item.id}`} to={`/${item.type === 'page' ? 'pages' : 'posts'}/${item.id}`} className="track-row"><time>{formatDate(item.modified)}</time><span className={`track-mark status-${item.status}`} aria-hidden="true"/><span className="track-title">{item.title}</span><small>{item.type === 'page' ? '页面' : statusText[item.status] || item.status}</small><Icon name="chevron"/></StudioLink>)}</div> : <Empty title="还没有文稿" copy="写下第一篇文章，最近编辑会出现在这里。" action={<StudioLink to="/posts/new" className="button-secondary">写文章</StudioLink>}/>}</section>
    <section className="manuscript-section compact-section"><div className="section-heading"><div><p>需要处理的</p><h2>评论</h2></div><StudioLink to="/comments">全部评论 <Icon name="chevron"/></StudioLink></div>
      {data.pendingComments.length ? <div className="comment-preview-list">{data.pendingComments.map((comment) => <article key={comment.id}><div><strong>{comment.author}</strong><small>在《{comment.postTitle}》</small></div><p>{comment.content}</p><StudioLink to="/comments">处理</StudioLink></article>)}</div> : <p className="quiet-message">目前没有待审核评论。</p>}
    </section>
    <footer className="system-strip"><span>WordPress {data.system.wordpress}</span><span>{data.system.theme}</span><span>{data.system.updates ? `${data.system.updates} 项更新` : '已是最新'}</span><span className={data.system.https ? 'status-ok' : 'status-warn'}>{data.system.https ? 'HTTPS 正常' : 'HTTPS 需要检查'}</span><StudioLink to="/system">查看状态</StudioLink></footer>
  </Page>;
}

function Page({ children }: { children: React.ReactNode }) { return <div className="studio-page dashboard-page">{children}</div>; }
function formatDate(value: string) { return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit' }).format(new Date(value)); }
