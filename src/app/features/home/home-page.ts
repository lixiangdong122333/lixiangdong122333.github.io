import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';

import { ContentRepository } from '../../core/services/content-repository';
import { SeoService } from '../../core/services/seo';
import { SITE_CONFIG } from '../../generated/site.generated';
import { ContentCard } from '../../shared/content-card/content-card';
import { Icon } from '../../shared/icon/icon';
import { ProjectCard } from '../../shared/project-card/project-card';
import { PROJECTS } from '../projects/project-data';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonDirective, ContentCard, Icon, NgOptimizedImage, ProjectCard, RouterLink],
  template: `
    <section
      class="relative isolate min-h-[calc(100svh-144px)] overflow-hidden bg-slate-950 text-white"
    >
      <img
        ngSrc="images/engineering-workbench.jpg"
        fill
        priority
        sizes="100vw"
        alt="放有代码编辑器的工程工作台"
        class="-z-20 object-cover object-center"
      />
      <div class="absolute inset-0 -z-10 bg-slate-950/75"></div>
      <div
        class="mx-auto flex min-h-[calc(100svh-144px)] max-w-7xl items-end px-4 py-16 sm:px-6 lg:px-8"
      >
        <div class="max-w-4xl">
          <p class="text-sm font-semibold uppercase tracking-normal text-emerald-300">
            {{ site.role }} · Builder · Writer
          </p>
          <h1 class="mt-4 text-5xl font-bold leading-none tracking-normal sm:text-7xl">
            {{ site.displayName }}
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-200 sm:text-xl">
            在代码、系统与长期知识之间建立可靠连接。这里记录可以复用的工程判断，也展示正在发生的实验。
          </p>
          <div class="mt-8 flex flex-wrap gap-3">
            <a pButton routerLink="/blog" class="h-12 gap-2 border-2 px-5">
              阅读最新文章
              <app-icon name="arrow-right" />
            </a>
            <a
              pButton
              routerLink="/projects"
              severity="secondary"
              [outlined]="true"
              class="h-12 gap-2 border-2 px-5 text-white"
            >
              浏览 GitHub 项目
              <app-icon name="github" />
            </a>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b-2 border-slate-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <div>
          <p class="text-sm font-semibold text-emerald-700 dark:text-emerald-300">最近更新</p>
          <h2 class="mt-3 text-3xl font-bold tracking-normal text-slate-950 dark:text-white">
            正在写什么
          </h2>
          <p class="mt-4 text-sm leading-6 text-slate-600 dark:text-zinc-400">
            围绕可靠系统、内容工程和真实开发现场持续整理。
          </p>
          <a
            routerLink="/blog"
            class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-300"
          >
            查看全部文章
            <app-icon name="arrow-right" size="sm" />
          </a>
        </div>
        <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          @for (post of recentPosts; track post.id) {
            <app-content-card [document]="post" />
          }
        </div>
      </div>
    </section>

    @defer (on viewport; hydrate on viewport) {
      <section class="bg-slate-50 dark:bg-zinc-900">
        <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div class="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p class="text-sm font-semibold text-amber-700 dark:text-amber-300">公开项目</p>
              <h2 class="mt-3 text-3xl font-bold tracking-normal text-slate-950 dark:text-white">
                从工具到可视化实验
              </h2>
            </div>
            <a
              routerLink="/projects"
              class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300"
            >
              全部项目
              <app-icon name="arrow-right" size="sm" />
            </a>
          </div>
          <div class="mt-8 grid gap-4 lg:grid-cols-3">
            @for (project of featuredProjects; track project.name) {
              <app-project-card [project]="project" />
            }
          </div>
        </div>
      </section>
    } @placeholder {
      <section class="h-64 bg-slate-50 dark:bg-zinc-900" aria-hidden="true"></section>
    }
  `,
})
export class HomePage {
  private readonly content = inject(ContentRepository);
  private readonly seo = inject(SeoService);

  protected readonly site = SITE_CONFIG;
  protected readonly recentPosts = this.content.blogPosts.slice(0, 3);
  protected readonly featuredProjects = PROJECTS.filter((project) => project.featured).slice(0, 3);

  constructor() {
    this.seo.update({
      title: SITE_CONFIG.displayName,
      description: SITE_CONFIG.description,
      path: '/',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_CONFIG.name,
        url: SITE_CONFIG.siteUrl,
        description: SITE_CONFIG.description,
        author: { '@type': 'Person', name: SITE_CONFIG.author },
      },
    });
  }
}
