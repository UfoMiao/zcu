/**
 * ZCU i18n Browser Package
 *
 * Provides i18n functionality specifically for browser environments.
 * Uses HTTP backend to load translations, with zero Node.js dependencies.
 */

import type { BaseI18nOptions, I18nStatus, SupportedLang, TranslationFunction } from '@ufomiao/i18n-core'
import type { i18n as I18nInstance } from 'i18next'
import { DEFAULT_LANGUAGE, DEFAULT_NAMESPACE, FALLBACK_LANGUAGE, format, I18N_CONFIG, LANG_LABELS, NAMESPACES, SUPPORTED_LANGS } from '@ufomiao/i18n-core'
import i18next from 'i18next'
import HttpBackend from 'i18next-http-backend'

// Re-export core types and constants
export * from '@ufomiao/i18n-core'

// Browser specific initialization options
export interface BrowserI18nOptions extends BaseI18nOptions {
  localesPath?: string
  enableSuspense?: boolean
  preload?: SupportedLang[]
}

// Create i18next instance for browser
export const i18n: I18nInstance = i18next.createInstance()

/**
 * Check if current environment supports HTTP translations loading
 */
export function canLoadHttpTranslations(): boolean {
  return typeof window !== 'undefined' && typeof fetch !== 'undefined'
}

/**
 * Initialize i18n for browser environments
 * Uses HTTP backend to load translations from static assets
 */
export async function initI18nForBrowser(options: BrowserI18nOptions = {}): Promise<typeof i18n> {
  const {
    language = DEFAULT_LANGUAGE,
    enableDebug = I18N_CONFIG.debug,
    preloadNamespaces = [],
    localesPath = '/locales',
    preload = [],
  } = options

  if (i18n.isInitialized) {
    if (i18n.language !== language) {
      await i18n.changeLanguage(language)
    }
    return i18n
  }

  if (!canLoadHttpTranslations()) {
    throw new Error('Browser environment does not support HTTP translations loading')
  }

  await i18n
    .use(HttpBackend)
    .init({
      lng: language,
      fallbackLng: FALLBACK_LANGUAGE,
      ns: NAMESPACES,
      defaultNS: DEFAULT_NAMESPACE,
      keySeparator: I18N_CONFIG.keySeparator,
      nsSeparator: I18N_CONFIG.nsSeparator,
      debug: enableDebug,

      // HTTP Backend configuration
      backend: {
        loadPath: `${localesPath}/{{lng}}/{{ns}}.json`,
        crossDomain: false,
        requestOptions: {
          cache: 'default',
          credentials: 'same-origin',
        },
      },

      // Preload languages
      preload: preload.length > 0 ? preload : [language],

      // Interpolation settings
      interpolation: {
        escapeValue: false, // React already escapes values
      },
    })

  // Load additional namespaces if specified
  if (preloadNamespaces.length > 0) {
    await i18n.loadNamespaces(preloadNamespaces)
  }

  return i18n
}

/**
 * Preload specific namespaces for lazy loading
 * Useful for loading feature-specific translations on demand
 */
export async function preloadNamespaces(namespaces: string | string[]): Promise<void> {
  if (!i18n.isInitialized) {
    throw new Error('i18n must be initialized before preloading namespaces')
  }

  const nsArray = Array.isArray(namespaces) ? namespaces : [namespaces]
  const validNamespaces = nsArray.filter(ns => NAMESPACES.includes(ns as any))

  if (validNamespaces.length === 0) {
    console.warn('[i18n-browser] No valid namespaces found for preloading:', nsArray)
    return
  }

  await Promise.all(
    validNamespaces.map(ns => i18n.loadNamespaces(ns)),
  )
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
 * Get current i18n status for browser applications
 */
export function getI18nStatus(): I18nStatus & { canLoadHttp: boolean } {
  return {
    isInitialized: i18n.isInitialized,
    currentLanguage: getCurrentLanguage(),
    loadedNamespaces: Object.keys(i18n.store?.data || {}),
    environment: 'browser',
    canLoadHttp: canLoadHttpTranslations(),
  }
}

/**
 * Generic translation function
 */
export function t(key: string, options?: Parameters<TranslationFunction>[1]): string {
  if (!i18n.isInitialized) {
    console.warn('[i18n-browser] i18n not initialized, returning key')
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
 * CLI namespace translation (for browser applications that show CLI commands)
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
 * UI namespace translation
 */
export function tUi(key: string, options?: Parameters<TranslationFunction>[1]): string {
  return t(`ui:${key}`, options)
}

/**
 * Ensure i18n is initialized (safety check)
 */
export function ensureI18nInitialized(): void {
  if (!i18n.isInitialized) {
    throw new Error('i18n must be initialized before use. Call initI18nForBrowser() first.')
  }
}

/**
 * Check if a specific namespace is loaded
 */
export function isNamespaceLoaded(namespace: string): boolean {
  if (!i18n.isInitialized) {
    return false
  }
  return i18n.hasResourceBundle(i18n.language, namespace)
}

/**
 * Get all loaded namespaces for current language
 */
export function getLoadedNamespaces(): string[] {
  if (!i18n.isInitialized) {
    return []
  }
  return Object.keys(i18n.store?.data?.[i18n.language] || {})
}

// Export legacy format function for compatibility
export { format }

// Export constants for convenience
export { LANG_LABELS, NAMESPACES, SUPPORTED_LANGS }
