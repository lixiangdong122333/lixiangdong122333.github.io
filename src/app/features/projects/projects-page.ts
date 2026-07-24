import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { SeoService } from '../../core/services/seo';
import { PageIntro } from '../../shared/page-intro/page-intro';
import { ProjectCard } from '../../shared/project-card/project-card';
import { PROJECTS } from './project-data';

@Component({
  selector: 'app-projects-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageIntro, ProjectCard],
  template: `
    <app-page-intro
      eyebrow="GitHub Projects"
      title="公开项目与工程实验"
      description="从生产可观测工具到 GPU 群集模拟，覆盖服务、图形、游戏机制与流媒体部署。"
      icon="github"
    />
    <section class="bg-white dark:bg-zinc-950">
      <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p class="mb-6 text-sm text-slate-500 dark:text-zinc-400">
          {{ projects.length }} 个精选公开仓库
        </p>
        <div class="grid gap-4 md:grid-cols-2">
          @for (project of projects; track project.name) {
            <app-project-card [project]="project" />
          }
        </div>
      </div>
    </section>
  `,
})
export class ProjectsPage {
  protected readonly projects = PROJECTS;

  constructor() {
    inject(SeoService).update({
      title: 'GitHub 项目',
      description:
        '李相东的公开项目：云日志 MCP Server、GPU 群集模拟、FXGL 游戏机制原型与流媒体部署配置。',
      path: '/projects/',
    });
  }
}
