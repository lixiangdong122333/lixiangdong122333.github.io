import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../generated/site.generated';
import { Icon } from '../shared/icon/icon';

@Component({
  selector: 'app-site-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RouterLink],
  template: `
    <footer class="border-t-2 border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div class="max-w-xl">
          <p class="text-lg font-semibold tracking-normal text-slate-950 dark:text-white">
            {{ site.name }}
          </p>
          <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
            {{ site.description }}
          </p>
        </div>
        <nav class="grid grid-cols-2 gap-x-8 gap-y-3 text-sm" aria-label="页脚导航">
          <a
            routerLink="/blog"
            class="text-slate-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300"
            >博客</a
          >
          <a
            routerLink="/knowledge"
            class="text-slate-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300"
            >知识库</a
          >
          <a
            routerLink="/projects"
            class="text-slate-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300"
            >项目</a
          >
          <a
            routerLink="/about"
            class="text-slate-600 hover:text-emerald-700 dark:text-zinc-400 dark:hover:text-emerald-300"
            >关于</a
          >
        </nav>
      </div>
      <div class="border-t-2 border-slate-200 dark:border-zinc-800">
        <div
          class="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8 dark:text-zinc-500"
        >
          <span>© {{ currentYear }} {{ site.author }}. 内容与代码同源。</span>
          <div class="flex items-center gap-4">
            <a
              href="rss.xml"
              class="inline-flex items-center gap-2 hover:text-emerald-700 dark:hover:text-emerald-300"
            >
              <app-icon name="rss" size="sm" />
              RSS
            </a>
            <a href="sitemap.xml" class="hover:text-emerald-700 dark:hover:text-emerald-300"
              >Sitemap</a
            >
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class SiteFooter {
  protected readonly site = SITE_CONFIG;
  protected readonly currentYear = new Date().getUTCFullYear();
}
