import type { UndoRedoConfig } from '../undo-redo/undo-redo-engine'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OperationTracker } from '../operations/operation-tracker'
import { ShadowRepositoryManager } from '../repository/shadow-repository-manager'
import { StorageManager } from '../storage/storage-manager'
import { UndoRedoEngine } from '../undo-redo/undo-redo-engine'

// Mock dependencies
vi.mock('../storage/storage-manager')
vi.mock('../repository/shadow-repository-manager')
vi.mock('../operations/operation-tracker')

describe('undoRedoEngine', () => {
  let engine: UndoRedoEngine
  let config: UndoRedoConfig
  let mockStorageManager: StorageManager
  let mockShadowRepository: ShadowRepositoryManager
  let mockOperationTracker: OperationTracker

  beforeEach(() => {
    config = {
      projectPath: '/test/project',
      aiAgent: 'test-agent',
      maxSnapshots: 20,
      maxOperationChain: 100,
      storageConfig: {
        dbPath: '/test/db',
        maxSize: 100 * 1024 * 1024,
        compression: true,
      },
      repositoryConfig: {
        projectPath: '/test/project',
        shadowPath: '/test/shadow',
        maxSnapshots: 20,
        enableCompression: true,
        excludePatterns: ['.git', 'node_modules'],
      },
    }

    // Create mocked instances
    mockStorageManager = {
      initialize: vi.fn(),
      close: vi.fn(),
      getMetrics: vi.fn().mockResolvedValue({
        dbSize: 1024,
        snapshotCount: 5,
        cacheHitRate: 0.8,
        lastBackup: new Date(),
      }),
    } as any

    mockShadowRepository = {
      initialize: vi.fn(),
      createSnapshot: vi.fn().mockResolvedValue({
        id: 'snapshot-123',
        timestamp: new Date(),
        operationId: 'op-123',
        projectPath: '/test/project',
        fileCount: 3,
        size: 1024,
        isIncremental: true,
      }),
      getSnapshotHistory: vi.fn().mockResolvedValue([]),
      getStats: vi.fn().mockResolvedValue({
        totalSnapshots: 5,
        totalSize: 5120,
        oldestSnapshot: new Date('2023-01-01'),
        newestSnapshot: new Date(),
        averageSize: 1024,
        compressionRatio: 0.7,
      }),
      restoreSnapshot: vi.fn().mockResolvedValue(undefined),
    } as any

    mockOperationTracker = {
      initialize: vi.fn(),
      recordOperation: vi.fn().mockResolvedValue({
        success: true,
        operationId: 'op-123',
        snapshotId: 'snapshot-123',
        rollbackAvailable: true,
      }),
      rollbackOperation: vi.fn().mockResolvedValue({
        success: true,
        operationId: 'rollback-op-123',
        snapshotId: 'rollback-snapshot-123',
        rollbackAvailable: false,
      }),
      getOperationChain: vi.fn().mockResolvedValue(null),
      getOperationHistory: vi.fn().mockResolvedValue([]),
    } as any

    // Inject mocks
    vi.mocked(StorageManager).mockImplementation(() => mockStorageManager)
    vi.mocked(ShadowRepositoryManager).mockImplementation(() => mockShadowRepository)
    vi.mocked(OperationTracker).mockImplementation(() => mockOperationTracker)

    engine = new UndoRedoEngine(config)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize all components', async () => {
      await engine.initialize()

      expect(mockStorageManager.initialize).toHaveBeenCalled()
      expect(mockShadowRepository.initialize).toHaveBeenCalled()
      expect(mockOperationTracker.initialize).toHaveBeenCalled()
    })

    it('should not reinitialize if already initialized', async () => {
      await engine.initialize()
      await engine.initialize() // Second call

      expect(mockStorageManager.initialize).toHaveBeenCalledTimes(1)
    })

    it('should close storage manager when closing', async () => {
      await engine.initialize()
      await engine.close()

      expect(mockStorageManager.close).toHaveBeenCalled()
    })
  })

  describe('operation recording', () => {
    beforeEach(async () => {
      await engine.initialize()
    })

    it('should record a new operation', async () => {
      const result = await engine.recordOperation('file_change', ['test.txt'], {
        description: 'Test file change',
      })

      expect(result.success).toBe(true)
      expect(result.operationId).toBe('op-123')
      expect(result.snapshotId).toBe('snapshot-123')

      expect(mockOperationTracker.recordOperation).toHaveBeenCalledWith({
        type: 'file_change',
        aiAgent: 'test-agent',
        projectPath: '/test/project',
        affectedFiles: ['test.txt'],
        description: 'Test file change',
        beforeState: undefined,
        afterState: undefined,
        reversible: true,
        parentOperationId: undefined,
      })
    })

    it('should record non-reversible operation', async () => {
      const result = await engine.recordOperation('metadata_change', [], {
        reversible: false,
        description: 'Non-reversible operation',
      })

      expect(result.success).toBe(true)
      expect(mockOperationTracker.recordOperation).toHaveBeenCalledWith(
        expect.objectContaining({ reversible: false }),
      )
    })
  })

  describe('undo functionality', () => {
    beforeEach(async () => {
      await engine.initialize()
    })

    it('should undo single operation', async () => {
      // Mock operation chain with one operation
      const mockChain = {
        workspaceId: 'test-agent',
        operations: [
          {
            id: 'op-1',
            type: 'file_change',
            reversible: true,
            affectedFiles: ['test.txt'],
          },
        ],
        currentIndex: 0,
        maxLength: 100,
        headOperationId: 'op-1',
        totalOperations: 1,
        createdAt: new Date(),
        lastModified: new Date(),
      }

      mockOperationTracker.getOperationChain.mockResolvedValue(mockChain)

      const result = await engine.undo()

      expect(result.success).toBe(true)
      expect(result.rollbackCount).toBe(1)
      expect(result.operationId).toBe('rollback-op-123')

      expect(mockOperationTracker.rollbackOperation).toHaveBeenCalledWith('op-1')
      expect(mockChain.currentIndex).toBe(-1) // Should move to previous position
    })

    it('should undo multiple operations', async () => {
      const mockChain = {
        workspaceId: 'test-agent',
        operations: [
          { id: 'op-1', type: 'file_change', reversible: true },
          { id: 'op-2', type: 'file_change', reversible: true },
          { id: 'op-3', type: 'file_change', reversible: true },
        ],
        currentIndex: 2,
        maxLength: 100,
        headOperationId: 'op-3',
        totalOperations: 3,
        createdAt: new Date(),
        lastModified: new Date(),
      }

      mockOperationTracker.getOperationChain.mockResolvedValue(mockChain)

      const result = await engine.undo(2)

      expect(result.success).toBe(true)
      expect(result.rollbackCount).toBe(2)
      expect(mockOperationTracker.rollbackOperation).toHaveBeenCalledTimes(2)
    })

    it('should skip non-reversible operations during undo', async () => {
      const mockChain = {
        workspaceId: 'test-agent',
        operations: [
          { id: 'op-1', type: 'file_change', reversible: true },
          { id: 'op-2', type: 'metadata_change', reversible: false },
        ],
        currentIndex: 1,
        maxLength: 100,
        headOperationId: 'op-2',
        totalOperations: 2,
        createdAt: new Date(),
        lastModified: new Date(),
      }

      mockOperationTracker.getOperationChain.mockResolvedValue(mockChain)

      const result = await engine.undo(2)

      expect(result.success).toBe(true)
      expect(result.rollbackCount).toBe(1) // Only one reversible operation
      expect(mockOperationTracker.rollbackOperation).toHaveBeenCalledWith('op-1')
      expect(mockChain.currentIndex).toBe(-1)
    })

    it('should handle empty operation chain', async () => {
      mockOperationTracker.getOperationChain.mockResolvedValue(null)

      const result = await engine.undo()

      expect(result.success).toBe(false)
      expect(result.rollbackCount).toBe(0)
      expect(result.error?.message).toContain('No operations to undo')
    })
  })

  describe('redo functionality', () => {
    beforeEach(async () => {
      await engine.initialize()
    })

    it('should redo single operation', async () => {
      const mockChain = {
        workspaceId: 'test-agent',
        operations: [
          {
            id: 'op-1',
            type: 'file_change',
            reversible: true,
            snapshotId: 'snapshot-1',
          },
          {
            id: 'op-2',
            type: 'file_change',
            reversible: true,
            snapshotId: 'snapshot-2',
          },
        ],
        currentIndex: 0, // Currently at first operation
        maxLength: 100,
        headOperationId: 'op-2',
        totalOperations: 2,
        createdAt: new Date(),
        lastModified: new Date(),
      }

      mockOperationTracker.getOperationChain.mockResolvedValue(mockChain)

      const result = await engine.redo()

      expect(result.success).toBe(true)
      expect(result.rollbackCount).toBe(1)
      expect(mockShadowRepository.restoreSnapshot).toHaveBeenCalledWith(
        'snapshot-2',
        expect.objectContaining({ createBackup: false }),
      )
      expect(mockChain.currentIndex).toBe(1)
    })

    it('should handle no operations to redo', async () => {
      const mockChain = {
        workspaceId: 'test-agent',
        operations: [{ id: 'op-1', type: 'file_change', reversible: true }],
        currentIndex: 0, // At the last operation
        maxLength: 100,
        headOperationId: 'op-1',
        totalOperations: 1,
        createdAt: new Date(),
        lastModified: new Date(),
      }

      mockOperationTracker.getOperationChain.mockResolvedValue(mockChain)

      const result = await engine.redo()

      expect(result.success).toBe(false)
      expect(result.rollbackCount).toBe(0)
      expect(result.error?.message).toContain('No operations to redo')
    })
  })

  describe('file-level rollback', () => {
    beforeEach(async () => {
      await engine.initialize()
    })

    it('should rollback specific file to snapshot', async () => {
      const result = await engine.rollbackFile('/test/file.txt', 'snapshot-123')

      expect(result.success).toBe(true)
      expect(result.rollbackCount).toBe(1)

      expect(mockShadowRepository.restoreSnapshot).toHaveBeenCalledWith(
        'snapshot-123',
        expect.objectContaining({
          includePatterns: ['/test/file.txt'],
          preserveTimestamps: true,
          createBackup: true,
        }),
      )

      expect(mockOperationTracker.recordOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'file_change',
          affectedFiles: ['/test/file.txt'],
          reversible: false,
        }),
      )
    })
  })

  describe('project-level rollback', () => {
    beforeEach(async () => {
      await engine.initialize()
    })

    it('should rollback entire project to snapshot', async () => {
      mockShadowRepository.getSnapshotHistory.mockResolvedValue([
        { id: 'snapshot-123', timestamp: new Date() },
      ])

      const result = await engine.rollbackProject('snapshot-123')

      expect(result.success).toBe(true)
      expect(result.rollbackCount).toBe(1)

      expect(mockShadowRepository.restoreSnapshot).toHaveBeenCalledWith(
        'snapshot-123',
        expect.objectContaining({
          targetPath: '/test/project',
          preserveTimestamps: true,
          createBackup: true,
        }),
      )

      expect(mockOperationTracker.recordOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'metadata_change',
          reversible: false,
        }),
      )
    })

    it('should handle non-existent snapshot', async () => {
      mockShadowRepository.getSnapshotHistory.mockResolvedValue([])

      const result = await engine.rollbackProject('non-existent')

      expect(result.success).toBe(false)
      expect(result.error?.message).toContain('not found')
    })
  })

  describe('snapshot management', () => {
    beforeEach(async () => {
      await engine.initialize()
    })

    it('should create manual snapshot', async () => {
      const snapshot = await engine.createSnapshot('Manual backup')

      expect(snapshot.id).toBe('snapshot-123')
      expect(mockShadowRepository.createSnapshot).toHaveBeenCalled()
      expect(mockOperationTracker.recordOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'Manual backup',
        }),
      )
    })

    it('should get snapshot history', async () => {
      const mockSnapshots = [
        { id: 'snapshot-1', timestamp: new Date() },
        { id: 'snapshot-2', timestamp: new Date() },
      ]
      mockShadowRepository.getSnapshotHistory.mockResolvedValue(mockSnapshots)

      const snapshots = await engine.getSnapshots(10)

      expect(snapshots).toEqual(mockSnapshots)
      expect(mockShadowRepository.getSnapshotHistory).toHaveBeenCalledWith(10)
    })

    it('should clean up old snapshots', async () => {
      mockShadowRepository.getStats.mockResolvedValue({
        totalSnapshots: 25, // Exceeds maxSnapshots (20)
        totalSize: 25600,
        oldestSnapshot: new Date('2023-01-01'),
        newestSnapshot: new Date(),
        averageSize: 1024,
        compressionRatio: 0.7,
      })

      const mockSnapshots = Array.from({ length: 25 }, (_, i) => ({
        id: `snapshot-${i}`,
        timestamp: new Date(),
      }))
      mockShadowRepository.getSnapshotHistory.mockResolvedValue(mockSnapshots)

      const deletedCount = await engine.cleanupOldSnapshots()

      expect(deletedCount).toBe(5) // Should delete 5 old snapshots
    })
  })

  describe('stats and queries', () => {
    beforeEach(async () => {
      await engine.initialize()
    })

    it('should get comprehensive stats', async () => {
      const mockChain = {
        totalOperations: 10,
        currentIndex: 5,
        operations: [
          { reversible: true },
          { reversible: false },
          { reversible: true },
          { reversible: true },
          { reversible: true },
          { reversible: true },
          { reversible: true },
          { reversible: false },
          { reversible: true },
        ],
      }

      mockOperationTracker.getOperationChain.mockResolvedValue(mockChain)

      const stats = await engine.getStats()

      expect(stats.totalOperations).toBe(10)
      expect(stats.currentPosition).toBe(5)
      expect(stats.undoableOperations).toBe(5) // First 6 operations, 5 are reversible
      expect(stats.redoableOperations).toBe(2) // Last 3 operations, 2 are reversible
      expect(stats.snapshotStats).toBeDefined()
      expect(stats.storageStats).toBeDefined()
    })

    it('should check if undo is possible', async () => {
      const mockChain = {
        currentIndex: 2,
        operations: [1, 2, 3],
      }
      mockOperationTracker.getOperationChain.mockResolvedValue(mockChain)

      const canUndo = await engine.canUndo()
      expect(canUndo).toBe(true)
    })

    it('should check if redo is possible', async () => {
      const mockChain = {
        currentIndex: 1,
        operations: [1, 2, 3], // 3 operations, currently at index 1
      }
      mockOperationTracker.getOperationChain.mockResolvedValue(mockChain)

      const canRedo = await engine.canRedo()
      expect(canRedo).toBe(true)
    })

    it('should get operation history', async () => {
      const mockHistory = [
        { id: 'op-1', type: 'file_change' },
        { id: 'op-2', type: 'metadata_change' },
      ]
      mockOperationTracker.getOperationHistory.mockResolvedValue(mockHistory)

      const history = await engine.getOperationHistory(25)

      expect(history).toEqual(mockHistory)
      expect(mockOperationTracker.getOperationHistory).toHaveBeenCalledWith('test-agent', 25)
    })
  })
})
