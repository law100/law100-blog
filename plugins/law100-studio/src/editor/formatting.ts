export function linkAddress(input: string): string | null {
  const value = input.trim();
  if (!value || /[\u0000-\u0020\u007f\\]/.test(value)) return null;
  if (/^(\/(?!\/)|#|\.\.?\/)/.test(value)) return value;
  try {
    const url = new URL(value);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? value : null;
  } catch { return null; }
}

export function codeMarkup(text: string): string {
  return `<pre class="wp-block-code"><code>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
}
