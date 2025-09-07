import type { BaseConfig } from './base'
import { defu } from 'defu'
import { eslintBase } from './base'

const eslintLibraryConfig: BaseConfig = {
  type: 'lib',
  rules: {
    // Library-specific rule: allows the use of console.log (suitable for libraries and CLI tools)
    'no-console': 'off',
  },
}

export function eslintLibrary(config: BaseConfig = {}): ReturnType<typeof eslintBase> {
  return eslintBase(defu(config, eslintLibraryConfig))
}
