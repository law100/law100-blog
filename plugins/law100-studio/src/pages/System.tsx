import { useEffect, useState } from 'react';
import { api, config } from '../api';
import { Icon } from '../components/Icon';
import { ErrorState, Loading } from '../components/States';

type SystemData = { wordpress: string; theme: string; updates: number; https: boolean };

export function SystemPage() {
  const [data, setData] = useState<SystemData | null>(null); const [error, setError] = useState('');
  const load = () => { setError(''); api<SystemData>('/law100-studio/v1/system-status').then(setData).catch((reason) => setError(reason.message)); };
  useEffect(load, []);
  return <div className="studio-page system-page"><header className="page-hero"><div><p className="page-kicker">只读状态</p><h1>系统</h1><p>这里说明内容服务是否正常，不在日常工作台执行维护。</p></div></header>{error ? <ErrorState message={error} retry={load}/> : !data ? <Loading/> : <div className="system-ledger"><section><div><span>WordPress</span><strong>{data.wordpress}</strong></div><p>负责内容、用户认证和接口。</p></section><section><div><span>前台主题</span><strong>{data.theme}</strong></div><p>博客公开页面当前使用的主题。</p></section><section><div><span>更新</span><strong>{data.updates ? `${data.updates} 项待处理` : '已是最新'}</strong></div><p>更新操作保留在原生应急后台。</p></section><section><div><span>HTTPS</span><strong className={data.https ? 'status-ok' : 'status-warn'}>{data.https ? '正常' : '需要检查'}</strong></div><p>Studio 登录与媒体必须始终通过 HTTPS。</p></section></div>}
    <div className="system-links"><a href={config.homeUrl} target="_blank" rel="noreferrer"><Icon name="external"/>查看博客</a><a href={config.driveUrl} target="_blank" rel="noreferrer"><Icon name="drive"/>打开 Drive</a></div>
  </div>;
}
