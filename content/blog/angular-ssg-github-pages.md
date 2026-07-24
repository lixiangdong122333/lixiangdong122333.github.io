---
title: '用 Angular SSG 构建可部署到 GitHub Pages 的个人站'
slug: 'angular-ssg-github-pages'
excerpt: '拆解 Angular 预渲染、Hydration 与 GitHub Pages 静态托管之间的边界，并给出一条可复现的发布路径。'
publishedAt: '2026-07-18'
updatedAt: '2026-07-22'
tags: ['Angular', 'SSG', 'GitHub Pages', 'Hydration']
category: '前端工程'
featured: true
draft: false
---

# 用 Angular SSG 构建可部署到 GitHub Pages 的个人站

个人站的大多数页面面向所有访客展示相同内容，文章也能在构建时确定，因此很适合预渲染。Angular 在构建阶段生成完整 HTML，浏览器再通过 Hydration 恢复交互，首屏、SEO 与客户端体验可以同时兼顾。

![工程工作台](images/engineering-workbench.jpg '把内容和代码放在同一个版本周期中')

## 先明确部署边界

GitHub Pages 只提供静态文件托管，不能在请求到来时运行 Node.js 服务。所以项目可以保留 Angular 的服务端渲染能力，但部署到 GitHub Pages 的公开路由必须产出为预渲染页面。

```typescript
import { RenderMode, type ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: 'blog/**', renderMode: RenderMode.Prerender },
  { path: 'knowledge/**', renderMode: RenderMode.Prerender },
  { path: '**', renderMode: RenderMode.Prerender },
];
```

如果未来迁移到可运行服务端进程的平台，可以把需要实时数据的路由切换为 `RenderMode.Server`，而无需改变其他静态页面。

## 发布流程

构建产物应使用仓库名作为基础路径，并由 GitHub Actions 发布到 Pages。部署前至少确认以下事项：

- [x] 所有公开路由都能在构建时枚举
- [x] 静态资源路径包含正确的 `base href`
- [x] 直接访问深层链接不会落到空白页
- [x] `sitemap.xml`、`rss.xml` 与 `robots.txt` 已进入产物
- [ ] 在正式域名启用后更新 canonical URL

```shell
npm ci
npm run build -- --configuration production --base-href /xiangdong-lab/
```

## 验收标准

不要只验证首页。随机抽取一篇博客、一个知识库条目和一个标签页，关闭 JavaScript 后确认标题与正文仍然存在；重新启用 JavaScript，再检查筛选、主题切换等交互是否在 Hydration 后正常工作。
