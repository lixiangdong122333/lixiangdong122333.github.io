export type ContentKind = 'blog' | 'knowledge';

export interface HtmlContentBlock {
  readonly kind: 'html';
  readonly html: string;
}

export interface ImageContentBlock {
  readonly kind: 'image';
  readonly src: string;
  readonly alt: string;
  readonly caption?: string;
  readonly width: number;
  readonly height: number;
}

export type ContentBlock = HtmlContentBlock | ImageContentBlock;

export interface ContentDocument {
  readonly id: string;
  readonly kind: ContentKind;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly publishedAt: string;
  readonly updatedAt?: string;
  readonly tags: readonly string[];
  readonly category: string;
  readonly featured: boolean;
  readonly draft: boolean;
  readonly readingMinutes: number;
  readonly plainText: string;
  readonly blocks: readonly ContentBlock[];
}
