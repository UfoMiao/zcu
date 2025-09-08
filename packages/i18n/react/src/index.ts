/**
 * ZCU i18n React Package
 *
 * Provides React-specific hooks and components for i18n functionality.
 * Built on top of the browser package with React integration.
 */

import type { LanguageSwitcher, SupportedLang } from '@ufomiao/i18n-core'
import { SUPPORTED_LANGS } from '@ufomiao/i18n-core'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

export * from '@ufomiao/i18n-browser'
// Re-export core types and constants
export * from '@ufomiao/i18n-core'

// Re-export react-i18next essentials
export { I18nextProvider, initReactI18next, Trans, useTranslation } from 'react-i18next'

/**
 * Custom hook for language switching functionality
 * Provides current language state and switching capabilities
 *
 * Example usage:
 * ```tsx
 * const { currentLanguage, changeLanguage, isReady } = useLanguageSwitcher()
 *
 * // In component render: use i18n.t('namespace:key') instead of t() for i18n-ally
 * const i18nInstance = useI18nInstance()
 * return <h1>{i18nInstance.t('commands:status_title')}</h1>
 * ```
 */
export function useLanguageSwitcher(): LanguageSwitcher {
  const { i18n: i18nInstance } = useTranslation()

  const changeLanguage = useCallback(async (lng: SupportedLang) => {
    await i18nInstance.changeLanguage(lng)
  }, [i18nInstance])

  return {
    currentLanguage: i18nInstance.language as SupportedLang,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGS,
    isReady: i18nInstance.isInitialized,
  }
}

/**
 * Hook to get i18n instance for direct usage
 * Use this when you need the i18n instance for i18n.t('namespace:key') calls
 *
 * This approach maintains compatibility with i18n-ally VS Code extension
 *
 * Example:
 * ```tsx
 * const i18nInstance = useI18nInstance()
 * return <h1>{i18nInstance.t('commands:status_title')}</h1>
 * ```
 */
export function useI18nInstance(): any {
  const { i18n: i18nInstance } = useTranslation()
  return i18nInstance
}

/**
 * Hook for loading additional namespaces dynamically
 * Useful for lazy-loading translations for specific features
 *
 * Example:
 * ```tsx
 * const { loadNamespaces } = useNamespaceLoader()
 *
 * useEffect(() => {
 *   loadNamespaces(['errors', 'ui'])
 * }, [loadNamespaces])
 * ```
 */
export function useNamespaceLoader(): {
  loadNamespaces: (namespaces: string | string[]) => Promise<void>
} {
  const { i18n: i18nInstance } = useTranslation()

  const loadNamespaces = useCallback(async (namespaces: string | string[]) => {
    if (!i18nInstance.isInitialized) {
      throw new Error('i18n must be initialized before loading namespaces')
    }

    const nsArray = Array.isArray(namespaces) ? namespaces : [namespaces]
    await Promise.all(nsArray.map(ns => i18nInstance.loadNamespaces(ns)))
  }, [i18nInstance])

  return { loadNamespaces }
}

/**
 * Hook to check if specific namespaces are loaded
 *
 * Example:
 * ```tsx
 * const { isLoaded } = useNamespaceStatus(['ui', 'errors'])
 *
 * if (!isLoaded) {
 *   return <LoadingSpinner />
 * }
 * ```
 */
export function useNamespaceStatus(namespaces: string | string[]): {
  isLoaded: boolean
} {
  const { i18n: i18nInstance } = useTranslation()

  const nsArray = Array.isArray(namespaces) ? namespaces : [namespaces]
  const isLoaded = nsArray.every(ns => i18nInstance.hasResourceBundle(i18nInstance.language, ns))

  return { isLoaded }
}

/**
 * Hook to get current i18n status and diagnostics
 * Useful for debugging and status displays
 *
 * Example:
 * ```tsx
 * const status = useI18nStatus()
 * return <div>Language: {status.currentLanguage}, Loaded: {status.loadedNamespaces.join(', ')}</div>
 * ```
 */
