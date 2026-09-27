import { useEffect, useState } from 'react';
import { api, config } from './api';
import { Dialog } from './components/Dialog';
import { Layout } from './components/Layout';
import { ErrorState, Loading } from './components/States';
import { useRoute } from './router';
import type { Bootstrap } from './types';
import { Comments } from './pages/Comments';
import { Dashboard } from './pages/Dashboard';
import { Documents } from './pages/Documents';
import { Editor } from './pages/Editor';
import { Media } from './pages/Media';
import { SystemPage } from './pages/System';
import { Taxonomies } from './pages/Taxonomies';

export default function App() {
  const path = useRoute();
  const [bootstrap, setBootstrap] = useState<Bootstrap | null>(null);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);
  const load = () => { setError(''); api<Bootstrap>('/law100-studio/v1/bootstrap').then(setBootstrap).catch((reason) => setError(reason.message)); };
  useEffect(load, []);
  useEffect(() => {
    const listener = () => setExpired(true);
    window.addEventListener('studio:session-expired', listener);
    return () => window.removeEventListener('studio:session-expired', listener);
  }, []);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const resize = () => {
      document.documentElement.style.setProperty('--visual-height', `${viewport.height}px`);
      document.body.classList.toggle('keyboard-open', window.innerHeight - viewport.height > 160);
    };
    resize(); viewport.addEventListener('resize', resize); return () => viewport.removeEventListener('resize', resize);
  }, []);
  if (error) return <div className="boot-state"><ErrorState message={error} retry={load}/></div>;
  if (!bootstrap) return <div className="boot-state"><Loading label="正在打开 Studio"/></div>;
  return <Layout bootstrap={bootstrap} path={path}><Route path={path}/>{expired && <Dialog title="登录状态已过期" onClose={() => window.location.assign(`${config.studioUrl}login/`)}><div className="dialog-copy"><p>编辑内容已经留在当前浏览器。重新登录后可以继续。</p></div><footer className="dialog-actions"><button className="button-primary" onClick={() => window.location.assign(`${config.studioUrl}login/`)}>重新登录</button></footer></Dialog>}</Layout>;
}

function Route({ path }: { path: string }) {
  if (path === '/') return <Dashboard/>;
  if (path === '/posts') return <Documents type="post"/>;
  if (path === '/pages') return <Documents type="page"/>;
  if (path === '/comments') return <Comments/>;
  if (path === '/media') return <Media/>;
  if (path === '/taxonomies') return <Taxonomies/>;
  if (path === '/system') return <SystemPage/>;
  const post = path.match(/^\/posts\/(new|\d+)$/); if (post) return <Editor type="post" id={post[1] === 'new' ? 'new' : Number(post[1])}/>;
  const page = path.match(/^\/pages\/(new|\d+)$/); if (page) return <Editor type="page" id={page[1] === 'new' ? 'new' : Number(page[1])}/>;
  return <div className="studio-page not-found"><p className="page-kicker">404</p><h1>这里没有内容</h1><p>返回工作台，继续处理文稿。</p><a href={config.studioUrl}>回到工作台</a></div>;
}
