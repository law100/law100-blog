import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, api, json } from '../api';
import { Confirm, Dialog } from '../components/Dialog';
import { PopupSelect, TwoOptionToggle, type ChoiceOption } from '../components/ChoiceControls';
import { Icon } from '../components/Icon';
import { ErrorState, Loading } from '../components/States';
import { makeBlock, parseBlocks, serializeBlocks, type BlockType, type StudioBlock } from '../editor/blocks';
import { navigate } from '../router';
import { codeMarkup, linkAddress } from '../editor/formatting';
import type { WpMedia, WpPost, WpTerm } from '../types';

type EditorDocument = {
  id: number;
  type: 'post' | 'page';
  title: string;
  blocks: StudioBlock[];
  excerpt: string;
  status: string;
  slug: string;
  dateGmt: string;
  commentStatus: 'open' | 'closed';
  categories: number[];
  tags: number[];
  featuredMedia: number;
  baseModified: string;
};

type SaveResponse = { document: { id: number; status: string; modified: string }; baseModified: string; editLink: string };

const statusText: Record<string, string> = { publish: '已发布', draft: '草稿', pending: '待审核', future: '已定时', private: '私密' };
const editorStatusOptions: ChoiceOption[] = [{ value: 'draft', label: '草稿' }, { value: 'pending', label: '待审核' }, { value: 'future', label: '定时发布' }, { value: 'private', label: '私密' }, { value: 'publish', label: '已发布' }];

