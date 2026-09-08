import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Slider } from 'primeng/slider';

import { Icon } from '../../../shared/icon/icon';

export function channelLuminance(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function parseHexColor(hex: string): readonly [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

export function calculateContrastRatio(foreground: string, background: string): number {
  const luminance = (color: string) => {
    const [red, green, blue] = parseHexColor(color);
    return (
      0.2126 * channelLuminance(red) +
      0.7152 * channelLuminance(green) +
      0.0722 * channelLuminance(blue)
    );
  };
  const first = luminance(foreground);
  const second = luminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

@Component({
  selector: 'app-contrast-tool',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, ReactiveFormsModule, Slider],
  template: `
    <div class="grid gap-8 p-4 sm:p-6 lg:grid-cols-2">
      <div class="space-y-6">
        <div>
          <label
            for="foreground"
            class="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-200"
            >前景色</label
          >
          <div class="flex items-center gap-3">
            <input
              id="foreground"
              type="color"
              [formControl]="foregroundControl"
              class="h-12 w-16 rounded-lg border-2 border-slate-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <code class="font-mono text-sm">{{ foreground() }}</code>
          </div>
        </div>
        <div>
          <label
            for="background"
            class="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-200"
            >背景色</label
          >
          <div class="flex items-center gap-3">
            <input
              id="background"
              type="color"
              [formControl]="backgroundControl"
              class="h-12 w-16 rounded-lg border-2 border-slate-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900"
            />
            <code class="font-mono text-sm">{{ background() }}</code>
          </div>
        </div>
      </div>

      <div
        class="flex min-h-64 flex-col justify-between rounded-lg p-6"
        [style.color]="foreground()"
        [style.background-color]="background()"
      >
        <div>
          <p class="text-sm font-semibold">实时预览</p>
          <p class="mt-4 text-3xl font-bold tracking-normal">清晰的信息层级</p>
          <p class="mt-3 text-base leading-6">对比度决定文字在不同设备与光线下能否被稳定阅读。</p>
        </div>
        <p class="mt-8 font-mono text-2xl font-semibold">{{ contrastRatio().toFixed(2) }}:1</p>
      </div>
    </div>
    <div
      class="grid gap-4 border-t-2 border-slate-200 p-4 sm:grid-cols-3 sm:p-6 dark:border-zinc-800"
    >
      @for (result of contrastChecks(); track result.label) {
        <div
          class="flex items-center justify-between gap-3 rounded-lg bg-slate-100 p-4 dark:bg-zinc-800"
        >
          <span class="text-sm font-medium">{{ result.label }}</span>
          <span
            [class.text-emerald-700]="result.pass"
            [class.text-rose-700]="!result.pass"
            class="inline-flex items-center gap-2 text-sm font-semibold dark:text-white"
          >
            <app-icon [name]="result.pass ? 'check' : 'x'" size="sm" />
            {{ result.pass ? '通过' : '未通过' }}
          </span>
        </div>
      }
    </div>
  `,
})
export class ContrastTool {
  protected readonly foregroundControl = new FormControl('#0f172a', { nonNullable: true });
  protected readonly backgroundControl = new FormControl('#f8fafc', { nonNullable: true });
  protected readonly foreground = toSignal(this.foregroundControl.valueChanges, {
    initialValue: this.foregroundControl.value,
  });
  protected readonly background = toSignal(this.backgroundControl.valueChanges, {
    initialValue: this.backgroundControl.value,
  });
  protected readonly contrastRatio = computed(() =>
    calculateContrastRatio(this.foreground(), this.background()),
  );
  protected readonly contrastChecks = computed(() => {
    const ratio = this.contrastRatio();
    return [
      { label: 'AA 正文', pass: ratio >= 4.5 },
      { label: 'AA 大字', pass: ratio >= 3 },
      { label: 'AAA 正文', pass: ratio >= 7 },
    ];
  });
}
