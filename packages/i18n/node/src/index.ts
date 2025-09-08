/**
 * ZCU i18n Node.js Package
 *
 * Provides i18n functionality specifically for Node.js/CLI environments.
 * Uses filesystem backend to load translations from the shared package.
 */

import type { BaseI18nOptions, I18nStatus, SupportedLang, TranslationFunction } from '@ufomiao/i18n-core'
import type { i18n as I18nInstance } from 'i18next'
import { DEFAULT_LANGUAGE, DEFAULT_NAMESPACE, FALLBACK_LANGUAGE, format, I18N_CONFIG, LANG_LABELS, NAMESPACES, SUPPORTED_LANGS } from '@ufomiao/i18n-core'
import i18next from 'i18next'
import FsBackend from 'i18next-fs-backend'
import { resolve } from 'pathe'

// Re-export core types and constants
export * from '@ufomiao/i18n-core'

// Node.js specific initialization options
export interface NodeI18nOptions extends BaseI18nOptions {
  localesPath?: string
}

// Create i18next instance for Node.js
export const i18n: I18nInstance = i18next.createInstance()

/**
 * Get the path to shared translation files
 */
function getSharedLocalesPath(customPath?: string): string {
  if (customPath) {
    return resolve(customPath)
  }

  // Default: resolve to the shared package's locales
  try {
    const sharedPackageDir = resolve(import.meta.dirname, '../../shared/dist/locales')
    return sharedPackageDir
  }
  catch {
    // Fallback to current directory structure during development
    return resolve(import.meta.dirname, '../../shared/locales')
  }
}

/**
 * Initialize i18n for Node.js/CLI environments
 * Uses filesystem backend to load translations from shared package
 */
export async function initI18nForNode(options: NodeI18nOptions = {}): Promise<typeof i18n> {
  const {
    language = DEFAULT_LANGUAGE,
    enableDebug = I18N_CONFIG.debug,
    preloadNamespaces = [],
    localesPath,
  } = options

  if (i18n.isInitialized) {
    if (i18n.language !== language) {
      await i18n.changeLanguage(language)
    }
    return i18n
  }

  const localesDir = getSharedLocalesPath(localesPath)

  await i18n
    .use(FsBackend)
    .init({
      lng: language,
      fallbackLng: FALLBACK_LANGUAGE,
      ns: NAMESPACES,
      defaultNS: DEFAULT_NAMESPACE,
      keySeparator: I18N_CONFIG.keySeparator,
      nsSeparator: I18N_CONFIG.nsSeparator,
      debug: enableDebug,
      backend: {
        loadPath: `${localesDir}/{{lng}}/{{ns}}.json`,
      },
    })

  // Load additional namespaces if specified
  if (preloadNamespaces.length > 0) {
    await i18n.loadNamespaces(preloadNamespaces)
  }

  return i18n
}

/**
 * Change language at runtime
 */
export async function changeLanguage(lng: SupportedLang): Promise<void> {
  if (!i18n.isInitialized) {
    throw new Error('i18n must be initialized before changing language')
  }
  await i18n.changeLanguage(lng)
}

/**
 * Get current language
 */
export function getCurrentLanguage(): SupportedLang {
  return (i18n.language as SupportedLang) || DEFAULT_LANGUAGE
}

/**
 * Check if i18n is ready
 */
export function isI18nReady(): boolean {
  return i18n.isInitialized
}

/**
 * Get current i18n status
 */
export function getI18nStatus(): I18nStatus {
  return {
    isInitialized: i18n.isInitialized,
    currentLanguage: getCurrentLanguage(),
    loadedNamespaces: Object.keys(i18n.store?.data || {}),
    environment: 'node',
  }
}

/**
 * Generic translation function
 */
export function t(key: string, options?: Parameters<TranslationFunction>[1]): string {
  if (!i18n.isInitialized) {
    console.warn('[i18n-node] i18n not initialized, returning key')
    return key
  }
  return i18n.t(key, options)
}

/**
 * Common namespace translation
 */
export function tc(key: string, options?: Parameters<TranslationFunction>[1]): string {
  return t(`common:${key}`, options)
}

/**
 * CLI namespace translation
 */
export function tCli(key: string, options?: Parameters<TranslationFunction>[1]): string {
  return t(`cli:${key}`, options)
}

/**
 * Commands namespace translation
 */
export function tCmd(key: string, options?: Parameters<TranslationFunction>[1]): string {
  return t(`commands:${key}`, options)
}

/**
 * Errors namespace translation
 */
export function tErr(key: string, options?: Parameters<TranslationFunction>[1]): string {
  return t(`errors:${key}`, options)
}

/**
 * Messages namespace translation
 */
export function tMsg(key: string, options?: Parameters<TranslationFunction>[1]): string {
  return t(`messages:${key}`, options)
}

/**
 * Ensure i18n is initialized (safety check)
 */
export function ensureI18nInitialized(): void {
  if (!i18n.isInitialized) {
    throw new Error('i18n must be initialized before use. Call initI18nForNode() first.')
  }
}

// Export legacy format function for compatibility
export { format }

// Export constants for convenience
export { LANG_LABELS, NAMESPACES, SUPPORTED_LANGS }
