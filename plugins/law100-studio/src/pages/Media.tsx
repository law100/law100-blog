import { useEffect, useRef, useState } from 'react';
import { api, json } from '../api';
import { Confirm, Dialog } from '../components/Dialog';
import { Icon } from '../components/Icon';
import { Empty, ErrorState, Loading } from '../components/States';
import type { WpMedia } from '../types';

export function Media() {
  const [items, setItems] = useState<WpMedia[]>([]);
  const [editing, setEditing] = useState<WpMedia | null>(null);
  const [removing, setRemoving] = useState<WpMedia | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const load = () => { setLoading(true); setError(''); api<WpMedia[]>('/wp/v2/media?context=edit&per_page=100&orderby=date&order=desc').then(setItems).catch((reason) => setError(reason.message)).finally(() => setLoading(false)); };
  useEffect(load, []);
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true); setError('');
    try {
      for (const file of Array.from(files)) {
        const form = new FormData(); form.append('file', file); form.append('title', file.name.replace(/\.[^.]+$/, ''));
        await api('/wp/v2/media', { method: 'POST', body: form });
      }
      load();
    } catch (reason) { setError((reason as Error).message); } finally { setUploading(false); if (input.current) input.current.value = ''; }
  };
  const save = async (media: WpMedia) => { await api(`/wp/v2/media/${media.id}`, { method: 'POST', ...json({ title: plain(media.title.raw || media.title.rendered), caption: plain(media.caption.raw || media.caption.rendered), description: media.description.raw || media.description.rendered, alt_text: media.alt_text }) }); setEditing(null); load(); };
  const remove = async () => { if (!removing) return; await api(`/wp/v2/media/${removing.id}?force=true`, { method: 'DELETE' }); setRemoving(null); load(); };
  return <div className="studio-page media-page">
    <header className="page-hero list-hero"><div><p className="page-kicker">素材</p><h1>媒体</h1><p>图片与文件保持清楚的名称和说明。</p></div><button className="button-primary" disabled={uploading} onClick={() => input.current?.click()}><Icon name="upload"/>{uploading ? '正在上传' : '上传文件'}</button><input ref={input} type="file" multiple hidden onChange={(event) => upload(event.target.files)}/></header>
    {error && <div className="inline-error" role="alert">{error}</div>}
    {loading ? <Loading/> : items.length ? <div className="media-grid">{items.map((media) => <article key={media.id} className="media-item"><button className="media-preview" onClick={() => setEditing(media)}>{media.media_type === 'image' ? <img src={thumbnail(media)} alt={media.alt_text || ''}/> : <span><Icon name="media"/></span>}</button><div><strong>{plain(media.title.raw || media.title.rendered) || '未命名文件'}</strong><small>{media.mime_type}{media.media_details?.width ? ` · ${media.media_details.width}×${media.media_details.height}` : ''}</small></div><div className="media-actions"><button className="icon-button" onClick={() => navigator.clipboard.writeText(media.source_url)} aria-label="复制地址"><Icon name="link"/></button><button className="icon-button" onClick={() => setEditing(media)} aria-label="编辑"><Icon name="edit"/></button><button className="icon-button" onClick={() => setRemoving(media)} aria-label="删除"><Icon name="trash"/></button></div></article>)}</div> : <Empty title="媒体库还是空的" copy="上传第一张图片或一个文件。" action={<button className="button-secondary" onClick={() => input.current?.click()}>上传文件</button>}/>}
    {editing && <MediaEditor media={editing} onChange={setEditing} onSave={() => save(editing)} onClose={() => setEditing(null)}/>}
    {removing && <Confirm title="永久删除媒体" message={`“${plain(removing.title.raw || removing.title.rendered) || '未命名文件'}”会从服务器永久删除，文章中的引用可能失效。`} confirmLabel="永久删除" danger onConfirm={remove} onClose={() => setRemoving(null)}/>}
  </div>;
}

function MediaEditor({ media, onChange, onSave, onClose }: { media: WpMedia; onChange: (media: WpMedia) => void; onSave: () => void; onClose: () => void }) {
  return <Dialog title="媒体信息" onClose={onClose} className="media-dialog"><div className="media-editor-preview">{media.media_type === 'image' ? <img src={media.source_url} alt=""/> : <Icon name="media"/>}</div><div className="dialog-form"><label>标题<input value={plain(media.title.raw || media.title.rendered)} onChange={(event) => onChange({ ...media, title: { ...media.title, raw: event.target.value } })}/></label><label>替代文字<input value={media.alt_text} onChange={(event) => onChange({ ...media, alt_text: event.target.value })}/><small>简短描述图片内容，帮助无法看到图片的人理解。</small></label><label>说明<textarea rows={3} value={plain(media.caption.raw || media.caption.rendered)} onChange={(event) => onChange({ ...media, caption: { ...media.caption, raw: event.target.value } })}/></label><label>文件地址<div className="copy-field"><input readOnly value={media.source_url}/><button onClick={() => navigator.clipboard.writeText(media.source_url)}>复制</button></div></label></div><footer className="dialog-actions"><button className="button-secondary" onClick={onClose}>取消</button><button className="button-primary" onClick={onSave}>保存信息</button></footer></Dialog>;
}

function plain(value: string) { const div = document.createElement('div'); div.innerHTML = value; return div.textContent || ''; }
function thumbnail(media: WpMedia) { return media.media_details?.sizes?.medium?.source_url || media.media_details?.sizes?.thumbnail?.source_url || media.source_url; }
