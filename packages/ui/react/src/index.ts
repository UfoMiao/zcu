/**
 * ZCU UI React Package
 *
 * React components with i18n integration for web applications.
 * This is the main entry point for web projects, providing zero Node.js dependencies.
 */

// Enhanced components with automatic i18n integration
export * from './components/EnhancedButton'

// Re-export i18n React utilities for convenience
export { useI18nInstance, useLanguageSwitcher } from '@ufomiao/i18n-react'

// Re-export all browser components
export * from '@ufomiao/ui-browser'
