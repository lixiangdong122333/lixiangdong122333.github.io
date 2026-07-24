import { ContentRepository } from './content-repository';

describe('ContentRepository', () => {
  const repository = new ContentRepository();

  it('finds Chinese content without whitespace token boundaries', () => {
    const results = repository.search('knowledge', '渲染模式');

    expect(results.some((document) => document.slug === 'angular-rendering-modes')).toBe(true);
  });

  it('combines a query with a tag filter', () => {
    const results = repository.search('blog', 'Angular', 'Angular');

    expect(results.length).toBeGreaterThan(0);
    expect(results.every((document) => document.tags.includes('Angular'))).toBe(true);
  });

  it('returns a document by kind and slug', () => {
    const document = repository.get('blog', 'angular-ssg-github-pages');

    expect(document?.title).toContain('Angular');
  });
});
