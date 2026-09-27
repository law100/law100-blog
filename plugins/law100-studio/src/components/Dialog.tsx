import { useLayoutEffect, useRef } from 'react';
import { Icon } from './Icon';

export function Dialog({ title, children, onClose, className = '' }: { title: string; children: React.ReactNode; onClose: () => void; className?: string }) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  useLayoutEffect(() => { close.current = onClose; }, [onClose]);
  useLayoutEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const available = (element: HTMLElement) => !element.matches(':disabled, [aria-disabled="true"], input[type="hidden"]')
      && !element.closest('[hidden], [inert]') && element.getClientRects().length > 0
      && !['hidden', 'collapse'].includes(getComputedStyle(element).visibility);
    const first = (selector: string) => [...(dialog.current?.querySelectorAll<HTMLElement>(selector) || [])].find(available);
    const initial = first('[data-dialog-initial-focus]')
      || first('input:not([type="hidden"]):not([readonly]), textarea:not([readonly]), select, [contenteditable="true"]')
      || first('button, [href]');
    (initial || dialog.current)?.focus({ preventScroll: true });
    let closeTimer: number | undefined;
    const key = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.isComposing || event.keyCode === 229 || event.defaultPrevented) return;
      if (document.body.classList.contains('has-popup-select')) return;
      if ((event.target as Element | null)?.closest?.('.popup-select__menu')) return;
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(() => { if (!event.defaultPrevented && !document.querySelector('.popup-select__menu')) close.current(); });
    };
    window.addEventListener('keydown', key);
    return () => {
      window.clearTimeout(closeTimer);
      window.removeEventListener('keydown', key);
      document.body.style.overflow = previousOverflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return <div className="studio-dialog-layer" role="presentation" onMouseDown={(event) => {
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    onClose();
  }}>
    <div ref={dialog} className={`studio-dialog ${className}`} role="dialog" aria-modal="true" aria-labelledby="studio-dialog-title" tabIndex={-1}>
      <header><h2 id="studio-dialog-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="关闭"><Icon name="close" /></button></header>
      {children}
    </div>
  </div>;
}

export function Confirm({ title, message, confirmLabel = '确认', danger = false, onConfirm, onClose }: { title: string; message: string; confirmLabel?: string; danger?: boolean; onConfirm: () => void | Promise<void>; onClose: () => void }) {
  return <Dialog title={title} onClose={onClose}><div className="dialog-copy"><p>{message}</p></div><footer className="dialog-actions"><button className="button-secondary" onClick={onClose}>取消</button><button className={danger ? 'button-danger' : 'button-primary'} onClick={onConfirm}>{confirmLabel}</button></footer></Dialog>;
}
