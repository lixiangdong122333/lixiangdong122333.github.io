import { afterNextRender, Injectable, signal } from '@angular/core';
import { LAB_TOOLS } from './tool-registry';

@Injectable({ providedIn: 'root' })
export class ToolPreferences {
  readonly recent = signal<string[]>([]);
  readonly favorites = signal<string[]>([]);
  readonly ready = signal(false);

  constructor() {
    afterNextRender(() => {
      this.recent.set(this.read('recentTools').slice(0, 6));
      this.favorites.set(this.read('favoriteTools'));
      this.ready.set(true);
    });
  }

  visit(id: string): void {
    if (!this.ready()) return;
    const ids = [id, ...this.recent().filter((value) => value !== id)].slice(0, 6);
    this.recent.set(ids);
    this.save('recentTools', ids);
  }

  toggleFavorite(id: string): void {
    const ids = this.favorites().includes(id)
      ? this.favorites().filter((value) => value !== id)
      : [...this.favorites(), id];
    this.favorites.set(ids);
    this.save('favoriteTools', ids);
  }

  clearRecent(): void {
    this.recent.set([]);
    this.save('recentTools', []);
  }

  private read(key: string): string[] {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
      return Array.isArray(value)
        ? [
            ...new Set(
              value.filter(
                (id): id is string =>
                  typeof id === 'string' && LAB_TOOLS.some((tool) => tool.id === id),
              ),
            ),
          ]
        : [];
    } catch {
      return [];
    }
  }

  private save(key: string, ids: string[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(ids));
    } catch {
      // Private browsing or storage limits must not interrupt a tool session.
    }
  }
}
