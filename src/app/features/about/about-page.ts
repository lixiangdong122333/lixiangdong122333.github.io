import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';

import { SeoService } from '../../core/services/seo';
import { SITE_CONFIG } from '../../generated/site.generated';
import { Icon } from '../../shared/icon/icon';
import { PageIntro } from '../../shared/page-intro/page-intro';

@Component({
  selector: 'app-about-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, Icon, NgOptimizedImage, PageIntro, Tag],
  template: `
    <app-page-intro
      eyebrow="About"
      title="关于我"
      description="软件工程师，关注可靠系统、清晰的开发体验，以及能在时间里持续复用的知识。"
      icon="user"
    />

    <section class="bg-white dark:bg-zinc-950">
      <div
        class="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8"
      >
        <div>
          <img
            ngSrc="images/profile.png"
            width="420"
            height="420"
            alt="相东实验室标志"
            class="aspect-square w-full max-w-80 rounded-lg object-cover"
            priority
          />
          <a
            pButton
            [href]="site.githubUrl"
            target="_blank"
            rel="noreferrer"
            class="mt-6 h-12 w-full gap-2 border-2 px-5"
          >
            <app-icon name="github" />
            GitHub
          </a>
          <a
            pButton
            [href]="'mailto:' + site.email"
            [outlined]="true"
            class="mt-3 h-12 w-full justify-start gap-2 border-2 px-5"
            [attr.aria-label]="'发送邮件至 ' + site.email"
          >
            <app-icon name="mail" />
            {{ site.email }}
          </a>
        </div>

        <div class="max-w-3xl">
          <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            {{ site.author }}
          </p>
          <h2 class="mt-3 text-3xl font-bold tracking-normal text-slate-950 dark:text-white">
            把复杂问题整理成可靠路径
          </h2>
          <div class="mt-6 space-y-5 text-base leading-7 text-slate-600 dark:text-zinc-300">
            <p>
              我的工作横跨前端体验、服务端系统与云平台。比起堆叠工具，我更关心边界是否清楚、失败是否可观察、知识是否能被下一次决策直接复用。
            </p>
            <p>
              这个站点是公开工作台：文章保留判断过程，知识库沉淀检查清单，实验室承载可以亲手验证的小问题，项目页连接真实代码。
            </p>
          </div>

          <div class="mt-10 border-t-2 border-slate-200 pt-8 dark:border-zinc-800">
            <h2 class="text-xl font-semibold tracking-normal text-slate-950 dark:text-white">
              关注方向
            </h2>
            <div class="mt-4 flex flex-wrap gap-2">
              @for (skill of skills; track skill) {
                <p-tag [value]="skill" severity="secondary" />
              }
            </div>
          </div>

          <div class="mt-10 grid gap-6 sm:grid-cols-3">
            @for (principle of principles; track principle.title) {
              <div class="border-l-2 border-emerald-500 pl-4">
                <app-icon [name]="principle.icon" class="text-emerald-700 dark:text-emerald-300" />
                <h3 class="mt-3 font-semibold tracking-normal text-slate-950 dark:text-white">
                  {{ principle.title }}
                </h3>
                <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                  {{ principle.description }}
                </p>
              </div>
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AboutPage {
  protected readonly site = SITE_CONFIG;
  protected readonly skills = [
    'Angular',
    'TypeScript',
    'Java',
    'Kubernetes',
    'Google Cloud',
    'Observability',
    'AI Tooling',
  ];
  protected readonly principles = [
    { title: '清晰', description: '让边界、状态与取舍可以被验证。', icon: 'layers' as const },
    { title: '可靠', description: '把失败路径当作系统的一等公民。', icon: 'server' as const },
    { title: '可复用', description: '将一次判断沉淀为长期资产。', icon: 'book' as const },
  ];

  constructor() {
    inject(SeoService).update({
      title: '关于我',
      description: '关于李相东：关注可靠系统、开发体验、云平台与可复用知识的软件工程师。',
      path: '/about/',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: SITE_CONFIG.author,
        alternateName: SITE_CONFIG.displayName,
        url: `${SITE_CONFIG.siteUrl}/about/`,
        sameAs: [SITE_CONFIG.githubUrl],
        email: SITE_CONFIG.email,
        jobTitle: SITE_CONFIG.role,
      },
    });
  }
}
