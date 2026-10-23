import { PROJECTS } from './project-data';

describe('PROJECTS', () => {
  it('lists dsh-notify as a featured open source project', () => {
    const dshNotify = PROJECTS.find((project) => project.name === 'dsh-notify');

    expect(dshNotify).toBeDefined();
    expect(dshNotify?.featured).toBe(true);
    expect(dshNotify?.url).toBe('https://github.com/lixiangdong122333/dsh-notify');
  });

  it('keeps three or more featured projects so the home page has a full row', () => {
    expect(PROJECTS.filter((project) => project.featured).length).toBeGreaterThanOrEqual(3);
  });

  it('keeps every entry complete enough to render a card', () => {
    for (const project of PROJECTS) {
      expect(project.description.length).toBeGreaterThan(20);
      expect(project.stack.length).toBeGreaterThan(0);
      expect(project.highlights).toHaveLength(3);
      expect(project.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
