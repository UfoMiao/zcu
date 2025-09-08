/**
 * UI Utility Functions Tests
 * Tests for class name utilities and environment detection
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { cn, UI_ENV, variantClass } from '../src/utils/cn'

describe('uI Utilities', () => {
  describe('cn (class name merger)', () => {
    it('should merge simple class names', () => {
      const result = cn('btn', 'primary')
      expect(result).toBe('btn primary')
    })

    it('should handle undefined and null values', () => {
      const result = cn('btn', undefined, null, 'primary')
      expect(result).toBe('btn primary')
    })

    it('should merge conditional classes', () => {
      const isActive = true
      const result = cn('btn', isActive && 'active', 'primary')
      expect(result).toBe('btn active primary')
    })

    it('should handle Tailwind class conflicts', () => {
      const result = cn('px-2 py-1', 'px-4')
      // tailwind-merge should resolve conflicts, keeping px-4
      expect(result).toBe('py-1 px-4')
    })

    it('should handle array of classes', () => {
      const result = cn(['btn', 'primary'], 'active')
      expect(result).toBe('btn primary active')
    })

    it('should handle object-style classes', () => {
      const result = cn({
        btn: true,
        primary: true,
        disabled: false,
      })
      expect(result).toBe('btn primary')
    })

    it('should merge complex combinations', () => {
      const isLarge = true
      const isDisabled = false
      const result = cn(
        'btn',
        {
          'btn-lg': isLarge,
          'btn-disabled': isDisabled,
        },
        isLarge && 'text-lg',
        'hover:bg-blue-500',
      )
      expect(result).toBe('btn btn-lg text-lg hover:bg-blue-500')
    })
  })

  describe('environment detection (UI_UI_ENV)', () => {
    beforeEach(() => {
      // Clean up any mocked values
      vi.unstubAllEnvs()
    })

    it('should detect test environment', () => {
      expect(UI_ENV.isTest).toBe(true)
    })

    it('should detect browser environment', () => {
      // In node test environment, window should be undefined
      expect(UI_ENV.isBrowser).toBe(false)
    })

    it('should detect Ink environment correctly', () => {
      // In test environment, isInk should be false
      expect(UI_ENV.isInk).toBe(false)
    })

    it('should provide all environment flags', () => {
      expect(typeof UI_ENV.isInk).toBe('boolean')
      expect(typeof UI_ENV.isBrowser).toBe('boolean')
      expect(typeof UI_ENV.isTest).toBe('boolean')
    })

    it('should have consistent environment object', () => {
      // UI_ENV object should be consistent
      const envKeys = Object.keys(UI_ENV).sort()
      expect(envKeys).toEqual(['isBrowser', 'isInk', 'isTest'])

      // All values should be booleans
      Object.values(UI_ENV).forEach((value) => {
        expect(typeof value).toBe('boolean')
      })
    })
  })

  describe('variantClass function', () => {
    const buttonVariants = {
      default: 'bg-blue-500 text-white',
      primary: 'bg-blue-600 text-white font-bold',
      secondary: 'bg-gray-500 text-white',
      danger: 'bg-red-500 text-white',
    }

    it('should apply variant classes', () => {
      const result = variantClass('btn rounded', buttonVariants, 'primary')
      expect(result).toBe('btn rounded bg-blue-600 text-white font-bold')
    })

    it('should fallback to default variant', () => {
      const result = variantClass('btn rounded', buttonVariants, 'nonexistent')
      expect(result).toBe('btn rounded bg-blue-500 text-white')
    })

    it('should handle missing default variant', () => {
      const variantsWithoutDefault = {
        primary: 'bg-blue-600',
        secondary: 'bg-gray-500',
      }
      const result = variantClass('btn', variantsWithoutDefault, 'nonexistent')
      expect(result).toBe('btn')
    })

    it('should merge base classes with variant', () => {
      const result = variantClass('btn px-4 py-2', buttonVariants, 'danger')
      expect(result).toBe('btn px-4 py-2 bg-red-500 text-white')
    })

    it('should handle empty base classes', () => {
      const result = variantClass('', buttonVariants, 'secondary')
      expect(result).toBe('bg-gray-500 text-white')
    })
  })

  describe('utility function integration', () => {
    it('should work together for component styling', () => {
      const baseClasses = 'inline-flex items-center justify-center'
      const sizeVariants = {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      }
      const colorVariants = {
        blue: 'bg-blue-500 hover:bg-blue-600',
        red: 'bg-red-500 hover:bg-red-600',
      }

      const isDisabled = false
      const size = 'md'
      const color = 'blue'

      const result = cn(
        baseClasses,
        variantClass('', sizeVariants, size),
        variantClass('', colorVariants, color),
        {
          'opacity-50 cursor-not-allowed': isDisabled,
        },
      )

      expect(result).toContain('inline-flex')
      expect(result).toContain('h-10 px-4')
      expect(result).toContain('bg-blue-500')
      expect(result).not.toContain('opacity-50')
    })
  })
})