export function useI18nStatus(): {
  isInitialized: boolean
  currentLanguage: SupportedLang
  loadedNamespaces: string[]
  isDevMode: boolean
} {
  const { i18n: i18nInstance } = useTranslation()

  return {
    isInitialized: i18nInstance.isInitialized,
    currentLanguage: i18nInstance.language as SupportedLang,
    loadedNamespaces: Object.keys(i18nInstance.store?.data?.[i18nInstance.language] || {}),
    isDevMode: typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : false,
  }
}

/**
 * Development helper: Hook to detect missing translations
 * Only active in development mode
 *
 * Example:
 * ```tsx
 * const { isDevMode } = useMissingTranslations()
 * // Missing translations will be logged to console in dev mode
 * ```
 */
export function useMissingTranslations(): {
  isDevMode: boolean
} {
  const { i18n: i18nInstance } = useTranslation()

  // Simple development detection (browser-compatible)
  const isDevMode = typeof process !== 'undefined' ? process.env.NODE_ENV === 'development' : false

  if (isDevMode && typeof window !== 'undefined') {
    // Only set up listeners in browser environment
    const handleMissingKey = (lng: string, namespace: string, key: string) => {
      console.warn(`[i18n-react] Missing translation: ${lng}:${namespace}:${key}`)
    }

    // Set up listener (i18next handles duplicate listeners)
    i18nInstance.on('missingKey', handleMissingKey)
  }

  return { isDevMode }
}

/**
 * Hook for namespace-specific translations with better type safety
 * Provides pre-bound translation functions for specific namespaces
 *
 * Example:
 * ```tsx
 * const { tc, tUi, tErr } = useNamespaceTranslations()
 * return (
 *   <div>
 *     <h1>{tc('welcome')}</h1>
 *     <button>{tUi('submit')}</button>
 *     <span>{tErr('validation_failed')}</span>
 *   </div>
 * )
 * ```
 */
export function useNamespaceTranslations(): {
  tc: (key: string, options?: any) => string // common
  tCli: (key: string, options?: any) => string // cli
  tCmd: (key: string, options?: any) => string // commands
  tErr: (key: string, options?: any) => string // errors
  tMsg: (key: string, options?: any) => string // messages
  tUi: (key: string, options?: any) => string // ui
} {
  const { t } = useTranslation()

  return {
    tc: useCallback((key: string, options?: any) => t(`common:${key}`, options) as string, [t]),
    tCli: useCallback((key: string, options?: any) => t(`cli:${key}`, options) as string, [t]),
    tCmd: useCallback((key: string, options?: any) => t(`commands:${key}`, options) as string, [t]),
    tErr: useCallback((key: string, options?: any) => t(`errors:${key}`, options) as string, [t]),
    tMsg: useCallback((key: string, options?: any) => t(`messages:${key}`, options) as string, [t]),
    tUi: useCallback((key: string, options?: any) => t(`ui:${key}`, options) as string, [t]),
  }
}

/**
 * Hook for handling language persistence
 * Automatically saves language preference to localStorage
 *
 * Example:
 * ```tsx
 * const { changeLanguage } = useLanguagePersistence()
 *
 * const handleLanguageChange = (lang: SupportedLang) => {
 *   changeLanguage(lang) // Will also save to localStorage
 * }
 * ```
 */
export function useLanguagePersistence(): {
  changeLanguage: (lng: SupportedLang) => Promise<void>
  getStoredLanguage: () => SupportedLang | null
} {
  const { i18n: i18nInstance } = useTranslation()

  const changeLanguage = useCallback(async (lng: SupportedLang) => {
    await i18nInstance.changeLanguage(lng)
    if (typeof window !== 'undefined') {
      localStorage.setItem('zcu-language', lng)
    }
  }, [i18nInstance])

  const getStoredLanguage = useCallback((): SupportedLang | null => {
    if (typeof window === 'undefined') {
      return null
    }
    const stored = localStorage.getItem('zcu-language')
    return SUPPORTED_LANGS.includes(stored as SupportedLang) ? stored as SupportedLang : null
  }, [])

  return {
    changeLanguage,
    getStoredLanguage,
  }
}
