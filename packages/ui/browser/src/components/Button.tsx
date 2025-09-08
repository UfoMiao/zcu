/**
 * Browser Button Component
 * Pure web implementation without Node.js dependencies
 */

import type { BaseButtonProps, VariantProps } from '@ufomiao/ui-core'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { buttonVariants, cn } from '@ufomiao/ui-core'
import { forwardRef } from 'react'

export interface BrowserButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'>, BaseButtonProps {
  children?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, BrowserButtonProps>(
  ({ className, variant = 'default', size = 'default', loading, disabled, children, ...props }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        type="button"
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'

// Export variant types for external use
export type ButtonProps = BrowserButtonProps
export type { VariantProps }

// Utility buttons with predefined styles
export const PrimaryButton = forwardRef<HTMLButtonElement, Omit<BrowserButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="default" {...props} />,
)

export const SecondaryButton = forwardRef<HTMLButtonElement, Omit<BrowserButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />,
)

export const DestructiveButton = forwardRef<HTMLButtonElement, Omit<BrowserButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="destructive" {...props} />,
)

export const OutlineButton = forwardRef<HTMLButtonElement, Omit<BrowserButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />,
)

export const GhostButton = forwardRef<HTMLButtonElement, Omit<BrowserButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="ghost" {...props} />,
)

PrimaryButton.displayName = 'PrimaryButton'
SecondaryButton.displayName = 'SecondaryButton'
DestructiveButton.displayName = 'DestructiveButton'
OutlineButton.displayName = 'OutlineButton'
GhostButton.displayName = 'GhostButton'
