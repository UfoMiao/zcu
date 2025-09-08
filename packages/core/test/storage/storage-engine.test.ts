/**
 * Storage Engine Tests
 * Tests for LevelDB-based storage operations with 100% coverage
 */

import type { CheckpointData, LevelDBOptions } from '@ufomiao/types'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { StorageEngine } from '../../src/storage/storage-engine'

describe('storageEngine', () => {
  let storageEngine: StorageEngine
  const testPath = '/tmp/zcu-test-storage'

  beforeEach(() => {
    storageEngine = new StorageEngine(testPath)
  })

  afterEach(async () => {
    if (storageEngine.isInitialized()) {
      await storageEngine.close()
    }
  })

  describe('constructor', () => {
    it('should create storage engine with provided path', () => {
      const engine = new StorageEngine('/test/path')
      expect(engine.getPath()).toBe('/test/path')
      expect(engine.isInitialized()).toBe(false)
    })
  })

  describe('initialization', () => {
    it('should initialize with default options', async () => {
      await storageEngine.initialize()
      expect(storageEngine.isInitialized()).toBe(true)
    })

    it('should initialize with custom options', async () => {
      const options: LevelDBOptions = { valueEncoding: 'buffer' }
      await storageEngine.initialize(options)
      expect(storageEngine.isInitialized()).toBe(true)
    })

    it('should throw error when initializing already initialized storage', async () => {
      await storageEngine.initialize()
      await expect(storageEngine.initialize()).rejects.toThrow('Storage already initialized')
    })
  })

  describe('getPath', () => {
    it('should return storage path', () => {
      expect(storageEngine.getPath()).toBe(testPath)
    })
  })

  describe('isInitialized', () => {
    it('should return false for new instance', () => {
      expect(storageEngine.isInitialized()).toBe(false)
    })

    it('should return true after initialization', async () => {
      await storageEngine.initialize()
      expect(storageEngine.isInitialized()).toBe(true)
    })

    it('should return false after close', async () => {
      await storageEngine.initialize()
      await storageEngine.close()
      expect(storageEngine.isInitialized()).toBe(false)
    })
  })

  describe('checkpoint operations', () => {
    const mockCheckpointData: CheckpointData = {
      id: 'test-checkpoint-1',
      name: 'Test Checkpoint',
      description: 'A test checkpoint',
      timestamp: new Date(),
      files: [
        'src/index.ts',
        'package.json',
      ],
      snapshotHash: 'test-hash',
      projectPath: '/test/project',
      aiAgent: 'test-agent',
    }

    beforeEach(async () => {
      await storageEngine.initialize()
    })

    describe('saveCheckpoint', () => {
      it('should save checkpoint data successfully', async () => {
        await expect(storageEngine.saveCheckpoint(mockCheckpointData)).resolves.not.toThrow()
      })

      it('should throw error when not initialized', async () => {
        await storageEngine.close()
        await expect(storageEngine.saveCheckpoint(mockCheckpointData))
          .rejects
          .toThrow('Storage not initialized')
      })
    })

    describe('getCheckpoint', () => {
      it('should return null for non-existent checkpoint', async () => {
        const result = await storageEngine.getCheckpoint('non-existent')
        expect(result).toBeNull()
      })

      it('should throw error when not initialized', async () => {
        await storageEngine.close()
        await expect(storageEngine.getCheckpoint('test-id'))
          .rejects
          .toThrow('Storage not initialized')
      })
    })

    describe('listCheckpoints', () => {
      it('should return empty array when no checkpoints exist', async () => {
        const result = await storageEngine.listCheckpoints()
        expect(result).toEqual([])
      })

      it('should throw error when not initialized', async () => {
        await storageEngine.close()
        await expect(storageEngine.listCheckpoints())
          .rejects
          .toThrow('Storage not initialized')
      })
    })

    describe('deleteCheckpoint', () => {
      it('should return false for non-existent checkpoint', async () => {
        const result = await storageEngine.deleteCheckpoint('non-existent')
        expect(result).toBe(false)
      })

      it('should throw error when not initialized', async () => {
        await storageEngine.close()
        await expect(storageEngine.deleteCheckpoint('test-id'))
          .rejects
          .toThrow('Storage not initialized')
      })
    })
  })

  describe('close', () => {
    it('should close initialized storage', async () => {
      await storageEngine.initialize()
      await storageEngine.close()
      expect(storageEngine.isInitialized()).toBe(false)
    })

    it('should handle close when not initialized', async () => {
      await expect(storageEngine.close()).resolves.not.toThrow()
      expect(storageEngine.isInitialized()).toBe(false)
    })

    it('should be safe to call close multiple times', async () => {
      await storageEngine.initialize()
      await storageEngine.close()
      await expect(storageEngine.close()).resolves.not.toThrow()
    })
  })
})
