# Xiangdong Lab Engineering Rules

These rules apply to every change in this repository.

## Required Stack

- Use Angular 22 with strict TypeScript, standalone components, SSR, SSG, and hydration.
- Keep request-time SSR available in the default production build. Use the `pages` build configuration for the fully static GitHub Pages artifact.
- Use PrimeNG 22 with `providePrimeNG`, `@primeuix/themes`, and the official `tailwindcss-primeui` Tailwind v4 integration.
- Prefer Tailwind CSS utilities. Component CSS files should remain empty unless a behavior cannot be expressed safely with Tailwind or PrimeNG design tokens.
- Use Markdown files under `content/` as the content source. Do not add an admin editor or upload workflow.

## TypeScript

- Keep strict type checking enabled.
- Prefer inference when the type is obvious.
- Never use `any`; use `unknown` and narrow it.
- Keep state transformations pure and predictable.

## Angular

- Use standalone components. Do not set `standalone: true`; it is the default.
- Lazy-load every feature route.
- Keep components small and focused on a single responsibility.
- Prefer inline templates for small components.
- Use signals for local state and `computed()` for derived state.
- Never call `mutate()` on signals; use `set()` or `update()` instead.
- Use `input()` and `output()` instead of decorator inputs and outputs.
- Set `changeDetection: ChangeDetectionStrategy.OnPush` on every component.
- Use `inject()` instead of constructor injection.
- Use Reactive Forms for forms and search controls.
- Use native template control flow (`@if`, `@for`, `@switch`) instead of structural directives.
- Use the `async` pipe when templates consume observables.
- Do not use `ngClass` or `ngStyle`; use class and style bindings.
- Do not use `@HostBinding` or `@HostListener`; declare host bindings in the decorator `host` object.
- Use `NgOptimizedImage` for every static image. Markdown images are generated as structured image blocks so the Angular renderer can use `ngSrc`.
- Keep browser-only APIs inside `afterNextRender()` or guarded services so server rendering and hydration produce matching initial DOM.

## Services

- Design each service around a single responsibility.
- Register singleton services with `providedIn: 'root'`.
- Use `inject()` instead of constructor injection.

## Content And SEO

- Validate Markdown frontmatter at build time.
- Keep raw HTML disabled. Sanitize the generated HTML before applying trusted KaTeX, syntax-highlighting, and Mermaid enhancements.
- Every public route must provide a unique title, description, canonical URL, Open Graph metadata, and structured data where applicable.
- Keep RSS, `sitemap.xml`, and `robots.txt` generated from the same content manifest used by prerendering.
- Enumerate every parameterized content route for GitHub Pages; do not rely on an SPA rewrite.

## UI

- Follow the 8/4/2 grid: prefer multiples of 8 px, then 4 px, and use 2 px only for micro-adjustments. Do not introduce odd pixel values or 1 px borders.
- Keep cards at an 8 px radius or less. Avoid nested cards and floating-card page sections.
- Use PrimeNG controls for established interaction patterns and Lucide icons for interface actions.
- Maintain accessible names, keyboard behavior, visible focus states, and WCAG AA contrast.
- Do not use negative letter spacing or viewport-scaled typography.
- Verify desktop and mobile layouts in a real browser before completion.

## Verification

- Run `npm run build:pages`, `npm test`, and `npm run format:check` for material changes.
- Treat hydration warnings, accessibility errors, broken prerender routes, and invalid Markdown as build failures.

## Primary References

- https://angular.cn/llms.txt
- https://angular.cn/context/llm-files/llms-full.txt
- https://primeng.dev/llms/llms.txt
- https://primeng.dev/llms/llms-full.txt
