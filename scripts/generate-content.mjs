import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import matter from 'gray-matter';
import { imageSize } from 'image-size';
import { toString as mdastToString } from 'mdast-util-to-string';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { z } from 'zod';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDirectory = path.join(root, 'content');
const publicDirectory = path.join(root, 'public');
const generatedDirectory = path.join(root, 'src', 'app', 'generated');
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const siteUrl = (process.env.SITE_URL || config.siteUrl).replace(/\/$/, '');
const configuredBaseHref = process.env.BASE_HREF || '/';
const baseHref =
  configuredBaseHref === '/' ? '/' : `/${configuredBaseHref.replace(/^\/+|\/+$/g, '')}/`;

const dateSchema = z
  .union([z.string(), z.date()])
  .transform((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));

const frontmatterSchema = z
  .object({
    title: z.string().min(4),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    excerpt: z.string().min(20).max(240),
    publishedAt: dateSchema,
    updatedAt: dateSchema.optional(),
    tags: z.array(z.string().min(1)).min(1),
    category: z.string().min(1),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  })
  .strict();

const markdownParser = unified().use(remarkParse).use(remarkGfm).use(remarkMath);

function rehypeMermaidBlocks() {
  return (tree) => {
    visit(tree, 'element', (node) => {
      if (node.tagName !== 'pre' || node.children.length !== 1) {
        return;
      }

      const code = node.children[0];
      const classes = code.type === 'element' ? code.properties?.className : undefined;
      if (
        code.type !== 'element' ||
        code.tagName !== 'code' ||
        !Array.isArray(classes) ||
        !classes.includes('language-mermaid')
      ) {
        return;
      }

      node.tagName = 'div';
      node.properties = { className: ['mermaid'] };
      node.children = code.children;
    });
  };
}

function rehypeRouteFragmentLinks(route) {
  return (tree) => {
    visit(tree, 'element', (node) => {
      const href = node.tagName === 'a' ? node.properties?.href : undefined;
      if (typeof href === 'string' && href.startsWith('#')) {
        node.properties.href = `${route}${href}`;
      }
    });
  };
}

function createHtmlCompiler(route) {
  return unified()
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeSanitize)
    .use(rehypeMermaidBlocks)
    .use(rehypeKatex)
    .use(rehypeHighlight, { detect: false })
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
      properties: { className: ['heading-anchor'] },
    })
    .use(rehypeRouteFragmentLinks, route)
    .use(rehypeStringify);
}

async function compileHtml(nodes, route) {
  if (nodes.length === 0) {
    return '';
  }

  const htmlCompiler = createHtmlCompiler(route);
  const tree = await htmlCompiler.run({ type: 'root', children: nodes });
  return htmlCompiler.stringify(tree);
}

async function listMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory() ? listMarkdownFiles(target) : target;
    }),
  );

  return files.flat().filter((file) => file.endsWith('.md'));
}

