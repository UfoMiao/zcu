import type { BaseConfig } from './base'
import { defu } from 'defu'
import { eslintBase } from './base'

const eslintCliConfig: BaseConfig = {
  type: 'lib',
  rules: {
    // CLI application-specific rule: allows the use of console.log (suitable for command-line tools)
    'no-console': 'off',
  },
}

export function eslintCli(config: BaseConfig = {}): ReturnType<typeof eslintBase> {
  return eslintBase(defu(config, eslintCliConfig))
}
