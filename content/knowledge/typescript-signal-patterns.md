---
title: 'TypeScript 与 Angular Signal 状态模式'
slug: 'typescript-signal-patterns'
excerpt: '用只读派生状态、不可变更新和明确类型边界组织 Angular 组件的本地状态。'
publishedAt: '2026-07-12'
tags: ['TypeScript', 'Angular', 'Signal', '状态管理']
category: '前端架构'
featured: false
draft: false
---

# TypeScript 与 Angular Signal 状态模式

Signal 适合表达组件内部同步状态。原始状态保持最小，派生值使用 `computed()`，更新通过 `set()` 或 `update()` 完成，这样状态变化更容易跟踪和测试。

```typescript
import { computed, signal } from '@angular/core';

interface Article {
  readonly slug: string;
  readonly title: string;
  readonly tags: readonly string[];
}

export class ArticleFilterState {
  private readonly articles = signal<readonly Article[]>([]);
  readonly selectedTag = signal<string | null>(null);

  readonly visibleArticles = computed(() => {
    const tag = this.selectedTag();
    return tag ? this.articles().filter((article) => article.tags.includes(tag)) : this.articles();
  });

  selectTag(tag: string): void {
    this.selectedTag.update((current) => (current === tag ? null : tag));
  }

  replaceArticles(articles: readonly Article[]): void {
    this.articles.set([...articles]);
  }
}
```

## 约束清单

- 状态类型使用具体接口或联合类型，不用 `any`
- 派生状态只读取其他 signal，不在 `computed()` 中产生副作用
- 数组与对象采用不可变更新，不依赖原地修改
- 异步请求与取消逻辑放到服务边界，不塞进模板表达式
- 模板调用只保留轻量读取，复杂筛选提前派生

当状态需要跨越多个功能域、持久化或协调复杂异步流程时，应重新评估边界。Signal 是响应式原语，不必承担整个应用的数据层职责。
