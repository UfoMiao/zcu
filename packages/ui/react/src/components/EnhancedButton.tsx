/**
 * Enhanced Button with i18n Integration
 * Builds on top of browser Button with automatic translation
 */

import type { ButtonProps } from '@ufomiao/ui-browser'
import { useI18nInstance } from '@ufomiao/i18n-react'
import { Button } from '@ufomiao/ui-browser'
import { forwardRef } from 'react'

export interface EnhancedButtonProps extends Omit<ButtonProps, 'children'> {
  children?: React.ReactNode
  i18nKey?: string // Auto-translate using this key
  i18nNamespace?: string // Custom namespace (default: 'ui')
}

export const EnhancedButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ i18nKey, i18nNamespace = 'ui', children, loading, ...props }, ref) => {
    const i18nInstance = useI18nInstance()

    // Auto-translate if i18nKey is provided and no children
    const displayText = i18nKey && !children
      ? i18nInstance.t(`${i18nNamespace}:${i18nKey}`)
      : children

    // Show loading state with translation
    const loadingText = loading && i18nKey
      ? i18nInstance.t('ui:message_loading')
      : displayText

    return (
      <Button
        ref={ref}
        loading={loading}
        {...props}
      >
        {loading ? loadingText : displayText}
      </Button>
    )
  },
)

EnhancedButton.displayName = 'EnhancedButton'

// Predefined buttons with common translations
export const SaveButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'i18nKey'>>(
  (props, ref) => <EnhancedButton ref={ref} i18nKey="button_save" {...props} />,
)

export const CancelButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'i18nKey'>>(
  (props, ref) => <EnhancedButton ref={ref} variant="outline" i18nKey="button_cancel" {...props} />,
)

export const DeleteButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'i18nKey'>>(
  (props, ref) => <EnhancedButton ref={ref} variant="destructive" i18nKey="button_delete" {...props} />,
)

export const ConfirmButton = forwardRef<HTMLButtonElement, Omit<EnhancedButtonProps, 'i18nKey'>>(
  (props, ref) => <EnhancedButton ref={ref} i18nKey="button_confirm" {...props} />,
)

SaveButton.displayName = 'SaveButton'
CancelButton.displayName = 'CancelButton'
DeleteButton.displayName = 'DeleteButton'
ConfirmButton.displayName = 'ConfirmButton'
