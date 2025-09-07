import type { UserConfig } from 'unocss'
import {
  defineConfig,
  mergeConfigs,
  presetIcons,
  presetTypography,
  presetWind4,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
import { presetShadcn } from 'unocss-preset-shadcn'

const baseConfig: UserConfig = {
  presets: [
    presetWind4(),
    presetTypography(),
    presetIcons({
      scale: 1.2,
      warn: true,
    }),
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
