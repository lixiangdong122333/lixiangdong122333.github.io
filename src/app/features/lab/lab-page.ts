import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { Icon } from '../../shared/icon/icon';
import { SeoService } from '../../core/services/seo';
import { LAB_TOOLS, TOOL_CATEGORIES } from './tool-registry';
import type { ToolCategory } from './tool-model';
import { ToolPreferences } from './tool-preferences';
import { ToolSearch } from './tool-search';
import { ToolWorkspace } from './tool-workspace';
import { ToolTile } from './tool-tile';

@Component({
  selector: 'app-lab-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    Icon,
    ButtonModule,
    DialogModule,
    TooltipModule,
    ToolSearch,
    ToolWorkspace,
    ToolTile,
  ],
  templateUrl: './lab-page.html',
})
export class LabPage {
  readonly tools = LAB_TOOLS;
  readonly categories = TOOL_CATEGORIES;
  readonly featuredTools = LAB_TOOLS.filter((tool) => tool.featured);
  readonly preferences = inject(ToolPreferences);
  readonly category = signal<ToolCategory | null>(null);
  readonly categoryTools = computed(() =>
    LAB_TOOLS.filter((tool) => !this.category() || tool.category === this.category()),
  );
  readonly categoryDescription = computed(
    () =>
      TOOL_CATEGORIES.find((category) => category.id === this.category())?.description ??
      '全部工具',
  );
  readonly recentTools = computed(() =>
    this.preferences.recent().flatMap((id) => LAB_TOOLS.filter((tool) => tool.id === id)),
  );
  readonly favoriteTools = computed(() =>
    LAB_TOOLS.filter((tool) => this.preferences.favorites().includes(tool.id)),
  );
  readonly paletteOpen = signal(false);
  private readonly route = inject(ActivatedRoute);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  readonly toolId = signal(this.route.snapshot.paramMap.get('toolId'));
  readonly selected = computed(() => LAB_TOOLS.find((tool) => tool.id === this.toolId()));
  readonly relatedTools = computed(() => {
    const selected = this.selected();
    return selected
      ? LAB_TOOLS.filter(
          (tool) =>
            tool.id !== selected.id &&
            (selected.related.includes(tool.id) || tool.category === selected.category),
        ).slice(0, 3)
      : [];
  });
  readonly paletteSearchRef = viewChild<ToolSearch>('paletteSearch');

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.toolId.set(params.get('toolId'));
      this.paletteOpen.set(false);
      this.updateSeo();
    });
    effect(() => {
      const tool = this.selected();
      if (this.preferences.ready() && tool) untracked(() => this.preferences.visit(tool.id));
    });
    afterNextRender(() => {
      const listener = (event: KeyboardEvent) => {
        if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          this.paletteOpen.update((open) => !open);
        }
      };
      globalThis.addEventListener('keydown', listener);
      this.destroyRef.onDestroy(() => globalThis.removeEventListener('keydown', listener));
    });
  }

  count(category: ToolCategory): number {
    return LAB_TOOLS.filter((tool) => tool.category === category).length;
  }

  private updateSeo(): void {
    const tool = this.selected();
    const missing = !!this.toolId() && !tool;
    this.seo.update({
      title: missing ? '工具不存在' : (tool?.nameZh ?? '相东实验室'),
      description: tool?.description ?? '个人在线工具箱：数据处理、文本转换与开发辅助。',
      path: tool ? `/lab/${tool.id}/` : '/lab/',
      robots: missing ? 'noindex, nofollow' : 'index, follow',
      structuredData: tool
        ? {
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: tool.name,
            description: tool.description,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Any',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          }
        : undefined,
    });
  }
}

export { calculateContrastRatio } from './tool-processors';
