import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { Drawer } from 'primeng/drawer';

import { SITE_CONFIG } from '../generated/site.generated';
import { Icon } from '../shared/icon/icon';
import { ThemeService } from '../core/services/theme';

interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly exact?: boolean;
}

@Component({
  selector: 'app-site-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, Drawer, Icon, NgOptimizedImage, RouterLink, RouterLinkActive],
  template: `
    <header
      class="sticky top-0 z-50 h-16 border-b-2 border-slate-200 bg-white/95 dark:border-zinc-800 dark:bg-zinc-950/95"
    >
      <div class="mx-auto flex h-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <a
          routerLink="/"
          class="flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="返回首页"
        >
          <img
            ngSrc="images/profile.png"
            width="40"
            height="40"
            alt="相东实验室标志"
            class="size-10 rounded-lg"
            priority
          />
          <span
            class="hidden truncate text-base font-semibold tracking-normal text-slate-950 sm:inline dark:text-white"
          >
            {{ site.shortName }}
          </span>
        </a>

        <nav class="ml-auto hidden h-full items-center gap-1 lg:flex" aria-label="主导航">
          @for (item of navigation; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-slate-100 text-slate-950 dark:bg-zinc-800 dark:text-white"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="flex h-10 items-center rounded-lg px-3 text-sm font-medium tracking-normal text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
            >
              {{ item.label }}
            </a>
          }
        </nav>

        <div class="ml-auto flex items-center gap-1 lg:ml-2">
          <a
            pButton
            [text]="true"
            [rounded]="true"
            [href]="site.githubUrl"
            target="_blank"
            rel="noreferrer"
            class="size-10 p-0"
            aria-label="访问 GitHub"
          >
            <app-icon name="github" />
          </a>
          <button
            pButton
            type="button"
            [text]="true"
            [rounded]="true"
            class="size-10 p-0"
            [attr.aria-label]="theme.isDark() ? '切换到浅色模式' : '切换到深色模式'"
            (click)="theme.toggle()"
          >
            <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" />
          </button>
          <button
            pButton
            type="button"
            [text]="true"
            [rounded]="true"
            class="size-10 p-0 lg:hidden"
            aria-label="打开导航"
            (click)="menuOpen.set(true)"
          >
            <app-icon name="menu" />
          </button>
        </div>
      </div>
    </header>

    <p-drawer
      position="right"
      [visible]="menuOpen()"
      (visibleChange)="menuOpen.set($event)"
      [style]="{ width: '320px' }"
      styleClass="border-l-2"
      header="站点导航"
      ariaCloseLabel="关闭导航"
    >
      <nav class="flex flex-col gap-2" aria-label="移动端导航">
        @for (item of navigation; track item.path) {
          <a
            [routerLink]="item.path"
            routerLinkActive="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
            [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
            class="flex h-12 items-center justify-between rounded-lg px-4 font-medium tracking-normal text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:text-zinc-200"
            (click)="menuOpen.set(false)"
          >
            <span>{{ item.label }}</span>
            <app-icon name="chevron-right" />
          </a>
        }
      </nav>
    </p-drawer>
  `,
})
export class SiteHeader {
  protected readonly site = SITE_CONFIG;
  protected readonly theme = inject(ThemeService);
  protected readonly menuOpen = signal(false);
  protected readonly navigation: readonly NavigationItem[] = [
    { label: '首页', path: '/', exact: true },
    { label: '博客', path: '/blog' },
    { label: 'GitHub 项目', path: '/projects' },
    { label: '实验室', path: '/lab' },
    { label: '知识库', path: '/knowledge' },
    { label: '关于我', path: '/about' },
  ];
}
