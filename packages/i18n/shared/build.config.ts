import { cpSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [],
  declaration: false,
  clean: true,
  sourcemap: false,
  rollup: {
    emitCJS: false,
  },
  failOnWarn: false,
  hooks: {
    'build:before': () => {
      // Copy locales to dist before build
      try {
        const srcPath = join(process.cwd(), 'locales')
        const destPath = join(process.cwd(), 'dist/locales')

        if (existsSync(srcPath)) {
          cpSync(srcPath, destPath, { recursive: true })
          console.log('✓ Copied locales to dist/')
        }
        else {
          console.error('✗ No locales directory found!')
          process.exit(1)
        }
      }
      catch (error) {
        console.error('✗ Failed to copy locales:', error)
        process.exit(1)
      }
    },
  },
})
