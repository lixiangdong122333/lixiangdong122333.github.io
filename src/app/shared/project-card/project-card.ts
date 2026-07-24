import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';

import type { Project } from '../../features/projects/project-data';
import { Icon } from '../icon/icon';

@Component({
  selector: 'app-project-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, Icon, Tag],
  host: { class: 'block h-full' },
  template: `
    <article
      class="flex h-full flex-col rounded-lg border-2 border-slate-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-normal text-emerald-700 dark:text-emerald-300"
          >
            Open source
          </p>
          <h2 class="mt-2 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
            {{ project().name }}
          </h2>
        </div>
        <app-icon name="github" size="lg" />
      </div>
      <p class="mt-4 flex-1 text-sm leading-6 text-slate-600 dark:text-zinc-300">
        {{ project().description }}
      </p>
      <div class="mt-6 flex flex-wrap gap-2">
        @for (technology of project().stack; track technology) {
          <p-tag [value]="technology" severity="secondary" />
        }
      </div>
      <ul class="mt-6 space-y-2 text-sm text-slate-600 dark:text-zinc-300">
        @for (highlight of project().highlights; track highlight) {
          <li class="flex items-start gap-2">
            <app-icon name="check" size="sm" class="mt-1 text-emerald-600" />
            <span>{{ highlight }}</span>
          </li>
        }
      </ul>
      <div
        class="mt-6 flex items-center justify-between gap-4 border-t-2 border-slate-100 pt-4 dark:border-zinc-800"
      >
        <span class="text-xs text-slate-500 dark:text-zinc-500"
          >更新于 {{ project().updatedAt }}</span
        >
        <a
          pButton
          [href]="project().url"
          target="_blank"
          rel="noreferrer"
          [text]="true"
          class="h-10 gap-2 px-3"
        >
          查看源码
          <app-icon name="arrow-up-right" size="sm" />
        </a>
      </div>
    </article>
  `,
})
export class ProjectCard {
  readonly project = input.required<Project>();
}
