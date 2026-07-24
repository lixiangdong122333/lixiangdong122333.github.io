---
title: 'Angular 渲染模式选择指南'
slug: 'angular-rendering-modes'
excerpt: '比较客户端渲染、服务端渲染与预渲染的适用边界，并记录静态托管时的选择原则。'
publishedAt: '2026-07-20'
tags: ['Angular', 'SSR', 'SSG', 'Hydration']
category: '前端架构'
featured: true
draft: false
---

# Angular 渲染模式选择指南

Angular 可以按路由选择渲染方式。判断依据不是“哪种模式更新”，而是页面数据何时可用、是否因用户而异，以及部署平台能否执行服务端代码。

| 模式       | HTML 生成时机 | 适用场景           | 主要约束             |
| ---------- | ------------- | ------------------ | -------------------- |
| 客户端渲染 | 浏览器运行时  | 登录后的高交互工具 | 首屏依赖 JavaScript  |
| 服务端渲染 | 每次请求      | 实时且公开的数据页 | 需要服务端运行环境   |
| 预渲染     | 构建时        | 博客、文档、作品集 | 数据必须在构建时可得 |

```typescript
import { RenderMode, type ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'blog/**', renderMode: RenderMode.Prerender },
  { path: 'account', renderMode: RenderMode.Client },
];
```

## Hydration 的作用

SSR 或 SSG 先提供可见 HTML，Hydration 在客户端复用这些 DOM 并接管事件。它不等于重新渲染整页。页面要避免依赖浏览器与服务端不一致的随机值、时间或直接 DOM 操作，否则可能产生内容不匹配。

## GitHub Pages 的结论

GitHub Pages 没有请求时服务端进程，所以部署产物必须是静态文件。个人站可以在代码层保留混合渲染配置，但发布到 Pages 的路由应使用预渲染或客户端渲染；公开内容优先预渲染，以便搜索引擎和禁用 JavaScript 的访问者读取正文。
