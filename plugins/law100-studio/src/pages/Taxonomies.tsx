import { useEffect, useState } from 'react';
import { api, json } from '../api';
import { Confirm, Dialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { Empty, ErrorState, Loading } from '../components/States';
import type { WpTerm } from '../types';

export function Taxonomies() {
  const [kind, setKind] = useState<'categories' | 'tags'>('categories');
  const [terms, setTerms] = useState<WpTerm[]>([]);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<WpTerm | null>(null);
  const [removing, setRemoving] = useState<WpTerm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = () => { setLoading(true); setError(''); api<WpTerm[]>(`/wp/v2/${kind}?per_page=100&hide_empty=false`).then(setTerms).catch((reason) => setError(reason.message)).finally(() => setLoading(false)); };
  useEffect(load, [kind]);
  const save = async (name: string, description: string, id?: number) => { await api(`/wp/v2/${kind}${id ? `/${id}` : ''}`, { method: 'POST', ...json({ name, description }) }); setCreating(false); setEditing(null); load(); };
  const remove = async () => { if (!removing) return; await api(`/wp/v2/${kind}/${removing.id}?force=true`, { method: 'DELETE' }); setRemoving(null); load(); };
  return <div className="studio-page taxonomy-page"><header className="page-hero list-hero"><div><p className="page-kicker">整理</p><h1>分类与标签</h1><p>让文章更容易被找到，但不为整理而整理。</p></div><button className="button-primary" onClick={() => setCreating(true)}><Icon name="plus"/>新建{kind === 'categories' ? '分类' : '标签'}</button></header>
    <div className="filter-tabs taxonomy-tabs"><button className={kind === 'categories' ? 'is-active' : ''} onClick={() => setKind('categories')}>分类</button><button className={kind === 'tags' ? 'is-active' : ''} onClick={() => setKind('tags')}>标签</button></div>
    {loading ? <Loading/> : error ? <ErrorState message={error} retry={load}/> : terms.length ? <div className="term-list">{terms.map((term) => <article key={term.id}><div><strong>{term.name}</strong><small>/{term.slug}/</small></div><p>{term.description || '没有说明'}</p><span>{term.count} 篇文章</span><button className="icon-button" onClick={() => setEditing(term)} aria-label="编辑"><Icon name="edit"/></button><button className="icon-button" onClick={() => setRemoving(term)} aria-label="删除"><Icon name="trash"/></button></article>)}</div> : <Empty title={`还没有${kind === 'categories' ? '分类' : '标签'}`} copy="有需要时再创建，不必提前填满。"/>}
    {(creating || editing) && <TermEditor title={`${editing ? '编辑' : '新建'}${kind === 'categories' ? '分类' : '标签'}`} term={editing} onSave={save} onClose={() => { setCreating(false); setEditing(null); }}/>}
    {removing && <Confirm title={`删除${kind === 'categories' ? '分类' : '标签'}`} message={`“${removing.name}”正在用于 ${removing.count} 篇文章。删除后文章内容不会被删除。`} confirmLabel="删除" danger onConfirm={remove} onClose={() => setRemoving(null)}/>}
  </div>;
}

function TermEditor({ title, term, onSave, onClose }: { title: string; term: WpTerm | null; onSave: (name: string, description: string, id?: number) => void; onClose: () => void }) {
  const [name, setName] = useState(term?.name || ''); const [description, setDescription] = useState(term?.description || '');
  return <Dialog title={title} onClose={onClose}><div className="dialog-form"><label>名称<input data-dialog-initial-focus value={name} onChange={(event) => setName(event.target.value)}/></label><label>说明<textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)}/></label></div><footer className="dialog-actions"><button className="button-secondary" onClick={onClose}>取消</button><button className="button-primary" disabled={!name.trim()} onClick={() => onSave(name.trim(), description, term?.id)}>保存</button></footer></Dialog>;
}
