/**
 * Class name utility for merging Tailwind CSS classes
 * Based on tailwind-merge and clsx for optimal performance
 */

import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Simple environment detection (browser-compatible)
const ENV = {
  isBrowser: typeof window !== 'undefined',
  isNode: typeof process !== 'undefined' && typeof process.env !== 'undefined',
}

/**
 * Merge class names with Tailwind CSS class conflict resolution
 * @param inputs - Class names to merge
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Environment detection utilities for cross-platform components
 */
export const UI_ENV = {
  isInk: ENV.isNode && !ENV.isBrowser,
  isBrowser: ENV.isBrowser,
  isTest: typeof process !== 'undefined' ? process.env.NODE_ENV === 'test' : false,
} as const

/**
 * Component variant helper for conditional styling
 */
export function variantClass(
  base: string,
  variants: Record<string, string>,
  variant: string,
): string {
  return cn(base, variants[variant] || variants.default || '')
}
