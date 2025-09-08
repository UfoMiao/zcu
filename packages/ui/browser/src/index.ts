/**
 * ZCU UI Browser Package
 *
 * Pure browser/web UI components with zero Node.js dependencies.
 * Built on Radix UI primitives for excellent accessibility.
 */

// Export all components
export * from './components'

// Re-export core utilities and types for convenience
export { cn, envCheck, UI_ENV, type UIEnvironment } from '@ufomiao/ui-core'
export type { BaseButtonProps, ButtonSize, ButtonVariant, VariantProps } from '@ufomiao/ui-core'
