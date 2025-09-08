import type { UserConfig } from 'unocss'
import presetWind4 from '@unocss/preset-wind4'
import {
  defineConfig,
  mergeConfigs,
  presetIcons,
  presetTypography,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetShadcn } from 'unocss-preset-shadcn'

const baseConfig: UserConfig = {
  presets: [
    presetWind4({
      preflights: {
        reset: true,
      },
    }),
    presetTypography(),
    presetIcons(),
    presetShadcn(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
}

export function unocssBase(config: UserConfig = {}): UserConfig {
  return mergeConfigs([baseConfig, config])
}

export { defineConfig, mergeConfigs }
