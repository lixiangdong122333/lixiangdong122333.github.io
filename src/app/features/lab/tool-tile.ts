import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';
import type { LabTool } from './tool-model';

@Component({
  selector: 'app-tool-tile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  host: { class: 'min-w-0' },
  template: `
    <a
      [routerLink]="['/lab', tool().id]"
      class="group flex h-full min-h-28 items-start gap-4 rounded-lg border-2 border-slate-200 bg-white p-4 transition-colors hover:border-emerald-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-emerald-500"
    >
      <app-icon [name]="tool().icon" class="mt-1 text-emerald-700 dark:text-emerald-300" />
      <span class="min-w-0 flex-1"
        ><strong class="block text-base text-slate-900 dark:text-white">{{ tool().nameZh }}</strong>
        <span class="mt-1 block text-xs leading-4 text-slate-600 dark:text-zinc-400">{{
          tool().name
        }}</span>
        <span class="mt-2 block text-sm leading-5 text-slate-600 dark:text-zinc-400">{{
          tool().description
        }}</span></span
      >
      <app-icon
        name="arrow-up-right"
        size="sm"
        class="mt-1 text-slate-500 group-hover:text-emerald-700 dark:text-zinc-400"
      />
    </a>
  `,
})
export class ToolTile {
  readonly tool = input.required<LabTool>();
}
