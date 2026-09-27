export type PopupPlacement = 'top' | 'bottom';

export type PopupRect = {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
};

export function positionPopup(trigger: PopupRect, popup: Pick<PopupRect, 'width' | 'height'>, viewportWidth: number, viewportHeight: number) {
  const margin = 12;
  const gap = 8;
  const width = Math.min(320, Math.max(trigger.width, popup.width));
  const below = viewportHeight - trigger.bottom - margin - gap;
  const above = trigger.top - margin - gap;
  const wantedHeight = Math.min(360, popup.height);
  const placement: PopupPlacement = below >= wantedHeight || below >= above ? 'bottom' : 'top';
  const available = Math.max(96, placement === 'bottom' ? below : above);
  const maxHeight = Math.min(360, available);
  const visibleHeight = Math.min(popup.height, maxHeight);
  const maxLeft = Math.max(margin, viewportWidth - margin - width);
  const left = Math.min(Math.max(margin, trigger.left), maxLeft);
  const top = placement === 'bottom' ? trigger.bottom + gap : trigger.top - gap - visibleHeight;
  const originX = Math.min(width - 22, Math.max(22, trigger.left + trigger.width / 2 - left));

  return { left, top, width, maxHeight, placement, originX };
}