export function Editor({ type, id }: { type: 'post' | 'page'; id: number | 'new' }) {
  const endpoint = type === 'post' ? 'posts' : 'pages';
  const [document, setDocument] = useState<EditorDocument | null>(id === 'new' ? blank(type) : null);
  const [terms, setTerms] = useState<{ categories: WpTerm[]; tags: WpTerm[] }>({ categories: [], tags: [] });
  const [loading, setLoading] = useState(id !== 'new');
  const [error, setError] = useState('');
  const [dirty, setDirty] = useState(false);
  const [saveState, setSaveState] = useState<'clean' | 'local' | 'saving' | 'saved' | 'offline' | 'conflict'>('clean');
  const [conflict, setConflict] = useState(false);
  const [recovery, setRecovery] = useState<EditorDocument | null>(null);
  const [inspector, setInspector] = useState(false);
  const [mediaPicker, setMediaPicker] = useState<false | 'insert' | 'featured'>(false);
  const autoTimer = useRef<number | undefined>(undefined);
  const localTimer = useRef<number | undefined>(undefined);

  const localKey = `law100-studio:${type}:${id}`;
  const load = useCallback(async () => {
    setError(''); setLoading(id !== 'new');
    try {
      const termPromise = type === 'post' ? Promise.all([api<WpTerm[]>('/wp/v2/categories?per_page=100&hide_empty=false'), api<WpTerm[]>('/wp/v2/tags?per_page=100&hide_empty=false')]) : Promise.resolve([[], []] as [WpTerm[], WpTerm[]]);
      if (id === 'new') {
        const [categories, tags] = await termPromise; setTerms({ categories, tags }); setDocument(blank(type));
      } else {
        const [post, [categories, tags]] = await Promise.all([api<WpPost>(`/wp/v2/${endpoint}/${id}?context=edit`), termPromise]);
        const server = fromPost(post); setDocument(server); setTerms({ categories, tags });
        const stored = localStorage.getItem(localKey);
        if (stored) {
          try { const parsed = JSON.parse(stored) as { updated: number; document: EditorDocument }; if (parsed.updated > new Date(post.modified).getTime()) setRecovery(parsed.document); } catch { localStorage.removeItem(localKey); }
        }
      }
    } catch (reason) { setError((reason as Error).message); } finally { setLoading(false); }
  }, [endpoint, id, localKey, type]);
  useEffect(() => { load(); }, [load]);

  const change = useCallback((next: EditorDocument | ((current: EditorDocument) => EditorDocument)) => {
    setDocument((current) => current ? (typeof next === 'function' ? next(current) : next) : current);
    setDirty(true); setSaveState('local');
  }, []);

  useEffect(() => {
    if (!dirty || !document) return;
    window.clearTimeout(localTimer.current);
    localTimer.current = window.setTimeout(() => {
      localStorage.setItem(localKey, JSON.stringify({ updated: Date.now(), document }));
      setSaveState((state) => state === 'saving' ? state : 'local');
    }, 500);
    window.clearTimeout(autoTimer.current);
    autoTimer.current = window.setTimeout(() => autosave(document), 20000);
    return () => { window.clearTimeout(localTimer.current); window.clearTimeout(autoTimer.current); };
  }, [dirty, document, localKey]);

  useEffect(() => {
    const before = (event: BeforeUnloadEvent) => { if (dirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', before); return () => window.removeEventListener('beforeunload', before);
  }, [dirty]);

  const autosave = async (value: EditorDocument) => {
    if (!dirty) return;
    try {
      setSaveState('saving');
      if (value.id) {
        await api(`/wp/v2/${endpoint}/${value.id}/autosaves`, { method: 'POST', ...json({ title: value.title, content: serializeBlocks(value.blocks), excerpt: value.excerpt }) });
        setSaveState('local');
      } else {
        await save(value, false, true);
      }
    } catch { setSaveState(navigator.onLine ? 'local' : 'offline'); }
  };

  const save = async (value = document, force = false, automatic = false, duplicate = false): Promise<SaveResponse | null> => {
    if (!value) return null;
    setSaveState('saving'); setError('');
    try {
      const payload = {
        id: duplicate ? 0 : value.id,
        type: value.type,
        title: duplicate ? `${value.title || '无标题'}（副本）` : value.title,
        content: serializeBlocks(value.blocks), excerpt: value.excerpt,
        status: automatic || duplicate ? 'draft' : value.status,
        slug: duplicate ? '' : value.slug, dateGmt: value.dateGmt,
        commentStatus: value.commentStatus, categories: value.categories, tags: value.tags,
        featuredMedia: value.featuredMedia, baseModified: duplicate ? '' : value.baseModified, force,
      };
      const result = await api<SaveResponse>('/law100-studio/v1/documents/save', { method: 'POST', ...json(payload) });
      const nextId = result.document.id;
      const next = { ...value, id: nextId, baseModified: result.baseModified, status: automatic || duplicate ? 'draft' : value.status, title: duplicate ? payload.title : value.title };
      setDocument(next); setDirty(false); setSaveState('saved'); setConflict(false); localStorage.removeItem(localKey);
      if ((id === 'new' || duplicate) && nextId) navigate(`/${endpoint}/${nextId}`);
      return result;
    } catch (reason) {
      if (reason instanceof ApiError && reason.status === 409) { setConflict(true); setSaveState('conflict'); return null; }
      setSaveState(navigator.onLine ? 'local' : 'offline'); setError((reason as Error).message); return null;
    }
  };

  const preview = async () => {
    const saved = dirty || !document?.id ? await save() : { document: { id: document.id } } as SaveResponse;
    if (!saved?.document.id) return;
    const result = await api<{ url: string }>(`/law100-studio/v1/documents/${saved.document.id}/preview`);
    window.open(result.url, '_blank', 'noopener');
  };

  if (loading) return <div className="studio-page editor-page"><Loading label="正在打开文稿"/></div>;
  if (error && !document) return <div className="studio-page editor-page"><ErrorState message={error} retry={load}/></div>;
  if (!document) return null;
  const functional = type === 'page' && ['articles','drive','changelog'].includes(document.slug);
  return <div className="studio-page editor-page">
    <header className="editor-topbar"><button className="back-button" onClick={() => navigate(`/${endpoint}`)}><Icon name="chevron"/>返回{type === 'post' ? '文章' : '页面'}</button><SaveIndicator state={saveState}/><div className="editor-actions"><button className="button-secondary" onClick={preview}>预览</button><button className="button-secondary mobile-inspector-button" onClick={() => setInspector(true)}>设置</button><button className="button-primary" disabled={functional || saveState === 'saving'} onClick={() => save()}>{document.status === 'publish' ? '更新' : '保存'}</button></div></header>
    {functional && <div className="functional-notice"><Icon name="page"/><div><strong>这是功能页</strong><p>路由和模板由网站功能使用，请从对应功能本身修改。</p></div><a href={`${window.location.origin}/${document.slug}/`} target="_blank" rel="noreferrer">打开页面</a></div>}
    {error && <div className="inline-error" role="alert">{error}</div>}
    <div className={`editor-layout ${functional ? 'is-locked' : ''}`}>
      <main className="writing-canvas">
        <textarea className="title-input" rows={1} value={document.title} onChange={(event) => change({ ...document, title: event.target.value })} placeholder={type === 'post' ? '文章标题' : '页面标题'} aria-label="标题" disabled={functional}/>
        <BlockEditor blocks={document.blocks} disabled={functional} onChange={(blocks) => change({ ...document, blocks })} onPickMedia={() => setMediaPicker('insert')}/>
      </main>
      <Inspector document={document} terms={terms} functional={functional} onChange={change} onPickFeatured={() => setMediaPicker('featured')}/>
    </div>
    {inspector && <Dialog title="文稿设置" onClose={() => setInspector(false)} className="inspector-dialog"><Inspector document={document} terms={terms} functional={functional} onChange={change} onPickFeatured={() => setMediaPicker('featured')}/></Dialog>}
    {mediaPicker && <MediaPicker onPick={(media) => { if (mediaPicker === 'featured') change((current) => ({ ...current, featuredMedia: media.id })); else change((current) => ({ ...current, blocks: [...current.blocks, { ...makeBlock('image'), html: `<figure class="wp-block-image"><img src="${escapeAttr(media.source_url)}" alt="${escapeAttr(media.alt_text)}" class="wp-image-${media.id}"/><figcaption class="wp-element-caption"></figcaption></figure>`, attrs: { id: media.id, sizeSlug: 'full', linkDestination: 'none' } }] })); setMediaPicker(false); }} onClose={() => setMediaPicker(false)}/>}
    {recovery && <Dialog title="找到本地恢复内容" onClose={() => { localStorage.removeItem(localKey); setRecovery(null); }}><div className="dialog-copy"><p>浏览器中有一份比服务器更新的内容。恢复后不会立即覆盖服务器。</p></div><footer className="dialog-actions"><button className="button-secondary" onClick={() => { localStorage.removeItem(localKey); setRecovery(null); }}>使用服务器版本</button><button className="button-primary" onClick={() => { setDocument(recovery); setRecovery(null); setDirty(true); setSaveState('local'); }}>恢复本地内容</button></footer></Dialog>}
    {conflict && <Dialog title="文稿在其他地方更新过" onClose={() => setConflict(false)}><div className="dialog-copy"><p>选择服务器版本最安全；也可以覆盖，或把当前内容另存为草稿。</p></div><footer className="dialog-actions conflict-actions"><button className="button-secondary" onClick={() => { setConflict(false); load(); }}>使用服务器版本</button><button className="button-secondary" onClick={() => save(document, false, false, true)}>另存为草稿</button><button className="button-danger" onClick={() => save(document, true)}>覆盖服务器版本</button></footer></Dialog>}
  </div>;
}

function BlockEditor({ blocks, disabled, onChange, onPickMedia }: { blocks: StudioBlock[]; disabled: boolean; onChange: (blocks: StudioBlock[]) => void; onPickMedia: () => void }) {
  const update = (index: number, html: string) => onChange(blocks.map((block, position) => position === index ? { ...block, html } : block));
  const remove = (index: number) => onChange(blocks.length === 1 ? [makeBlock('paragraph')] : blocks.filter((_, position) => position !== index));
  const move = (index: number, direction: -1 | 1) => { const next = [...blocks]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; onChange(next); };
  const add = (type: Exclude<BlockType, 'unknown'>) => type === 'image' ? onPickMedia() : onChange([...blocks, makeBlock(type)]);
  return <div className="block-editor"><RichToolbar disabled={disabled}/>{blocks.map((block, index) => <div className={`editor-block block-${block.type}`} key={block.id}>
    {!disabled && <div className="block-controls"><button onClick={() => move(index, -1)} disabled={index === 0} aria-label="上移区块"><Icon name="arrow-up"/></button><button onClick={() => move(index, 1)} disabled={index === blocks.length - 1} aria-label="下移区块"><Icon name="arrow-down"/></button><button onClick={() => remove(index)} aria-label="删除区块"><Icon name="trash"/></button></div>}
    {block.type === 'separator' ? <hr/> : block.type === 'image' ? <div className="image-block" dangerouslySetInnerHTML={{ __html: block.html }}/> : block.type === 'unknown' ? <div className="unknown-block"><strong>暂不支持编辑的区块</strong><p>原始内容会原样保留。</p><pre>{block.raw}</pre></div> : block.type === 'code' ? <CodeEditor value={block.html} disabled={disabled} onChange={(html) => update(index, html)}/> : <EditableHtml value={block.html} disabled={disabled} className={`editable-${block.type}`} onChange={(html) => update(index, html)}/>}
  </div>)}{!disabled && <div className="block-adder"><span>添加</span>{([['paragraph','段落'],['heading','标题'],['list','列表'],['quote','引用'],['code','代码'],['separator','分隔线'],['image','图片']] as const).map(([type,label]) => <button key={type} onClick={() => add(type)}>{label}</button>)}</div>}</div>;
}

function EditableHtml({ value, onChange, className, disabled }: { value: string; onChange: (value: string) => void; className: string; disabled: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value; }, [value]);
  return <div ref={ref} className={`editable-html ${className}`} contentEditable={!disabled} suppressContentEditableWarning onInput={(event) => onChange(event.currentTarget.innerHTML)} data-placeholder="开始写作…"/>;
}

function CodeEditor({ value, disabled, onChange }: { value: string; disabled: boolean; onChange: (html: string) => void }) {
  const text = useMemo(() => {
    const parsed = new DOMParser().parseFromString(value, 'text/html');
    const code = parsed.querySelector('pre code, pre');
    code?.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
    return code?.textContent || '';
  }, [value]);
  return <label className="code-editor"><span>代码</span><textarea aria-label="代码内容" value={text} disabled={disabled} spellCheck={false} autoCapitalize="off" autoCorrect="off" wrap="off" rows={Math.max(6, Math.min(22, text.split('\n').length + 1))} onChange={(event) => onChange(codeMarkup(event.target.value))}/></label>;
}

function RichToolbar({ disabled }: { disabled: boolean }) {
  const toolbar = useRef<HTMLDivElement>(null);
  const saved = useRef<Range | null>(null);
  const linkInput = useRef<HTMLInputElement>(null);
  const [link, setLink] = useState<{ range: Range; existing: boolean } | null>(null);
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const element = (node: Node) => node.nodeType === Node.ELEMENT_NODE ? node as Element : node.parentElement;
  const field = (range: Range) => {
    const start = element(range.startContainer)?.closest<HTMLElement>('.editable-html[contenteditable="true"]');
    return start && start === element(range.endContainer)?.closest('.editable-html') && toolbar.current?.parentElement?.contains(start) ? start : null;
  };
  useEffect(() => {
    const remember = () => {
      const selection = window.getSelection();
      if (selection?.rangeCount && field(selection.getRangeAt(0))) saved.current = selection.getRangeAt(0).cloneRange();
      else if (!toolbar.current?.contains(document.activeElement)) saved.current = null;
    };
    document.addEventListener('selectionchange', remember);
    const focus = () => { if (!toolbar.current?.contains(document.activeElement) && !document.activeElement?.closest('.editable-html')) saved.current = null; };
    document.addEventListener('focusin', focus);
    return () => { document.removeEventListener('selectionchange', remember); document.removeEventListener('focusin', focus); };
  }, []);
  useEffect(() => { if (link) linkInput.current?.focus({ preventScroll: true }); }, [link]);
  const restore = (range: Range | null = saved.current) => {
    if (disabled || !range?.startContainer.isConnected || !range.endContainer.isConnected) return false;
    const target = field(range);
    if (!target) return false;
    target.focus({ preventScroll: true });
    const selection = window.getSelection(); selection?.removeAllRanges(); selection?.addRange(range);
    return true;
  };
  // Native editing commands retain the browser's undo history; never assign innerHTML to apply a format.
  const run = (command: string, value?: string, range = saved.current) => {
    if (!restore(range)) { setMessage('请先在正文中选择要设置格式的文字。'); return false; }
    const ok = document.execCommand(command, false, value);
    if (ok) setMessage('');
    else setMessage('未能应用格式，请重新选择文字。');
    return ok;
  };
  const openLink = () => {
    const range = saved.current?.cloneRange();
    if (!range || !field(range)) { setMessage('请先选中正文中要添加链接的文字。'); return; }
    const anchor = element(range.startContainer)?.closest('a');
    const existing = !!anchor && anchor === element(range.endContainer)?.closest('a');
    if (existing) range.selectNodeContents(anchor!);
    else if (range.collapsed) { setMessage('请先选中文字，再添加链接。'); return; }
    setAddress(existing ? anchor!.getAttribute('href') || '' : ''); setMessage('');
    setLink({ range, existing });
  };
  const closeLink = () => { if (link) restore(link.range); setLink(null); setMessage(''); };
  const applyLink = () => {
    const url = linkAddress(address);
    if (!url) { setMessage('请输入 https:// 地址、站内路径、mailto: 或 tel: 链接。'); return; }
    if (link && run('createLink', url, link.range)) setLink(null);
  };
  const inlineCode = () => {
    const range = saved.current?.cloneRange();
    if (!range || !field(range)) { setMessage('请先选择同一段落中的文字。'); return; }
    const paragraphs = [...field(range)!.querySelectorAll('p,h2,h3,li')].filter((node) => range.intersectsNode(node));
    if (paragraphs.length === 1) {
      const paragraph = paragraphs[0];
      if (!paragraph.contains(range.startContainer)) range.setStart(paragraph, 0);
      if (!paragraph.contains(range.endContainer)) range.setEnd(paragraph, paragraph.childNodes.length);
    }
    const start = element(range.startContainer), end = element(range.endContainer);
    const code = start?.closest('code');
    if (code && code === end?.closest('code')) {
      range.selectNode(code);
      run('insertHTML', code.innerHTML, range);
      return;
    }
    if (range.collapsed || start?.closest('p,h2,h3,li,blockquote') !== end?.closest('p,h2,h3,li,blockquote')) {
      setMessage('请选择同一段落中的文字；多行代码请使用“添加 → 代码”。'); return;
    }
    const wrapper = document.createElement('code'); wrapper.append(range.cloneContents());
    wrapper.querySelectorAll('code').forEach((nested) => nested.replaceWith(...nested.childNodes));
    if (wrapper.querySelector('p,div,h2,h3,li,ul,ol,blockquote,pre')) { setMessage('行内代码不能跨段落，请使用代码区块。'); return; }
    run('insertHTML', wrapper.outerHTML, range);
  };
  return <div ref={toolbar} className="format-tools">
    <div className="rich-toolbar" aria-label="文字格式"><button disabled={disabled || !!link} onMouseDown={(e) => e.preventDefault()} onClick={() => run('bold')} aria-label="粗体"><Icon name="bold"/></button><button disabled={disabled || !!link} onMouseDown={(e) => e.preventDefault()} onClick={() => run('italic')} aria-label="斜体"><Icon name="italic"/></button><button disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={link ? closeLink : openLink} aria-label="链接" aria-expanded={!!link} aria-controls="editor-link-fields"><Icon name="link"/></button><button disabled={disabled || !!link} onMouseDown={(e) => e.preventDefault()} onClick={inlineCode} aria-label="行内代码"><Icon name="code"/></button></div>
    {link && <div className="inline-link" id="editor-link-fields" role="group" aria-label="编辑链接" onKeyDown={(event) => { if (event.nativeEvent.isComposing) return; if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeLink(); } else if (event.key === 'Enter' && event.target === linkInput.current) { event.preventDefault(); applyLink(); } }}><label htmlFor="editor-link-address">链接地址</label><div className="inline-link-row"><input ref={linkInput} id="editor-link-address" type="text" inputMode="url" autoComplete="off" autoCapitalize="off" spellCheck={false} value={address} placeholder="https://" aria-describedby={message ? 'format-message' : undefined} onChange={(event) => { setAddress(event.target.value); setMessage(''); }}/><button className="button-primary" onClick={applyLink}>应用</button><button className="button-secondary" onClick={closeLink}>取消</button>{link.existing && <button className="button-secondary" onClick={() => { if (run('unlink', undefined, link.range)) setLink(null); }}>移除链接</button>}</div></div>}
    {message && <p id="format-message" className="format-message" role="status">{message}</p>}
  </div>;
}

