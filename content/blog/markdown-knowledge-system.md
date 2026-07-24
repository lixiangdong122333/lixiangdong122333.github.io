---
title: '把 Markdown 文章变成可维护的知识系统'
slug: 'markdown-knowledge-system'
excerpt: '从内容契约、构建校验到标签检索，说明如何让 Markdown 仓库长期保持可发现与可演进。'
publishedAt: '2026-07-03'
tags: ['Markdown', '知识管理', '内容工程', '搜索']
category: '知识工程'
featured: false
draft: false
---

# 把 Markdown 文章变成可维护的知识系统

Markdown 解决的是写作格式，知识系统还要解决内容契约、关联与检索。文章和代码进入同一个版本周期后，评审、回滚与自动发布都能复用现有工程流程。

## 用 frontmatter 建立契约

字段应少而稳定。标题、摘要和发布日期服务于列表与 SEO，标签用于横向关联，分类用于建立主路径。`slug` 一旦公开就不应随标题变化。

```typescript
export interface ContentMeta {
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly publishedAt: string;
  readonly tags: readonly string[];
  readonly category: string;
  readonly featured: boolean;
  readonly draft: false;
}
```

构建阶段应拒绝重复 slug、无效日期和缺失字段，而不是等到页面运行时再降级处理。

## 检索不是标题匹配

一个轻量的本地索引可以综合标题、标签和正文命中。设各字段的标准化相关度为 $r_t$、$r_g$ 和 $r_b$，可先使用简单加权：

$$
score = 0.5r_t + 0.3r_g + 0.2r_b
$$

权重不是永久规则，应根据真实搜索词和零结果查询迭代。中文检索还要明确分词策略；内容量较小时，构建期生成索引通常比引入远程搜索服务更容易维护。

## 保持链接可用

- [x] 在 CI 中校验 frontmatter
- [x] 为标题生成稳定锚点
- [x] 构建时检查站内链接与图片路径
- [ ] 定期合并同义标签
- [ ] 为被替换文章保留重定向记录

好的知识系统不追求无限分类，而是让读者从搜索结果、标签页或正文链接出发，都能在两三步内找到可信的下一条信息。
