import { NgOptimizedImage } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  RESPONSE_INIT,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, type SafeHtml } from '@angular/platform-browser';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';

import type { ContentKind } from '../../core/models/content';
import { ContentRepository } from '../../core/services/content-repository';
import { SeoService } from '../../core/services/seo';
import { ThemeService } from '../../core/services/theme';
import { SITE_CONFIG } from '../../generated/site.generated';
import { Icon } from '../../shared/icon/icon';

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'UTC',
});

@Component({
  selector: 'app-content-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, Icon, NgOptimizedImage, RouterLink, Tag],
  template: `
    @if (document(); as entry) {
      <article #article data-pagefind-body>
        <header
          class="border-b-2 border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <a
              [routerLink]="['/', kind]"
              class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300"
            >
              <app-icon name="arrow-right" size="sm" class="rotate-180" />
              返回{{ kind === 'blog' ? '博客' : '知识库' }}
            </a>
            <div class="mt-8 flex flex-wrap items-center gap-2">
              <p-tag [value]="entry.category" />
              @for (tag of entry.tags; track tag) {
                <span
                  data-pagefind-filter="tag"
                  class="text-sm font-medium text-slate-500 dark:text-zinc-400"
                  >#{{ tag }}</span
                >
              }
            </div>
            <h1
              class="mt-6 text-4xl font-bold leading-10 tracking-normal text-slate-950 sm:text-5xl sm:leading-12 dark:text-white"
            >
              {{ entry.title }}
            </h1>
            <p class="mt-5 text-lg leading-8 text-slate-600 dark:text-zinc-300">
              {{ entry.excerpt }}
            </p>
            <div class="mt-6 flex flex-wrap gap-5 text-sm text-slate-500 dark:text-zinc-400">
              <span class="inline-flex items-center gap-2">
                <app-icon name="calendar" size="sm" />
                {{ formatDate(entry.publishedAt) }}
              </span>
              <span class="inline-flex items-center gap-2">
                <app-icon name="clock" size="sm" />
                {{ entry.readingMinutes }} 分钟阅读
              </span>
            </div>
          </div>
        </header>

        <div class="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          @for (block of entry.blocks; track $index) {
            @if (block.kind === 'html') {
              <div
                class="prose prose-slate max-w-none prose-headings:tracking-normal prose-a:text-emerald-700 prose-a:decoration-2 prose-pre:rounded-lg prose-pre:border-2 prose-pre:border-zinc-700 dark:prose-invert dark:prose-a:text-emerald-300 [&_.mermaid]:my-8 [&_.mermaid]:overflow-x-auto [&_.mermaid]:rounded-lg [&_.mermaid]:border-2 [&_.mermaid]:border-slate-200 [&_.mermaid]:bg-white [&_.mermaid]:p-4 [&_.mermaid_svg]:mx-auto [&_.mermaid_svg]:max-w-full dark:[&_.mermaid]:border-zinc-700 dark:[&_.mermaid]:bg-zinc-900"
                [innerHTML]="renderCompiledHtml(block.html)"
              ></div>
            } @else {
              <figure class="my-10">
                <img
                  [ngSrc]="block.src"
                  [width]="block.width"
                  [height]="block.height"
                  [alt]="block.alt"
                  class="h-auto w-full rounded-lg object-cover"
                />
                @if (block.caption) {
                  <figcaption class="mt-3 text-center text-sm text-slate-500 dark:text-zinc-400">
                    {{ block.caption }}
                  </figcaption>
                }
              </figure>
            }
          }

          @if (diagramError()) {
            <div
              class="mt-8 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
            >
              图表渲染失败，源码内容仍保留在页面中。
            </div>
          }

          <footer
            class="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-2 border-slate-200 pt-8 dark:border-zinc-800"
          >
            <p class="text-sm text-slate-500 dark:text-zinc-400">
              最后更新：{{ formatDate(entry.updatedAt ?? entry.publishedAt) }}
            </p>
            <a
              pButton
              [routerLink]="['/', kind]"
              [outlined]="true"
              class="h-10 gap-2 border-2 px-4"
            >
              返回列表
              <app-icon name="arrow-right" size="sm" />
            </a>
          </footer>
        </div>
      </article>
    } @else {
      <section class="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 class="text-4xl font-bold tracking-normal text-slate-950 dark:text-white">
          内容不存在
        </h1>
        <a pButton [routerLink]="['/', kind]" class="mt-8 h-12 border-2 px-5">返回列表</a>
      </section>
    }
  `,
})
export class ContentDetailPage {
  private readonly repository = inject(ContentRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly theme = inject(ThemeService);
  private readonly responseInit = inject(RESPONSE_INIT);
  private readonly article = viewChild<ElementRef<HTMLElement>>('article');
  private readonly paramMap = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  protected readonly kind: ContentKind =
    this.route.snapshot.data['kind'] === 'knowledge' ? 'knowledge' : 'blog';
  protected readonly document = computed(() =>
    this.repository.get(this.kind, this.paramMap().get('slug') ?? ''),
  );
  protected readonly diagramError = signal(false);
  protected readonly formatDate = (date: string) =>
    dateFormatter.format(new Date(`${date}T00:00:00Z`));
  // Raw HTML is removed before rehype adds trusted KaTeX and highlighting markup at build time.
  protected readonly renderCompiledHtml = (html: string): SafeHtml =>
    this.sanitizer.bypassSecurityTrustHtml(html);

  constructor() {
    effect(() => {
      const entry = this.document();
      if (!entry) {
        const slug = this.paramMap().get('slug') ?? '';
        if (this.responseInit) {
          this.responseInit.status = 404;
        }
        this.seo.update({
          title: '内容不存在',
          description: '请求的内容不存在。',
          path: `/${this.kind}/${slug}/`,
          robots: 'noindex, nofollow',
        });
        return;
      }

      const path = `/${entry.kind}/${entry.slug}/`;
      this.seo.update({
        title: entry.title,
        description: entry.excerpt,
        path,
        type: 'article',
        structuredData: {
          '@context': 'https://schema.org',
          '@type': entry.kind === 'blog' ? 'BlogPosting' : 'TechArticle',
          headline: entry.title,
          description: entry.excerpt,
          datePublished: entry.publishedAt,
          dateModified: entry.updatedAt ?? entry.publishedAt,
          mainEntityOfPage: `${SITE_CONFIG.siteUrl}${path}`,
          author: { '@type': 'Person', name: SITE_CONFIG.author },
          keywords: entry.tags.join(', '),
        },
      });
    });

    afterNextRender(async () => {
      const nodes = [
        ...(this.article()?.nativeElement.querySelectorAll<HTMLElement>('.mermaid') ?? []),
      ];
      if (nodes.length === 0) {
        return;
      }

      try {
        const { default: mermaid } = await import('mermaid');
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          htmlLabels: false,
          deterministicIds: true,
          theme: this.theme.isDark() ? 'dark' : 'neutral',
        });
        await mermaid.run({ nodes });
      } catch {
        this.diagramError.set(true);
      }
    });
  }
}
