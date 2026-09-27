import { useEffect, useMemo, useState } from 'react';
import { api } from '../api';
import { Icon } from '../components/Icon';
import { Confirm } from '../components/Dialog';
import { PopupSelect, type ChoiceOption } from '../components/ChoiceControls';
import { Empty, ErrorState, Loading } from '../components/States';
import { StudioLink } from '../router';
import type { WpPost, WpTerm } from '../types';

const statusText: Record<string, string> = { publish: '已发布', draft: '草稿', pending: '待审核', future: '已定时', private: '私密', trash: '回收站' };
const statusOptions: ChoiceOption[] = [{ value: 'all', label: '全部状态' }, { value: 'publish', label: '已发布' }, { value: 'draft', label: '草稿' }, { value: 'future', label: '已定时' }, { value: 'private', label: '私密' }, { value: 'trash', label: '回收站' }];

export function Documents({ type }: { type: 'post' | 'page' }) {
  const [items, setItems] = useState<WpPost[]>([]);
  const [categories, setCategories] = useState<WpTerm[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] = useState('all');
  const [selected, setSelected] = useState<number[]>([]);
  const [removing, setRemoving] = useState<WpPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const noun = type === 'post' ? '文章' : '页面';
  const endpoint = type === 'post' ? 'posts' : 'pages';
  const load = () => {
    setLoading(true); setError('');
    const statuses = 'publish,draft,pending,private,future,trash';
    Promise.all([
      api<WpPost[]>(`/wp/v2/${endpoint}?context=edit&per_page=100&status=${statuses}&orderby=modified&order=desc`),
      type === 'post' ? api<WpTerm[]>('/wp/v2/categories?per_page=100&hide_empty=false') : Promise.resolve([]),
    ]).then(([documents, terms]) => { setItems(documents); setCategories(terms); }).catch((reason) => setError(reason.message)).finally(() => setLoading(false));
  };
  useEffect(load, [type]);

  const filtered = useMemo(() => items.filter((item) => {
    const title = plain(item.title.raw || item.title.rendered).toLowerCase();
    return (!query || title.includes(query.toLowerCase())) && (status === 'all' || item.status === status) && (category === 'all' || item.categories?.includes(Number(category)));
  }), [items, query, status, category]);

  const remove = async () => {
    if (!removing) return;
    await api(`/wp/v2/${endpoint}/${removing.id}?force=${removing.status === 'trash' ? 'true' : 'false'}`, { method: 'DELETE' });
    setRemoving(null); setSelected((value) => value.filter((id) => id !== removing.id)); load();
  };

  const bulkTrash = async () => {
    await Promise.all(selected.map((id) => api(`/wp/v2/${endpoint}/${id}?force=false`, { method: 'DELETE' })));
    setSelected([]); load();
  };

  return <div className="studio-page list-page">
    <header className="page-hero list-hero"><div><p className="page-kicker">内容</p><h1>{noun}</h1><p>{type === 'post' ? '写作、整理和发布，都从同一处开始。' : '管理博客里的固定内容与功能入口。'}</p></div><StudioLink to={`/${endpoint}/new`} className="button-primary"><Icon name="plus"/>新建{noun}</StudioLink></header>
    <div className="list-tools"><label className="search-control"><Icon name="search"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`搜索${noun}`} aria-label={`搜索${noun}`}/></label><PopupSelect value={status} options={statusOptions} label="按状态筛选" onChange={setStatus}/>{type === 'post' && <PopupSelect value={category} options={[{ value: 'all', label: '全部分类' }, ...categories.map((term) => ({ value: String(term.id), label: term.name }))]} label="按分类筛选" onChange={setCategory}/>}<span className="list-count">{filtered.length} 项</span></div>
    {selected.length > 0 && <div className="selection-bar"><span>已选择 {selected.length} 项</span><button className="text-danger" onClick={bulkTrash}><Icon name="trash"/>移入回收站</button><button onClick={() => setSelected([])}>取消选择</button></div>}
    {loading ? <Loading/> : error ? <ErrorState message={error} retry={load}/> : filtered.length ? <div className="document-list" role="list">
      <div className="document-head" aria-hidden="true"><span></span><span>标题</span><span>状态</span><span>{type === 'post' ? '分类' : '类型'}</span><span>最近修改</span><span></span></div>
      {filtered.map((item) => { const feature = type === 'page' && ['articles','drive','changelog'].includes(item.slug); return <article key={item.id} className="document-row">
        <label className="row-check"><input type="checkbox" checked={selected.includes(item.id)} onChange={(event) => setSelected((value) => event.target.checked ? [...value, item.id] : value.filter((id) => id !== item.id))}/><span className="sr-only">选择 {plain(item.title.raw || item.title.rendered)}</span></label>
        <div className="document-title"><StudioLink to={`/${endpoint}/${item.id}`}>{plain(item.title.raw || item.title.rendered) || '无标题'}</StudioLink><a href={item.link} target="_blank" rel="noreferrer" aria-label="在博客中查看"><Icon name="external"/></a></div>
        <span className={`status-label status-${item.status}`}>{statusText[item.status] || item.status}</span>
        <span className="document-meta">{feature ? '功能页' : type === 'page' ? '内容页' : categoryNames(item.categories || [], categories)}</span>
        <time>{formatDate(item.modified)}</time>
        <button className="icon-button row-remove" onClick={() => setRemoving(item)} aria-label={item.status === 'trash' ? '永久删除' : '移入回收站'}><Icon name="trash"/></button>
      </article>; })}
    </div> : <Empty title={`没有符合条件的${noun}`} copy="调整筛选条件，或新建一项。"/>}
    {removing && <Confirm title={removing.status === 'trash' ? '永久删除' : '移入回收站'} message={removing.status === 'trash' ? `“${plain(removing.title.raw || removing.title.rendered) || '无标题'}”将无法恢复。` : `“${plain(removing.title.raw || removing.title.rendered) || '无标题'}”会进入 WordPress 回收站。`} confirmLabel={removing.status === 'trash' ? '永久删除' : '移入回收站'} danger onConfirm={remove} onClose={() => setRemoving(null)}/>}
  </div>;
}

function plain(value: string) { const div = document.createElement('div'); div.innerHTML = value; return div.textContent || ''; }
function formatDate(value: string) { return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value)); }
function categoryNames(ids: number[], terms: WpTerm[]) { const names = terms.filter((term) => ids.includes(term.id)).map((term) => term.name); return names.join('、') || '未分类'; }
