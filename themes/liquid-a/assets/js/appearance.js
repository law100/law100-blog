/* Runs before styles. Preferences are independent of account/session data. */
(function () {
    'use strict';
    var root = document.documentElement;
    var key = 'law100.blog.appearance';
    var modes = ['light', 'dark'];
    var names = { light: '日间', dark: '夜间' };
    function normalize(value) {
        // One-time migration only; never subscribe to system colour changes.
        if (value === 'system') return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        return modes.indexOf(value) === -1 ? 'light' : value;
    }
    var preference = 'light';
    var feedbackTimer, transitionTimer;
    try {
        var stored = localStorage.getItem(key);
        preference = normalize(stored);
        if (stored === 'system') localStorage.setItem(key, preference);
    } catch (_) { /* Private storage: keep the in-memory preference. */ }
    function render(animate) {
        if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            root.classList.add('appearance-changing');
            clearTimeout(transitionTimer);
            transitionTimer = setTimeout(function () { root.classList.remove('appearance-changing'); }, 180);
        }
        var effective = preference;
        root.setAttribute('data-appearance', preference);
        root.setAttribute('data-color-mode', effective);
        // Paint the canvas before the external stylesheet has arrived.
        root.style.colorScheme = effective;
        root.style.backgroundColor = effective === 'dark' ? '#18191B' : '#f3f3f6';
        var label = '当前：' + names[preference] + '；点击切换为' + names[modes[(modes.indexOf(preference) + 1) % modes.length]];
        document.querySelectorAll('.appearance-control').forEach(function (control) {
            control.querySelector('button').setAttribute('aria-label', label);
            control.querySelector('.appearance-tip').textContent = label;
        });
    }
    render(false);
    window.addEventListener('storage', function (event) {
        if (event.key !== key && event.key !== null) return;
        preference = normalize(event.newValue);
        if (event.newValue === 'system') {
            try { localStorage.setItem(key, preference); } catch (_) { /* Private storage. */ }
        }
        render(true);
    });
    document.addEventListener('DOMContentLoaded', function () {
        var status = document.createElement('span');
        status.className = 'screen-reader-text';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        document.body.appendChild(status);
        render(false);
        document.querySelectorAll('.appearance-toggle').forEach(function (button) {
            button.addEventListener('click', function (event) {
                // A theme choice is not an outside click that dismisses/clears search.
                event.stopPropagation();
                preference = modes[(modes.indexOf(preference) + 1) % modes.length];
                try { localStorage.setItem(key, preference); } catch (_) { /* In-memory switching still works. */ }
                render(true);
                status.textContent = '已切换为' + names[preference];
                document.querySelectorAll('.appearance-control').forEach(function (control) { control.classList.remove('show-feedback'); });
                var control = button.parentElement;
                control.querySelector('.appearance-tip').textContent = names[preference];
                control.classList.add('show-feedback');
                clearTimeout(feedbackTimer);
                feedbackTimer = setTimeout(function () { control.classList.remove('show-feedback'); render(false); }, 1400);
            });
        });
    });
}());
