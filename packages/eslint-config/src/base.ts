import type { OptionsConfig, TypedFlatConfigItem } from '@antfu/eslint-config'
import antfu from '@antfu/eslint-config'
import { defu } from 'defu'

export type BaseConfig = OptionsConfig & TypedFlatConfigItem

const baseConfig: BaseConfig = {
  pnpm: true,
  ignores: [
    '**/**.md',
  ],
}

export function eslintBase(config: BaseConfig = {}): ReturnType<typeof antfu> {
  return antfu(defu(config, baseConfig))
}
