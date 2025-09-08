import { createVitestConfig } from '../../vitest.config.base'

export default createVitestConfig({
  coverage: {
    thresholds: {
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90,
    },
  },
})
