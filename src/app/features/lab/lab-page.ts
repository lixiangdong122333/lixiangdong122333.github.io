import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Slider } from 'primeng/slider';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Textarea } from 'primeng/textarea';

import { SeoService } from '../../core/services/seo';
import { Icon } from '../../shared/icon/icon';
import { PageIntro } from '../../shared/page-intro/page-intro';

function channelLuminance(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

function parseHexColor(hex: string): readonly [number, number, number] {
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
  selector: 'app-lab-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonDirective,
    Icon,
    PageIntro,
    ReactiveFormsModule,
    Slider,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Textarea,
  ],
  template: `
    <app-page-intro
      eyebrow="Interactive Lab"
      title="实验室"
      description="用于验证界面、内容与数据处理判断的小型交互实验。"
      icon="flask"
    />

    <section class="bg-white dark:bg-zinc-950">
      <div class="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <p-tabs
          value="contrast"
          class="block overflow-hidden rounded-lg border-2 border-slate-200 dark:border-zinc-800"
        >
          <p-tablist>
            <p-tab value="contrast">对比度</p-tab>
            <p-tab value="reading">阅读时间</p-tab>
            <p-tab value="json">JSON</p-tab>
          </p-tablist>
          <p-tabpanels>
            <p-tabpanel value="contrast">
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
                    <p class="mt-3 text-base leading-6">
                      对比度决定文字在不同设备与光线下能否被稳定阅读。
                    </p>
                  </div>
                  <p class="mt-8 font-mono text-2xl font-semibold">
                    {{ contrastRatio().toFixed(2) }}:1
                  </p>
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
            </p-tabpanel>

            <p-tabpanel value="reading">
              <div class="p-4 sm:p-6">
                <div class="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <label
                      for="word-count"
                      class="text-sm font-semibold text-slate-700 dark:text-zinc-200"
                      >内容长度</label
                    >
                    <p
                      class="mt-2 text-4xl font-bold tracking-normal text-slate-950 dark:text-white"
                    >
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
                  class="mt-10 block"
                />
                <div class="mt-4 flex justify-between text-xs text-slate-500 dark:text-zinc-500">
                  <span>300</span><span>6000</span>
                </div>
              </div>
            </p-tabpanel>

            <p-tabpanel value="json">
              <div class="grid gap-4 p-4 sm:p-6 lg:grid-cols-2">
                <div>
                  <label
                    for="json-input"
                    class="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-200"
                    >JSON 输入</label
                  >
                  <textarea
                    pTextarea
                    id="json-input"
                    [formControl]="jsonControl"
                    [attr.aria-describedby]="jsonError() ? 'json-error' : null"
                    [attr.aria-invalid]="jsonError() ? 'true' : null"
                    rows="14"
                    class="w-full rounded-lg border-2 font-mono text-sm"
                  ></textarea>
                  @if (jsonError()) {
                    <p
                      id="json-error"
                      role="alert"
                      class="mt-2 text-sm text-rose-700 dark:text-rose-300"
                    >
                      {{ jsonError() }}
                    </p>
                  }
                  <div class="mt-4 flex flex-wrap gap-2">
                    <button
                      pButton
                      type="button"
                      class="h-10 gap-2 border-2 px-4"
                      (click)="formatJson()"
                    >
                      <app-icon name="code" size="sm" />
                      格式化
                    </button>
                    <button
                      pButton
                      type="button"
                      [outlined]="true"
                      class="h-10 gap-2 border-2 px-4"
                      [disabled]="!formattedJson()"
                      (click)="copyJson()"
                    >
                      <app-icon [name]="copied() ? 'check' : 'copy'" size="sm" />
                      {{ copied() ? '已复制' : '复制结果' }}
                    </button>
                  </div>
                </div>
                <div>
                  <p class="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">
                    格式化结果
                  </p>
                  <pre
                    class="min-h-80 overflow-auto rounded-lg border-2 border-zinc-700 bg-zinc-950 p-4 font-mono text-sm leading-6 text-zinc-100"
                    >{{ formattedJson() || '等待有效 JSON' }}</pre>
                </div>
              </div>
            </p-tabpanel>
          </p-tabpanels>
        </p-tabs>
      </div>
    </section>
  `,
})
export class LabPage {
  protected readonly foregroundControl = new FormControl('#0f172a', { nonNullable: true });
  protected readonly backgroundControl = new FormControl('#f8fafc', { nonNullable: true });
  protected readonly wordCountControl = new FormControl(1800, { nonNullable: true });
  protected readonly jsonControl = new FormControl(
    '{"project":"Xiangdong Lab","rendering":["SSR","SSG","Hydration"]}',
    {
      nonNullable: true,
    },
  );
  protected readonly foreground = toSignal(this.foregroundControl.valueChanges, {
    initialValue: this.foregroundControl.value,
  });
  protected readonly background = toSignal(this.backgroundControl.valueChanges, {
    initialValue: this.backgroundControl.value,
  });
  protected readonly wordCount = toSignal(this.wordCountControl.valueChanges, {
    initialValue: this.wordCountControl.value,
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
  protected readonly readingMinutes = computed(() =>
    Math.max(1, Math.ceil(this.wordCount() / 300)),
  );
  protected readonly formattedJson = signal('');
  protected readonly jsonError = signal('');
  protected readonly copied = signal(false);

  constructor() {
    inject(SeoService).update({
      title: '实验室',
      description: '颜色对比度、阅读时间与 JSON 数据处理的交互实验。',
      path: '/lab/',
    });
  }

  protected formatJson(): void {
    try {
      const parsed: unknown = JSON.parse(this.jsonControl.value);
      this.formattedJson.set(JSON.stringify(parsed, null, 2));
      this.jsonError.set('');
      this.copied.set(false);
    } catch (error: unknown) {
      this.formattedJson.set('');
      this.jsonError.set(error instanceof Error ? error.message : 'JSON 格式无效');
    }
  }

  protected async copyJson(): Promise<void> {
    if (!this.formattedJson()) {
      return;
    }
    await globalThis.navigator.clipboard.writeText(this.formattedJson());
    this.copied.set(true);
  }
}