function Inspector({ document, terms, functional, onChange, onPickFeatured }: { document: EditorDocument; terms: { categories: WpTerm[]; tags: WpTerm[] }; functional: boolean; onChange: (next: EditorDocument | ((current: EditorDocument) => EditorDocument)) => void; onPickFeatured: () => void }) {
  return <aside className="editor-inspector" aria-label="文稿设置"><fieldset disabled={functional}><section><h2>发布</h2><label>状态<PopupSelect value={document.status} options={editorStatusOptions} label="发布状态" onChange={(status) => onChange({ ...document, status })}/></label><label>发布日期<input type="datetime-local" value={toLocalInput(document.dateGmt)} onChange={(event) => onChange({ ...document, dateGmt: event.target.value ? new Date(event.target.value).toISOString().replace('.000Z','') : '' })}/></label><label>固定链接<input value={document.slug} onChange={(event) => onChange({ ...document, slug: event.target.value })} placeholder="保存后自动生成"/></label><div className="inspector-choice"><span>评论</span><TwoOptionToggle name="comment-status" label="评论设置" value={document.commentStatus} options={[{ value: 'open', label: '允许评论' }, { value: 'closed', label: '关闭评论' }]} onChange={(commentStatus) => onChange({ ...document, commentStatus: commentStatus as 'open' | 'closed' })}/></div></section>{document.type === 'post' && <><section><h2>分类</h2><div className="check-list">{terms.categories.map((term) => <label key={term.id}><input type="checkbox" checked={document.categories.includes(term.id)} onChange={(event) => onChange({ ...document, categories: event.target.checked ? [...document.categories, term.id] : document.categories.filter((id) => id !== term.id) })}/><span>{term.name}</span></label>)}</div></section><section><h2>标签</h2><div className="check-list">{terms.tags.length ? terms.tags.map((term) => <label key={term.id}><input type="checkbox" checked={document.tags.includes(term.id)} onChange={(event) => onChange({ ...document, tags: event.target.checked ? [...document.tags, term.id] : document.tags.filter((id) => id !== term.id) })}/><span>{term.name}</span></label>) : <p className="inspector-empty">还没有标签，可在“分类与标签”中创建。</p>}</div></section></>}<section><h2>摘要</h2><label><span className="sr-only">摘要</span><textarea rows={5} value={document.excerpt} onChange={(event) => onChange({ ...document, excerpt: event.target.value })} placeholder="可选，留空时自动截取正文。"/></label></section><section><h2>特色图片</h2><div className="featured-control"><span>{document.featuredMedia ? `媒体 #${document.featuredMedia}` : '尚未设置'}</span><button type="button" className="button-secondary" onClick={onPickFeatured}>选择图片</button>{document.featuredMedia > 0 && <button type="button" onClick={() => onChange({ ...document, featuredMedia: 0 })}>移除</button>}</div></section></fieldset></aside>;
}

