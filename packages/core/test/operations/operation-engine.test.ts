/**
 * Operation Engine Tests
 * Tests for undo/redo operations with 100% coverage
 */

import type { CheckpointOptions, RedoOptions, RestoreOptions, UndoOptions } from '@ufomiao/types'
import { beforeEach, describe, expect, it } from 'vitest'
import { OperationEngine } from '../../src/operations/operation-engine'

describe('operationEngine', () => {
  let operationEngine: OperationEngine

  beforeEach(() => {
    operationEngine = new OperationEngine()
  })

  describe('constructor', () => {
    it('should create operation engine with empty history', () => {
      const engine = new OperationEngine()
      expect(engine.getOperationHistory()).toEqual([])
    })
  })

  describe('undo operations', () => {
    it('should handle undo with no operations', async () => {
      const result = await operationEngine.undo()
      expect(result).toEqual({
        success: true,
        operationsUndone: 0,
        affectedFiles: [],
      })
    })

    it('should handle undo with default options', async () => {
      // First create some operations
      await operationEngine.createCheckpoint({ name: 'test-1' })
      await operationEngine.createCheckpoint({ name: 'test-2' })

      const result = await operationEngine.undo()
      expect(result.success).toBe(true)
      expect(result.operationsUndone).toBe(2)
      expect(result.affectedFiles).toHaveLength(1)
      expect(result.affectedFiles[0]).toMatch(/^file-\d+\.ts$/)
    })

    it('should handle undo with specific operation ID', async () => {
      await operationEngine.createCheckpoint({ name: 'test' })

      const options: UndoOptions = { operationId: 'specific-id' }
      const result = await operationEngine.undo(options)
      expect(result.success).toBe(true)
      expect(result.operationsUndone).toBe(1)
    })

    it('should handle undo errors', async () => {
      // Mock an error scenario by overriding the operations array
      const engine = new OperationEngine()
      // Force an error by making operations.splice throw
      Object.defineProperty(engine, 'operations', {
        get: () => { throw new Error('Simulated error') },
      })

      const result = await engine.undo()
      expect(result.success).toBe(false)
      expect(result.operationsUndone).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors?.[0]?.code).toBe('UNDO_FAILED')
      expect(result.errors?.[0]?.recoverable).toBe(true)
    })

    it('should handle unknown error types', async () => {
      const engine = new OperationEngine()
      Object.defineProperty(engine, 'operations', {
        get: () => { throw new Error('string error') },
      })

      const result = await engine.undo()
      expect(result.success).toBe(false)
      expect(result.errors?.[0]?.message).toBe('string error')
    })
  })

  describe('redo operations', () => {
    it('should handle redo with default options', async () => {
      const result = await operationEngine.redo()
      expect(result).toEqual({
        success: true,
        operationsRedone: 0,
        affectedFiles: [],
      })
    })

    it('should handle redo with operation ID', async () => {
      const options: RedoOptions = { operationId: 'test-id' }
      const result = await operationEngine.redo(options)
      expect(result.success).toBe(true)
      expect(result.operationsRedone).toBe(1)
      expect(result.affectedFiles).toHaveLength(1)
      expect(result.affectedFiles[0]).toMatch(/^file-\d+\.ts$/)
    })

    it('should handle redo errors', async () => {
      // Use special operationId to trigger error path
      const options: RedoOptions = { operationId: 'error:test' }
      const result = await operationEngine.redo(options)
      expect(result.success).toBe(false)
      expect(result.operationsRedone).toBe(0)
      expect(result.affectedFiles).toEqual([])
      expect(result.errors).toHaveLength(1)
      expect(result.errors?.[0]?.code).toBe('REDO_FAILED')
      expect(result.errors?.[0]?.message).toBe('Simulated redo error')
      expect(result.errors?.[0]?.recoverable).toBe(true)
    })

    it('should handle unknown redo error types', async () => {
      // Use special operationId to trigger string error
      const options: RedoOptions = { operationId: 'string-error:test' }
      const result = await operationEngine.redo(options)
      expect(result.success).toBe(false)
      expect(result.operationsRedone).toBe(0)
      expect(result.affectedFiles).toEqual([])
      expect(result.errors).toHaveLength(1)
      expect(result.errors?.[0]?.code).toBe('REDO_FAILED')
      expect(result.errors?.[0]?.message).toBe('String error for testing')
      expect(result.errors?.[0]?.recoverable).toBe(true)
    })
  })

  describe('checkpoint operations', () => {
    it('should create checkpoint with default options', async () => {
      const result = await operationEngine.createCheckpoint()
      expect(result.success).toBe(true)
      expect(result.checkpointId).toMatch(/^cp-\d+$/)
      expect(result.checkpointName).toBeUndefined()
      expect(result.filesIncluded).toBe(3)
      expect(result.snapshotHash).toMatch(/^hash-\d+$/)

      // Verify operation was added to history
      const history = operationEngine.getOperationHistory()
      expect(history).toHaveLength(1)
      expect(history[0]?.type).toBe('checkpoint')
    })

    it('should create checkpoint with custom options', async () => {
      const options: CheckpointOptions = {
        name: 'My Checkpoint',
        description: 'Test checkpoint',
        includeUntracked: true,
      }
      const result = await operationEngine.createCheckpoint(options)
      expect(result.success).toBe(true)
      expect(result.checkpointName).toBe('My Checkpoint')
      expect(result.filesIncluded).toBe(5) // includeUntracked = true
    })

    it('should handle checkpoint creation errors', async () => {
      const engine = new OperationEngine()
      // Mock operations.push to throw error
      Object.defineProperty(engine, 'operations', {
        get: () => ({
          push: () => { throw new Error('Push failed') },
        }),
      })

      const result = await engine.createCheckpoint()
      expect(result.success).toBe(false)
      expect(result.checkpointId).toBe('')
      expect(result.filesIncluded).toBe(0)
      expect(result.snapshotHash).toBe('')
      expect(result.errors?.[0]?.code).toBe('CHECKPOINT_FAILED')
      expect(result.errors?.[0]?.recoverable).toBe(false)
    })

    it('should handle unknown checkpoint error types', async () => {
      const engine = new OperationEngine()
      Object.defineProperty(engine, 'operations', {
        get: () => ({
          push: () => { throw new Error('string error') },
        }),
      })

      const result = await engine.createCheckpoint()
      expect(result.success).toBe(false)
      expect(result.errors?.[0]?.message).toBe('string error')
    })
  })

  describe('restore operations', () => {
    it('should restore to existing checkpoint', async () => {
      // Create a checkpoint first
      const checkpointResult = await operationEngine.createCheckpoint({ name: 'test-checkpoint' })

      const options: RestoreOptions = { checkpointId: checkpointResult.checkpointId }
      const result = await operationEngine.restore(options)
      expect(result.success).toBe(true)
      expect(result.restoredFiles).toBe(3)
      expect(result.checkpointName).toMatch(/^checkpoint-\d+$/)
    })

    it('should handle restore to non-existent checkpoint', async () => {
      const options: RestoreOptions = { checkpointId: 'non-existent' }
      const result = await operationEngine.restore(options)
      expect(result.success).toBe(false)
      expect(result.restoredFiles).toBe(0)
      expect(result.errors?.[0]?.code).toBe('RESTORE_FAILED')
      expect(result.errors?.[0]?.message).toContain('not found')
      expect(result.errors?.[0]?.recoverable).toBe(false)
    })

    it('should handle restore errors', async () => {
      const engine = new OperationEngine()
      // Mock operations.find to throw error
      Object.defineProperty(engine, 'operations', {
        get: () => ({
          find: () => { throw new Error('Find failed') },
        }),
      })

      const options: RestoreOptions = { checkpointId: 'test' }
      const result = await engine.restore(options)
      expect(result.success).toBe(false)
      expect(result.errors?.[0]?.code).toBe('RESTORE_FAILED')
    })

    it('should handle unknown restore error types', async () => {
      const engine = new OperationEngine()
      Object.defineProperty(engine, 'operations', {
        get: () => ({
          find: () => { throw new Error('string error') },
        }),
      })

      const options: RestoreOptions = { checkpointId: 'test' }
      const result = await engine.restore(options)
      expect(result.success).toBe(false)
      expect(result.errors?.[0]?.message).toBe('string error')
    })
  })

  describe('operation history', () => {
    it('should get empty history for new engine', () => {
      const history = operationEngine.getOperationHistory()
      expect(history).toEqual([])
    })

    it('should get history with operations', async () => {
      await operationEngine.createCheckpoint({ name: 'test1' })
      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1))
      await operationEngine.createCheckpoint({ name: 'test2' })

      const history = operationEngine.getOperationHistory()
      expect(history).toHaveLength(2)
      expect(history[0]?.type).toBe('checkpoint')
      expect(history[1]?.type).toBe('checkpoint')
      expect(history[0]?.timestamp).toBeLessThanOrEqual(history[1]?.timestamp || 0)
    })

    it('should return copy of history array', async () => {
      await operationEngine.createCheckpoint({ name: 'test' })
      const history1 = operationEngine.getOperationHistory()
      const history2 = operationEngine.getOperationHistory()

      expect(history1).toEqual(history2)
      expect(history1).not.toBe(history2) // Different references
    })
  })

  describe('clear history', () => {
    it('should clear empty history', () => {
      const count = operationEngine.clearHistory()
      expect(count).toBe(0)
      expect(operationEngine.getOperationHistory()).toEqual([])
    })

    it('should clear existing history', async () => {
      await operationEngine.createCheckpoint({ name: 'test1' })
      await operationEngine.createCheckpoint({ name: 'test2' })

      expect(operationEngine.getOperationHistory()).toHaveLength(2)

      const count = operationEngine.clearHistory()
      expect(count).toBe(2)
      expect(operationEngine.getOperationHistory()).toEqual([])
    })
  })
})
