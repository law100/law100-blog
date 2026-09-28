const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('homepage skips the intro and keeps the article scroll target', () => {
    const index = read('index.php');
    const hero = read('template-parts/hero.php');

    assert.doesNotMatch(index, /get_template_part\( 'template-parts\/home-intro' \)/);
    assert.match(index, /id="content-start" class="home-content-cover"/);
    assert.match(hero, /href="#content-start"/);
    assert.ok(index.indexOf('id="content-start"') < index.indexOf('class="section-heading section-heading--simple"'));
    assert.match(read('assets/css/main.css'), /@media \(max-width: 782px\)\s*\{[\s\S]*?\.home\.blog \.section-heading\s*\{[^}]*padding-top:\s*128px;/);
});
