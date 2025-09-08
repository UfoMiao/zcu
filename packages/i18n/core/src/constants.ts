/**
 * Core i18n constants shared across all packages
 */

// Supported languages
export const SUPPORTED_LANGS = ['zh-CN', 'en'] as const
export type SupportedLang = (typeof SUPPORTED_LANGS)[number]

// Language display labels
export const LANG_LABELS = {
  'zh-CN': '简体中文',
  'en': 'English',
} as const

// All available namespaces based on ZCU project structure
export const NAMESPACES = [
  'common',
  'cli',
  'commands',
  'errors',
  'messages',
  'ui',
] as const

export type Namespace = (typeof NAMESPACES)[number]

// Default language settings
export const DEFAULT_LANGUAGE: SupportedLang = 'en'
export const FALLBACK_LANGUAGE: SupportedLang = 'en'
export const DEFAULT_NAMESPACE: Namespace = 'common'

// i18n configuration constants
export const I18N_CONFIG = {
  keySeparator: false,
  nsSeparator: ':',
  debug: false,
} as const
