/**
 * Core utility functions shared across all packages
 */

import type { FormatFunction } from './types'

/**
 * Simple format function for legacy compatibility
 * Replaces {key} placeholders with values from the provided object
 */
export const format: FormatFunction = (template: string, values?: Record<string, string>): string => {
  if (!values)
    return template

  return Object.keys(values).reduce((result, key) => {
    const value = values[key]
    return result.replace(new RegExp(`{${key}}`, 'g'), value ?? '')
  }, template)
}

/**
 * Check if a language is supported
 */
export function isSupportedLanguage(lang: string): boolean {
  return ['zh-CN', 'en'].includes(lang)
}

/**
 * Get a safe language value with fallback
 */
export function getSafeLanguage(lang?: string): 'zh-CN' | 'en' {
  if (lang && isSupportedLanguage(lang)) {
    return lang as 'zh-CN' | 'en'
  }
  return 'en'
}

/**
 * Validate namespace exists
 */
export function isValidNamespace(ns: string): boolean {
  return ['common', 'cli', 'commands', 'errors', 'messages', 'ui'].includes(ns)
}

/**
 * Get display name for language
 */
export function getLanguageDisplayName(lang: 'zh-CN' | 'en'): string {
  const labels = {
    'zh-CN': '简体中文',
    'en': 'English',
  }
  return labels[lang] || 'English'
}
