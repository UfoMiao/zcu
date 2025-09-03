import type { ShadowRepositoryManager } from '../repository/shadow-repository-manager'
import type { StorageManager } from '../storage/storage-manager'
import { Buffer } from 'node:buffer'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { OperationTracker } from '../operations/operation-tracker'

// Mock dependencies
vi.mock('../storage/storage-manager')
vi.mock('../repository/shadow-repository-manager')
vi.mock('fs/promises', () => ({
  stat: vi.fn().mockResolvedValue({
    size: 100,
    mtime: new Date('2023-01-01'),
  }),
  readFile: vi.fn().mockResolvedValue(Buffer.from('test content')),
}))

describe('operationTracker', () => {
  let tracker: OperationTracker
  let mockStorageManager: StorageManager
  let mockShadowRepository: ShadowRepositoryManager

  beforeEach(() => {
    // Create mock instances
    mockStorageManager = {
      storeOperation: vi.fn().mockResolvedValue(undefined),
      getOperation: vi.fn().mockResolvedValue(null),
      initialize: vi.fn(),
      close: vi.fn(),
    } as any

    mockShadowRepository = {
      createSnapshot: vi.fn().mockResolvedValue({
        id: 'snapshot-123',
        timestamp: new Date(),
        operationId: 'op-123',
        projectPath: '/test/path',
        commitHash: 'abc123',
        fileCount: 1,
        size: 100,
        isIncremental: true,
      }),
      restoreSnapshot: vi.fn().mockResolvedValue(undefined),
      initialize: vi.fn(),
    } as any

    tracker = new OperationTracker(mockStorageManager, mockShadowRepository)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('recordOperation', () => {
    it('should record a new operation successfully', async () => {
      const operationData = {
        type: 'file_change' as const,
        aiAgent: 'test-agent',
        projectPath: '/test/path',
        affectedFiles: ['test.txt'],
        description: 'Test operation',
      }

      const result = await tracker.recordOperation(operationData)

      expect(result.success).toBe(true)
      expect(result.operationId).toBeTruthy()
      expect(result.snapshotId).toBe('snapshot-123')
      expect(result.rollbackAvailable).toBe(true)

      expect(mockShadowRepository.createSnapshot).toHaveBeenCalledWith(
        expect.any(String),
      )
      expect(mockStorageManager.storeOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'file_change',
          aiAgent: 'test-agent',
          projectPath: '/test/path',
          affectedFiles: ['test.txt'],
          reversible: true,
        }),
      )
    })

    it('should handle operation recording errors gracefully', async () => {
      mockShadowRepository.createSnapshot.mockRejectedValue(new Error('Snapshot failed'))

      const operationData = {
        type: 'file_change' as const,
        aiAgent: 'test-agent',
        projectPath: '/test/path',
        affectedFiles: ['test.txt'],
      }

      const result = await tracker.recordOperation(operationData)

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.rollbackAvailable).toBe(false)
    })

    it('should create non-reversible operations when specified', async () => {
      const operationData = {
        type: 'metadata_change' as const,
        aiAgent: 'test-agent',
        projectPath: '/test/path',
        affectedFiles: [],
        reversible: false,
      }

      const result = await tracker.recordOperation(operationData)

      expect(result.success).toBe(true)
      expect(result.rollbackAvailable).toBe(false)

      const storeCall = mockStorageManager.storeOperation.mock.calls[0][0]
      expect(storeCall.reversible).toBe(false)
      expect(storeCall.snapshotId).toBeUndefined()
      expect(storeCall.rollbackData).toBeUndefined()
    })

    it('should handle parent-child operation linking', async () => {
      const parentOpData = {
        type: 'batch_operation' as const,
        aiAgent: 'test-agent',
        projectPath: '/test/path',
        affectedFiles: ['parent.txt'],
      }

      const parentResult = await tracker.recordOperation(parentOpData)

      const childOpData = {
        type: 'file_change' as const,
        aiAgent: 'test-agent',
        projectPath: '/test/path',
        affectedFiles: ['child.txt'],
        parentOperationId: parentResult.operationId,
      }

      const childResult = await tracker.recordOperation(childOpData)

      expect(childResult.success).toBe(true)
      expect(mockStorageManager.storeOperation).toHaveBeenCalledTimes(2)
    })
  })

  describe('rollbackOperation', () => {
    beforeEach(() => {
      // Mock getOperation to return operation metadata
      mockStorageManager.getOperation.mockResolvedValue({
        id: 'op-123',
        type: 'file_change',
        timestamp: new Date(),
        size: 100,
        checksum: 'abc123',
      })

      // Mock getFullOperation method (private, but we'll assume it works)
      vi.spyOn(tracker as any, 'getFullOperation').mockResolvedValue({
        id: 'op-123',
        type: 'file_change',
        timestamp: new Date(),
        aiAgent: 'test-agent',
        projectPath: '/test/path',
        affectedFiles: ['test.txt'],
        reversible: true,
        childOperationIds: [],
        snapshotId: 'snapshot-123',
        rollbackData: {
          snapshotId: 'snapshot-123',
          fileStates: [],
          dependentOperations: [],
        },
      })
    })

    it('should rollback an operation successfully', async () => {
      const result = await tracker.rollbackOperation('op-123')

      expect(result.success).toBe(true)
      expect(result.operationId).toBeTruthy()
      expect(result.rollbackAvailable).toBe(false) // 回滚操作本身不可回滚

      expect(mockShadowRepository.restoreSnapshot).toHaveBeenCalledWith(
        'snapshot-123',
        expect.objectContaining({
          preserveTimestamps: true,
          createBackup: true,
        }),
      )

      // 应该记录一个新的回滚操作
      expect(mockStorageManager.storeOperation).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'metadata_change',
          description: 'Rollback of operation op-123',
          parentOperationId: 'op-123',
          reversible: false,
        }),
      )
    })

    it('should handle rollback of non-existent operation', async () => {
      mockStorageManager.getOperation.mockResolvedValue(null)

      const result = await tracker.rollbackOperation('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toContain('not found')
    })

    it('should handle rollback of non-rollbackable operation', async () => {
      vi.spyOn(tracker as any, 'getFullOperation').mockResolvedValue({
        id: 'op-123',
        type: 'file_change',
        reversible: false, // 不可回滚
        rollbackData: undefined,
      })

      const result = await tracker.rollbackOperation('op-123')

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toContain('not rollbackable')
    })
  })

  describe('operation chain management', () => {
    it('should create and manage operation chains', async () => {
      const operations = []

      // 记录多个操作
      for (let i = 0; i < 3; i++) {
        const result = await tracker.recordOperation({
          type: 'file_change',
          aiAgent: 'test-agent',
          projectPath: '/test/path',
          affectedFiles: [`file${i}.txt`],
          description: `Operation ${i + 1}`,
        })
        operations.push(result)
      }

      // 获取操作链
      const chain = await tracker.getOperationChain('test-agent')

      expect(chain).toBeTruthy()
      expect(chain!.operations).toHaveLength(3)
      expect(chain!.currentIndex).toBe(2)
      expect(chain!.totalOperations).toBe(3)
      expect(chain!.workspaceId).toBe('test-agent')
    })

    it('should traverse operation chain backward', async () => {
      // 先记录几个操作
      for (let i = 0; i < 5; i++) {
        await tracker.recordOperation({
          type: 'file_change',
          aiAgent: 'test-agent',
          projectPath: '/test/path',
          affectedFiles: [`file${i}.txt`],
        })
      }

      const operations = await tracker.traverseChain('test-agent', {
        direction: 'backward',
        maxDepth: 3,
      })

      expect(operations).toHaveLength(3)
      // 最新的操作应该在前面
      expect(operations[0].affectedFiles).toContain('file4.txt')
      expect(operations[1].affectedFiles).toContain('file3.txt')
      expect(operations[2].affectedFiles).toContain('file2.txt')
    })

    it('should traverse operation chain forward', async () => {
      for (let i = 0; i < 3; i++) {
        await tracker.recordOperation({
          type: 'file_change',
          aiAgent: 'test-agent',
          projectPath: '/test/path',
          affectedFiles: [`file${i}.txt`],
        })
      }

      const operations = await tracker.traverseChain('test-agent', {
        direction: 'forward',
        maxDepth: 2,
      })

      expect(operations).toHaveLength(2)
      expect(operations[0].affectedFiles).toContain('file0.txt')
      expect(operations[1].affectedFiles).toContain('file1.txt')
    })

    it('should filter operations by type during traversal', async () => {
      await tracker.recordOperation({
        type: 'file_change',
        aiAgent: 'test-agent',
        projectPath: '/test/path',
        affectedFiles: ['file.txt'],
      })

      await tracker.recordOperation({
        type: 'metadata_change',
        aiAgent: 'test-agent',
        projectPath: '/test/path',
        affectedFiles: ['metadata.json'],
      })

      await tracker.recordOperation({
        type: 'file_change',
        aiAgent: 'test-agent',
        projectPath: '/test/path',
        affectedFiles: ['another.txt'],
      })

      const fileOperations = await tracker.traverseChain('test-agent', {
        direction: 'backward',
        filterTypes: ['file_change'],
      })

      expect(fileOperations).toHaveLength(2)
      expect(fileOperations.every((op) => op.type === 'file_change')).toBe(true)
    })

    it('should exclude non-reversible operations when specified', async () => {
      await tracker.recordOperation({
        type: 'file_change',
        aiAgent: 'test-agent',
        projectPath: '/test/path',
        affectedFiles: ['file.txt'],
        reversible: true,
      })

      await tracker.recordOperation({
        type: 'metadata_change',
        aiAgent: 'test-agent',
        projectPath: '/test/path',
        affectedFiles: ['system.log'],
        reversible: false,
      })

      const reversibleOnly = await tracker.traverseChain('test-agent', {
        direction: 'backward',
        includeNonReversible: false,
      })

      expect(reversibleOnly).toHaveLength(1)
      expect(reversibleOnly[0].reversible).toBe(true)

      const allOperations = await tracker.traverseChain('test-agent', {
        direction: 'backward',
        includeNonReversible: true,
      })

      expect(allOperations).toHaveLength(2)
    })
  })

  describe('operation history', () => {
    it('should return operation history with default limit', async () => {
      // 记录超过默认限制的操作
      for (let i = 0; i < 60; i++) {
        await tracker.recordOperation({
          type: 'file_change',
          aiAgent: 'test-agent',
          projectPath: '/test/path',
          affectedFiles: [`file${i}.txt`],
        })
      }

      const history = await tracker.getOperationHistory('test-agent')

      expect(history).toHaveLength(50) // 默认限制
      expect(history[0].affectedFiles).toContain('file59.txt') // 最新的在前
    })

    it('should return operation history with custom limit', async () => {
      for (let i = 0; i < 10; i++) {
        await tracker.recordOperation({
          type: 'file_change',
          aiAgent: 'test-agent',
          projectPath: '/test/path',
          affectedFiles: [`file${i}.txt`],
        })
      }

      const history = await tracker.getOperationHistory('test-agent', 5)

      expect(history).toHaveLength(5)
    })

    it('should handle empty operation history', async () => {
      const history = await tracker.getOperationHistory('non-existent-agent')

      expect(history).toHaveLength(0)
    })
  })
})
