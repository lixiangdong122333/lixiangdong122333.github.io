import { DOCUMENT } from '@angular/common';
import { afterNextRender, inject, Injectable, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  readonly isDark = signal(false);

  constructor() {
    afterNextRender(() => {
      const storedTheme = globalThis.localStorage.getItem('theme');
      const prefersDark = globalThis.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(storedTheme === 'dark' || (storedTheme !== 'light' && prefersDark));
    });
  }

  toggle(): void {
    this.applyTheme(!this.isDark());
  }

  private applyTheme(dark: boolean): void {
    const theme: Theme = dark ? 'dark' : 'light';
    this.isDark.set(dark);
    this.document.documentElement.classList.toggle('app-dark', dark);
    globalThis.localStorage.setItem('theme', theme);
  }
}
