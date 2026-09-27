import { useEffect, useState } from 'react';
import { api, config } from '../api';
import type { Bootstrap } from '../types';
import { navigate, StudioLink } from '../router';
import { Icon } from './Icon';
import { CommandPalette } from './CommandPalette';

const studioLogo = new URL('../assets/law100s_studio_logo_sharp.svg', import.meta.url).href;

const nav = [
  { path: '/', label: '工作台', icon: 'home' as const },
  { path: '/posts', label: '文章', icon: 'post' as const },
  { path: '/pages', label: '页面', icon: 'page' as const },
  { path: '/comments', label: '评论', icon: 'comment' as const },
  { path: '/media', label: '媒体', icon: 'media' as const },
];

function activePath(current: string, target: string) {
  return target === '/' ? current === '/' : current === target || current.startsWith(`${target}/`);
}

export function Layout({ bootstrap, path, children }: { bootstrap: Bootstrap; path: string; children: React.ReactNode }) {
  const [commands, setCommands] = useState(false);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommands(true); }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, []);
  useEffect(() => setMore(false), [path]);

  const logout = async () => {
    const result = await api<{ loginUrl: string }>('/law100-studio/v1/session/logout', { method: 'POST' });
    window.location.assign(result.loginUrl);
  };

  return <div className="studio-app">
    <aside className="studio-sidebar" aria-label="Studio 导航">
      <StudioLink to="/" className="studio-wordmark"><img className="studio-logo" src={studioLogo} width="1320" height="261" alt="law100’s Studio，返回工作台"/></StudioLink>
      <nav>{nav.map((item) => <StudioLink key={item.path} to={item.path} className={activePath(path, item.path) ? 'is-active' : ''}><Icon name={item.icon}/><span>{item.label}</span></StudioLink>)}</nav>
      <div className="sidebar-utility">
        <button onClick={() => setCommands(true)}><Icon name="search"/><span>搜索</span><kbd>Ctrl K</kbd></button>
        <a href={config.homeUrl} target="_blank" rel="noreferrer"><Icon name="external"/><span>查看博客</span></a>
        <a href={config.driveUrl} target="_blank" rel="noreferrer"><Icon name="drive"/><span>Drive</span></a>
        <button onClick={logout}><Icon name="logout"/><span>退出</span></button>
      </div>
    </aside>
    <header className="mobile-topbar"><StudioLink to="/" className="mobile-wordmark"><img className="studio-logo" src={studioLogo} width="1320" height="261" alt="law100’s Studio，返回工作台"/></StudioLink><button className="icon-button" onClick={() => setCommands(true)} aria-label="搜索"><Icon name="search"/></button></header>
    <main className="studio-main" id="studio-main">{children}</main>
    <nav className="mobile-nav" aria-label="手机导航">
      {nav.slice(0, 2).map((item) => <StudioLink key={item.path} to={item.path} className={activePath(path, item.path) ? 'is-active' : ''}><Icon name={item.icon}/><span>{item.label}</span></StudioLink>)}
      <StudioLink to="/comments" className={activePath(path, '/comments') ? 'is-active' : ''}><Icon name="comment"/><span>评论</span></StudioLink>
      <button className={more ? 'is-active' : ''} onClick={() => setMore((value) => !value)}><Icon name="more"/><span>更多</span></button>
    </nav>
    {more && <div className="mobile-more" role="dialog" aria-label="更多功能">
      <StudioLink to="/pages"><Icon name="page"/>页面</StudioLink><StudioLink to="/media"><Icon name="media"/>媒体</StudioLink><StudioLink to="/taxonomies"><Icon name="folder"/>分类与标签</StudioLink><StudioLink to="/system"><Icon name="settings"/>系统状态</StudioLink>
      <a href={config.homeUrl} target="_blank" rel="noreferrer"><Icon name="external"/>查看博客</a><a href={config.driveUrl} target="_blank" rel="noreferrer"><Icon name="drive"/>Drive</a><button onClick={logout}><Icon name="logout"/>退出登录</button>
    </div>}
    {commands && <CommandPalette onClose={() => setCommands(false)} onLogout={logout}/>}
  </div>;
}
