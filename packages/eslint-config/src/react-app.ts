import type { BaseConfig } from './base'
import { defu } from 'defu'
import { eslintBase } from './base'

const eslintReactAppConfig: BaseConfig = {
  type: 'app',
  react: true,
  rules: {
    // React-specific rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // Allow console in React components for development
    'no-console': 'off',
  },
}

export function eslintReactApp(config: BaseConfig = {}): ReturnType<typeof eslintBase> {
  return eslintBase(defu(config, eslintReactAppConfig))
}
