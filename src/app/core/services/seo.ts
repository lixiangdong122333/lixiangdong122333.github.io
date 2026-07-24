import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { SITE_CONFIG } from '../../generated/site.generated';

export interface SeoPage {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly type?: 'website' | 'article';
  readonly image?: string;
  readonly robots?: 'index, follow' | 'noindex, nofollow';
  readonly structuredData?: Readonly<Record<string, unknown>>;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);

  update(page: SeoPage): void {
    const fullTitle =
      page.title === SITE_CONFIG.name ? page.title : `${page.title} | ${SITE_CONFIG.name}`;
    const canonicalUrl = `${SITE_CONFIG.siteUrl}${page.path.startsWith('/') ? page.path : `/${page.path}`}`;
    const imageUrl = page.image ?? `${SITE_CONFIG.siteUrl}/images/engineering-workbench.jpg`;

    this.title.setTitle(fullTitle);
    this.updateMeta('name', 'description', page.description);
    this.updateMeta('property', 'og:title', fullTitle);
    this.updateMeta('property', 'og:description', page.description);
    this.updateMeta('property', 'og:type', page.type ?? 'website');
    this.updateMeta('property', 'og:url', canonicalUrl);
    this.updateMeta('property', 'og:image', imageUrl);
    this.updateMeta('property', 'og:locale', 'zh_CN');
    this.updateMeta('name', 'twitter:card', 'summary_large_image');
    this.updateMeta('name', 'twitter:title', fullTitle);
    this.updateMeta('name', 'twitter:description', page.description);
    this.updateMeta('name', 'twitter:image', imageUrl);
    this.updateMeta('name', 'robots', page.robots ?? 'index, follow');
    this.updateCanonical(canonicalUrl);
    this.updateStructuredData(page.structuredData);
  }

  private updateMeta(attribute: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attribute]: key, content }, `${attribute}='${key}'`);
  }

  private updateCanonical(url: string): void {
    let canonical = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.document.createElement('link');
      canonical.rel = 'canonical';
      this.document.head.appendChild(canonical);
    }
    canonical.href = url;
  }

  private updateStructuredData(data?: Readonly<Record<string, unknown>>): void {
    this.document.getElementById('page-structured-data')?.remove();
    if (!data) {
      return;
    }

    const script = this.document.createElement('script');
    script.id = 'page-structured-data';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data).replaceAll('</script', '<\\/script');
    this.document.head.appendChild(script);
  }
}
