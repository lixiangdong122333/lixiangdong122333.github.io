import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon, type IconName } from '../icon/icon';

@Component({
  selector: 'app-page-intro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <section class="border-b-2 border-slate-200 bg-slate-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div
          class="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
        >
          <app-icon [name]="icon()" />
          <span>{{ eyebrow() }}</span>
        </div>
        <h1
          class="mt-4 max-w-4xl text-4xl font-bold leading-10 tracking-normal text-slate-950 sm:text-5xl sm:leading-12 dark:text-white"
        >
          {{ title() }}
        </h1>
        <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-zinc-300">
          {{ description() }}
        </p>
      </div>
    </section>
  `,
})
export class PageIntro {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly icon = input.required<IconName>();
}
