import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';

import type { ContentKind } from '../../core/models/content';
import { ContentRepository } from '../../core/services/content-repository';
import { SeoService } from '../../core/services/seo';
import { ContentCard } from '../../shared/content-card/content-card';
import { Icon } from '../../shared/icon/icon';
import { PageIntro } from '../../shared/page-intro/page-intro';

@Component({
  selector: 'app-content-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ContentCard, Icon, InputText, PageIntro, ReactiveFormsModule],
  template: `
    <app-page-intro
      [eyebrow]="copy.eyebrow"
      [title]="copy.title"
      [description]="copy.description"
      [icon]="copy.icon"
    />

    <section class="border-b-2 border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <label for="content-search" class="sr-only">检索{{ copy.title }}</label>
        <div class="relative max-w-2xl">
          <app-icon
            name="search"
            class="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-400"
          />
          <input
            pInputText
            id="content-search"
            type="search"
            [formControl]="searchControl"
            [placeholder]="copy.placeholder"
            class="h-12 w-full rounded-lg border-2 pl-12"
          />
        </div>

        <div class="mt-6 flex flex-wrap gap-2" aria-label="标签筛选">
          <button
            pButton
            type="button"
            [outlined]="activeTag() !== ''"
            [attr.aria-pressed]="activeTag() === ''"
            class="h-10 border-2 px-4"
            (click)="activeTag.set('')"
          >
            全部
          </button>
          @for (tag of tags; track tag) {
            <button
              pButton
              type="button"
              severity="secondary"
              [outlined]="activeTag() !== tag"
              [attr.aria-pressed]="activeTag() === tag"
              class="h-10 border-2 px-4"
              (click)="activeTag.set(activeTag() === tag ? '' : tag)"
            >
              {{ tag }}
            </button>
          }
        </div>
      </div>
    </section>

    <section class="bg-slate-50 dark:bg-zinc-900">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div class="mb-6 flex items-center justify-between gap-4">
          <p class="text-sm text-slate-500 dark:text-zinc-400">{{ results().length }} 条结果</p>
          @if (searchTerm() || activeTag()) {
            <button pButton type="button" [text]="true" class="h-10 px-3" (click)="clearFilters()">
              清除筛选
            </button>
          }
        </div>

        @if (results().length > 0) {
          <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            @for (document of results(); track document.id) {
              <app-content-card [document]="document" />
            }
          </div>
        } @else {
          <div
            class="rounded-lg border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-zinc-700 dark:bg-zinc-950"
          >
            <app-icon name="search" size="lg" class="mx-auto text-slate-400" />
            <h2 class="mt-4 text-xl font-semibold tracking-normal text-slate-950 dark:text-white">
              没有匹配内容
            </h2>
            <p class="mt-2 text-sm text-slate-500 dark:text-zinc-400">换一个关键词或标签。</p>
          </div>
        }
      </div>
    </section>
  `,
})
export class ContentListPage {
  private readonly repository = inject(ContentRepository);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);

  protected readonly kind: ContentKind =
    this.route.snapshot.data['kind'] === 'knowledge' ? 'knowledge' : 'blog';
  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly searchTerm = toSignal(this.searchControl.valueChanges, {
    initialValue: this.searchControl.value,
  });
  protected readonly activeTag = signal('');
  protected readonly tags = this.repository.tags(this.kind);
  protected readonly results = computed(() =>
    this.repository.search(this.kind, this.searchTerm(), this.activeTag()),
  );
  protected readonly copy =
    this.kind === 'blog'
      ? {
          eyebrow: 'Writing',
          title: '博客',
          description: '关于工程实践、系统设计与开发过程中的判断记录。',
          placeholder: '搜索文章、标签或正文',
          icon: 'notebook' as const,
        }
      : {
          eyebrow: 'Knowledge Base',
          title: '知识库',
          description: '可复用的技术笔记、排障路径与检查清单。',
          placeholder: '搜索主题、标签或正文',
          icon: 'book' as const,
        };

  constructor() {
    this.seo.update({
      title: this.copy.title,
      description: this.copy.description,
      path: `/${this.kind}/`,
    });
  }

  protected clearFilters(): void {
    this.searchControl.setValue('');
    this.activeTag.set('');
  }
}