async function createImageBlock(image) {
  const normalizedSource = image.url.replaceAll('\\', '/').replace(/^\.\//, '');
  if (
    normalizedSource.startsWith('/') ||
    normalizedSource.includes('..') ||
    /^[a-z][a-z\d+.-]*:/i.test(normalizedSource)
  ) {
    throw new Error(`Markdown images must use a local public path: ${image.url}`);
  }

  const absolutePath = path.resolve(publicDirectory, normalizedSource);
  if (!absolutePath.startsWith(`${publicDirectory}${path.sep}`)) {
    throw new Error(`Markdown image escapes public/: ${image.url}`);
  }

  const dimensions = imageSize(await readFile(absolutePath));
  if (!dimensions.width || !dimensions.height) {
    throw new Error(`Unable to determine image dimensions: ${image.url}`);
  }

  return {
    kind: 'image',
    src: normalizedSource,
    alt: image.alt || '',
    ...(image.title ? { caption: image.title } : {}),
    width: dimensions.width,
    height: dimensions.height,
  };
}

async function compileBlocks(markdown, sourcePath, title, route) {
  const parsed = markdownParser.parse(markdown);
  const mdast = await markdownParser.run(parsed);
  const firstNode = mdast.children[0];
  if (
    firstNode?.type === 'heading' &&
    firstNode.depth === 1 &&
    mdastToString(firstNode).trim() === title.trim()
  ) {
    mdast.children.shift();
  }
  const standaloneImages = new Set();

  for (const node of mdast.children) {
    if (
      node.type === 'paragraph' &&
      node.children.length === 1 &&
      node.children[0].type === 'image'
    ) {
      standaloneImages.add(node.children[0]);
    }
  }

  let imageCount = 0;
  visit(mdast, 'image', () => {
    imageCount += 1;
  });
  if (imageCount !== standaloneImages.size) {
    throw new Error(`Images must be placed in their own paragraph: ${sourcePath}`);
  }

  const blocks = [];
  let htmlNodes = [];

  const flushHtml = async () => {
    const html = await compileHtml(htmlNodes, route);
    if (html) {
      blocks.push({ kind: 'html', html });
    }
    htmlNodes = [];
  };

  for (const node of mdast.children) {
    if (
      node.type === 'paragraph' &&
      node.children.length === 1 &&
      node.children[0].type === 'image'
    ) {
      await flushHtml();
      blocks.push(await createImageBlock(node.children[0]));
    } else {
      htmlNodes.push(node);
    }
  }
  await flushHtml();

  return { blocks, plainText: mdastToString(mdast).replace(/\s+/g, ' ').trim() };
}

function calculateReadingMinutes(text) {
  const cjkCount = text.match(/[\u3400-\u9fff\uf900-\ufaff]/gu)?.length ?? 0;
  const latinCount =
    text.replace(/[\u3400-\u9fff\uf900-\ufaff]/gu, ' ').match(/[\p{L}\p{N}]+/gu)?.length ?? 0;
  return Math.max(1, Math.ceil((cjkCount + latinCount) / 300));
}

function serialize(value) {
  return JSON.stringify(value, null, 2).replaceAll('</script', '<\\/script');
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function generateLucideSprite() {
  const lucide = await import('lucide');
  const icons = {
    accessibility: 'Accessibility',
    'arrow-right': 'ArrowRight',
    'arrow-up-right': 'ArrowUpRight',
    book: 'BookOpen',
    calendar: 'CalendarDays',
    check: 'Check',
    'chevron-right': 'ChevronRight',
    clock: 'Clock3',
    code: 'Code2',
    command: 'Command',
    copy: 'Copy',
    external: 'ExternalLink',
    flask: 'FlaskConical',
    github: 'GitFork',
    house: 'House',
    info: 'Info',
    layers: 'Layers3',
    link: 'Link',
    menu: 'Menu',
    moon: 'Moon',
    notebook: 'NotebookTabs',
    palette: 'Palette',
    rss: 'Rss',
    search: 'Search',
    server: 'ServerCog',
    sun: 'Sun',
    tag: 'Tag',
    terminal: 'Terminal',
    user: 'UserRound',
    x: 'X',
  };

  const attributeName = (name) => name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const escapeAttribute = (value) => escapeXml(String(value));
  const symbols = Object.entries(icons).map(([id, exportName]) => {
    const icon = lucide[exportName];
    if (!Array.isArray(icon)) {
      throw new Error(`Lucide icon export not found: ${exportName}`);
    }
    const elements = icon
      .map(([tag, attributes]) => {
        const serializedAttributes = Object.entries(attributes)
          .map(([name, value]) => `${attributeName(name)}="${escapeAttribute(value)}"`)
          .join(' ');
        return `<${tag} ${serializedAttributes}/>`;
      })
      .join('');
    return `<symbol id="${id}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${elements}</symbol>`;
  });

  await mkdir(path.join(publicDirectory, 'icons'), { recursive: true });
  await writeFile(
    path.join(publicDirectory, 'icons', 'lucide.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg"><defs>${symbols.join('')}</defs></svg>`,
    'utf8',
  );
}

const sourceFiles = await listMarkdownFiles(contentDirectory);
const documents = [];

for (const sourceFile of sourceFiles) {
  const kind = path.relative(contentDirectory, sourceFile).split(path.sep)[0];
  if (kind !== 'blog' && kind !== 'knowledge') {
    throw new Error(`Unsupported content directory: ${kind}`);
  }

  const source = await readFile(sourceFile, 'utf8');
  const parsed = matter(source);
  const metadata = frontmatterSchema.parse(parsed.data);
  const { blocks, plainText } = await compileBlocks(
    parsed.content,
    sourceFile,
    metadata.title,
    `${baseHref}${kind}/${metadata.slug}/`,
  );

  documents.push({
    id: `${kind}:${metadata.slug}`,
    kind,
    ...metadata,
    readingMinutes: calculateReadingMinutes(plainText),
    plainText,
    blocks,
  });
}

documents.sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
const publishedDocuments = documents.filter((document) => !document.draft);
const duplicateIds = publishedDocuments.filter(
  (document, index) =>
    publishedDocuments.findIndex((candidate) => candidate.id === document.id) !== index,
);
if (duplicateIds.length > 0) {
  throw new Error(`Duplicate content id: ${duplicateIds[0].id}`);
}

await mkdir(generatedDirectory, { recursive: true });
await writeFile(
  path.join(generatedDirectory, 'content.generated.ts'),
  `import type { ContentDocument } from '../core/models/content';\n\nexport const CONTENT_DOCUMENTS = ${serialize(publishedDocuments)} as const satisfies readonly ContentDocument[];\n\nexport const BLOG_POST_SLUGS = ${serialize(publishedDocuments.filter((document) => document.kind === 'blog').map((document) => document.slug))} as const;\n\nexport const KNOWLEDGE_ENTRY_SLUGS = ${serialize(publishedDocuments.filter((document) => document.kind === 'knowledge').map((document) => document.slug))} as const;\n`,
  'utf8',
);
await writeFile(
  path.join(generatedDirectory, 'site.generated.ts'),
  `import type { SiteConfig } from '../core/models/site';\n\nexport const SITE_CONFIG = ${serialize({ ...config, siteUrl })} as const satisfies SiteConfig;\n`,
  'utf8',
);
await writeFile(
  path.join(generatedDirectory, 'license.generated.ts'),
  `export const PRIMEUI_LICENSE = ${serialize(process.env.PRIMEUI_LICENSE_KEY || '')};\n`,
  'utf8',
);

const staticRoutes = ['', '/blog/', '/projects/', '/lab/', '/knowledge/', '/about/'];
const contentRoutes = publishedDocuments.map((document) => `/${document.kind}/${document.slug}/`);
const urls = [...staticRoutes, ...contentRoutes];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
  .map((route) => {
    const document = publishedDocuments.find((item) => `/${item.kind}/${item.slug}/` === route);
    const lastmod = document?.updatedAt ?? document?.publishedAt;
    const normalizedRoute = route || '/';
    return `  <url><loc>${escapeXml(`${siteUrl}${normalizedRoute}`)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
  })
  .join('\n')}\n</urlset>\n`;
await writeFile(path.join(publicDirectory, 'sitemap.xml'), sitemap, 'utf8');

const blogPosts = publishedDocuments.filter((document) => document.kind === 'blog');
const rss = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${escapeXml(config.name)}</title><link>${escapeXml(`${siteUrl}/`)}</link><description>${escapeXml(config.description)}</description><language>${escapeXml(config.locale)}</language>${blogPosts
  .map(
    (post) =>
      `<item><title>${escapeXml(post.title)}</title><link>${escapeXml(`${siteUrl}/blog/${post.slug}/`)}</link><guid>${escapeXml(`${siteUrl}/blog/${post.slug}/`)}</guid><pubDate>${new Date(`${post.publishedAt}T00:00:00Z`).toUTCString()}</pubDate><description>${escapeXml(post.excerpt)}</description>${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('')}</item>`,
  )
  .join('')}</channel></rss>\n`;
await writeFile(path.join(publicDirectory, 'rss.xml'), rss, 'utf8');
await writeFile(
  path.join(publicDirectory, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
  'utf8',
);
await generateLucideSprite();

console.log(`Generated ${publishedDocuments.length} content documents for ${siteUrl}`);
