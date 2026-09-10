import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { FormControl, FormRecord, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';
import { Icon } from '../../shared/icon/icon';
import type { LabTool, ToolResult } from './tool-model';

@Component({
  selector: 'app-tool-workspace',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    TooltipModule,
    Icon,
  ],
  template: `
    <div
      class="mt-8 border-y-2 border-slate-200 py-8 dark:border-zinc-800"
      [attr.aria-busy]="processing()"
    >
      <form [formGroup]="form()" (ngSubmit)="process(tool().actions[0].id)">
        <div class="grid gap-6 md:grid-cols-2">
          @for (field of tool().fields; track field.key) {
            <div class="min-w-0" [class.md:col-span-2]="tool().fields.length === 1">
              <label [for]="'tool-' + field.key" class="mb-2 block text-sm font-semibold">{{
                field.label
              }}</label>
              @switch (field.type) {
                @case ('textarea') {
                  <textarea
                    pTextarea
                    [id]="'tool-' + field.key"
                    [formControlName]="field.key"
                    [placeholder]="field.placeholder ?? ''"
                    rows="10"
                    spellcheck="false"
                    class="min-h-60 w-full resize-y border-2! font-mono text-sm!"
                  ></textarea>
                }
                @case ('select') {
                  <p-select
                    [inputId]="'tool-' + field.key"
                    [formControlName]="field.key"
                    [options]="field.options ?? []"
                    optionLabel="label"
                    optionValue="value"
                    class="min-h-12 w-full border-2!"
                  />
                }
                @case ('color') {
                  <input
                    [id]="'tool-' + field.key"
                    [formControlName]="field.key"
                    type="color"
                    class="h-12 w-24 cursor-pointer rounded-lg border-2 border-slate-300 bg-transparent"
                  />
                }
                @default {
                  <input
                    pInputText
                    [id]="'tool-' + field.key"
                    [formControlName]="field.key"
                    [placeholder]="field.placeholder ?? ''"
                    type="text"
                    [attr.inputmode]="field.type === 'number' ? 'numeric' : null"
                    class="h-12 w-full border-2!"
                  />
                }
              }
            </div>
          }
        </div>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          @for (action of tool().actions; track action.id) {
            <button
              pButton
              type="button"
              (click)="process(action.id)"
              [disabled]="processing()"
              class="min-h-12"
            >
              <app-icon [name]="tool().icon" size="sm" />{{ action.label }}
            </button>
          }
          <button
            pButton
            type="button"
            severity="secondary"
            (click)="clear()"
            aria-label="清空"
            pTooltip="清空"
            class="size-12 border-2!"
          >
            <app-icon name="x" />
          </button>
          <span class="text-sm text-slate-600 dark:text-zinc-400" role="status">{{
            processing() ? '处理中' : copied() ? '已复制' : ''
          }}</span>
        </div>
      </form>
      @if (error()) {
        <p role="alert" class="mt-4 text-sm text-rose-700 dark:text-rose-300">{{ error() }}</p>
      }
      <div class="mb-2 mt-8 flex items-center justify-between">
        <label for="tool-output" class="text-sm font-semibold">输出</label>
        <button
          pButton
          type="button"
          severity="secondary"
          [disabled]="!result() || processing()"
          (click)="copy()"
          aria-label="复制结果"
          pTooltip="复制结果"
          class="size-12 border-2!"
        >
          <app-icon [name]="copied() ? 'check' : 'copy'" />
        </button>
      </div>
      <textarea
        id="tool-output"
        readonly
        [value]="result()?.text ?? ''"
        placeholder="结果"
        class="min-h-48 w-full resize-y rounded-lg border-2 border-zinc-700 bg-zinc-950 p-4 font-mono text-sm leading-6 text-zinc-100 focus-visible:outline-2 focus-visible:outline-emerald-600"
        aria-describedby="output-status"
        spellcheck="false"
      ></textarea>
      <span id="output-status" role="status" class="sr-only">{{ result() ? '处理完成' : '' }}</span>
      @if (result()?.preview; as preview) {
        <div
          class="mt-4 flex min-h-32 items-center justify-center rounded-lg border-2 border-slate-300 p-6 text-2xl font-semibold"
          [style.background-color]="preview.background"
          [style.color]="preview.foreground"
          aria-label="颜色预览"
        >
          Aa 文字示例
        </div>
      }
    </div>
  `,
})
export class ToolWorkspace {
  readonly tool = input.required<LabTool>();
  readonly form = computed(
    () =>
      new FormRecord(
        Object.fromEntries(
          this.tool().fields.map((field) => [
            field.key,
            new FormControl(field.value ?? '', { nonNullable: true }),
          ]),
        ),
      ),
  );
  readonly result = signal<ToolResult | undefined>(undefined);
  readonly error = signal('');
  readonly copied = signal(false);
  readonly processing = signal(false);
  private revision = 0;

  constructor() {
    effect(() => {
      this.tool();
      this.resetResult();
    });
  }

  async process(action: string): Promise<void> {
    this.resetResult();
    const revision = this.revision;
    this.processing.set(true);
    try {
      const result = await this.tool().process(this.form().getRawValue(), action);
      if (revision === this.revision) this.result.set(result);
    } catch (error: unknown) {
      if (revision === this.revision)
        this.error.set(error instanceof Error ? error.message : '无法处理输入。');
    } finally {
      if (revision === this.revision) this.processing.set(false);
    }
  }

  clear(): void {
    this.form().reset();
    this.resetResult();
  }

  async copy(): Promise<void> {
    const result = this.result();
    if (!result) return;
    const revision = this.revision;
    try {
      await navigator.clipboard.writeText(result.text);
      if (revision === this.revision) this.copied.set(true);
    } catch {
      if (revision === this.revision) this.error.set('无法访问剪贴板，请从输出框手动复制。');
    }
  }

  private resetResult(): void {
    this.revision++;
    this.result.set(undefined);
    this.error.set('');
    this.copied.set(false);
    this.processing.set(false);
  }
}
