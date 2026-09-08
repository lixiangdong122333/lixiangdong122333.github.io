import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Slider } from 'primeng/slider';

@Component({
  selector: 'app-reading-time-tool',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, Slider],
  template: `
    <div class="p-4 sm:p-6">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label for="word-count" class="text-sm font-semibold text-slate-700 dark:text-zinc-200"
            >内容长度</label
          >
          <p class="mt-2 text-4xl font-bold tracking-normal text-slate-950 dark:text-white">
            {{ wordCount() }} 字
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-slate-500 dark:text-zinc-400">预计阅读</p>
          <p
            class="mt-2 text-3xl font-semibold tracking-normal text-emerald-700 dark:text-emerald-300"
          >
            {{ readingMinutes() }} 分钟
          </p>
        </div>
      </div>
      <p-slider
        id="word-count"
        [formControl]="wordCountControl"
        [min]="300"
        [max]="6000"
        [step]="100"
        ariaLabel="内容长度（字）"
        class="mt-10 block"
      />
      <div class="mt-4 flex justify-between text-xs text-slate-500 dark:text-zinc-400">
        <span>300</span><span>6000</span>
      </div>
    </div>
  `,
})
export class ReadingTimeTool {
  protected readonly wordCountControl = new FormControl(1800, { nonNullable: true });
  protected readonly wordCount = toSignal(this.wordCountControl.valueChanges, {
    initialValue: this.wordCountControl.value,
  });
  protected readonly readingMinutes = computed(() =>
    Math.max(1, Math.ceil(this.wordCount() / 300)),
  );
}
