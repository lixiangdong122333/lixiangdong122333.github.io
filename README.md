# 相东实验室

相东实验室是一个以 Markdown 为内容源的个人主页，集中展示技术文章、知识笔记、GitHub 项目与可交互实验。项目使用 Angular 的 SSR、SSG 与 Hydration 能力，在保留 Node 服务端部署能力的同时，为 GitHub Pages 生成可直接托管的静态站点。

## 技术栈

- Angular 22、严格 TypeScript、Standalone Components、Signals 与懒加载路由
- Angular SSR、构建时预渲染（SSG）与客户端 Hydration
- PrimeNG 22、`@primeuix/themes` 与 `tailwindcss-primeui`
- Tailwind CSS 4，优先使用工具类完成布局和视觉样式
- Markdown、GFM、Highlight.js、Mermaid、KaTeX 与安全的 HTML 清理流程
- MiniSearch 驱动的全文检索，以及由内容清单派生的标签系统
- RSS、Sitemap、Robots、Canonical、Open Graph 与结构化数据

## 站点功能

- 首页：个人简介、精选内容与主要入口
- 博客：Markdown 文章、标签筛选、全文检索与文章详情
- GitHub 项目：开源项目和工程实践展示
- 实验室：可交互的技术实验与原型
- 知识库：按主题整理的长期知识条目
- 关于我：个人经历、技术方向与联系方式
- SEO：预渲染页面、RSS、`sitemap.xml`、`robots.txt` 和页面级元数据

## 内容目录

内容由 Git 管理，不提供后台编辑器或上传流程。

```text
content/
├── blog/          # 博客文章
└── knowledge/     # 知识库条目

public/
└── images/        # Markdown 引用的本地图片
```

运行内容构建后会生成以下文件，请把 Markdown 作为源数据维护，不要直接修改生成结果：

- `src/app/generated/content.generated.ts`：页面渲染、检索、标签和预渲染共用的内容清单
- `public/rss.xml`：已发布博客文章的 RSS 订阅源
- `public/sitemap.xml`：静态页面与已发布内容的站点地图
- `public/robots.txt`：搜索引擎抓取规则

## Markdown Frontmatter

每篇文章必须包含通过构建时校验的 Frontmatter：

```yaml
---
title: '用 Angular 构建个人知识站'
slug: 'angular-personal-knowledge-site'
excerpt: '记录从 Markdown 内容建模到 Angular 预渲染和 GitHub Pages 发布的完整过程。'
publishedAt: '2026-07-24'
updatedAt: '2026-07-25'
tags: ['Angular', 'SSG', 'Markdown']
category: '前端工程'
featured: true
draft: false
---
```

字段约束：

| 字段          | 必填 | 说明                                           |
| ------------- | ---- | ---------------------------------------------- |
| `title`       | 是   | 文章标题，至少 4 个字符                        |
| `slug`        | 是   | URL 标识，只能使用小写字母、数字和连字符       |
| `excerpt`     | 是   | 20 至 240 个字符的摘要                         |
| `publishedAt` | 是   | 发布日期，格式为 `YYYY-MM-DD`                  |
| `updatedAt`   | 否   | 更新日期，格式为 `YYYY-MM-DD`                  |
| `tags`        | 是   | 至少包含一个标签                               |
| `category`    | 是   | 内容分类                                       |
| `featured`    | 否   | 是否进入精选内容，默认 `false`                 |
| `draft`       | 否   | 草稿不会进入页面、RSS 或 Sitemap，默认 `false` |

正文支持 GFM 表格与任务列表、带语言标识的代码块、Mermaid 图和 KaTeX 数学公式。图片必须来自 `public/`，使用相对路径并单独占一个段落，例如：

```markdown
![工程工作台](images/engineering-workbench.jpg '图片说明')
```

Mermaid 图使用语言标识为 `mermaid` 的 fenced code block；行内公式使用 `$...$`，块级公式使用 `$$...$$`。原始 HTML 默认关闭，生成内容会经过清理后再应用代码高亮、KaTeX 与 Mermaid 增强。

## 本地开发

项目使用 Node.js 24 和 npm，首次运行先安装锁定版本的依赖：

```bash
npm ci
npm start
```

开发服务器默认地址为 `http://localhost:4200/`。常用命令如下：

