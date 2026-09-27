(() => {
  const header = document.querySelector('.site-header');
  const nav = header?.querySelector('.main-navigation');
  if (!header || !nav) return;
  const mobile = matchMedia('(max-width:782px)');
  let last = scrollY, direction = 0, distance = 0, pausedUntil = 0;
  const height = () => document.body.style.setProperty('--reading-header', `${header.offsetHeight + 16}px`);
  const show = (hidden) => {
    header.classList.toggle('reading-nav-hidden', hidden);
    nav.inert = hidden;
    height();
  };
  const blocked = () => header.querySelector('.header-search.active') ||
    header.contains(document.activeElement) ||
    document.activeElement?.matches('input,textarea,select,[contenteditable="true"]') || Date.now() < pausedUntil;
  addEventListener('scroll', () => {
    const y = Math.max(0, scrollY), delta = y - last; last = y;
    if (!mobile.matches || y <= 160 || blocked()) { show(false); distance = 0; direction = 0; return; }
    const next = Math.sign(delta);
    if (next !== direction) { direction = next; distance = 0; }
    distance += Math.abs(delta);
    if (distance >= (next > 0 ? 32 : 16)) { show(next > 0); distance = 0; }
  }, { passive:true });
  document.addEventListener('focusin', () => { show(false); distance = 0; });
  addEventListener('resize', () => { pausedUntil = Date.now() + 500; show(false); last = scrollY; });
  window.visualViewport?.addEventListener('resize', () => { pausedUntil = Date.now() + 800; show(false); distance = 0; });
  new MutationObserver(() => { if (header.querySelector('.header-search.active')) show(false); }).observe(header.querySelector('.header-search'), { attributes:true, attributeFilter:['class'] });
  if (window.ResizeObserver) new ResizeObserver(height).observe(header);
  document.querySelectorAll('.reading-toc a').forEach((link) => link.addEventListener('click', (event) => {
    const target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
    if (!target) return;
    event.preventDefault(); show(false); pausedUntil = Date.now() + 1600;
    setTimeout(() => {
      height();
      target.setAttribute('tabindex','-1'); target.focus({preventScroll:true});
      target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'start'});
      history.pushState(null,'',link.hash);
    }, matchMedia('(prefers-reduced-motion:reduce)').matches ? 0 : 170);
  }));
  height();
})();
