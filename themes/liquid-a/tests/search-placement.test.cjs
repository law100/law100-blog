const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../assets/js/scripts.js'), 'utf8');
const fn = source.slice(source.indexOf('    function positionSearch'), source.indexOf('    function setSearchState'));
function place(viewport, right, navBottom = 64) {
    const width = Math.min(280, viewport - 32), values = {};
    const input = { offsetHeight: 44, getBoundingClientRect: () => ({ width }) };
    const wrap = {
        querySelector: () => input,
        getBoundingClientRect: () => ({ left:right - 44, right, top:20, bottom:64, width:44, height:44 }),
        parentElement: { querySelector: () => ({ getBoundingClientRect: () => ({ bottom:navBottom }) }) },
        style: { setProperty: (key, value) => { values[key] = parseFloat(value); } }
    };
    vm.runInNewContext(fn + '\npositionSearch(wrap);', { wrap, document:{documentElement:{clientWidth:viewport}} });
    return { left:right - 44 + values['--search-left'], top:20 + values['--search-top'], width };
}
test('opens right when there is space', () => {
    assert.deepEqual(place(1440, 1000), {left:1008, top:20, width:280});
});
test('falls below navigation at screen edge and on mobile', () => {
    for (const viewport of [1920,1440,1024,783,782,390,320]) {
        const box = place(viewport, viewport - 20, 116);
        assert.equal(box.top, 124);
        assert.ok(box.left >= 16);
        assert.ok(box.left + box.width <= viewport - 16);
    }
});
test('templates put appearance before search; closing keeps the query', () => {
    for (const [file, kind] of [['header.php','header'],['template-parts/hero.php','hero']]) {
        const html = fs.readFileSync(require('node:path').join(__dirname,'..',file),'utf8');
        assert.ok(html.indexOf("get_template_part( 'template-parts/appearance-toggle' )") < html.indexOf('class="' + kind + '-search"'));
    }
    assert.ok(!source.includes("if (!open && input) input.value = ''"));
});
test('search positioning has no legacy transforms or breakpoint overrides', () => {
    let positions = 0;
    for (const file of ['main.css', 'appearance.css', 'reading.css']) {
        const css = fs.readFileSync(require('node:path').join(__dirname, '../assets/css', file), 'utf8');
        for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
            if (!/\.(hero|header)-search-form\b/.test(match[1])) continue;
            assert.ok(!/translate|scale/.test(match[2]), 'legacy transform in ' + file);
            if (/\b(?:top|left|right)\s*:/.test(match[2])) {
                positions++;
                assert.ok(match[2].includes('--search-top'));
                assert.ok(match[2].includes('--search-left'));
            }
        }
    }
    assert.equal(positions, 1);
});
