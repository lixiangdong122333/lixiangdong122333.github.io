import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { Icon } from '../../../shared/icon/icon';
import { md5Hex } from '../crypto/md5';
import { digestHex, hmacSha256Hex, type HashAlgorithm } from '../crypto/webcrypto';

type HashOption = HashAlgorithm | 'MD5' | 'HMAC-SHA256';

interface HashAlgorithmOption {
  readonly label: string;
  readonly value: HashOption;
  readonly note: string;
}

@Component({
  selector: 'app-hash-tool',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, Icon, ReactiveFormsModule, Select, Textarea],
  template: `
    <div class="grid gap-6 p-4 sm:p-6 lg:grid-cols-2">
      <div class="space-y-6">
        <div>
          <label
            for="hash-algorithm"
            class="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-200"
            >算法</label
          >
          <p-select
            inputId="hash-algorithm"
            [options]="algorithms"
            optionLabel="label"
            optionValue="value"
            [formControl]="algorithmControl"
            appendTo="body"
            class="block w-full"
          />
          <p class="mt-2 text-xs leading-5 text-slate-500 dark:text-zinc-400">
            {{ selectedNote() }}
          </p>
        </div>
        @if (needsKey()) {
          <div>
            <label
              for="hash-key"
              class="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-200"
              >密钥</label
            >
            <input
              id="hash-key"
              type="text"
              [formControl]="keyControl"
              [autocomplete]="'off'"
              class="h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-4 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        }
        <div>
          <label
            for="hash-input"
            class="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-200"
            >输入</label
          >
          <textarea
            pTextarea
            id="hash-input"
            [formControl]="inputControl"
            rows="6"
            class="w-full rounded-lg border-2 font-mono text-sm"
          ></textarea>
        </div>
        <button
          pButton
          type="button"
          class="h-10 gap-2 border-2 px-4"
          [disabled]="!ready()"
          (click)="compute()"
        >
          <app-icon name="shield" size="sm" />
          计算摘要
        </button>
        @if (error()) {
          <p role="alert" class="text-sm text-rose-700 dark:text-rose-300">{{ error() }}</p>
        }
      </div>

      <div class="flex flex-col">
        <p class="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">摘要（十六进制）</p>
        <pre
          class="min-h-48 flex-1 overflow-auto rounded-lg border-2 border-zinc-700 bg-zinc-950 p-4 font-mono text-sm leading-6 break-all text-zinc-100"
          >{{ result() || '等待计算' }}</pre>
        @if (result()) {
          <button
            pButton
            type="button"
            [text]="true"
            class="mt-2 h-10 gap-2 self-end px-3"
            (click)="copyResult()"
          >
            <app-icon [name]="copied() ? 'check' : 'copy'" size="sm" />
            {{ copied() ? '已复制' : '复制摘要' }}
          </button>
        }
      </div>
    </div>
  `,
})
export class HashTool {
  protected readonly algorithms: HashAlgorithmOption[] = [
    { label: 'SHA-256', value: 'SHA-256', note: '当前标准：TLS、Git 与区块链的通用选择。' },
    { label: 'SHA-512', value: 'SHA-512', note: 'SHA-2 家族长摘要，适合大输入与 64 位平台。' },
    {
      label: 'SHA-1',
      value: 'SHA-1',
      note: '已存在碰撞攻击，仅用于遗留系统校验，不要用于安全场景。',
    },
    {
      label: 'MD5',
      value: 'MD5',
      note: '纯 TypeScript 实现（RFC 1321）。已不安全，仅用于校验和对照。',
    },
    {
      label: 'HMAC-SHA256',
      value: 'HMAC-SHA256',
      note: '带密钥的摘要，常用于 API 签名与 Webhook 验签。',
    },
  ];

  protected readonly algorithmControl = new FormControl<HashOption>('SHA-256', {
    nonNullable: true,
  });
  protected readonly keyControl = new FormControl('', { nonNullable: true });
  protected readonly inputControl = new FormControl('', { nonNullable: true });

  protected readonly result = signal('');
  protected readonly error = signal('');
  protected readonly copied = signal(false);
  private busy = false;

  protected needsKey(): boolean {
    return this.algorithmControl.value === 'HMAC-SHA256';
  }

  protected selectedNote(): string {
    return (
      this.algorithms.find((option) => option.value === this.algorithmControl.value)?.note ?? ''
    );
  }

  protected ready(): boolean {
    const keyReady = !this.needsKey() || this.keyControl.value.length > 0;
    return this.inputControl.value.trim().length > 0 && keyReady && !this.busy;
  }

  protected async compute(): Promise<void> {
    this.copied.set(false);
    this.error.set('');
    this.busy = true;
    try {
      const algorithm = this.algorithmControl.value;
      const input = this.inputControl.value;
      this.result.set(
        algorithm === 'MD5'
          ? md5Hex(input)
          : algorithm === 'HMAC-SHA256'
            ? await hmacSha256Hex(this.keyControl.value, input)
            : await digestHex(algorithm, input),
      );
    } catch (error: unknown) {
      this.result.set('');
      this.error.set(error instanceof Error ? error.message : '计算失败，请检查输入');
    } finally {
      this.busy = false;
    }
  }

  protected async copyResult(): Promise<void> {
    await globalThis.navigator.clipboard.writeText(this.result());
    this.copied.set(true);
  }
}
