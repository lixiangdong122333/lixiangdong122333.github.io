import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { Icon } from '../../shared/icon/icon';
import { LAB_TOOLS } from './tool-registry';

export function searchTools(query: string) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return LAB_TOOLS.filter((tool) => {
    const text = [tool.name, tool.nameZh, tool.description, ...tool.keywords]
      .join(' ')
      .toLowerCase();
    return terms.every((term) => text.includes(term));
  });
}

@Component({
  selector: 'app-tool-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, RouterLink, InputTextModule, Icon],
  template: `
    <div class="relative">
      <app-icon
        name="search"
        class="pointer-events-none absolute left-4 top-4 z-10 text-slate-500"
      />
      <input
        #searchInput
        pInputText
        [formControl]="control"
        (input)="active.set(0)"
        (keydown)="handleKey($event)"
        aria-label="搜索工具"
        placeholder="搜索工具，例如 JSON、时间戳、SQL"
        class="h-12 w-full border-2! pl-12! text-base!"
        autocomplete="off"
      />
    </div>
    @if (query().trim() || expanded()) {
      <p class="sr-only" role="status">{{ results().length }} 个匹配工具</p>
      <div class="mt-4 max-h-80 overflow-y-auto" (keydown)="handleKey($event)">
        @for (tool of results(); track tool.id; let index = $index) {
          <a
            #resultLink
            [routerLink]="['/lab', tool.id]"
            (click)="chosen.emit()"
            class="flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-slate-900 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-emerald-700 dark:text-white dark:hover:bg-zinc-800"
            [class.bg-slate-100]="index === active()"
            [class.dark:bg-zinc-800]="index === active()"
            [attr.data-search-index]="index"
          >
            <app-icon [name]="tool.icon" />
            <span class="min-w-0 flex-1"
              ><strong class="block text-sm">{{ tool.nameZh }}</strong>
              <span class="block text-xs text-slate-600 dark:text-zinc-400">{{
                tool.name
              }}</span></span
            >
            <app-icon name="arrow-right" size="sm" />
          </a>
        } @empty {
          <p class="py-6 text-sm text-slate-600 dark:text-zinc-400">没有找到匹配的工具。</p>
        }
      </div>
    }
  `,
})
export class ToolSearch {
  readonly expanded = input(false);
  readonly chosen = output();
  readonly control = new FormControl('', { nonNullable: true });
  readonly query = toSignal(this.control.valueChanges, { initialValue: '' });
  readonly results = computed(() => searchTools(this.query()));
  readonly active = signal(0);
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  focus(): void {
    this.searchInput()?.nativeElement.focus();
  }

  handleKey(event: KeyboardEvent): void {
    const links =
      this.searchInput()?.nativeElement.parentElement?.parentElement?.querySelectorAll<HTMLAnchorElement>(
        '[data-search-index]',
      );
    if (!links?.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const current =
        event.target instanceof HTMLAnchorElement
          ? Number(event.target.dataset['searchIndex'])
          : -1;
      const next =
        current < 0
          ? event.key === 'ArrowDown'
            ? 0
            : links.length - 1
          : (current + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
      this.active.set(next);
      links[next].focus();
    } else if (event.key === 'Enter' && event.target === this.searchInput()?.nativeElement) {
      event.preventDefault();
      links[this.active()]?.click();
    } else if (event.key === 'Escape') {
      this.control.reset();
      this.focus();
    }
  }
}