| 命令                              | 用途                                                          |
| --------------------------------- | ------------------------------------------------------------- |
| `npm start`                       | 生成内容并启动 Angular 开发服务器                             |
| `npm run content:build`           | 校验并编译 Markdown，刷新内容清单、RSS、Sitemap 和图标资源    |
| `npm run build:ssr`               | 生成包含浏览器包与 Node 服务端包的生产构建                    |
| `npm run serve:ssr:xiangdong-lab` | 在完成 SSR 构建后运行 Node 服务端包                           |
| `npm run build:pages`             | 为 GitHub Pages 生成完整静态站点并处理仓库子路径和 `404.html` |
| `npm test`                        | 运行 Vitest 单元测试                                          |
| `npm run format`                  | 使用 Prettier 格式化项目                                      |
| `npm run format:check`            | 检查代码与文档格式                                            |

## SSR、SSG 与 GitHub Pages

`npm run build:ssr` 使用默认生产配置和 `outputMode: "server"`，输出浏览器资源及 Node 服务端入口。它适合容器、虚拟机或其他能够持续运行 Node.js 的平台，可按路由在请求到达时渲染页面。

`npm run build:pages` 使用独立的 `pages` 配置和 `outputMode: "static"`。构建脚本会枚举所有公开页面及 Markdown 内容路由，在构建时生成 HTML，并根据 GitHub 仓库类型设置正确的 `base href`。浏览器加载静态 HTML 后仍会执行 Angular Hydration，恢复客户端交互。

GitHub Pages 只能托管静态文件，不能启动 `dist/xiangdong-lab/server/server.mjs`，因此不能提供请求时 SSR。参数化文章路由必须在构建阶段全部枚举，也不能依赖 SPA 回退来补齐页面；`build:pages` 会把预渲染的 404 页面复制为根目录 `404.html`。

## PrimeUI License

PrimeNG 22 使用 PrimeUI 许可证体系。请从 [PrimeUI Community License](https://primeui.dev/licenses/community) 或商业许可证渠道取得有效 key，并在 GitHub 仓库中创建名为 `PRIMEUI_LICENSE_KEY` 的 Actions Secret。内容构建只会把环境变量写入已被 Git 忽略的 `src/app/generated/license.generated.ts`，不会进入可提交的站点配置；浏览器端组件使用它完成离线验证。未配置时本地构建仍可完成，但 PrimeUI 会输出许可证提示。

## 站点配置

修改根目录的 `site.config.json` 来设置站点身份与公开地址：

| 配置                              | 说明                                          |
| --------------------------------- | --------------------------------------------- |
| `name` / `shortName`              | 站点全名与简称                                |
| `author` / `displayName` / `role` | 作者资料                                      |
| `description`                     | 默认 SEO 描述与 RSS 描述                      |
| `siteUrl`                         | 本地构建时使用的生产站点 URL，不要以 `/` 结尾 |
| `repository`                      | GitHub 仓库，格式为 `owner/repository`        |
| `githubUrl` / `githubUser`        | GitHub 主页与用户名                           |
| `locale`                          | 站点与 RSS 的语言，例如 `zh-CN`               |

GitHub Actions 中，`GITHUB_REPOSITORY` 会覆盖配置文件中的 `repository` 来计算部署地址。若仓库名是 `owner.github.io`，站点部署在域名根路径；普通项目仓库则部署在 `/repository/` 子路径。内容构建也支持通过 `SITE_URL` 环境变量临时覆盖 `siteUrl`。

## GitHub Pages 部署

仓库工作流位于 `.github/workflows/deploy-pages.yml`，推送到 `main` 或 `master`，或手动运行 workflow 时会执行：

1. 使用 Node.js 24 和 npm 缓存安装依赖。
2. 运行 `npm run build:pages` 生成静态站点。
3. 上传 `dist/xiangdong-lab/browser` 作为 GitHub Pages artifact。
4. 通过 `github-pages` environment 发布站点。

首次部署前，在 GitHub 仓库的 **Settings > Pages > Build and deployment** 中把 Source 设为 **GitHub Actions**。工作流只需要 GitHub 提供的 `GITHUB_TOKEN`，无需额外保存部署密钥。

## 参考资料

- [Angular LLM 索引](https://angular.cn/llms.txt)
- [Angular 完整 LLM 上下文](https://angular.cn/context/llm-files/llms-full.txt)
- [PrimeNG LLM 索引](https://primeng.dev/llms/llms.txt)
- [PrimeNG 完整 LLM 上下文](https://primeng.dev/llms/llms-full.txt)

首页工程工作台照片来自 [Christopher Gower / Unsplash](https://unsplash.com/photos/m_HRfLhgABo)。
