import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import { SiteFooter } from './layout/site-footer';
import { SiteHeader } from './layout/site-header';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterOutlet, SiteFooter, SiteHeader],
  template: `
    <a
      [routerLink]="[]"
      fragment="main-content"
      class="fixed left-4 top-4 z-[60] -translate-y-24 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-400"
    >
      跳到主要内容
    </a>
    <app-site-header />
    <main id="main-content" class="min-h-[calc(100svh-256px)]">
      <router-outlet />
    </main>
    <app-site-footer />
  `,
})
export class App {}
