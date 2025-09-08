import { createVitestConfig } from '../../vitest.config.base'

/**
 * Core package Vitest configuration
 *
 * 100% 覆盖率要求 - 核心包
 * 包含存储引擎、操作引擎和会话管理测试
 */

export default createVitestConfig({
  name: 'packages:core',
  environment: 'node',
  coverage: {
    thresholds: {
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
  testConfig: {
    // Core 包的测试设置
    setupFiles: ['./test/setup.ts'],
  },
})
