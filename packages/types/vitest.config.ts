import { createVitestConfig } from '../../vitest.config.base'

/**
 * Types package Vitest configuration
 *
 * 100% 覆盖率要求 - 核心包
 * 主要测试类型导出完整性和接口定义正确性
 */

export default createVitestConfig({
  name: 'packages:types',
  environment: 'node',
  coverage: {
    thresholds: {
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
})
