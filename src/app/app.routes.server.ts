import { PrerenderFallback, RenderMode, ServerRoute } from '@angular/ssr';

import { BLOG_POST_SLUGS, KNOWLEDGE_ENTRY_SLUGS } from './generated/content.generated';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },
  {
    path: 'blog/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,
    async getPrerenderParams() {
      return BLOG_POST_SLUGS.map((slug) => ({ slug }));
    },
  },
  { path: 'projects', renderMode: RenderMode.Prerender },
  { path: 'lab', renderMode: RenderMode.Prerender },
  { path: 'knowledge', renderMode: RenderMode.Prerender },
  {
    path: 'knowledge/:slug',
    renderMode: RenderMode.Prerender,
    fallback: PrerenderFallback.Server,
    async getPrerenderParams() {
      return KNOWLEDGE_ENTRY_SLUGS.map((slug) => ({ slug }));
    },
  },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: '404', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Server },
];
