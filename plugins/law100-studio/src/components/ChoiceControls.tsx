import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from './Icon';
import { positionPopup, type PopupPlacement } from './popupPosition';

export type ChoiceOption = { value: string; label: string; disabled?: boolean };

type PopupPosition = {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
  placement: PopupPlacement;
  originX: number;
};

export function PopupSelect({ value, options, label, onChange, className = '' }: { value: string; options: ChoiceOption[]; label: string; onChange: (value: string) => void; className?: string }) {
  const id = useId().replaceAll(':', '');
  const trigger = useRef<HTMLButtonElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const openFrame = useRef<number | undefined>(undefined);
  const [rendered, setRendered] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<PopupPosition | null>(null);
  const selected = Math.max(0, options.findIndex((option) => option.value === value));
  const current = options[selected] || options[0];
  const cancelOpenFrame = () => { if (openFrame.current !== undefined) window.cancelAnimationFrame(openFrame.current); };

  const close = (restoreFocus = false) => {
    window.clearTimeout(closeTimer.current);
    cancelOpenFrame();
    setOpen(false);
    closeTimer.current = window.setTimeout(() => {
      setRendered(false);
      setPosition(null);
      requestAnimationFrame(() => { if (!document.querySelector('.popup-select__menu')) document.body.classList.remove('has-popup-select'); });
      if (restoreFocus) trigger.current?.focus();
    }, 135);
  };

  const show = (initial = selected) => {
    window.clearTimeout(closeTimer.current);
    setActive(initial);
    if (rendered) setOpen(true);
    else setRendered(true);
    document.body.classList.add('has-popup-select');
    window.dispatchEvent(new CustomEvent('studio-popup-open', { detail: id }));
  };

  useLayoutEffect(() => {
    if (!rendered || !trigger.current || !popup.current) return;
    const triggerRect = trigger.current.getBoundingClientRect();
    const popupRect = popup.current.getBoundingClientRect();
    const next = positionPopup(triggerRect, { width: popup.current.scrollWidth || popupRect.width, height: popup.current.scrollHeight || popupRect.height }, window.innerWidth, window.innerHeight);
    setPosition(next);
    openFrame.current = requestAnimationFrame(() => setOpen(true));
    return cancelOpenFrame;
  }, [rendered, options.length]);

  useEffect(() => {
    if (!rendered || !open) return;
    const option = popup.current?.querySelector<HTMLElement>(`#${id}-option-${active}`);
    popup.current?.focus({ preventScroll: true });
    option?.scrollIntoView({ block: 'nearest' });
  }, [active, id, open, rendered]);

  useEffect(() => {
    const onOtherOpen = (event: Event) => { if ((event as CustomEvent<string>).detail !== id && rendered) close(false); };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!trigger.current?.contains(target) && !popup.current?.contains(target)) close(false);
    };
    const onScroll = (event: Event) => { if (!popup.current?.contains(event.target as Node)) close(false); };
    const onRoute = () => close(false);
    window.addEventListener('studio-popup-open', onOtherOpen);
    if (rendered) {
      document.addEventListener('pointerdown', onPointerDown, true);
      window.addEventListener('scroll', onScroll, true);
      window.addEventListener('blur', onRoute);
      window.addEventListener('resize', onRoute);
      window.addEventListener('popstate', onRoute);
    }
    return () => {
      window.removeEventListener('studio-popup-open', onOtherOpen);
      document.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('blur', onRoute);
      window.removeEventListener('resize', onRoute);
      window.removeEventListener('popstate', onRoute);
    };
  }, [id, rendered]);

  useEffect(() => () => {
    window.clearTimeout(closeTimer.current);
    cancelOpenFrame();
    requestAnimationFrame(() => { if (!document.querySelector('.popup-select__menu')) document.body.classList.remove('has-popup-select'); });
  }, []);

  const move = (direction: 1 | -1) => {
    let next = active;
    do next = (next + direction + options.length) % options.length;
    while (options[next]?.disabled && next !== active);
    setActive(next);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    close(true);
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (!['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) return;
    event.preventDefault();
    show(event.key === 'ArrowUp' ? options.length - 1 : selected);
  };

  const onListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); move(event.key === 'ArrowDown' ? 1 : -1); }
    else if (event.key === 'Home') { event.preventDefault(); setActive(0); }
    else if (event.key === 'End') { event.preventDefault(); setActive(options.length - 1); }
    else if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); choose(active); }
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); }
    else if (event.key === 'Tab') {
      event.preventDefault();
      const focusable = [...document.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])')].filter((element) => element.offsetParent !== null && !popup.current?.contains(element));
      const index = trigger.current ? focusable.indexOf(trigger.current) : -1;
      const next = focusable[index + (event.shiftKey ? -1 : 1)] || trigger.current;
      close(false);
      next?.focus();
    }
  };

  return <div className={`popup-select ${className}`}>
    <button ref={trigger} type="button" className="popup-select__trigger" aria-label={label} aria-haspopup="listbox" aria-expanded={rendered && open} aria-controls={`${id}-listbox`} onClick={() => open ? close(false) : show()} onKeyDown={onTriggerKeyDown}>
      <span title={current?.label}>{current?.label}</span><span className="popup-select__chevron" aria-hidden="true"><Icon name="chevron"/></span>
    </button>
    {rendered && createPortal(<div ref={popup} id={`${id}-listbox`} className={`popup-select__menu is-${position?.placement || 'bottom'} ${open ? 'is-open' : ''}`} role="listbox" aria-label={label} aria-activedescendant={`${id}-option-${active}`} tabIndex={-1} onKeyDown={onListKeyDown} style={position ? { left: position.left, top: position.top, width: position.width, maxHeight: position.maxHeight, visibility: 'visible', '--popup-origin-x': `${position.originX}px` } as React.CSSProperties : undefined}>
      {options.map((option, index) => <div id={`${id}-option-${index}`} key={option.value} className={`popup-select__option ${index === active ? 'is-active' : ''}`} role="option" aria-selected={option.value === value} aria-disabled={option.disabled || undefined} title={option.label} onPointerMove={() => !option.disabled && setActive(index)} onClick={() => choose(index)}>
        <span>{option.label}</span>{option.value === value && <Icon name="check"/>}
      </div>)}
    </div>, document.body)}
  </div>;
}

