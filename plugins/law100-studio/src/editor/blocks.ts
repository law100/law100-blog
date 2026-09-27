export type BlockType = 'paragraph' | 'heading' | 'list' | 'quote' | 'code' | 'separator' | 'image' | 'unknown';

export type StudioBlock = {
  id: string;
  type: BlockType;
  html: string;
  attrs: Record<string, unknown>;
  raw?: string;
};

const supported: Record<string, BlockType> = {
  'core/paragraph': 'paragraph',
  'core/heading': 'heading',
  'core/list': 'list',
  'core/quote': 'quote',
  'core/code': 'code',
  'core/separator': 'separator',
  'core/image': 'image',
};

function id() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

function attrs(value?: string): Record<string, unknown> {
  if (!value) return {};
  try { return JSON.parse(value); } catch { return {}; }
}

export function parseBlocks(content: string): StudioBlock[] {
  if (!content.trim()) return [{ id: id(), type: 'paragraph', html: '', attrs: {} }];
  const blocks: StudioBlock[] = [];
  const pattern = /<!--\s+wp:([^\s]+)(?:\s+(\{.*?\}))?\s+-->([\s\S]*?)<!--\s+\/wp:\1\s+-->|<!--\s+wp:([^\s]+)(?:\s+(\{.*?\}))?\s+\/-->/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content))) {
    if (match.index > last && content.slice(last, match.index).trim()) {
      const raw = content.slice(last, match.index);
      blocks.push({ id: id(), type: 'unknown', html: raw, attrs: {}, raw });
    }
    const name = `core/${match[1] || match[4]}`.replace('core/core/', 'core/');
    const raw = match[0];
    blocks.push({
      id: id(),
      type: supported[name] || 'unknown',
      html: match[3] || '',
      attrs: attrs(match[2] || match[5]),
      raw: supported[name] ? undefined : raw,
    });
    last = pattern.lastIndex;
  }
  if (last < content.length && content.slice(last).trim()) {
    const raw = content.slice(last);
    blocks.push({ id: id(), type: 'unknown', html: raw, attrs: {}, raw });
  }
  return blocks.length ? blocks : [{ id: id(), type: 'unknown', html: content, attrs: {}, raw: content }];
}

export function serializeBlocks(blocks: StudioBlock[]): string {
  return blocks.map((block) => {
    if (block.type === 'unknown') return block.raw || block.html;
    const map: Record<Exclude<BlockType, 'unknown'>, string> = {
      paragraph: 'paragraph', heading: 'heading', list: 'list', quote: 'quote', code: 'code', separator: 'separator', image: 'image',
    };
    const attrString = Object.keys(block.attrs).length ? ` ${JSON.stringify(block.attrs)}` : '';
    if (block.type === 'separator') return `<!-- wp:${map[block.type]}${attrString} /-->`;
    return `<!-- wp:${map[block.type]}${attrString} -->\n${block.html}\n<!-- /wp:${map[block.type]} -->`;
  }).join('\n\n');
}

export function makeBlock(type: Exclude<BlockType, 'unknown'>): StudioBlock {
  const defaults: Record<Exclude<BlockType, 'unknown'>, { html: string; attrs: Record<string, unknown> }> = {
    paragraph: { html: '<p></p>', attrs: {} },
    heading: { html: '<h2></h2>', attrs: { level: 2 } },
    list: { html: '<ul><li></li></ul>', attrs: {} },
    quote: { html: '<blockquote class="wp-block-quote"><p></p></blockquote>', attrs: {} },
    code: { html: '<pre class="wp-block-code"><code></code></pre>', attrs: {} },
    separator: { html: '', attrs: {} },
    image: { html: '', attrs: {} },
  };
  return { id: id(), type, ...defaults[type] };
}
