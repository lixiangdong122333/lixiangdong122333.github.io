import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

import { BLOG_POST_SLUGS, KNOWLEDGE_ENTRY_SLUGS } from './generated/content.generated';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return BLOG_POST_SLUGS.map((slug) => ({ slug }));
    },
  },
  {
    path: 'knowledge/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.None,
    async getPrerenderParams() {
      return KNOWLEDGE_ENTRY_SLUGS.map((slug) => ({ slug }));
    },
  },
  { path: '**', renderMode: RenderMode.Prerender },
];
