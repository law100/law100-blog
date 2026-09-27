export function Loading({ label = '正在整理内容' }: { label?: string }) {
  return <div className="state-block" role="status"><span className="loading-line" aria-hidden="true"/><p>{label}</p></div>;
}

export function Empty({ title, copy, action }: { title: string; copy: string; action?: React.ReactNode }) {
  return <div className="empty-state"><h2>{title}</h2><p>{copy}</p>{action}</div>;
}

export function ErrorState({ message, retry }: { message: string; retry?: () => void }) {
  return <div className="error-state" role="alert"><h2>内容没有载入</h2><p>{message}</p>{retry && <button className="button-secondary" onClick={retry}>重试</button>}</div>;
}
