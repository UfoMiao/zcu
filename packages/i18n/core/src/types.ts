/**
 * Core i18n types shared across all packages
 */

import type { Namespace, SupportedLang } from './constants'

// Translation options interface
export interface TranslationOptions {
  [key: string]: string | number | boolean | undefined
  count?: number // For pluralization
  context?: string // For context-specific translations
  defaultValue?: string // Fallback value
}

// Core i18n instance interface (environment-agnostic)
export interface I18nInstance {
  isInitialized: boolean
  language: string
  t: (key: string, options?: TranslationOptions) => string
  changeLanguage: (lng: SupportedLang) => Promise<void>
  hasResourceBundle: (lng: string, ns: string) => boolean
  loadNamespaces: (ns: string | string[]) => Promise<void>
}

// Translation function signature
export type TranslationFunction = (key: string, options?: TranslationOptions) => string

// Namespace-specific translation functions
export type CommonTranslation = TranslationFunction
export type CliTranslation = TranslationFunction
export type CommandTranslation = TranslationFunction
export type ErrorTranslation = TranslationFunction
export type MessageTranslation = TranslationFunction
export type UiTranslation = TranslationFunction

// i18n initialization options (base interface)
export interface BaseI18nOptions {
  language?: SupportedLang
  enableDebug?: boolean
  preloadNamespaces?: Namespace[]
}

// Environment status interface
export interface I18nStatus {
  isInitialized: boolean
  currentLanguage: SupportedLang
  loadedNamespaces: string[]
  environment: 'node' | 'browser' | 'react'
}

// Legacy format function signature
export type FormatFunction = (template: string, values?: Record<string, string>) => string

// Language switcher interface for React
export interface LanguageSwitcher {
  currentLanguage: SupportedLang
  changeLanguage: (lng: SupportedLang) => Promise<void>
  supportedLanguages: readonly SupportedLang[]
  isReady: boolean
}
