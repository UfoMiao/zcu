import { defineWorkspace } from 'vitest/config'

/**
 * Vitest 工作区配置
 *
 * 统一管理 monorepo 中所有包的测试配置
 * 支持不同包使用不同的测试环境和配置
 *
 * 执行测试：
 * - `pnpm test` - 运行所有测试
 * - `pnpm test:coverage` - 运行测试并生成覆盖率报告
 * - `pnpm test:ui` - 启动测试 UI 界面
 * - `pnpm test:watch` - 监视模式运行测试
 */

export default defineWorkspace([
  // 核心包 - 100% 覆盖率要求
  {
    extends: './vitest.config.base.ts',
    test: {
      name: 'packages:types',
      root: './packages/types',
      environment: 'node',
      coverage: {
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
    },
  },

  {
    extends: './vitest.config.base.ts',
    test: {
      name: 'packages:core',
      root: './packages/core',
      environment: 'node',
      coverage: {
        thresholds: {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
      },
      // 模拟文件系统和 Git 操作
      setupFiles: ['./test/setup.ts'],
    },
  },

  // 应用层 - 90% 覆盖率
  {
    extends: './vitest.config.base.ts',
    test: {
      name: 'apps:cli',
      root: './apps/cli',
      environment: 'node',
      coverage: {
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
      },
      // CLI 测试设置
      setupFiles: ['./test/setup.ts'],
    },
  },

  {
    extends: './vitest.config.base.ts',
    test: {
      name: 'apps:web',
      root: './apps/web',
      environment: 'jsdom',
      coverage: {
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
      },
      // React 测试设置
      setupFiles: ['./test/setup.ts'],
    },
  },

  // UI 组件库 - 90% 覆盖率 + React 支持
  {
    extends: './vitest.config.base.ts',
    test: {
      name: 'packages:ui',
      root: './packages/ui',
      environment: 'jsdom',
      coverage: {
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
      },
      // React 组件测试设置
      setupFiles: ['./test/setup.ts'],
    },
  },

  // 工具包 - 90% 覆盖率
  {
    extends: './vitest.config.base.ts',
    test: {
      name: 'packages:i18n',
      root: './packages/i18n',
      environment: 'node',
      coverage: {
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
      },
    },
  },

  // 配置包
  {
    extends: './vitest.config.base.ts',
    test: {
      name: 'packages:eslint-config',
      root: './packages/eslint-config',
      environment: 'node',
      coverage: {
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
      },
    },
  },

  {
    extends: './vitest.config.base.ts',
    test: {
      name: 'packages:tsconfig',
      root: './packages/tsconfig',
      environment: 'node',
      coverage: {
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
      },
    },
  },

  {
    extends: './vitest.config.base.ts',
    test: {
      name: 'packages:unocss-config',
      root: './packages/unocss-config',
      environment: 'node',
      coverage: {
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
      },
    },
  },
])
