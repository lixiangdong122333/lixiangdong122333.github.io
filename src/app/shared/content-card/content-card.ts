import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tag } from 'primeng/tag';

import type { ContentDocument } from '../../core/models/content';
import { Icon } from '../icon/icon';

const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

@Component({
  selector: 'app-content-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, RouterLink, Tag],
  host: { class: 'block h-full' },
  template: `
    <article
      class="group relative flex h-full flex-col rounded-lg border-2 border-slate-200 bg-white p-6 transition-colors hover:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500"
    >
      <div class="flex flex-wrap items-center gap-2">
        <p-tag [value]="document().category" severity="secondary" />
        @for (tag of document().tags.slice(0, 2); track tag) {
          <span class="text-xs font-medium text-slate-500 dark:text-zinc-400">#{{ tag }}</span>
        }
      </div>
      <h2
        class="mt-4 text-xl font-semibold leading-7 tracking-normal text-slate-950 dark:text-white"
      >
        <a
          [routerLink]="['/', document().kind, document().slug]"
          class="rounded-sm outline-none after:absolute after:inset-0 focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          {{ document().title }}
        </a>
      </h2>
      <p class="mt-3 flex-1 text-sm leading-6 text-slate-600 dark:text-zinc-300">
        {{ document().excerpt }}
      </p>
      <div class="mt-6 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-zinc-500">
        <span class="inline-flex items-center gap-2">
          <app-icon name="calendar" size="sm" />
          {{ formatDate(document().publishedAt) }}
        </span>
        <span class="inline-flex items-center gap-2">
          <app-icon name="clock" size="sm" />
          {{ document().readingMinutes }} 分钟
        </span>
        <span
          class="ml-auto inline-flex items-center gap-2 font-semibold text-emerald-700 group-hover:text-emerald-800 dark:text-emerald-300"
        >
          阅读
          <app-icon name="arrow-right" size="sm" />
        </span>
      </div>
    </article>
  `,
})
export class ContentCard {
  readonly document = input.required<ContentDocument>();
  protected readonly formatDate = (date: string) =>
    dateFormatter.format(new Date(`${date}T00:00:00Z`));
}
