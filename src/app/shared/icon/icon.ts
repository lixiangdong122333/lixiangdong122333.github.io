import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type IconName =
  | 'accessibility'
  | 'arrow-right'
  | 'arrow-up-right'
  | 'book'
  | 'calendar'
  | 'check'
  | 'chevron-right'
  | 'clock'
  | 'code'
  | 'command'
  | 'copy'
  | 'external'
  | 'flask'
  | 'github'
  | 'house'
  | 'info'
  | 'layers'
  | 'link'
  | 'menu'
  | 'moon'
  | 'notebook'
  | 'palette'
  | 'rss'
  | 'search'
  | 'server'
  | 'sun'
  | 'tag'
  | 'terminal'
  | 'user'
  | 'x';

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-flex shrink-0 align-middle',
    '[class.size-4]': "size() === 'sm'",
    '[class.size-5]': "size() === 'md'",
    '[class.size-6]': "size() === 'lg'",
    '[attr.aria-hidden]': 'label() ? null : true',
    '[attr.aria-label]': 'label() || null',
    '[attr.role]': "label() ? 'img' : null",
  },
  template: `
    <svg class="size-full" aria-hidden="true" focusable="false">
      <use [attr.href]="href()" />
    </svg>
  `,
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly label = input('');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  protected readonly href = computed(() => `icons/lucide.svg#${this.name()}`);
}