function MediaPicker({ onPick, onClose }: { onPick: (media: WpMedia) => void; onClose: () => void }) {
  const [items, setItems] = useState<WpMedia[]>([]); const [loading, setLoading] = useState(true); const file = useRef<HTMLInputElement>(null);
  const load = () => api<WpMedia[]>('/wp/v2/media?context=edit&media_type=image&per_page=100&orderby=date&order=desc').then(setItems).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const upload = async (list: FileList | null) => { const value = list?.[0]; if (!value) return; const form = new FormData(); form.append('file', value); const media = await api<WpMedia>('/wp/v2/media', { method: 'POST', body: form }); onPick(media); };
  return <Dialog title="插入图片" onClose={onClose} className="media-picker"><div className="media-picker-tools"><button className="button-secondary" onClick={() => file.current?.click()}><Icon name="upload"/>上传新图片</button><input ref={file} hidden type="file" accept="image/*" onChange={(event) => upload(event.target.files)}/></div>{loading ? <Loading/> : <div className="picker-grid">{items.map((media) => <button key={media.id} onClick={() => onPick(media)}><img src={media.media_details?.sizes?.thumbnail?.source_url || media.source_url} alt={media.alt_text || ''}/><span>{plain(media.title.raw || media.title.rendered)}</span></button>)}</div>}</Dialog>;
}

