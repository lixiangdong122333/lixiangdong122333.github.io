import { Injectable } from '@angular/core';
import MiniSearch from 'minisearch';

import { CONTENT_DOCUMENTS } from '../../generated/content.generated';
import type { ContentDocument, ContentKind } from '../models/content';

function tokenize(value: string): string[] {
  const normalized = value.toLocaleLowerCase('zh-CN');
  const latinTokens = normalized.match(/[a-z\d]+/gu) ?? [];
  const cjkSequences = normalized.match(/[\u3400-\u9fff\uf900-\ufaff]+/gu) ?? [];
  const cjkTokens = cjkSequences.flatMap((sequence) => {
    const characters = [...sequence];
    const bigrams = characters
      .slice(0, -1)
      .map((character, index) => `${character}${characters[index + 1]}`);
    return [...characters, ...bigrams];
  });

  return [...latinTokens, ...cjkTokens];
}

@Injectable({ providedIn: 'root' })
export class ContentRepository {
  readonly documents: readonly ContentDocument[] = CONTENT_DOCUMENTS;
  readonly blogPosts = this.documents.filter((document) => document.kind === 'blog');
  readonly knowledgeEntries = this.documents.filter((document) => document.kind === 'knowledge');
  readonly featured = this.documents.filter((document) => document.featured);

  private readonly byId = new Map(this.documents.map((document) => [document.id, document]));
  private readonly searchIndex = new MiniSearch<ContentDocument>({
    fields: ['title', 'excerpt', 'plainText', 'tags', 'category'],
    storeFields: ['id'],
    tokenize,
  });

  constructor() {
    this.searchIndex.addAll([...this.documents]);
  }

  get(kind: ContentKind, slug: string): ContentDocument | undefined {
    return this.byId.get(`${kind}:${slug}`);
  }

  tags(kind: ContentKind): readonly string[] {
    const source = kind === 'blog' ? this.blogPosts : this.knowledgeEntries;
    return [...new Set(source.flatMap((document) => document.tags))].sort((left, right) =>
      left.localeCompare(right, 'zh-CN'),
    );
  }

  search(kind: ContentKind, query: string, tag = ''): readonly ContentDocument[] {
    const normalizedQuery = query.trim();
    const source = kind === 'blog' ? this.blogPosts : this.knowledgeEntries;
    const filteredByTag = tag ? source.filter((document) => document.tags.includes(tag)) : source;

    if (!normalizedQuery) {
      return filteredByTag;
    }

    const allowedIds = new Set(filteredByTag.map((document) => document.id));
    return this.searchIndex
      .search(normalizedQuery, {
        combineWith: 'AND',
        prefix: true,
        fuzzy: normalizedQuery.length >= 4 ? 0.2 : false,
      })
      .map((result) => this.byId.get(String(result.id)))
      .filter((document): document is ContentDocument =>
        Boolean(document && allowedIds.has(document.id)),
      );
  }
}
