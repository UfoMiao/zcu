/**
 * Node.js/CLI Button Component
 * Ink-based implementation for terminal interfaces
 */

import type { BaseButtonProps } from '@ufomiao/ui-core'
import { buttonVariants } from '@ufomiao/ui-core'
import { Box, Text } from 'ink'
import { forwardRef } from 'react'

export interface NodeButtonProps extends BaseButtonProps {
  onPress?: () => void
  focus?: boolean
}

export const Button = forwardRef<any, NodeButtonProps>(
  ({ variant = 'default', size = 'default', loading, disabled, children, focus, onPress, i18nKey }, ref) => {
    const isDisabled = disabled || loading

    // Simple styling for CLI environment
    const getCliStyle = () => {
      switch (variant) {
        case 'destructive':
          return { color: 'red', inverse: focus }
        case 'secondary':
          return { color: 'gray', inverse: focus }
        case 'outline':
          return { color: 'white', inverse: focus, bold: true }
        case 'ghost':
          return { color: 'gray', dimColor: true, inverse: focus }
        default:
          return { color: 'blue', inverse: focus, bold: true }
      }
    }

    const style = getCliStyle()

    return (
      <Box ref={ref} borderStyle="round" paddingX={1}>
        <Text {...style} dimColor={isDisabled}>
          {loading ? '⏳ ' : ''}
          {children || i18nKey || 'Button'}
        </Text>
      </Box>
    )
  },
)

Button.displayName = 'NodeButton'

// Export props type for external use
export type ButtonProps = NodeButtonProps

// Utility buttons with predefined styles for CLI
export const PrimaryButton = forwardRef<any, Omit<NodeButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="default" {...props} />,
)

export const SecondaryButton = forwardRef<any, Omit<NodeButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="secondary" {...props} />,
)

export const DestructiveButton = forwardRef<any, Omit<NodeButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="destructive" {...props} />,
)

export const OutlineButton = forwardRef<any, Omit<NodeButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="outline" {...props} />,
)

export const GhostButton = forwardRef<any, Omit<NodeButtonProps, 'variant'>>(
  (props, ref) => <Button ref={ref} variant="ghost" {...props} />,
)

PrimaryButton.displayName = 'PrimaryButton'
SecondaryButton.displayName = 'SecondaryButton'
DestructiveButton.displayName = 'DestructiveButton'
OutlineButton.displayName = 'OutlineButton'
GhostButton.displayName = 'GhostButton'
