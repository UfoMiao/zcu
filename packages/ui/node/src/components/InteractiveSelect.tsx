/**
 * CLI Interactive Select Component
 * Enquirer-based selection component for CLI environments
 */

import { Select } from 'enquirer'
import { useEffect, useState } from 'react'

export interface SelectOption {
  name: string
  value: string
  disabled?: boolean
  hint?: string
}

export interface InteractiveSelectProps {
  message: string
  choices: SelectOption[]
  initial?: string | number
  multiple?: boolean
  onSelect: (selected: string | string[]) => void
  onCancel?: () => void
}

export function InteractiveSelect({
  message,
  choices,
  initial,
  multiple = false,
  onSelect,
  onCancel,
}: InteractiveSelectProps) {
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    if (!isActive) {
      return
    }

    const runSelect = async () => {
      try {
        const prompt = new Select({
          name: 'selection',
          message,
          choices: choices.map(choice => ({
            name: choice.name,
            value: choice.value,
            disabled: choice.disabled,
            hint: choice.hint,
          })),
          initial,
          multiple,
        })

        const result = await prompt.run()
        onSelect(result)
      }
      catch (error) {
        if (onCancel) {
          onCancel()
        }
      }
      finally {
        setIsActive(false)
      }
    }

    runSelect()
  }, [isActive, message, choices, initial, multiple, onSelect, onCancel])

  // This component doesn't render anything visible - enquirer handles the UI
  return null
}

InteractiveSelect.displayName = 'InteractiveSelect'

// Utility function to create a quick select
export async function quickSelect(
  message: string,
  choices: SelectOption[],
  options?: { initial?: string | number, multiple?: boolean },
): Promise<string | string[]> {
  const prompt = new Select({
    name: 'selection',
    message,
    choices: choices.map(choice => ({
      name: choice.name,
      value: choice.value,
      disabled: choice.disabled,
      hint: choice.hint,
    })),
    initial: options?.initial,
    multiple: options?.multiple,
  })

  return prompt.run()
}
