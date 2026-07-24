import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home-page').then((module) => module.HomePage),
  },
  {
    path: 'blog',
    loadComponent: () =>
      import('./features/content/content-list-page').then((module) => module.ContentListPage),
    data: { kind: 'blog' },
  },
  {
    path: 'blog/:slug',
    loadComponent: () =>
      import('./features/content/content-detail-page').then((module) => module.ContentDetailPage),
    data: { kind: 'blog' },
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./features/projects/projects-page').then((module) => module.ProjectsPage),
  },
  {
    path: 'lab',
    loadComponent: () => import('./features/lab/lab-page').then((module) => module.LabPage),
  },
  {
    path: 'knowledge',
    loadComponent: () =>
      import('./features/content/content-list-page').then((module) => module.ContentListPage),
    data: { kind: 'knowledge' },
  },
  {
    path: 'knowledge/:slug',
    loadComponent: () =>
      import('./features/content/content-detail-page').then((module) => module.ContentDetailPage),
    data: { kind: 'knowledge' },
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about-page').then((module) => module.AboutPage),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((module) => module.NotFoundPage),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((module) => module.NotFoundPage),
  },
];
