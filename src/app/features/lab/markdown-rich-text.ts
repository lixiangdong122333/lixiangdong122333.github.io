const HTML_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character] ?? character);
}

const ABSOLUTE_URL = /^(?:https?:|mailto:|tel:)/i;

/** Keeps only URLs that cannot execute script when the HTML is pasted elsewhere. */
export function safeUrl(value: string): string | undefined {
  const url = value.trim();
  if (!url) return undefined;
  if (ABSOLUTE_URL.test(url)) return url;
  if (url.startsWith('#') || url.startsWith('/') || url.startsWith('./') || url.startsWith('../'))
    return url;
  return undefined;
}

/**
 * Converts Markdown to the semantic HTML a rich-text editor expects on the
 * clipboard. Raw HTML is escaped rather than passed through, so the output only
 * ever contains markup this module produced.
 */
export async function markdownToRichText(source: string): Promise<string> {
  const { Marked } = await import('marked');
  const marked = new Marked({ gfm: true, breaks: false });

  marked.use({
    renderer: {
      html(token) {
        const text = escapeHtml(token.text);
        return token.block ? `<p>${text}</p>\n` : text;
      },
      link(token) {
        const text = this.parser.parseInline(token.tokens);
        const href = safeUrl(token.href);
        if (!href) return text;
        const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
        return `<a href="${escapeHtml(href)}"${title}>${text}</a>`;
      },
      image(token) {
        const src = safeUrl(token.href);
        if (!src) return escapeHtml(token.text);
        const title = token.title ? ` title="${escapeHtml(token.title)}"` : '';
        return `<img src="${escapeHtml(src)}" alt="${escapeHtml(token.text)}"${title}>`;
      },
    },
  });

  return (await marked.parse(source)).trim();
}
