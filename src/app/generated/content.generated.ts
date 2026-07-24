import type { ContentDocument } from '../core/models/content';

export const CONTENT_DOCUMENTS = [
  {
    "id": "knowledge:angular-rendering-modes",
    "kind": "knowledge",
    "title": "Angular 渲染模式选择指南",
    "slug": "angular-rendering-modes",
    "excerpt": "比较客户端渲染、服务端渲染与预渲染的适用边界，并记录静态托管时的选择原则。",
    "publishedAt": "2026-07-20",
    "tags": [
      "Angular",
      "SSR",
      "SSG",
      "Hydration"
    ],
    "category": "前端架构",
    "featured": true,
    "draft": false,
    "readingMinutes": 2,
    "plainText": "Angular 可以按路由选择渲染方式。判断依据不是“哪种模式更新”，而是页面数据何时可用、是否因用户而异，以及部署平台能否执行服务端代码。模式HTML 生成时机适用场景主要约束客户端渲染浏览器运行时登录后的高交互工具首屏依赖 JavaScript服务端渲染每次请求实时且公开的数据页需要服务端运行环境预渲染构建时博客、文档、作品集数据必须在构建时可得import { RenderMode, type ServerRoute } from '@angular/ssr'; export const serverRoutes: ServerRoute[] = [ { path: '', renderMode: RenderMode.Prerender }, { path: 'blog/**', renderMode: RenderMode.Prerender }, { path: 'account', renderMode: RenderMode.Client }, ];Hydration 的作用SSR 或 SSG 先提供可见 HTML，Hydration 在客户端复用这些 DOM 并接管事件。它不等于重新渲染整页。页面要避免依赖浏览器与服务端不一致的随机值、时间或直接 DOM 操作，否则可能产生内容不匹配。GitHub Pages 的结论GitHub Pages 没有请求时服务端进程，所以部署产物必须是静态文件。个人站可以在代码层保留混合渲染配置，但发布到 Pages 的路由应使用预渲染或客户端渲染；公开内容优先预渲染，以便搜索引擎和禁用 JavaScript 的访问者读取正文。",
    "blocks": [
      {
        "kind": "html",
        "html": "<p>Angular 可以按路由选择渲染方式。判断依据不是“哪种模式更新”，而是页面数据何时可用、是否因用户而异，以及部署平台能否执行服务端代码。</p>\n<table>\n<thead>\n<tr>\n<th>模式</th>\n<th>HTML 生成时机</th>\n<th>适用场景</th>\n<th>主要约束</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>客户端渲染</td>\n<td>浏览器运行时</td>\n<td>登录后的高交互工具</td>\n<td>首屏依赖 JavaScript</td>\n</tr>\n<tr>\n<td>服务端渲染</td>\n<td>每次请求</td>\n<td>实时且公开的数据页</td>\n<td>需要服务端运行环境</td>\n</tr>\n<tr>\n<td>预渲染</td>\n<td>构建时</td>\n<td>博客、文档、作品集</td>\n<td>数据必须在构建时可得</td>\n</tr>\n</tbody>\n</table>\n<pre><code class=\"hljs language-typescript\"><span class=\"hljs-keyword\">import</span> { <span class=\"hljs-title class_\">RenderMode</span>, <span class=\"hljs-keyword\">type</span> <span class=\"hljs-title class_\">ServerRoute</span> } <span class=\"hljs-keyword\">from</span> <span class=\"hljs-string\">'@angular/ssr'</span>;\n\n<span class=\"hljs-keyword\">export</span> <span class=\"hljs-keyword\">const</span> <span class=\"hljs-attr\">serverRoutes</span>: <span class=\"hljs-title class_\">ServerRoute</span>[] = [\n  { <span class=\"hljs-attr\">path</span>: <span class=\"hljs-string\">''</span>, <span class=\"hljs-attr\">renderMode</span>: <span class=\"hljs-title class_\">RenderMode</span>.<span class=\"hljs-property\">Prerender</span> },\n  { <span class=\"hljs-attr\">path</span>: <span class=\"hljs-string\">'blog/**'</span>, <span class=\"hljs-attr\">renderMode</span>: <span class=\"hljs-title class_\">RenderMode</span>.<span class=\"hljs-property\">Prerender</span> },\n  { <span class=\"hljs-attr\">path</span>: <span class=\"hljs-string\">'account'</span>, <span class=\"hljs-attr\">renderMode</span>: <span class=\"hljs-title class_\">RenderMode</span>.<span class=\"hljs-property\">Client</span> },\n];\n</code></pre>\n<h2 id=\"user-content-hydration-的作用\"><a class=\"heading-anchor\" href=\"/knowledge/angular-rendering-modes/#user-content-hydration-的作用\">Hydration 的作用</a></h2>\n<p>SSR 或 SSG 先提供可见 HTML，Hydration 在客户端复用这些 DOM 并接管事件。它不等于重新渲染整页。页面要避免依赖浏览器与服务端不一致的随机值、时间或直接 DOM 操作，否则可能产生内容不匹配。</p>\n<h2 id=\"user-content-github-pages-的结论\"><a class=\"heading-anchor\" href=\"/knowledge/angular-rendering-modes/#user-content-github-pages-的结论\">GitHub Pages 的结论</a></h2>\n<p>GitHub Pages 没有请求时服务端进程，所以部署产物必须是静态文件。个人站可以在代码层保留混合渲染配置，但发布到 Pages 的路由应使用预渲染或客户端渲染；公开内容优先预渲染，以便搜索引擎和禁用 JavaScript 的访问者读取正文。</p>"
      }
    ]
  },
  {
    "id": "blog:angular-ssg-github-pages",
    "kind": "blog",
    "title": "用 Angular SSG 构建可部署到 GitHub Pages 的个人站",
    "slug": "angular-ssg-github-pages",
    "excerpt": "拆解 Angular 预渲染、Hydration 与 GitHub Pages 静态托管之间的边界，并给出一条可复现的发布路径。",
    "publishedAt": "2026-07-18",
    "updatedAt": "2026-07-22",
    "tags": [
      "Angular",
      "SSG",
      "GitHub Pages",
      "Hydration"
    ],
    "category": "前端工程",
    "featured": true,
    "draft": false,
    "readingMinutes": 2,
    "plainText": "个人站的大多数页面面向所有访客展示相同内容，文章也能在构建时确定，因此很适合预渲染。Angular 在构建阶段生成完整 HTML，浏览器再通过 Hydration 恢复交互，首屏、SEO 与客户端体验可以同时兼顾。工程工作台先明确部署边界GitHub Pages 只提供静态文件托管，不能在请求到来时运行 Node.js 服务。所以项目可以保留 Angular 的服务端渲染能力，但部署到 GitHub Pages 的公开路由必须产出为预渲染页面。import { RenderMode, type ServerRoute } from '@angular/ssr'; export const serverRoutes: ServerRoute[] = [ { path: 'blog/**', renderMode: RenderMode.Prerender }, { path: 'knowledge/**', renderMode: RenderMode.Prerender }, { path: '**', renderMode: RenderMode.Prerender }, ];如果未来迁移到可运行服务端进程的平台，可以把需要实时数据的路由切换为 RenderMode.Server，而无需改变其他静态页面。发布流程构建产物应使用仓库名作为基础路径，并由 GitHub Actions 发布到 Pages。部署前至少确认以下事项：所有公开路由都能在构建时枚举静态资源路径包含正确的 base href直接访问深层链接不会落到空白页sitemap.xml、rss.xml 与 robots.txt 已进入产物在正式域名启用后更新 canonical URLnpm ci npm run build -- --configuration production --base-href /xiangdong-lab/验收标准不要只验证首页。随机抽取一篇博客、一个知识库条目和一个标签页，关闭 JavaScript 后确认标题与正文仍然存在；重新启用 JavaScript，再检查筛选、主题切换等交互是否在 Hydration 后正常工作。",
    "blocks": [
      {
        "kind": "html",
        "html": "<p>个人站的大多数页面面向所有访客展示相同内容，文章也能在构建时确定，因此很适合预渲染。Angular 在构建阶段生成完整 HTML，浏览器再通过 Hydration 恢复交互，首屏、SEO 与客户端体验可以同时兼顾。</p>"
      },
      {
        "kind": "image",
        "src": "images/engineering-workbench.jpg",
        "alt": "工程工作台",
        "caption": "把内容和代码放在同一个版本周期中",
        "width": 1920,
        "height": 1278
      },
      {
        "kind": "html",
        "html": "<h2 id=\"user-content-先明确部署边界\"><a class=\"heading-anchor\" href=\"/blog/angular-ssg-github-pages/#user-content-先明确部署边界\">先明确部署边界</a></h2>\n<p>GitHub Pages 只提供静态文件托管，不能在请求到来时运行 Node.js 服务。所以项目可以保留 Angular 的服务端渲染能力，但部署到 GitHub Pages 的公开路由必须产出为预渲染页面。</p>\n<pre><code class=\"hljs language-typescript\"><span class=\"hljs-keyword\">import</span> { <span class=\"hljs-title class_\">RenderMode</span>, <span class=\"hljs-keyword\">type</span> <span class=\"hljs-title class_\">ServerRoute</span> } <span class=\"hljs-keyword\">from</span> <span class=\"hljs-string\">'@angular/ssr'</span>;\n\n<span class=\"hljs-keyword\">export</span> <span class=\"hljs-keyword\">const</span> <span class=\"hljs-attr\">serverRoutes</span>: <span class=\"hljs-title class_\">ServerRoute</span>[] = [\n  { <span class=\"hljs-attr\">path</span>: <span class=\"hljs-string\">'blog/**'</span>, <span class=\"hljs-attr\">renderMode</span>: <span class=\"hljs-title class_\">RenderMode</span>.<span class=\"hljs-property\">Prerender</span> },\n  { <span class=\"hljs-attr\">path</span>: <span class=\"hljs-string\">'knowledge/**'</span>, <span class=\"hljs-attr\">renderMode</span>: <span class=\"hljs-title class_\">RenderMode</span>.<span class=\"hljs-property\">Prerender</span> },\n  { <span class=\"hljs-attr\">path</span>: <span class=\"hljs-string\">'**'</span>, <span class=\"hljs-attr\">renderMode</span>: <span class=\"hljs-title class_\">RenderMode</span>.<span class=\"hljs-property\">Prerender</span> },\n];\n</code></pre>\n<p>如果未来迁移到可运行服务端进程的平台，可以把需要实时数据的路由切换为 <code>RenderMode.Server</code>，而无需改变其他静态页面。</p>\n<h2 id=\"user-content-发布流程\"><a class=\"heading-anchor\" href=\"/blog/angular-ssg-github-pages/#user-content-发布流程\">发布流程</a></h2>\n<p>构建产物应使用仓库名作为基础路径，并由 GitHub Actions 发布到 Pages。部署前至少确认以下事项：</p>\n<ul class=\"contains-task-list\">\n<li class=\"task-list-item\"><input type=\"checkbox\" checked disabled> 所有公开路由都能在构建时枚举</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" checked disabled> 静态资源路径包含正确的 <code>base href</code></li>\n<li class=\"task-list-item\"><input type=\"checkbox\" checked disabled> 直接访问深层链接不会落到空白页</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" checked disabled> <code>sitemap.xml</code>、<code>rss.xml</code> 与 <code>robots.txt</code> 已进入产物</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 在正式域名启用后更新 canonical URL</li>\n</ul>\n<pre><code class=\"hljs language-shell\">npm ci\nnpm run build -- --configuration production --base-href /xiangdong-lab/\n</code></pre>\n<h2 id=\"user-content-验收标准\"><a class=\"heading-anchor\" href=\"/blog/angular-ssg-github-pages/#user-content-验收标准\">验收标准</a></h2>\n<p>不要只验证首页。随机抽取一篇博客、一个知识库条目和一个标签页，关闭 JavaScript 后确认标题与正文仍然存在；重新启用 JavaScript，再检查筛选、主题切换等交互是否在 Hydration 后正常工作。</p>"
      }
    ]
  },
  {
    "id": "knowledge:kubernetes-troubleshooting",
    "kind": "knowledge",
    "title": "Kubernetes 服务排障速查",
    "slug": "kubernetes-troubleshooting",
    "excerpt": "按影响、工作负载、事件、日志与依赖的顺序缩小 Kubernetes 故障范围。",
    "publishedAt": "2026-07-16",
    "tags": [
      "Kubernetes",
      "排障",
      "SRE",
      "运行手册"
    ],
    "category": "云原生",
    "featured": false,
    "draft": false,
    "readingMinutes": 2,
    "plainText": "排障的目标是快速缩小问题范围，同时保留证据。先确认用户影响与时间窗口，再进入具体 Pod，避免被单条异常日志带偏。第一轮检查确认环境、命名空间、服务名与影响开始时间检查 Deployment 的期望副本与可用副本查看 Pod 状态、重启次数和节点分布按时间排序读取 Warning 事件使用请求 ID 或 trace ID 关联应用日志检查上游流量与下游依赖是否同时异常kubectl -n sweetwater get deploy,pod -l app=sweetwater-payments-service -o wide kubectl -n sweetwater describe deploy sweetwater-payments-service kubectl -n sweetwater get events --sort-by=.metadata.creationTimestamp kubectl -n sweetwater logs deploy/sweetwater-payments-service --since=20m --all-containers --prefix常见状态如何继续现象优先检查下一步证据Pending资源请求、调度约束、PVCPod 事件与调度器消息CrashLoopBackOff启动参数、配置、依赖当前日志与 --previous 日志ImagePullBackOff镜像名、标签、凭据Pod 事件与仓库权限就绪探针失败探针路径、端口、启动耗时容器日志与探针响应延迟升高但 Pod 正常数据库、网络、限流指标、追踪与依赖日志需要修改配置或重启工作负载前，先记录当前副本、镜像摘要、事件和关键指标。恢复服务后仍要补齐时间线、根因与防复发动作，而不是把“重启后正常”当作结论。",
    "blocks": [
      {
        "kind": "html",
        "html": "<p>排障的目标是快速缩小问题范围，同时保留证据。先确认用户影响与时间窗口，再进入具体 Pod，避免被单条异常日志带偏。</p>\n<h2 id=\"user-content-第一轮检查\"><a class=\"heading-anchor\" href=\"/knowledge/kubernetes-troubleshooting/#user-content-第一轮检查\">第一轮检查</a></h2>\n<ul class=\"contains-task-list\">\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 确认环境、命名空间、服务名与影响开始时间</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 检查 Deployment 的期望副本与可用副本</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 查看 Pod 状态、重启次数和节点分布</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 按时间排序读取 Warning 事件</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 使用请求 ID 或 trace ID 关联应用日志</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 检查上游流量与下游依赖是否同时异常</li>\n</ul>\n<pre><code class=\"hljs language-shell\">kubectl -n sweetwater get deploy,pod -l app=sweetwater-payments-service -o wide\nkubectl -n sweetwater describe deploy sweetwater-payments-service\nkubectl -n sweetwater get events --sort-by=.metadata.creationTimestamp\nkubectl -n sweetwater logs deploy/sweetwater-payments-service --since=20m --all-containers --prefix\n</code></pre>\n<h2 id=\"user-content-常见状态如何继续\"><a class=\"heading-anchor\" href=\"/knowledge/kubernetes-troubleshooting/#user-content-常见状态如何继续\">常见状态如何继续</a></h2>\n<table>\n<thead>\n<tr>\n<th>现象</th>\n<th>优先检查</th>\n<th>下一步证据</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><code>Pending</code></td>\n<td>资源请求、调度约束、PVC</td>\n<td>Pod 事件与调度器消息</td>\n</tr>\n<tr>\n<td><code>CrashLoopBackOff</code></td>\n<td>启动参数、配置、依赖</td>\n<td>当前日志与 <code>--previous</code> 日志</td>\n</tr>\n<tr>\n<td><code>ImagePullBackOff</code></td>\n<td>镜像名、标签、凭据</td>\n<td>Pod 事件与仓库权限</td>\n</tr>\n<tr>\n<td>就绪探针失败</td>\n<td>探针路径、端口、启动耗时</td>\n<td>容器日志与探针响应</td>\n</tr>\n<tr>\n<td>延迟升高但 Pod 正常</td>\n<td>数据库、网络、限流</td>\n<td>指标、追踪与依赖日志</td>\n</tr>\n</tbody>\n</table>\n<p>需要修改配置或重启工作负载前，先记录当前副本、镜像摘要、事件和关键指标。恢复服务后仍要补齐时间线、根因与防复发动作，而不是把“重启后正常”当作结论。</p>"
      }
    ]
  },
  {
    "id": "knowledge:typescript-signal-patterns",
    "kind": "knowledge",
    "title": "TypeScript 与 Angular Signal 状态模式",
    "slug": "typescript-signal-patterns",
    "excerpt": "用只读派生状态、不可变更新和明确类型边界组织 Angular 组件的本地状态。",
    "publishedAt": "2026-07-12",
    "tags": [
      "TypeScript",
      "Angular",
      "Signal",
      "状态管理"
    ],
    "category": "前端架构",
    "featured": false,
    "draft": false,
    "readingMinutes": 1,
    "plainText": "Signal 适合表达组件内部同步状态。原始状态保持最小，派生值使用 computed()，更新通过 set() 或 update() 完成，这样状态变化更容易跟踪和测试。import { computed, signal } from '@angular/core'; interface Article { readonly slug: string; readonly title: string; readonly tags: readonly string[]; } export class ArticleFilterState { private readonly articles = signal<readonly Article[]>([]); readonly selectedTag = signal<string | null>(null); readonly visibleArticles = computed(() => { const tag = this.selectedTag(); return tag ? this.articles().filter((article) => article.tags.includes(tag)) : this.articles(); }); selectTag(tag: string): void { this.selectedTag.update((current) => (current === tag ? null : tag)); } replaceArticles(articles: readonly Article[]): void { this.articles.set([...articles]); } }约束清单状态类型使用具体接口或联合类型，不用 any派生状态只读取其他 signal，不在 computed() 中产生副作用数组与对象采用不可变更新，不依赖原地修改异步请求与取消逻辑放到服务边界，不塞进模板表达式模板调用只保留轻量读取，复杂筛选提前派生当状态需要跨越多个功能域、持久化或协调复杂异步流程时，应重新评估边界。Signal 是响应式原语，不必承担整个应用的数据层职责。",
    "blocks": [
      {
        "kind": "html",
        "html": "<p>Signal 适合表达组件内部同步状态。原始状态保持最小，派生值使用 <code>computed()</code>，更新通过 <code>set()</code> 或 <code>update()</code> 完成，这样状态变化更容易跟踪和测试。</p>\n<pre><code class=\"hljs language-typescript\"><span class=\"hljs-keyword\">import</span> { computed, signal } <span class=\"hljs-keyword\">from</span> <span class=\"hljs-string\">'@angular/core'</span>;\n\n<span class=\"hljs-keyword\">interface</span> <span class=\"hljs-title class_\">Article</span> {\n  <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-attr\">slug</span>: <span class=\"hljs-built_in\">string</span>;\n  <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-attr\">title</span>: <span class=\"hljs-built_in\">string</span>;\n  <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-attr\">tags</span>: <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-built_in\">string</span>[];\n}\n\n<span class=\"hljs-keyword\">export</span> <span class=\"hljs-keyword\">class</span> <span class=\"hljs-title class_\">ArticleFilterState</span> {\n  <span class=\"hljs-keyword\">private</span> <span class=\"hljs-keyword\">readonly</span> articles = signal&#x3C;<span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-title class_\">Article</span>[]>([]);\n  <span class=\"hljs-keyword\">readonly</span> selectedTag = signal&#x3C;<span class=\"hljs-built_in\">string</span> | <span class=\"hljs-literal\">null</span>>(<span class=\"hljs-literal\">null</span>);\n\n  <span class=\"hljs-keyword\">readonly</span> visibleArticles = <span class=\"hljs-title function_\">computed</span>(<span class=\"hljs-function\">() =></span> {\n    <span class=\"hljs-keyword\">const</span> tag = <span class=\"hljs-variable language_\">this</span>.<span class=\"hljs-title function_\">selectedTag</span>();\n    <span class=\"hljs-keyword\">return</span> tag ? <span class=\"hljs-variable language_\">this</span>.<span class=\"hljs-title function_\">articles</span>().<span class=\"hljs-title function_\">filter</span>(<span class=\"hljs-function\">(<span class=\"hljs-params\">article</span>) =></span> article.<span class=\"hljs-property\">tags</span>.<span class=\"hljs-title function_\">includes</span>(tag)) : <span class=\"hljs-variable language_\">this</span>.<span class=\"hljs-title function_\">articles</span>();\n  });\n\n  <span class=\"hljs-title function_\">selectTag</span>(<span class=\"hljs-attr\">tag</span>: <span class=\"hljs-built_in\">string</span>): <span class=\"hljs-built_in\">void</span> {\n    <span class=\"hljs-variable language_\">this</span>.<span class=\"hljs-property\">selectedTag</span>.<span class=\"hljs-title function_\">update</span>(<span class=\"hljs-function\">(<span class=\"hljs-params\">current</span>) =></span> (current === tag ? <span class=\"hljs-literal\">null</span> : tag));\n  }\n\n  <span class=\"hljs-title function_\">replaceArticles</span>(<span class=\"hljs-attr\">articles</span>: <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-title class_\">Article</span>[]): <span class=\"hljs-built_in\">void</span> {\n    <span class=\"hljs-variable language_\">this</span>.<span class=\"hljs-property\">articles</span>.<span class=\"hljs-title function_\">set</span>([...articles]);\n  }\n}\n</code></pre>\n<h2 id=\"user-content-约束清单\"><a class=\"heading-anchor\" href=\"/knowledge/typescript-signal-patterns/#user-content-约束清单\">约束清单</a></h2>\n<ul>\n<li>状态类型使用具体接口或联合类型，不用 <code>any</code></li>\n<li>派生状态只读取其他 signal，不在 <code>computed()</code> 中产生副作用</li>\n<li>数组与对象采用不可变更新，不依赖原地修改</li>\n<li>异步请求与取消逻辑放到服务边界，不塞进模板表达式</li>\n<li>模板调用只保留轻量读取，复杂筛选提前派生</li>\n</ul>\n<p>当状态需要跨越多个功能域、持久化或协调复杂异步流程时，应重新评估边界。Signal 是响应式原语，不必承担整个应用的数据层职责。</p>"
      }
    ]
  },
  {
    "id": "blog:observable-service-practice",
    "kind": "blog",
    "title": "从请求到告警：可观测服务的最小闭环",
    "slug": "observable-service-practice",
    "excerpt": "用日志、指标与追踪串起一次请求，并从用户影响出发设计可行动的告警。",
    "publishedAt": "2026-07-11",
    "tags": [
      "可观测性",
      "SRE",
      "OpenTelemetry",
      "Kubernetes"
    ],
    "category": "服务工程",
    "featured": true,
    "draft": false,
    "readingMinutes": 2,
    "plainText": "可观测性不是多装几个采集器，而是让一次用户请求能被定位、解释和复盘。最小闭环应回答三个问题：发生了什么、影响了谁、下一步做什么。flowchart LR A[客户端请求] --> B[网关] B --> C[应用服务] C --> D[(数据库)] B -. trace_id .-> E[追踪] C -. 结构化事件 .-> F[日志] C -. RED 指标 .-> G[指标] E --> H[故障定位] F --> H G --> I[告警] I --> H三类信号各司其职信号最适合回答最低要求指标问题是否正在扩大请求量、错误率、延迟分位数日志某次失败经历了什么时间、级别、服务名、trace_id追踪时间消耗在哪个依赖跨服务上下文、关键 span 属性服务可用率可以写成：A = \\frac{N_{successful}}{N_{total}} \\times 100\\%但单个平均值会掩盖尾部问题。告警应同时考虑错误预算消耗速度和持续时间，避免每次瞬时抖动都唤醒值班人员。让告警可以行动每条告警都应包含受影响的服务与环境、观察窗口、当前值与阈值、仪表盘链接，以及第一步排查命令。没有明确处置动作的告警更适合作为仪表盘信号。kubectl -n sweetwater get pods -l app=payments kubectl -n sweetwater logs deploy/payments --since=15m --prefix上线后用一次受控失败验证整条链路：制造可识别错误，确认指标上升、日志携带相同 trace_id、追踪标记错误，并检查告警能否指向正确的运行手册。",
    "blocks": [
      {
        "kind": "html",
        "html": "<p>可观测性不是多装几个采集器，而是让一次用户请求能被定位、解释和复盘。最小闭环应回答三个问题：发生了什么、影响了谁、下一步做什么。</p>\n<div class=\"mermaid\">flowchart LR\n  A[客户端请求] --> B[网关]\n  B --> C[应用服务]\n  C --> D[(数据库)]\n  B -. trace_id .-> E[追踪]\n  C -. 结构化事件 .-> F[日志]\n  C -. RED 指标 .-> G[指标]\n  E --> H[故障定位]\n  F --> H\n  G --> I[告警]\n  I --> H\n</div>\n<h2 id=\"user-content-三类信号各司其职\"><a class=\"heading-anchor\" href=\"/blog/observable-service-practice/#user-content-三类信号各司其职\">三类信号各司其职</a></h2>\n<table>\n<thead>\n<tr>\n<th>信号</th>\n<th>最适合回答</th>\n<th>最低要求</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>指标</td>\n<td>问题是否正在扩大</td>\n<td>请求量、错误率、延迟分位数</td>\n</tr>\n<tr>\n<td>日志</td>\n<td>某次失败经历了什么</td>\n<td>时间、级别、服务名、<code>trace_id</code></td>\n</tr>\n<tr>\n<td>追踪</td>\n<td>时间消耗在哪个依赖</td>\n<td>跨服务上下文、关键 span 属性</td>\n</tr>\n</tbody>\n</table>\n<p>服务可用率可以写成：</p>\n<span class=\"katex-display\"><span class=\"katex\"><span class=\"katex-mathml\"><math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\"><semantics><mrow><mi>A</mi><mo>=</mo><mfrac><msub><mi>N</mi><mrow><mi>s</mi><mi>u</mi><mi>c</mi><mi>c</mi><mi>e</mi><mi>s</mi><mi>s</mi><mi>f</mi><mi>u</mi><mi>l</mi></mrow></msub><msub><mi>N</mi><mrow><mi>t</mi><mi>o</mi><mi>t</mi><mi>a</mi><mi>l</mi></mrow></msub></mfrac><mo>×</mo><mn>100</mn><mi mathvariant=\"normal\">%</mi></mrow><annotation encoding=\"application/x-tex\">A = \\frac{N_{successful}}{N_{total}} \\times 100\\%</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"base\"><span class=\"strut\" style=\"height:0.6833em;\"></span><span class=\"mord mathnormal\">A</span><span class=\"mspace\" style=\"margin-right:0.2778em;\"></span><span class=\"mrel\">=</span><span class=\"mspace\" style=\"margin-right:0.2778em;\"></span></span><span class=\"base\"><span class=\"strut\" style=\"height:2.1963em;vertical-align:-0.836em;\"></span><span class=\"mord\"><span class=\"mopen nulldelimiter\"></span><span class=\"mfrac\"><span class=\"vlist-t vlist-t2\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:1.3603em;\"><span style=\"top:-2.314em;\"><span class=\"pstrut\" style=\"height:3em;\"></span><span class=\"mord\"><span class=\"mord\"><span class=\"mord mathnormal\" style=\"margin-right:0.109em;\">N</span><span class=\"msupsub\"><span class=\"vlist-t vlist-t2\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.3361em;\"><span style=\"top:-2.55em;margin-left:-0.109em;margin-right:0.05em;\"><span class=\"pstrut\" style=\"height:2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mtight\"><span class=\"mord mathnormal mtight\">t</span><span class=\"mord mathnormal mtight\">o</span><span class=\"mord mathnormal mtight\">t</span><span class=\"mord mathnormal mtight\">a</span><span class=\"mord mathnormal mtight\" style=\"margin-right:0.0197em;\">l</span></span></span></span></span><span class=\"vlist-s\">​</span></span><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.15em;\"><span></span></span></span></span></span></span></span></span><span style=\"top:-3.23em;\"><span class=\"pstrut\" style=\"height:3em;\"></span><span class=\"frac-line\" style=\"border-bottom-width:0.04em;\"></span></span><span style=\"top:-3.677em;\"><span class=\"pstrut\" style=\"height:3em;\"></span><span class=\"mord\"><span class=\"mord\"><span class=\"mord mathnormal\" style=\"margin-right:0.109em;\">N</span><span class=\"msupsub\"><span class=\"vlist-t vlist-t2\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.3361em;\"><span style=\"top:-2.55em;margin-left:-0.109em;margin-right:0.05em;\"><span class=\"pstrut\" style=\"height:2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mtight\"><span class=\"mord mathnormal mtight\">s</span><span class=\"mord mathnormal mtight\">u</span><span class=\"mord mathnormal mtight\">ccess</span><span class=\"mord mathnormal mtight\" style=\"margin-right:0.1076em;\">f</span><span class=\"mord mathnormal mtight\">u</span><span class=\"mord mathnormal mtight\" style=\"margin-right:0.0197em;\">l</span></span></span></span></span><span class=\"vlist-s\">​</span></span><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.2861em;\"><span></span></span></span></span></span></span></span></span></span><span class=\"vlist-s\">​</span></span><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.836em;\"><span></span></span></span></span></span><span class=\"mclose nulldelimiter\"></span></span><span class=\"mspace\" style=\"margin-right:0.2222em;\"></span><span class=\"mbin\">×</span><span class=\"mspace\" style=\"margin-right:0.2222em;\"></span></span><span class=\"base\"><span class=\"strut\" style=\"height:0.8056em;vertical-align:-0.0556em;\"></span><span class=\"mord\">100%</span></span></span></span></span>\n<p>但单个平均值会掩盖尾部问题。告警应同时考虑错误预算消耗速度和持续时间，避免每次瞬时抖动都唤醒值班人员。</p>\n<h2 id=\"user-content-让告警可以行动\"><a class=\"heading-anchor\" href=\"/blog/observable-service-practice/#user-content-让告警可以行动\">让告警可以行动</a></h2>\n<p>每条告警都应包含受影响的服务与环境、观察窗口、当前值与阈值、仪表盘链接，以及第一步排查命令。没有明确处置动作的告警更适合作为仪表盘信号。</p>\n<pre><code class=\"hljs language-shell\">kubectl -n sweetwater get pods -l app=payments\nkubectl -n sweetwater logs deploy/payments --since=15m --prefix\n</code></pre>\n<p>上线后用一次受控失败验证整条链路：制造可识别错误，确认指标上升、日志携带相同 <code>trace_id</code>、追踪标记错误，并检查告警能否指向正确的运行手册。</p>"
      }
    ]
  },
  {
    "id": "knowledge:seo-checklist",
    "kind": "knowledge",
    "title": "静态内容站 SEO 检查清单",
    "slug": "seo-checklist",
    "excerpt": "覆盖可抓取 HTML、元数据、站点地图、结构化内容与发布后验证的静态站 SEO 清单。",
    "publishedAt": "2026-07-08",
    "tags": [
      "SEO",
      "Sitemap",
      "RSS",
      "静态站点"
    ],
    "category": "内容工程",
    "featured": false,
    "draft": false,
    "readingMinutes": 2,
    "plainText": "SEO 的基础不是堆关键词，而是让搜索引擎稳定发现、理解并更新内容。对预渲染站点而言，大部分问题都可以在构建阶段自动检查。页面级每个可索引页面都有唯一且清晰的 title摘要准确描述正文，并控制在搜索结果可读的长度内页面只有一个主标题，后续标题层级连续canonical URL 使用正式域名和最终路径Open Graph 标题、摘要与分享图可访问图片包含有意义的替代文本和稳定尺寸关闭 JavaScript 后仍能读取标题、摘要和正文站点级sitemap.xml 只包含规范且可索引的 URLrobots.txt 引用站点地图，不误拦公开内容RSS 包含稳定 GUID、发布日期、标题与文章链接标签页和分页页有清晰的索引策略删除或迁移的 slug 有明确重定向生产环境返回正确的状态码与内容类型发布后验证检查项方法失败信号可抓取内容查看原始 HTML正文只在脚本执行后出现Canonical抽查首页、文章页、标签页指向预览域名或重复路径Sitemap解析 XML 并抽样访问 URL包含 404、草稿或重复地址分享卡片使用平台调试工具重新抓取图片失败或标题被截断性能检查真实用户与实验室数据LCP、INP 或 CLS 持续恶化检查应进入持续集成：frontmatter、重复 slug、失效链接与站点地图可以自动阻断发布；搜索引擎收录和真实用户性能则需要在发布后持续观察。",
    "blocks": [
      {
        "kind": "html",
        "html": "<p>SEO 的基础不是堆关键词，而是让搜索引擎稳定发现、理解并更新内容。对预渲染站点而言，大部分问题都可以在构建阶段自动检查。</p>\n<h2 id=\"user-content-页面级\"><a class=\"heading-anchor\" href=\"/knowledge/seo-checklist/#user-content-页面级\">页面级</a></h2>\n<ul class=\"contains-task-list\">\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 每个可索引页面都有唯一且清晰的 <code>title</code></li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 摘要准确描述正文，并控制在搜索结果可读的长度内</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 页面只有一个主标题，后续标题层级连续</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> canonical URL 使用正式域名和最终路径</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> Open Graph 标题、摘要与分享图可访问</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 图片包含有意义的替代文本和稳定尺寸</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 关闭 JavaScript 后仍能读取标题、摘要和正文</li>\n</ul>\n<h2 id=\"user-content-站点级\"><a class=\"heading-anchor\" href=\"/knowledge/seo-checklist/#user-content-站点级\">站点级</a></h2>\n<ul class=\"contains-task-list\">\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> <code>sitemap.xml</code> 只包含规范且可索引的 URL</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> <code>robots.txt</code> 引用站点地图，不误拦公开内容</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> RSS 包含稳定 GUID、发布日期、标题与文章链接</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 标签页和分页页有清晰的索引策略</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 删除或迁移的 slug 有明确重定向</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 生产环境返回正确的状态码与内容类型</li>\n</ul>\n<h2 id=\"user-content-发布后验证\"><a class=\"heading-anchor\" href=\"/knowledge/seo-checklist/#user-content-发布后验证\">发布后验证</a></h2>\n<table>\n<thead>\n<tr>\n<th>检查项</th>\n<th>方法</th>\n<th>失败信号</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>可抓取内容</td>\n<td>查看原始 HTML</td>\n<td>正文只在脚本执行后出现</td>\n</tr>\n<tr>\n<td>Canonical</td>\n<td>抽查首页、文章页、标签页</td>\n<td>指向预览域名或重复路径</td>\n</tr>\n<tr>\n<td>Sitemap</td>\n<td>解析 XML 并抽样访问 URL</td>\n<td>包含 404、草稿或重复地址</td>\n</tr>\n<tr>\n<td>分享卡片</td>\n<td>使用平台调试工具重新抓取</td>\n<td>图片失败或标题被截断</td>\n</tr>\n<tr>\n<td>性能</td>\n<td>检查真实用户与实验室数据</td>\n<td>LCP、INP 或 CLS 持续恶化</td>\n</tr>\n</tbody>\n</table>\n<p>检查应进入持续集成：frontmatter、重复 slug、失效链接与站点地图可以自动阻断发布；搜索引擎收录和真实用户性能则需要在发布后持续观察。</p>"
      }
    ]
  },
  {
    "id": "blog:markdown-knowledge-system",
    "kind": "blog",
    "title": "把 Markdown 文章变成可维护的知识系统",
    "slug": "markdown-knowledge-system",
    "excerpt": "从内容契约、构建校验到标签检索，说明如何让 Markdown 仓库长期保持可发现与可演进。",
    "publishedAt": "2026-07-03",
    "tags": [
      "Markdown",
      "知识管理",
      "内容工程",
      "搜索"
    ],
    "category": "知识工程",
    "featured": false,
    "draft": false,
    "readingMinutes": 2,
    "plainText": "Markdown 解决的是写作格式，知识系统还要解决内容契约、关联与检索。文章和代码进入同一个版本周期后，评审、回滚与自动发布都能复用现有工程流程。用 frontmatter 建立契约字段应少而稳定。标题、摘要和发布日期服务于列表与 SEO，标签用于横向关联，分类用于建立主路径。slug 一旦公开就不应随标题变化。export interface ContentMeta { readonly title: string; readonly slug: string; readonly excerpt: string; readonly publishedAt: string; readonly tags: readonly string[]; readonly category: string; readonly featured: boolean; readonly draft: false; }构建阶段应拒绝重复 slug、无效日期和缺失字段，而不是等到页面运行时再降级处理。检索不是标题匹配一个轻量的本地索引可以综合标题、标签和正文命中。设各字段的标准化相关度为 r_t、r_g 和 r_b，可先使用简单加权：score = 0.5r_t + 0.3r_g + 0.2r_b权重不是永久规则，应根据真实搜索词和零结果查询迭代。中文检索还要明确分词策略；内容量较小时，构建期生成索引通常比引入远程搜索服务更容易维护。保持链接可用在 CI 中校验 frontmatter为标题生成稳定锚点构建时检查站内链接与图片路径定期合并同义标签为被替换文章保留重定向记录好的知识系统不追求无限分类，而是让读者从搜索结果、标签页或正文链接出发，都能在两三步内找到可信的下一条信息。",
    "blocks": [
      {
        "kind": "html",
        "html": "<p>Markdown 解决的是写作格式，知识系统还要解决内容契约、关联与检索。文章和代码进入同一个版本周期后，评审、回滚与自动发布都能复用现有工程流程。</p>\n<h2 id=\"user-content-用-frontmatter-建立契约\"><a class=\"heading-anchor\" href=\"/blog/markdown-knowledge-system/#user-content-用-frontmatter-建立契约\">用 frontmatter 建立契约</a></h2>\n<p>字段应少而稳定。标题、摘要和发布日期服务于列表与 SEO，标签用于横向关联，分类用于建立主路径。<code>slug</code> 一旦公开就不应随标题变化。</p>\n<pre><code class=\"hljs language-typescript\"><span class=\"hljs-keyword\">export</span> <span class=\"hljs-keyword\">interface</span> <span class=\"hljs-title class_\">ContentMeta</span> {\n  <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-attr\">title</span>: <span class=\"hljs-built_in\">string</span>;\n  <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-attr\">slug</span>: <span class=\"hljs-built_in\">string</span>;\n  <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-attr\">excerpt</span>: <span class=\"hljs-built_in\">string</span>;\n  <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-attr\">publishedAt</span>: <span class=\"hljs-built_in\">string</span>;\n  <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-attr\">tags</span>: <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-built_in\">string</span>[];\n  <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-attr\">category</span>: <span class=\"hljs-built_in\">string</span>;\n  <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-attr\">featured</span>: <span class=\"hljs-built_in\">boolean</span>;\n  <span class=\"hljs-keyword\">readonly</span> <span class=\"hljs-attr\">draft</span>: <span class=\"hljs-literal\">false</span>;\n}\n</code></pre>\n<p>构建阶段应拒绝重复 slug、无效日期和缺失字段，而不是等到页面运行时再降级处理。</p>\n<h2 id=\"user-content-检索不是标题匹配\"><a class=\"heading-anchor\" href=\"/blog/markdown-knowledge-system/#user-content-检索不是标题匹配\">检索不是标题匹配</a></h2>\n<p>一个轻量的本地索引可以综合标题、标签和正文命中。设各字段的标准化相关度为 <span class=\"katex\"><span class=\"katex-mathml\"><math xmlns=\"http://www.w3.org/1998/Math/MathML\"><semantics><mrow><msub><mi>r</mi><mi>t</mi></msub></mrow><annotation encoding=\"application/x-tex\">r_t</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"base\"><span class=\"strut\" style=\"height:0.5806em;vertical-align:-0.15em;\"></span><span class=\"mord\"><span class=\"mord mathnormal\" style=\"margin-right:0.0278em;\">r</span><span class=\"msupsub\"><span class=\"vlist-t vlist-t2\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.2806em;\"><span style=\"top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;\"><span class=\"pstrut\" style=\"height:2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mathnormal mtight\">t</span></span></span></span><span class=\"vlist-s\">​</span></span><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.15em;\"><span></span></span></span></span></span></span></span></span></span>、<span class=\"katex\"><span class=\"katex-mathml\"><math xmlns=\"http://www.w3.org/1998/Math/MathML\"><semantics><mrow><msub><mi>r</mi><mi>g</mi></msub></mrow><annotation encoding=\"application/x-tex\">r_g</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"base\"><span class=\"strut\" style=\"height:0.7167em;vertical-align:-0.2861em;\"></span><span class=\"mord\"><span class=\"mord mathnormal\" style=\"margin-right:0.0278em;\">r</span><span class=\"msupsub\"><span class=\"vlist-t vlist-t2\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.1514em;\"><span style=\"top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;\"><span class=\"pstrut\" style=\"height:2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mathnormal mtight\" style=\"margin-right:0.0359em;\">g</span></span></span></span><span class=\"vlist-s\">​</span></span><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.2861em;\"><span></span></span></span></span></span></span></span></span></span> 和 <span class=\"katex\"><span class=\"katex-mathml\"><math xmlns=\"http://www.w3.org/1998/Math/MathML\"><semantics><mrow><msub><mi>r</mi><mi>b</mi></msub></mrow><annotation encoding=\"application/x-tex\">r_b</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"base\"><span class=\"strut\" style=\"height:0.5806em;vertical-align:-0.15em;\"></span><span class=\"mord\"><span class=\"mord mathnormal\" style=\"margin-right:0.0278em;\">r</span><span class=\"msupsub\"><span class=\"vlist-t vlist-t2\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.3361em;\"><span style=\"top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;\"><span class=\"pstrut\" style=\"height:2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mathnormal mtight\">b</span></span></span></span><span class=\"vlist-s\">​</span></span><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.15em;\"><span></span></span></span></span></span></span></span></span></span>，可先使用简单加权：</p>\n<span class=\"katex-display\"><span class=\"katex\"><span class=\"katex-mathml\"><math xmlns=\"http://www.w3.org/1998/Math/MathML\" display=\"block\"><semantics><mrow><mi>s</mi><mi>c</mi><mi>o</mi><mi>r</mi><mi>e</mi><mo>=</mo><mn>0.5</mn><msub><mi>r</mi><mi>t</mi></msub><mo>+</mo><mn>0.3</mn><msub><mi>r</mi><mi>g</mi></msub><mo>+</mo><mn>0.2</mn><msub><mi>r</mi><mi>b</mi></msub></mrow><annotation encoding=\"application/x-tex\">score = 0.5r_t + 0.3r_g + 0.2r_b</annotation></semantics></math></span><span class=\"katex-html\" aria-hidden=\"true\"><span class=\"base\"><span class=\"strut\" style=\"height:0.4306em;\"></span><span class=\"mord mathnormal\" style=\"margin-right:0.0278em;\">scor</span><span class=\"mord mathnormal\">e</span><span class=\"mspace\" style=\"margin-right:0.2778em;\"></span><span class=\"mrel\">=</span><span class=\"mspace\" style=\"margin-right:0.2778em;\"></span></span><span class=\"base\"><span class=\"strut\" style=\"height:0.7944em;vertical-align:-0.15em;\"></span><span class=\"mord\">0.5</span><span class=\"mord\"><span class=\"mord mathnormal\" style=\"margin-right:0.0278em;\">r</span><span class=\"msupsub\"><span class=\"vlist-t vlist-t2\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.2806em;\"><span style=\"top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;\"><span class=\"pstrut\" style=\"height:2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mathnormal mtight\">t</span></span></span></span><span class=\"vlist-s\">​</span></span><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.15em;\"><span></span></span></span></span></span></span><span class=\"mspace\" style=\"margin-right:0.2222em;\"></span><span class=\"mbin\">+</span><span class=\"mspace\" style=\"margin-right:0.2222em;\"></span></span><span class=\"base\"><span class=\"strut\" style=\"height:0.9305em;vertical-align:-0.2861em;\"></span><span class=\"mord\">0.3</span><span class=\"mord\"><span class=\"mord mathnormal\" style=\"margin-right:0.0278em;\">r</span><span class=\"msupsub\"><span class=\"vlist-t vlist-t2\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.1514em;\"><span style=\"top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;\"><span class=\"pstrut\" style=\"height:2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mathnormal mtight\" style=\"margin-right:0.0359em;\">g</span></span></span></span><span class=\"vlist-s\">​</span></span><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.2861em;\"><span></span></span></span></span></span></span><span class=\"mspace\" style=\"margin-right:0.2222em;\"></span><span class=\"mbin\">+</span><span class=\"mspace\" style=\"margin-right:0.2222em;\"></span></span><span class=\"base\"><span class=\"strut\" style=\"height:0.7944em;vertical-align:-0.15em;\"></span><span class=\"mord\">0.2</span><span class=\"mord\"><span class=\"mord mathnormal\" style=\"margin-right:0.0278em;\">r</span><span class=\"msupsub\"><span class=\"vlist-t vlist-t2\"><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.3361em;\"><span style=\"top:-2.55em;margin-left:-0.0278em;margin-right:0.05em;\"><span class=\"pstrut\" style=\"height:2.7em;\"></span><span class=\"sizing reset-size6 size3 mtight\"><span class=\"mord mathnormal mtight\">b</span></span></span></span><span class=\"vlist-s\">​</span></span><span class=\"vlist-r\"><span class=\"vlist\" style=\"height:0.15em;\"><span></span></span></span></span></span></span></span></span></span></span>\n<p>权重不是永久规则，应根据真实搜索词和零结果查询迭代。中文检索还要明确分词策略；内容量较小时，构建期生成索引通常比引入远程搜索服务更容易维护。</p>\n<h2 id=\"user-content-保持链接可用\"><a class=\"heading-anchor\" href=\"/blog/markdown-knowledge-system/#user-content-保持链接可用\">保持链接可用</a></h2>\n<ul class=\"contains-task-list\">\n<li class=\"task-list-item\"><input type=\"checkbox\" checked disabled> 在 CI 中校验 frontmatter</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" checked disabled> 为标题生成稳定锚点</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" checked disabled> 构建时检查站内链接与图片路径</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 定期合并同义标签</li>\n<li class=\"task-list-item\"><input type=\"checkbox\" disabled> 为被替换文章保留重定向记录</li>\n</ul>\n<p>好的知识系统不追求无限分类，而是让读者从搜索结果、标签页或正文链接出发，都能在两三步内找到可信的下一条信息。</p>"
      }
    ]
  }
] as const satisfies readonly ContentDocument[];

export const BLOG_POST_SLUGS = [
  "angular-ssg-github-pages",
  "observable-service-practice",
  "markdown-knowledge-system"
] as const;

export const KNOWLEDGE_ENTRY_SLUGS = [
  "angular-rendering-modes",
  "kubernetes-troubleshooting",
  "typescript-signal-patterns",
  "seo-checklist"
] as const;
