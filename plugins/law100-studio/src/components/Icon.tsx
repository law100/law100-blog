import type { SVGProps } from 'react';

type IconName = 'home' | 'post' | 'page' | 'comment' | 'media' | 'more' | 'write' | 'search' | 'external' | 'drive' | 'logout' | 'chevron' | 'plus' | 'trash' | 'edit' | 'check' | 'close' | 'upload' | 'folder' | 'settings' | 'arrow-up' | 'arrow-down' | 'bold' | 'italic' | 'link' | 'code' | 'quote' | 'list' | 'image';

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5M9 21v-7h6v7"/></>,
  post: <><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h4M8 12h8M8 16h8"/></>,
  page: <><path d="M6 3h9l3 3v15H6z"/><path d="M9 11h6M9 15h6"/></>,
  comment: <><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></>,
  media: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m5 18 4.5-4.5 3 3 2.5-2.5 4 4"/></>,
  more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
  write: <><path d="m4 20 4.2-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.2 16z"/><path d="m14.5 6.7 3 3"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m16.2 16.2 4 4"/></>,
  external: <><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v7H4V6h7"/></>,
  drive: <><path d="M4 15h16l-2-8H6z"/><path d="M4 15v4h16v-4M16 17h1"/></>,
  logout: <><path d="M10 4H4v16h6M14 8l4 4-4 4M8 12h10"/></>,
  chevron: <path d="m9 5 7 7-7 7"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  trash: <><path d="M4 7h16M9 3h6l1 4H8zM7 7l1 14h8l1-14M10 11v6M14 11v6"/></>,
  edit: <><path d="m4 20 4.2-1 10.7-10.7a2.1 2.1 0 0 0-3-3L5.2 16z"/><path d="m14.5 6.7 3 3"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  upload: <><path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 15v5h14v-5"/></>,
  folder: <path d="M3 6h7l2 2h9v11H3z"/>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7-.7-1.7.9-1.9-2.1-2.1-1.9.9-1.7-.7L10.5 2h-3l-.7 2-1.7.7-1.9-.9-2.1 2.1.9 1.9-.7 1.7-2 .7v3l2 .7.7 1.7-.9 1.9 2.1 2.1 1.9-.9 1.7.7.7 2h3l.7-2 1.7-.7 1.9.9 2.1-2.1-.9-1.9.7-1.7z" transform="scale(.8) translate(3 3)"/></>,
  'arrow-up': <path d="m6 14 6-6 6 6"/>,
  'arrow-down': <path d="m6 10 6 6 6-6"/>,
  bold: <><path d="M7 4h6a4 4 0 0 1 0 8H7zM7 12h7a4 4 0 0 1 0 8H7z"/></>,
  italic: <><path d="M10 4h8M6 20h8M14 4 10 20"/></>,
  link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/></>,
  code: <><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16"/></>,
  quote: <><path d="M5 7h5v5H7v5H4v-7a3 3 0 0 1 3-3M14 7h5v5h-3v5h-3v-7a3 3 0 0 1 3-3"/></>,
  list: <><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".7" fill="currentColor"/><circle cx="4.5" cy="12" r=".7" fill="currentColor"/><circle cx="4.5" cy="18" r=".7" fill="currentColor"/></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1"/><path d="m5 18 5-5 3 3 2-2 4 4"/></>,
};

export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