export function TwoOptionToggle({ name, label, value, options, onChange }: { name: string; label: string; value: string; options: [ChoiceOption, ChoiceOption]; onChange: (value: string) => void }) {
  const id = useId().replaceAll(':', '');
  const choose = (index: number) => {
    if (options[index].disabled) return;
    onChange(options[index].value);
    requestAnimationFrame(() => document.getElementById(`${id}-${index}`)?.focus());
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const index = ['ArrowRight', 'ArrowDown', 'End'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp', 'Home'].includes(event.key) ? 0 : -1;
    if (index < 0) return;
    event.preventDefault();
    choose(index);
  };
  return <fieldset className="two-option-toggle">
    <legend className="sr-only">{label}</legend>
    <div className="two-option-toggle__control">
      {options.map((option, index) => <input key={option.value} className={`two-option-toggle__input is-${index ? 'right' : 'left'}`} type="radio" name={`${name}-${id}`} id={`${id}-${index}`} value={option.value} checked={value === option.value} disabled={option.disabled} onChange={() => choose(index)} onKeyDown={onKeyDown}/>)}
      <span className="two-option-toggle__thumb" aria-hidden="true"/>
      {options.map((option, index) => <label key={option.value} className={`two-option-toggle__option is-${index ? 'right' : 'left'}`} htmlFor={`${id}-${index}`}>{option.label}</label>)}
    </div>
  </fieldset>;
}
