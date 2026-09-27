import { useEffect, useState } from 'react';
import { config } from './api';

export function routePath() {
  const base = new URL(config.studioUrl).pathname.replace(/\/$/, '');
  const value = window.location.pathname.replace(base, '') || '/';
  return value.endsWith('/') && value !== '/' ? value.slice(0, -1) : value;
}

export function navigate(path: string) {
  const base = new URL(config.studioUrl).pathname.replace(/\/$/, '');
  window.history.pushState({}, '', `${base}${path === '/' ? '/' : path + '/'}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

export function useRoute() {
  const [path, setPath] = useState(routePath());
  useEffect(() => {
    const update = () => setPath(routePath());
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  return path;
}

export function StudioLink({ to, children, className, onClick }: { to: string; children: React.ReactNode; className?: string; onClick?: () => void }) {
  return <a href={`${config.studioUrl.replace(/\/$/, '')}${to === '/' ? '/' : to + '/'}`} className={className} onClick={(event) => { event.preventDefault(); onClick?.(); navigate(to); }}>{children}</a>;
}
