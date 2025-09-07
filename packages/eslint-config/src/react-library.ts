import type { BaseConfig } from './base'
import { defu } from 'defu'
import { eslintBase } from './base'

const eslintReactLibraryConfig: BaseConfig = {
  type: 'lib',
  react: true,
  rules: {
    // React-specific rules
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    // Allow console in React library components for debugging
    'no-console': 'off',
  },
}

export function eslintReactLibrary(config: BaseConfig = {}): ReturnType<typeof eslintBase> {
  return eslintBase(defu(config, eslintReactLibraryConfig))
}
