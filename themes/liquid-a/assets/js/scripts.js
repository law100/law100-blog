/**
 * LiquidGlass 主题交互脚本
 * 轻量滚动增强、搜索交互、顶部导航和返回顶部
 */
(function () {
    'use strict';

    var root = document.documentElement;
    var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 只有脚本正常运行时才开启隐藏动画，避免 JS 失败时内容不可见。
    root.classList.add('js-enabled');
    if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
        root.classList.add('has-touch-input');
    }

    function positionSearch(wrap) {
        var input = wrap.querySelector('.hero-search-input, .header-search-input');
        if (!input) return;
        var rect = wrap.getBoundingClientRect();
        var width = input.getBoundingClientRect().width;
        var viewport = document.documentElement.clientWidth;
        var fitsRight = viewport > 782 && rect.right + 8 + width <= viewport - 16;
        var nav = wrap.parentElement.querySelector('.hero-nav, .main-navigation');
        var bottom = nav ? Math.max(rect.bottom, nav.getBoundingClientRect().bottom) : rect.bottom;
        var left = fitsRight ? rect.width + 8 : Math.max(16, Math.min(rect.right - width, viewport - width - 16)) - rect.left;
        wrap.style.setProperty('--search-left', left + 'px');
        wrap.style.setProperty('--search-top', (fitsRight ? (rect.height - input.offsetHeight) / 2 : bottom - rect.top + 8) + 'px');
    }

    function setSearchState(wrap, open) {
        var toggle = wrap.querySelector('.hero-search-toggle, .header-search-toggle');
        var form = wrap.querySelector('.hero-search-form, .header-search-form');
        var input = wrap.querySelector('.hero-search-input, .header-search-input');

        wrap.classList.toggle('active', open);
        if (open) positionSearch(wrap);
        if (toggle) toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (form) form.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    function initHeroReveal() {
        var hero = document.querySelector('.site-hero');
        if (!hero || reduceMotion || !window.requestAnimationFrame) return;

        // 只在脚本确认可用后才启用初始状态，脚本失败时首屏仍保持可见。
        hero.classList.add('hero-motion-ready');
        window.requestAnimationFrame(function () {
            window.requestAnimationFrame(function () {
                hero.classList.add('hero-motion-visible');
            });
        });
    }

    function initAllSearch() {
        var wraps = document.querySelectorAll('.hero-search, .header-search');
        if (!wraps.length) return;

        window.addEventListener('resize', function () {
            wraps.forEach(function (wrap) { if (wrap.classList.contains('active')) positionSearch(wrap); });
        }, { passive: true });

        var focusGuard = null;
        var visualViewport = window.visualViewport;

        var restoreFocusPosition = function () {
            if (!focusGuard || Date.now() > focusGuard.until) return;
            if (Math.abs(window.scrollY - focusGuard.top) > 1 || Math.abs(window.scrollX - focusGuard.left) > 1) {
                window.scrollTo({
                    top: focusGuard.top,
                    left: focusGuard.left,
                    behavior: 'auto'
                });
            }
        };

        var focusWithoutPageJump = function (input) {
            focusGuard = {
                top: window.scrollY,
                left: window.scrollX,
                until: Date.now() + 900
            };

            try {
                input.focus({ preventScroll: true });
            } catch (error) {
                input.focus();
            }

            window.requestAnimationFrame(restoreFocusPosition);
            window.setTimeout(restoreFocusPosition, 120);
            window.setTimeout(restoreFocusPosition, 360);
        };

        if (visualViewport) {
            visualViewport.addEventListener('resize', function () {
                window.requestAnimationFrame(restoreFocusPosition);
            }, { passive: true });
            visualViewport.addEventListener('scroll', function () {
                window.requestAnimationFrame(restoreFocusPosition);
            }, { passive: true });
        }

        wraps.forEach(function (wrap) {
            var toggle = wrap.querySelector('.hero-search-toggle, .header-search-toggle');
            var input = wrap.querySelector('.hero-search-input, .header-search-input');
            if (!toggle || !input) return;

            setSearchState(wrap, false);
            toggle.addEventListener('click', function (event) {
                event.stopPropagation();
                var shouldOpen = !wrap.classList.contains('active');
                wraps.forEach(function (other) {
                    setSearchState(other, other === wrap && shouldOpen);
                });
                if (shouldOpen) {
                    window.setTimeout(function () {
                        if (wrap.classList.contains('active')) focusWithoutPageJump(input);
                    }, 80);
                } else {
                    focusGuard = null;
                }
            });

            input.addEventListener('keydown', function (event) {
                if (event.key === 'Escape') {
                    setSearchState(wrap, false);
                    focusGuard = null;
                    toggle.focus();
                }
            });
        });

        document.addEventListener('click', function (event) {
            wraps.forEach(function (wrap) {
                if (wrap.classList.contains('active') && !wrap.contains(event.target)) {
                    setSearchState(wrap, false);
                    focusGuard = null;
                }
            });
        });
    }

    function initHeaderScroll() {
        var header = document.querySelector('.site-header');
        if (!header) return;

        var update = function () {
            header.classList.toggle('scrolled', window.scrollY > 40);
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
    }

    function initHeroHeaderSwitch() {
        var hero = document.querySelector('.site-hero');
        var header = document.querySelector('.site-header');
        if (!hero || !header) return;

        // 给动态视口与亚像素取整留出容差，避免手机端在临界位置延迟显示顶栏。
        var update = function () {
            var tolerance = Math.max(2, Math.min(6, (window.devicePixelRatio || 1) * 2));
            var heroBottom = hero.getBoundingClientRect().bottom;
            header.classList.toggle('visible', heroBottom <= tolerance);
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
    }

    function initReadingProgress() {
        var progress = document.querySelector('.reading-progress span');
        if (!progress) return;

        var ticking = false;
        var update = function () {
            var content = document.querySelector('[data-reading-body]');
            if (!content) return;
            var rect = content.getBoundingClientRect();
            var header = document.querySelector('.site-header');
            var top = header ? header.getBoundingClientRect().bottom : 0;
            var span = rect.height - Math.max(0, window.innerHeight - top);
            var ratio = span > 0 ? Math.min(Math.max((top - rect.top) / span, 0), 1) : (rect.bottom <= window.innerHeight ? 1 : 0);
            progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
        };

        var requestUpdate = function () {
            if (ticking) return;
            window.requestAnimationFrame(function () {
                update();
                ticking = false;
            });
            ticking = true;
        };

        update();
        window.addEventListener('scroll', requestUpdate, { passive: true });
        window.addEventListener('resize', requestUpdate, { passive: true });
        window.addEventListener('load', requestUpdate);
        if (window.ResizeObserver) new ResizeObserver(requestUpdate).observe(document.querySelector('[data-reading-body]') || document.body);
    }

    function initHeroScroll() {
        var btn = document.querySelector('.hero-scroll');
        var hero = document.querySelector('.site-hero');
        var target = document.getElementById('content-start');
        if (!btn || (!hero && !target)) return;

        var transitionRunning = false;
        var settleTimer = 0;
        var scrollToContent = function (behavior) {
            // 让 Hero 的底边精准贴到视口顶端，文章区域随即从第一行开始显示。
            var top = hero
                ? hero.getBoundingClientRect().bottom + window.pageYOffset
                : target.getBoundingClientRect().top + window.pageYOffset;

            window.scrollTo({
                top: Math.max(0, Math.round(top)),
                behavior: behavior
            });
        };

        var settleHeroEdge = function () {
            if (!hero) return;

            var delta = hero.getBoundingClientRect().bottom;
            if (Math.abs(delta) > 0.5) {
                window.scrollTo({
                    top: Math.max(0, window.pageYOffset + delta),
                    behavior: 'auto'
                });
            }

            var header = document.querySelector('.site-header');
            if (header) header.classList.add('visible');
        };

        btn.addEventListener('click', function (event) {
            event.preventDefault();

            // 指针或触摸点击后不把离屏焦点环留在 Hero；键盘激活仍保留焦点。
            if (event.detail > 0 && document.activeElement === btn) {
                btn.blur();
            }

            if (reduceMotion || !hero || !window.requestAnimationFrame) {
                scrollToContent('auto');
                window.requestAnimationFrame(settleHeroEdge);
                return;
            }

            if (transitionRunning) return;
            transitionRunning = true;
            hero.classList.add('hero-exiting');

            // 仅保留极短起步缓冲，淡出主体在滚动过程中完成。
            window.setTimeout(function () {
                scrollToContent('smooth');

                window.clearTimeout(settleTimer);
                settleTimer = window.setTimeout(settleHeroEdge, 760);

                // Hero 离开视口后恢复初始状态，返回顶部时仍可正常显示。
                window.setTimeout(function () {
                    hero.classList.remove('hero-exiting');
                    transitionRunning = false;
                }, 900);
            }, 60);
        });
    }

    function initBackToTop() {
        var btn = document.getElementById('back-to-top');
        if (!btn) return;

        var update = function () {
            var threshold = Math.max(1400, window.innerHeight * 2.1);
            btn.classList.toggle('visible', window.scrollY > threshold);
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update, { passive: true });
        btn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
    }

    function initButtonDetails() {
        if (reduceMotion || !window.matchMedia || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

        var buttons = document.querySelectorAll('.hero-scroll, .page-action-link, .social-link');
        buttons.forEach(function (button) {
            button.addEventListener('pointermove', function (event) {
                var rect = button.getBoundingClientRect();
                button.style.setProperty('--pointer-x', ((event.clientX - rect.left) / rect.width * 100).toFixed(1) + '%');
                button.style.setProperty('--pointer-y', ((event.clientY - rect.top) / rect.height * 100).toFixed(1) + '%');
            });

            button.addEventListener('pointerleave', function () {
                button.style.removeProperty('--pointer-x');
                button.style.removeProperty('--pointer-y');
            });
        });
    }

    function initHeroDriveHold() {
        var controls = document.querySelectorAll('.hero-brand [data-drive-hold]');
        if (!controls.length) return;

        controls.forEach(function (control) {
            var isTouchControl = control.classList.contains('hero-brand-touch');
            var holdTimer = 0;
            var startX = 0;
            var startY = 0;
            var holding = false;
            var completed = false;
            var activePointerId = null;
            var duration = 1200;
            var movementLimit = isTouchControl ? 16 : 10;

            var cancel = function () {
                window.clearTimeout(holdTimer);
                holdTimer = 0;
                holding = false;
                activePointerId = null;
                if (!completed) control.classList.remove('is-drive-holding');
            };

            var start = function (x, y) {
                cancel();
                completed = false;
                holding = true;
                startX = x;
                startY = y;
                control.style.setProperty('--drive-hold-duration', duration + 'ms');
                control.classList.remove('is-drive-complete', 'is-drive-holding');
                void control.offsetWidth;
                control.classList.add('is-drive-holding');
                holdTimer = window.setTimeout(function () {
                    holding = false;
                    completed = true;
                    control.classList.add('is-drive-complete');
                    if (navigator.vibrate) navigator.vibrate(35);
                    window.location.assign(control.getAttribute('data-drive-url'));
                }, duration);
            };

            var movedTooFar = function (x, y) {
                return Math.hypot(x - startX, y - startY) > movementLimit;
            };

            if (isTouchControl) {
                control.addEventListener('touchstart', function (event) {
                    if (event.touches.length !== 1) return;
                    event.preventDefault();
                    var touch = event.touches[0];
                    start(touch.clientX, touch.clientY);
                }, { passive: false });
                control.addEventListener('touchmove', function (event) {
                    if (!holding || !event.touches.length) return;
                    event.preventDefault();
                    var touch = event.touches[0];
                    if (movedTooFar(touch.clientX, touch.clientY)) cancel();
                }, { passive: false });
                window.addEventListener('touchend', cancel, { passive: true });
                window.addEventListener('touchcancel', cancel, { passive: true });
            }

            if (window.PointerEvent) {
                control.addEventListener('pointerdown', function (event) {
                    if (isTouchControl && event.pointerType === 'touch') return;
                    if ((event.pointerType === 'mouse' && event.button !== 0) || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
                    activePointerId = event.pointerId;
                    if (control.setPointerCapture) {
                        try { control.setPointerCapture(event.pointerId); } catch (error) { /* Unsupported capture is harmless. */ }
                    }
                    start(event.clientX, event.clientY);
                    activePointerId = event.pointerId;
                });
                control.addEventListener('pointermove', function (event) {
                    if (!holding || event.pointerId !== activePointerId) return;
                    if (movedTooFar(event.clientX, event.clientY)) cancel();
                });
                control.addEventListener('pointerleave', function (event) {
                    if (event.pointerType !== 'touch') cancel();
                });
                window.addEventListener('pointerup', function (event) {
                    if (!isTouchControl || event.pointerType !== 'touch') cancel();
                });
                window.addEventListener('pointercancel', function (event) {
                    if (!isTouchControl || event.pointerType !== 'touch') cancel();
                });
            } else if (!isTouchControl) {
                control.addEventListener('mousedown', function (event) {
                    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
                    start(event.clientX, event.clientY);
                });
                control.addEventListener('mousemove', function (event) {
                    if (holding && movedTooFar(event.clientX, event.clientY)) cancel();
                });
                control.addEventListener('mouseleave', cancel);
                window.addEventListener('mouseup', cancel);
            }

            window.addEventListener('scroll', cancel, { passive: true });
            window.addEventListener('blur', cancel);
            control.addEventListener('contextmenu', function (event) {
                if (isTouchControl || holding || completed) event.preventDefault();
            });
            control.addEventListener('click', function (event) {
                if (completed || isTouchControl) {
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (completed) {
                    completed = false;
                    control.classList.remove('is-drive-holding', 'is-drive-complete');
                } else if (isTouchControl) {
                    window.location.assign(control.getAttribute('data-home-url'));
                }
            }, true);
        });
    }

    function init() {
        initHeroReveal();
        initAllSearch();
        initHeaderScroll();
        initHeroHeaderSwitch();
        initHeroScroll();
        initBackToTop();
        initReadingProgress();
        initButtonDetails();
        initHeroDriveHold();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
