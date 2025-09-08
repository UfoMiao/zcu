/**
 * ZCU UI Core Types
 * Environment-agnostic type definitions for UI components
 */

import type { VariantProps } from 'class-variance-authority'

// Basic component props
export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

// Button component types
export type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon'

export interface BaseButtonProps extends BaseComponentProps {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  i18nKey?: string // Auto-translate using this key
}

// Environment detection types
export interface UIEnvironment {
  readonly isInk: boolean
  readonly isBrowser: boolean
  readonly isTest: boolean
}

// Component variant system types
export type ComponentVariants<T = Record<string, any>> = T & {
  variants: Record<string, Record<string, string>>
  defaultVariants?: Partial<T>
}

export type VariantClassFunction = (
  base: string,
  variants: Record<string, string>,
  variant: string,
) => string

// Export VariantProps for external use
export type { VariantProps }
