import type { UserConfig } from 'vitest/config'
import { defineConfig } from 'vitest/config'

/**
 * Base Vitest Configuration Template
 * Provides unified test environment setup, coverage configuration, and global settings
 *
 * Usage:
 * ```typescript
 * import { createVitestConfig } from '../vitest.config.base'
 *
 * export default createVitestConfig({
 *   coverage: { thresholds: { lines: 100 } }  // Optional override
 * })
 * ```
 */

interface TestConfigOptions {
  /** Package name for test report identification */
  name?: string
  /** Test environment configuration */
  environment?: 'node' | 'jsdom' | 'happy-dom'
  /** Coverage configuration override */
  coverage?: Partial<NonNullable<UserConfig['test']>['coverage']>
  /** Additional test configuration */
  testConfig?: Partial<NonNullable<UserConfig['test']>>
}

/**
 * Create standardized Vitest configuration
 */
export function createVitestConfig(options: TestConfigOptions = {}): UserConfig {
  const {
    name,
    environment = 'node',
    coverage = {},
    testConfig = {},
  } = options

  return defineConfig({
    test: {
      // Basic configuration
      name,
      globals: true,
      environment,

      // Test file matching patterns
      include: [
        'test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],

      // Exclude patterns
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build,eslint,prettier}.config.*',
      ],

      // Setup files
      setupFiles: [
        // Global test setup (if exists)
        environment === 'jsdom' || environment === 'happy-dom'
          ? './test/setup.ts'
          : undefined,
      ].filter(Boolean),

      // Coverage configuration
      coverage: {
        provider: 'v8',
        enabled: false, // Enable via CLI --coverage
        clean: true,
        cleanOnRerun: true,

        // Report formats
        reporter: [
          'text',
          'html',
          'clover',
          'json-summary',
          'json',
        ],

        // Output directory
        reportsDirectory: './coverage',

        // Include files
        include: [
          'src/**/*.{js,jsx,ts,tsx}',
        ],

        // Exclude files
        exclude: [
          'node_modules/',
          'test/',
          '__tests__/',
          '**/*.{test,spec}.{js,jsx,ts,tsx}',
          '**/*.d.ts',
          '**/index.{js,ts}', // Usually just exports
          'src/types/**', // Type definition files
          '**/{vite,vitest,rollup,webpack,jest}.config.*',
        ],

        // Global coverage thresholds (can be overridden)
        thresholds: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
          ...coverage.thresholds,
        },

        // Check thresholds per file
        perFile: true,

        // Fail when coverage doesn't meet thresholds
        reportOnFailure: true,

        // Other coverage options
        ...coverage,
      },

      // Performance configuration
      pool: 'forks', // Use process pool for better isolation
      poolOptions: {
        forks: {
          singleFork: false,
        },
      },

      // Reporting configuration
      reporters: ['verbose'],

      // Timeout configuration
      testTimeout: 10000, // 10 seconds
      hookTimeout: 10000,

      // Watch mode configuration
      watchExclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/coverage/**',
      ],

      // Additional configuration
      ...testConfig,
    },
  })
}

// Default configuration export
export default createVitestConfig()

// Preset configurations
export const nodeConfig = createVitestConfig({ environment: 'node' })
export const jsdomConfig = createVitestConfig({ environment: 'jsdom' })
export const happyDomConfig = createVitestConfig({ environment: 'happy-dom' })

// High coverage configuration (for core packages)
export const highCoverageConfig = createVitestConfig({
  coverage: {
    thresholds: {
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
})

// React component testing configuration
export const reactConfig = createVitestConfig({
  environment: 'jsdom',
  testConfig: {
    setupFiles: ['./test/setup-react.ts'],
  },
})
