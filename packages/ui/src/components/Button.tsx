/**
 * Multilingual Button component
 * Example of UI component with i18n support
 */

import type { ButtonHTMLAttributes, JSX, ReactNode } from 'react'
import { useI18nInstance } from '@ufomiao/i18n-react'
import { cn } from '../utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children?: ReactNode
  i18nKey?: string // Auto-translate using this key
  loading?: boolean
}

const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
}

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
}

export function Button({ ref, className, variant = 'default', size = 'default', i18nKey, loading, children, disabled, ...props }: ButtonProps & { ref?: React.RefObject<HTMLButtonElement | null> }): JSX.Element {
  // Get i18n instance using hook
  const i18nInstance = useI18nInstance()

  // Auto-translate if i18nKey is provided
  const displayText = i18nKey && !children ? i18nInstance.t(`ui:${i18nKey}`) : children

  // Show loading state
  const isDisabled = disabled || loading

  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      disabled={isDisabled}
      ref={ref}
      {...props}
    >
      {loading && (
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {loading && i18nKey ? i18nInstance.t('ui:message_loading') : displayText}
    </button>
  )
}

Button.displayName = 'Button'

// Predefined buttons with common translations
export const SaveButton = ({ ref, ...props }: Omit<ButtonProps, 'i18nKey'> & { ref?: React.RefObject<HTMLButtonElement | null> }): JSX.Element => <Button ref={ref} i18nKey="button_save" {...props} />

export const CancelButton = ({ ref, ...props }: Omit<ButtonProps, 'i18nKey'> & { ref?: React.RefObject<HTMLButtonElement | null> }): JSX.Element => <Button ref={ref} variant="outline" i18nKey="button_cancel" {...props} />

export const DeleteButton = ({ ref, ...props }: Omit<ButtonProps, 'i18nKey'> & { ref?: React.RefObject<HTMLButtonElement | null> }): JSX.Element => <Button ref={ref} variant="destructive" i18nKey="button_delete" {...props} />

SaveButton.displayName = 'SaveButton'
CancelButton.displayName = 'CancelButton'
DeleteButton.displayName = 'DeleteButton'
