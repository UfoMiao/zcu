/**
 * ZCU UI Node Package
 *
 * CLI/Node.js UI components with full access to Node.js APIs.
 * Built with Ink for terminal interfaces and Enquirer for interactions.
 */

// Export all components
export * from './components'

// Re-export core utilities and types for convenience
export { cn, envCheck, UI_ENV, type UIEnvironment } from '@ufomiao/ui-core'
export type { BaseButtonProps, ButtonSize, ButtonVariant } from '@ufomiao/ui-core'