function SaveIndicator({ state }: { state: string }) { const labels: Record<string,string> = { clean:'已打开', local:'本地已保存', saving:'正在同步', saved:'已保存', offline:'离线保存', conflict:'存在冲突' }; return <div className={`save-indicator state-${state}`} role="status"><span/><p>{labels[state]}</p></div>; }
function blank(type: 'post' | 'page'): EditorDocument { return { id:0, type, title:'', blocks:[makeBlock('paragraph')], excerpt:'', status:'draft', slug:'', dateGmt:'', commentStatus:'open', categories:[], tags:[], featuredMedia:0, baseModified:'' }; }
function fromPost(post: WpPost): EditorDocument { return { id:post.id, type:post.type, title:plain(post.title.raw || post.title.rendered), blocks:parseBlocks(post.content.raw || post.content.rendered), excerpt:plain(post.excerpt.raw || post.excerpt.rendered), status:post.status, slug:post.slug, dateGmt:post.date_gmt, commentStatus:post.comment_status, categories:post.categories || [], tags:post.tags || [], featuredMedia:post.featured_media, baseModified:post.modified_gmt }; }
function plain(value: string) { const div = window.document.createElement('div'); div.innerHTML = value; return div.textContent || ''; }
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char] || char)); }
function escapeAttr(value: string) { return escapeHtml(value); }
function toLocalInput(value: string) { if (!value) return ''; const date = new Date(`${value}Z`); const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000); return local.toISOString().slice(0,16); }
