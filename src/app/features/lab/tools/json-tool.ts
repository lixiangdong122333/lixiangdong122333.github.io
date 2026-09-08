import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Textarea } from 'primeng/textarea';

import { Icon } from '../../../shared/icon/icon';

@Component({
  selector: 'app-json-tool',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, Icon, ReactiveFormsModule, Textarea],
  template: `
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
          <p id="json-error" role="alert" class="mt-2 text-sm text-rose-700 dark:text-rose-300">
            {{ jsonError() }}
          </p>
        }
        <div class="mt-4 flex flex-wrap gap-2">
          <button pButton type="button" class="h-10 gap-2 border-2 px-4" (click)="formatJson()">
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
        <p class="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">格式化结果</p>
        <pre
          class="min-h-80 overflow-auto rounded-lg border-2 border-zinc-700 bg-zinc-950 p-4 font-mono text-sm leading-6 text-zinc-100"
          >{{ formattedJson() || '等待有效 JSON' }}</pre>
      </div>
    </div>
  `,
})
export class JsonTool {
  protected readonly jsonControl = new FormControl(
    '{"project":"Xiangdong Lab","rendering":["SSR","SSG","Hydration"]}',
    {
      nonNullable: true,
    },
  );
  protected readonly formattedJson = signal('');
  protected readonly jsonError = signal('');
  protected readonly copied = signal(false);

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
