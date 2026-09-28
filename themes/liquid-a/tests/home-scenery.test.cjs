const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('one landscape sticks behind hero, content, contact and footer', () => {
    const header = read('header.php');
    const index = read('index.php');
    const footer = read('footer.php');
    const hero = read('template-parts/hero.php');

    assert.match(header, /class="home-landscape"/);
    assert.match(header, /liquidglass_hero_image_url\(\)/);
    assert.doesNotMatch(hero, /home-landscape/);
    assert.ok(index.indexOf('<!-- .home-content-cover -->') < index.indexOf('template-parts/home-contact'));
    assert.match(footer, /id="colophon"/);
    assert.doesNotMatch(footer, /home-bottom-scenery/);
    assert.match(hero, /liquidglass_hero_image_url\(\)/);
});

test('hero has no second fixed photo and mobile uses the same background', () => {
    const css = read('assets/css/main.css');
    assert.match(css, /\.home\.blog \.home-landscape\s*\{[^}]*position:\s*sticky;[^}]*width:\s*100%;[^}]*background-size:\s*cover;/s);
    assert.match(css, /\.home\.blog \.hero-media\s*\{[^}]*display:\s*none;/);
    assert.match(css, /\.home\.blog \.home-content-cover\s*\{[^}]*z-index:\s*4;[^}]*background:/s);
    assert.match(css, /@media \(max-width: 782px\)\s*\{[\s\S]*?\.home\.blog \.home-landscape\s*\{[^}]*background-position:\s*50% 36%;/);
});
