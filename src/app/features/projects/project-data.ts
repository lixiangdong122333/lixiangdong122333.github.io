export interface Project {
  readonly name: string;
  readonly description: string;
  readonly url: string;
  readonly stack: readonly string[];
  readonly language: string;
  readonly updatedAt: string;
  readonly highlights: readonly string[];
  readonly featured: boolean;
}

export const PROJECTS: readonly Project[] = [
  {
    name: 'Helios',
    description:
      '面向服务监控和故障排查的只读 Google Cloud Logging MCP Server，支持日志查询、Trace 关联、确定性摘要和异常聚合。',
    url: 'https://github.com/lixiangdong122333/Helios',
    stack: ['TypeScript', 'Node.js', 'Google Cloud', 'MCP', 'Vitest'],
    language: 'TypeScript',
    updatedAt: '2026-07-21',
    highlights: ['4 个只读 MCP 工具', 'stdio / Streamable HTTP', '静态 Token / OIDC'],
    featured: true,
  },
  {
    name: 'Boids',
    description:
      '基于 Three.js GPGPU 与 GLSL 的 3D Boids 群集模拟，可调节分离、对齐、聚合、速度、边界和湍流参数。',
    url: 'https://github.com/lixiangdong122333/Boids',
    stack: ['TypeScript', 'Three.js', 'GLSL', 'WebGL', 'Vite'],
    language: 'TypeScript',
    updatedAt: '2026-02-28',
    highlights: ['512×512 GPGPU 数据纹理', '实例化渲染', '可交互参数控制'],
    featured: true,
  },
  {
    name: 'Touhou-Project-FXGL',
    description:
      '基于 FXGL 的 Java 游戏机制原型，实现移动、定时生成弹体、碰撞扣血和生命值组件，并配置 Native Image 构建。',
    url: 'https://github.com/lixiangdong122333/Touhou-Project-FXGL',
    stack: ['Java 11', 'FXGL', 'JavaFX', 'Maven', 'GraalVM'],
    language: 'Java',
    updatedAt: '2024-12-10',
    highlights: ['组件化游戏机制', '依赖打包 JAR', 'Native Image 配置'],
    featured: true,
  },
];
