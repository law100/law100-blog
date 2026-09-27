import { useEffect, useState } from 'react';
import { api, config } from '../api';
import { navigate } from '../router';
import { Icon } from './Icon';
import { Dialog } from './Dialog';

type SearchResult = { id: number; title: string; subtype: 'post' | 'page'; url: string };

export function CommandPalette({ onClose, onLogout }: { onClose: () => void; onLogout: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const timer = window.setTimeout(() => api<SearchResult[]>(`/wp/v2/search?search=${encodeURIComponent(query)}&per_page=8`).then(setResults).catch(() => setResults([])), 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  const go = (path: string) => { onClose(); navigate(path); };
  return <Dialog title="搜索与快捷操作" onClose={onClose} className="command-dialog">
    <div className="command-search"><Icon name="search"/><input data-dialog-initial-focus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索文章、页面或操作" aria-label="搜索" /></div>
    {!query && <div className="command-list" role="list">
      <button onClick={() => go('/posts/new')}><Icon name="write"/><span>写文章</span><kbd>N</kbd></button>
      <button onClick={() => window.open(config.homeUrl, '_blank', 'noopener')}><Icon name="external"/><span>查看博客</span></button>
      <button onClick={() => window.open(config.driveUrl, '_blank', 'noopener')}><Icon name="drive"/><span>打开 Drive</span></button>
      <button onClick={onLogout}><Icon name="logout"/><span>退出登录</span></button>
    </div>}
    {!!query && <div className="command-list" role="list">{results.length ? results.map((item) => <button key={`${item.subtype}-${item.id}`} onClick={() => go(`/${item.subtype === 'page' ? 'pages' : 'posts'}/${item.id}`)}><Icon name={item.subtype === 'page' ? 'page' : 'post'}/><span>{item.title || '无标题'}</span><small>{item.subtype === 'page' ? '页面' : '文章'}</small></button>) : <p className="command-empty">没有找到相关内容。</p>}</div>}
  </Dialog>;
}
