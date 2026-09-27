import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBlocks, serializeBlocks } from '../src/editor/blocks.ts';
import { codeMarkup, linkAddress } from '../src/editor/formatting.ts';

test('supported blocks survive a parse/serialize round trip', () => {
  const source = '<!-- wp:paragraph -->\n<p>你好 <strong>law100</strong></p>\n<!-- /wp:paragraph -->\n\n<!-- wp:heading {"level":2} -->\n<h2>标题</h2>\n<!-- /wp:heading -->';
  const result = serializeBlocks(parseBlocks(source));
  assert.match(result, /<strong>law100<\/strong>/);
  assert.match(result, /"level":2/);
});

test('unknown blocks are preserved byte for byte', () => {
  const source = '<!-- wp:plugin/custom {"x":1} --><div>keep me</div><!-- /wp:plugin/custom -->';
  assert.equal(serializeBlocks(parseBlocks(source)), source);
});

test('italic and combined bold markup survive saving and reopening', () => {
  for (const tag of ['i', 'em']) {
    const source = `<!-- wp:paragraph -->\n<p>普通文字 <${tag}>Italic sample 中文斜体 <strong>粗斜体</strong></${tag}></p>\n<!-- /wp:paragraph -->`;
    const reopened = parseBlocks(serializeBlocks(parseBlocks(source)));
    assert.equal(reopened.length, 1);
    assert.equal(reopened[0].html.trim(), parseBlocks(source)[0].html.trim());
  }
});

test('code preserves whitespace and escapes markup exactly once', () => {
  const text = '\n  <script>if (a < b && c > d) {}\n\t</script> &lt;\n';
  const html = codeMarkup(text);
  assert.equal(html, '<pre class="wp-block-code"><code>\n  &lt;script&gt;if (a &lt; b &amp;&amp; c &gt; d) {}\n\t&lt;/script&gt; &amp;lt;\n</code></pre>');
  const block = parseBlocks(`<!-- wp:code -->${html}<!-- /wp:code -->`);
  assert.equal(parseBlocks(serializeBlocks(block))[0].html.trim(), html);
});

test('link addresses allow explicit safe protocols and reject obfuscation', () => {
  for (const url of ['https://github.com/law100', 'http://example.test', '/about/', '#title', '../post/', 'mailto:test@example.test', 'tel:+861234']) assert.equal(linkAddress(` ${url} `), url);
  for (const url of ['', 'javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'java\nscript:alert(1)', 'data:text/html,hi', '//example.test', '/\\example.test', 'https://a.test/ bad', 'example.test']) assert.equal(linkAddress(url), null);
});
