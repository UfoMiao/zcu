import type { i18n as I18nInstance } from 'i18next'
import { existsSync } from 'node:fs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import { dirname, join } from 'pathe'

// Supported languages
export const SUPPORTED_LANGS = ['zh-CN', 'en'] as const
export type SupportedLang = (typeof SUPPORTED_LANGS)[number]

// Language labels
export const LANG_LABELS = {
  'zh-CN': '简体中文',
  'en': 'English',
} as const

// Create i18next instance
export const i18n: I18nInstance = i18next.createInstance()

// All available namespaces based on ZCU project structure
const NAMESPACES = [
  'common',
  'cli',
  'commands',
  'errors',
  'messages',
] as const

// Ensure i18n is initialized - safety check for utility functions
export function ensureI18nInitialized(): void {
  if (!i18n.isInitialized) {
    throw new Error(
      'i18n is not initialized. Please call initI18n() before using translation functions.',
    )
  }
}

// Initialize i18next with fs-backend (should only be called from CLI commands)
export async function initI18n(language: SupportedLang = 'en'): Promise<void> {
  if (i18n.isInitialized) {
    // If already initialized, just change language without reloading resources
    if (i18n.language !== language) {
      await i18n.changeLanguage(language)
    }
    return
  }

  await i18n
    .use(Backend)
    .init({
      lng: language,
      fallbackLng: 'en',

      // Load all translations as a single flat structure
      ns: NAMESPACES,
      defaultNS: 'common',
      preload: [language], // Preload the selected language

      // Backend configuration for loading JSON files
      backend: {
        loadPath: (() => {
          const currentDir = dirname(fileURLToPath(import.meta.url))

          // For npm packages, we need to find the package root
          const packageRoot = (() => {
            let dir = currentDir
            // Look for package.json to identify package root
            while (dir !== dirname(dir)) {
              if (existsSync(join(dir, 'package.json'))) {
                return dir
              }
              dir = dirname(dir)
            }
            return currentDir
          })()

          // Try multiple possible paths in order of preference
          const possibleBasePaths = [
            join(currentDir, 'locales'), // Development: src/locales
            join(packageRoot, 'dist/locales'), // NPM package: /node_modules/@ufomiao/i18n/dist/locales
            join(process.cwd(), 'dist/locales'), // Production build: ./dist/locales
            join(currentDir, '../../../dist/locales'), // Fallback for deep paths
            join(currentDir, '../../locales'), // Alternative structure
          ]

          // Find the first path that exists by checking for common.json
          for (const basePath of possibleBasePaths) {
            const testFile = join(basePath, 'en/common.json')
            if (existsSync(testFile)) {
              return join(basePath, '{{lng}}/{{ns}}.json')
            }
          }

          // Fallback to the production path if none found
          return join(process.cwd(), 'dist/locales/{{lng}}/{{ns}}.json')
        })(),
      },

      // Interpolation settings
      interpolation: {
        escapeValue: false, // Not needed for server-side usage
      },

      // Disable key separator for flat keys, enable namespace separator
      keySeparator: false,
      nsSeparator: ':',

      // Debugging (disable for clean output)
      debug: false,
    })

  // Ensure all namespaces are loaded before proceeding
  for (const ns of NAMESPACES) {
    if (ns !== 'common') { // common is already loaded
      await i18n.loadNamespaces(ns)
    }
  }
}

// Simple format function for legacy compatibility
export function format(template: string, values?: Record<string, string>): string {
  if (!values)
    return template

  return Object.keys(values).reduce((result, key) => {
    const value = values[key]
    return result.replace(new RegExp(`{${key}}`, 'g'), value ?? '')
  }, template)
}

// Language management
export async function changeLanguage(lng: SupportedLang): Promise<void> {
  await i18n.changeLanguage(lng)
}

export function getCurrentLanguage(): SupportedLang {
  return i18n.language as SupportedLang
}

// Translation helper functions
export function t(key: string, options?: any): string {
  ensureI18nInitialized()
  const result = i18n.t(key, options)
  return typeof result === 'string' ? result : String(result)
}

export function tc(key: string, options?: any): string {
  return t(`common:${key}`, options)
}

export function tCli(key: string, options?: any): string {
  return t(`cli:${key}`, options)
}

export function tCmd(key: string, options?: any): string {
  return t(`commands:${key}`, options)
}

export function tErr(key: string, options?: any): string {
  return t(`errors:${key}`, options)
}

export function tMsg(key: string, options?: any): string {
  return t(`messages:${key}`, options)
}
