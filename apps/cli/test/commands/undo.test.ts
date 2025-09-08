/**
 * Undo Command Handler Tests
 * Tests for the undo command implementation
 */

import type { UndoCliOptions } from '../../src/commands/undo'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { handleUndo } from '../../src/commands/undo'

describe('undo Command Handler', () => {
  let consoleSpy: any
  let processExitSpy: any

  beforeEach(() => {
    // Mock console methods
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    }

    // Mock process.exit
    processExitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called')
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    consoleSpy.log?.mockRestore?.()
    consoleSpy.error?.mockRestore?.()
    processExitSpy?.mockRestore?.()
  })

  describe('basic functionality', () => {
    it('should handle default undo operation', async () => {
      const options: UndoCliOptions = {}

      await handleUndo(options)

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('🔄 ZCU Undo'),
      )
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('✅ Undo operation completed'),
      )
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('development'),
      )
    })

    it('should handle preview mode', async () => {
      const options: UndoCliOptions = { preview: true }

      await handleUndo(options)

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('📋 Preview mode'),
      )
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Preview functionality'),
      )
    })

    it('should handle interactive mode', async () => {
      const options: UndoCliOptions = { interactive: true }

      await handleUndo(options)

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('🎯 Interactive undo mode'),
      )
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('Interactive selection'),
      )
    })

    it('should prioritize preview over interactive', async () => {
      const options: UndoCliOptions = {
        preview: true,
        interactive: true,
      }

      await handleUndo(options)

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('📋 Preview mode'),
      )
      expect(consoleSpy.log).not.toHaveBeenCalledWith(
        expect.stringContaining('🎯 Interactive undo mode'),
      )
    })

    it('should handle force option', async () => {
      const options: UndoCliOptions = { force: true }

      // Should not throw error
      await expect(handleUndo(options)).resolves.not.toThrow()

      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('🔄 ZCU Undo'),
      )
    })
  })

  describe('error handling', () => {
    it('should handle and log errors', async () => {
      // Mock console.log to throw error
      consoleSpy.log.mockImplementationOnce(() => {
        throw new Error('Test error')
      })

      const options: UndoCliOptions = {}

      await expect(handleUndo(options)).rejects.toThrow('process.exit called')

      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('❌ Undo failed:'),
        expect.any(Error),
      )
      expect(processExitSpy).toHaveBeenCalledWith(1)
    })

    it('should exit with code 1 on error', async () => {
      // Force an error by mocking a failing operation
      consoleSpy.log.mockImplementationOnce(() => {
        throw new Error('Simulated failure')
      })

      const options: UndoCliOptions = {}

      try {
        await handleUndo(options)
      }
      catch (error) {
        expect(error).toEqual(new Error('process.exit called'))
      }

      expect(processExitSpy).toHaveBeenCalledWith(1)
    })
  })

  describe('option combinations', () => {
    it('should handle all options together', async () => {
      const options: UndoCliOptions = {
        preview: true,
        interactive: true,
        force: true,
      }

      await handleUndo(options)

      // Preview should take precedence
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('📋 Preview mode'),
      )
    })

    it('should handle empty options object', async () => {
      const options: UndoCliOptions = {}

      await expect(handleUndo(options)).resolves.not.toThrow()

      expect(consoleSpy.log).toHaveBeenCalled()
    })
  })

  describe('output formatting', () => {
    it('should use colored output', async () => {
      const options: UndoCliOptions = {}

      await handleUndo(options)

      // Verify console.log was called (colors are handled by chalk)
      expect(consoleSpy.log).toHaveBeenCalledTimes(3)

      // Check that each call contains expected content
      const calls = consoleSpy.log.mock.calls
      expect(calls[0][0]).toContain('ZCU Undo')
      expect(calls[1][0]).toContain('completed')
      expect(calls[2][0]).toContain('development')
    })

    it('should show appropriate status messages', async () => {
      const testCases = [
        { options: {}, expectedMessages: ['ZCU Undo', 'completed', 'development'] },
        { options: { preview: true }, expectedMessages: ['ZCU Undo', 'Preview mode', 'development'] },
        { options: { interactive: true }, expectedMessages: ['ZCU Undo', 'Interactive', 'development'] },
      ]

      for (const testCase of testCases) {
        consoleSpy.log.mockClear()

        await handleUndo(testCase.options)

        const allOutput = consoleSpy.log.mock.calls.flat().join(' ')
        testCase.expectedMessages.forEach((message) => {
          expect(allOutput).toContain(message)
        })
      }
    })
  })
})
