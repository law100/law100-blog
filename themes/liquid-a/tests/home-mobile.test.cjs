const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/scripts.js'), 'utf8');
const start = source.indexOf('    function initHeroHeaderSwitch()');
const end = source.indexOf('    function initReadingProgress()', start);
const headerSwitch = source.slice(start, end);

function setup(width) {
    const listeners = {};
    const state = { heroBottom: 700, visible: false };
    const hero = {
        getBoundingClientRect: () => ({ bottom: state.heroBottom })
    };
    const header = { classList: { toggle: (_, visible) => { state.visible = visible; } } };
    const document = { querySelector: selector => selector === '.site-hero' ? hero : header };
    const window = {
        innerWidth: width,
        devicePixelRatio: 3,
        addEventListener: (name, handler) => { listeners[name] = handler; }
    };
    vm.runInNewContext(headerSwitch + '\ninitHeroHeaderSwitch();', { document, window });
    return { state, listeners, window };
}

test('mobile fixed header waits for the entire Hero to leave', () => {
    const { state, listeners } = setup(390);
    assert.equal(state.visible, false);
    state.heroBottom = 100;
    listeners.scroll();
    assert.equal(state.visible, false);
    state.heroBottom = 0;
    listeners.scroll();
    assert.equal(state.visible, true);
    state.heroBottom = 700;
    listeners.pageshow();
    assert.equal(state.visible, false);
});

test('desktop and tablet headers follow the same Hero boundary', () => {
    const { state, listeners, window } = setup(1440);
    listeners.scroll();
    assert.equal(state.visible, false);
    state.heroBottom = 0;
    listeners.scroll();
    assert.equal(state.visible, true);
    window.innerWidth = 782;
    state.heroBottom = 700;
    listeners.resize();
    assert.equal(state.visible, false);
});
