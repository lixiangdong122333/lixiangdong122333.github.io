import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonDirective } from 'primeng/button';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';

import { Icon } from '../../../shared/icon/icon';
import { xorDecryptFromHex, xorEncryptToHex } from '../crypto/xor';
import { aesDecrypt, aesEncrypt, type AesAlgorithm } from '../crypto/webcrypto';

interface CipherOption {
  readonly label: string;
  readonly value: AesAlgorithm | 'XOR';
}

@Component({
  selector: 'app-cipher-tool',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, Icon, ReactiveFormsModule, Select, Textarea],
  template: `
    <div class="grid gap-6 p-4 sm:p-6 lg:grid-cols-2">
      <div class="space-y-6">
        <div>
          <label
            for="cipher-algorithm"
            class="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-200"
            >算法</label
          >
          <p-select
            inputId="cipher-algorithm"
            [options]="algorithms"
            optionLabel="label"
            optionValue="value"
            [formControl]="algorithmControl"
            appendTo="body"
            class="block w-full"
          />
        </div>
        @if (isAes()) {
          <p class="text-xs leading-5 text-slate-500 dark:text-zinc-400">
            口令通过 PBKDF2（210,000 次迭代）派生 256 位密钥；输出为 Base64（salt + IV + 密文）。
          </p>
        } @else {
          <p class="text-xs leading-5 text-slate-500 dark:text-zinc-400">
            XOR 仅供教学演示：密钥会循环复用，输出为十六进制。请勿用于保护真实数据。
          </p>
        }
        <div>
          <label
            for="cipher-password"
            class="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-200"
            >{{ isAes() ? '口令' : '密钥' }}</label
          >
          <input
            id="cipher-password"
            type="text"
            [formControl]="passwordControl"
            [autocomplete]="'off'"
            class="h-12 w-full rounded-lg border-2 border-slate-300 bg-white px-4 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label
            for="cipher-input"
            class="mb-2 block text-sm font-semibold text-slate-700 dark:text-zinc-200"
            >输入</label
          >
          <textarea
            pTextarea
            id="cipher-input"
            [formControl]="inputControl"
            rows="5"
            class="w-full rounded-lg border-2 font-mono text-sm"
          ></textarea>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            pButton
            type="button"
            class="h-10 gap-2 border-2 px-4"
            [disabled]="!ready()"
            (click)="encrypt()"
          >
            <app-icon name="lock" size="sm" />
            加密
          </button>
          <button
            pButton
            type="button"
            [outlined]="true"
            class="h-10 gap-2 border-2 px-4"
            [disabled]="!ready()"
            (click)="decrypt()"
          >
            <app-icon name="shield" size="sm" />
            解密
          </button>
        </div>
        @if (error()) {
          <p role="alert" class="text-sm text-rose-700 dark:text-rose-300">{{ error() }}</p>
        }
      </div>

      <div class="flex flex-col">
        <p class="mb-2 text-sm font-semibold text-slate-700 dark:text-zinc-200">结果</p>
        <pre
          class="min-h-48 flex-1 overflow-auto rounded-lg border-2 border-zinc-700 bg-zinc-950 p-4 font-mono text-sm leading-6 text-zinc-100"
          >{{ result() || '等待操作' }}</pre>
        @if (result()) {
          <button
            pButton
            type="button"
            [text]="true"
            class="mt-2 h-10 gap-2 self-end px-3"
            (click)="copyResult()"
          >
            <app-icon [name]="copied() ? 'check' : 'copy'" size="sm" />
            {{ copied() ? '已复制' : '复制结果' }}
          </button>
        }
      </div>
    </div>
  `,
})
export class CipherTool {
  protected readonly algorithms: CipherOption[] = [
    { label: 'AES-256-GCM（推荐）', value: 'AES-GCM' },
    { label: 'AES-256-CBC', value: 'AES-CBC' },
    { label: 'XOR（教学演示）', value: 'XOR' },
  ];

  protected readonly algorithmControl = new FormControl<AesAlgorithm | 'XOR'>('AES-GCM', {
    nonNullable: true,
  });
  protected readonly passwordControl = new FormControl('', { nonNullable: true });
  protected readonly inputControl = new FormControl('', { nonNullable: true });

  protected readonly result = signal('');
  protected readonly error = signal('');
  protected readonly copied = signal(false);
  private busy = false;

  protected isAes(): boolean {
    return this.algorithmControl.value !== 'XOR';
  }

  protected ready(): boolean {
    return (
      this.inputControl.value.trim().length > 0 &&
      this.passwordControl.value.length > 0 &&
      !this.busy
    );
  }

  protected async encrypt(): Promise<void> {
    await this.run(async () => {
      const algorithm = this.algorithmControl.value;
      this.result.set(
        algorithm === 'XOR'
          ? xorEncryptToHex(this.inputControl.value, this.passwordControl.value)
          : await aesEncrypt(algorithm, this.passwordControl.value, this.inputControl.value),
      );
    });
  }

  protected async decrypt(): Promise<void> {
    await this.run(async () => {
      const algorithm = this.algorithmControl.value;
      this.result.set(
        algorithm === 'XOR'
          ? xorDecryptFromHex(this.inputControl.value, this.passwordControl.value)
          : await aesDecrypt(algorithm, this.passwordControl.value, this.inputControl.value),
      );
    });
  }

  protected async copyResult(): Promise<void> {
    await globalThis.navigator.clipboard.writeText(this.result());
    this.copied.set(true);
  }

  private async run(operation: () => Promise<void>): Promise<void> {
    this.copied.set(false);
    this.error.set('');
    this.busy = true;
    try {
      await operation();
    } catch (error: unknown) {
      this.result.set('');
      this.error.set(error instanceof Error ? error.message : '操作失败，请检查输入');
    } finally {
      this.busy = false;
    }
  }
}
