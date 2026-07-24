import { ChangeDetectionStrategy, Component, inject, RESPONSE_INIT } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';

import { SeoService } from '../../core/services/seo';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, Icon, RouterLink],
  template: `
    <section class="flex min-h-[calc(100svh-256px)] items-center bg-slate-50 dark:bg-zinc-900">
      <div class="mx-auto w-full max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p class="font-mono text-lg font-semibold text-emerald-700 dark:text-emerald-300">404</p>
        <h1 class="mt-4 text-5xl font-bold tracking-normal text-slate-950 dark:text-white">
          这条路径没有内容
        </h1>
        <p class="mt-5 text-lg text-slate-600 dark:text-zinc-300">
          页面可能已移动，或地址并不存在。
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <a pButton routerLink="/" class="h-12 gap-2 border-2 px-5">
            <app-icon name="house" />
            返回首页
          </a>
          <a pButton routerLink="/blog" [outlined]="true" class="h-12 gap-2 border-2 px-5">
            <app-icon name="notebook" />
            浏览博客
          </a>
        </div>
      </div>
    </section>
  `,
})
export class NotFoundPage {
  constructor() {
    const responseInit = inject(RESPONSE_INIT);
    if (responseInit) {
      responseInit.status = 404;
    }

    inject(SeoService).update({
      title: '页面不存在',
      description: '请求的页面不存在。',
      path: '/404/',
      robots: 'noindex, nofollow',
    });
  }
}
