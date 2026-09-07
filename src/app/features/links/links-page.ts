import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Tag } from 'primeng/tag';

import { SeoService } from '../../core/services/seo';
import { SITE_CONFIG } from '../../generated/site.generated';
import { FRIEND_LINKS } from '../../generated/links.generated';
import { Icon } from '../../shared/icon/icon';
import { PageIntro } from '../../shared/page-intro/page-intro';

@Component({
  selector: 'app-links-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, PageIntro, Tag],
  template: `
    <app-page-intro
      eyebrow="Friend Links"
      title="友情链接"
      description="值得长期关注的朋友与他们的站点：工具、项目与认真维护的内容。"
      icon="link"
    />
    <section class="bg-white dark:bg-zinc-950">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p class="mb-6 text-sm text-slate-500 dark:text-zinc-400">{{ links.length }} 个友情站点</p>
        <ul class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          @for (link of links; track link.url) {
            <li>
              <article
                class="relative flex h-full flex-col rounded-lg border-2 border-slate-200 bg-white p-6 transition-colors hover:border-emerald-400 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-700"
              >
                <div class="flex items-start justify-between gap-4">
                  <h2 class="text-xl font-semibold tracking-normal text-slate-950 dark:text-white">
                    <a
                      [href]="link.url"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="rounded-lg transition-colors after:absolute after:inset-0 after:rounded-lg hover:text-emerald-700 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-emerald-500 dark:hover:text-emerald-300"
                      >{{ link.name }}</a
                    >
                  </h2>
                  <app-icon name="external" size="sm" class="mt-1 text-slate-400" />
                </div>
                @if (link.author) {
                  <p class="mt-2 text-sm font-medium text-slate-500 dark:text-zinc-400">
                    {{ link.author }}
                  </p>
                }
                <p class="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-zinc-300">
                  {{ link.description }}
                </p>
                @if (link.tags.length > 0) {
                  <div class="mt-5 flex flex-wrap gap-2">
                    @for (tag of link.tags; track tag) {
                      <p-tag [value]="tag" severity="secondary" />
                    }
                  </div>
                }
              </article>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class LinksPage {
  protected readonly links = FRIEND_LINKS;

  constructor() {
    inject(SeoService).update({
      title: '友情链接',
      description: `${SITE_CONFIG.name}的友情链接：朋友们的站点、工具与值得关注的开源项目。`,
      path: '/links/',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: `${SITE_CONFIG.name}友情链接`,
        itemListElement: FRIEND_LINKS.map((link, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: link.name,
          url: link.url,
        })),
      },
    });
  }
}
