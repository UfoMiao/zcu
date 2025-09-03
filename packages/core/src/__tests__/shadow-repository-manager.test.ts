import type { RepositoryConfig } from '../types/repository'
import { Buffer } from 'node:buffer'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ShadowRepositoryManager } from '../repository/shadow-repository-manager'

// Mock simple-git
vi.mock('simple-git', () => {
  const mockGit = {
    init: vi.fn().mockResolvedValue(undefined),
    checkout: vi.fn().mockResolvedValue(undefined),
    add: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue({ commit: 'abc123' }),
    status: vi.fn().mockResolvedValue({ files: [] }),
    log: vi.fn().mockResolvedValue({
      all: [],
      latest: null,
    }),
  }

  return {
    simpleGit: vi.fn(() => mockGit),
    __mockGit: mockGit,
  }
})

// Mock file system operations
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs')
  return {
    ...actual,
    promises: {
      access: vi.fn(),
      mkdir: vi.fn(),
      writeFile: vi.fn(),
      readdir: vi.fn(),
      stat: vi.fn(),
      readFile: vi.fn(),
      copyFile: vi.fn(),
      unlink: vi.fn(),
    },
  }
})

describe('shadowRepositoryManager', () => {
  let manager: ShadowRepositoryManager
  let config: RepositoryConfig
  let tempDir: string

  beforeEach(() => {
    tempDir = '/tmp/zcu-test'
    config = {
      projectPath: join(tempDir, 'project'),
      shadowPath: join(tempDir, 'shadow'),
      maxSnapshots: 20,
      enableCompression: true,
      excludePatterns: ['.git', 'node_modules', '.zcu'],
    }

    manager = new ShadowRepositoryManager(config)

    // Setup mocks
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(fs.mkdir).mockResolvedValue(undefined)
    vi.mocked(fs.writeFile).mockResolvedValue(undefined)
    vi.mocked(fs.readdir).mockResolvedValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('initialize', () => {
    it('should create shadow directory and initialize git repository', async () => {
      const { __mockGit } = await import('simple-git')

      // Mock git status to throw error (no repo exists)
      __mockGit.status.mockRejectedValueOnce(new Error('Not a git repository'))

      await manager.initialize()

      expect(fs.mkdir).toHaveBeenCalledWith(config.shadowPath, { recursive: true })
      expect(__mockGit.init).toHaveBeenCalled()
      expect(__mockGit.checkout).toHaveBeenCalledWith(['-b', 'main'])
    })

    it('should not reinitialize if already initialized', async () => {
      const { __mockGit } = await import('simple-git')

      // First initialization
      __mockGit.status.mockRejectedValueOnce(new Error('Not a git repository'))
      await manager.initialize()

      vi.clearAllMocks()

      // Second initialization should not call git methods
      await manager.initialize()
      expect(__mockGit.init).not.toHaveBeenCalled()
    })
  })

  describe('createSnapshot', () => {
    beforeEach(async () => {
      const { __mockGit } = await import('simple-git')
      __mockGit.status.mockRejectedValueOnce(new Error('Not a git repository'))

      // Mock file scanning
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'test.txt', isDirectory: () => false, isFile: () => true } as any,
      ])
      vi.mocked(fs.stat).mockResolvedValue({
        size: 100,
        mtime: new Date(),
        isDirectory: () => false,
        isFile: () => true,
      } as any)
      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('test content'))

      await manager.initialize()
    })

    it('should create a snapshot with metadata', async () => {
      const { __mockGit } = await import('simple-git')
      const operationId = 'op-123'

      const metadata = await manager.createSnapshot(operationId)

      expect(metadata).toMatchObject({
        operationId,
        projectPath: config.projectPath,
        commitHash: 'abc123',
        isIncremental: true,
      })
      expect(metadata.id).toBeTruthy()
      expect(metadata.timestamp).toBeInstanceOf(Date)
      expect(__mockGit.add).toHaveBeenCalledWith('.')
      expect(__mockGit.commit).toHaveBeenCalled()
    })
  })

  describe('getSnapshotHistory', () => {
    it('should return snapshot history from git log', async () => {
      const { __mockGit } = await import('simple-git')

      const mockCommits = [
        {
          hash: 'abc123',
          message: 'Snapshot snap1 for operation op1',
          date: '2023-01-01',
          refs: [],
        },
        {
          hash: 'def456',
          message: 'Snapshot snap2 for operation op2',
          date: '2023-01-02',
          refs: [],
        },
      ]

      __mockGit.log.mockResolvedValue({ all: mockCommits, latest: mockCommits[0] })
      __mockGit.status.mockResolvedValue({ files: [] })

      await manager.initialize()
      const history = await manager.getSnapshotHistory()

      expect(history).toHaveLength(2)
      expect(history[0]).toMatchObject({
        id: 'snap1',
        operationId: 'op1',
        commitHash: 'abc123',
      })
      expect(history[1]).toMatchObject({
        id: 'snap2',
        operationId: 'op2',
        commitHash: 'def456',
      })
    })

    it('should handle empty git history', async () => {
      const { __mockGit } = await import('simple-git')

      __mockGit.log.mockResolvedValue({ all: [], latest: null })
      __mockGit.status.mockResolvedValue({ files: [] })

      await manager.initialize()
      const history = await manager.getSnapshotHistory()

      expect(history).toHaveLength(0)
    })
  })

  describe('getStats', () => {
    it('should return correct statistics', async () => {
      const { __mockGit } = await import('simple-git')

      __mockGit.status.mockResolvedValue({ files: [] })
      __mockGit.log.mockResolvedValue({ all: [], latest: null })

      await manager.initialize()
      const stats = await manager.getStats()

      expect(stats).toMatchObject({
        totalSnapshots: 0,
        totalSize: 0,
        averageSize: 0,
        compressionRatio: 1.0, // when no snapshots, ratio should be 1.0
      })
    })

    it('should calculate stats with snapshots', async () => {
      const { __mockGit } = await import('simple-git')

      const mockCommits = [
        {
          hash: 'abc123',
          message: 'Snapshot snap1 for operation op1',
          date: '2023-01-01',
          refs: [],
        },
      ]

      __mockGit.status.mockResolvedValue({ files: [] })
      __mockGit.log.mockResolvedValue({ all: mockCommits, latest: mockCommits[0] })

      await manager.initialize()

      // Mock getSnapshotHistory to return snapshots with size
      vi.spyOn(manager, 'getSnapshotHistory').mockResolvedValue([
        {
          id: 'snap1',
          timestamp: new Date('2023-01-01'),
          operationId: 'op1',
          projectPath: config.projectPath,
          commitHash: 'abc123',
          fileCount: 1,
          size: 100,
          isIncremental: true,
        },
      ])

      const stats = await manager.getStats()

      expect(stats.totalSnapshots).toBe(1)
      expect(stats.totalSize).toBe(100)
      expect(stats.averageSize).toBe(100)
    })
  })

  describe('restoreSnapshot', () => {
    it('should restore snapshot to target path', async () => {
      const { __mockGit } = await import('simple-git')

      __mockGit.status.mockResolvedValue({ files: [] })
      await manager.initialize()

      const snapshotId = 'snap123'
      await manager.restoreSnapshot(snapshotId)

      expect(__mockGit.checkout).toHaveBeenCalledWith(snapshotId)
      expect(__mockGit.checkout).toHaveBeenCalledWith('main')
    })
  })

  describe('file operations', () => {
    it('should exclude files based on patterns', async () => {
      // Test the private shouldExclude method by testing its behavior through public methods
      const { __mockGit } = await import('simple-git')

      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'test.txt', isDirectory: () => false, isFile: () => true },
        { name: 'node_modules', isDirectory: () => true, isFile: () => false },
        { name: '.git', isDirectory: () => true, isFile: () => false },
        { name: 'test.log', isDirectory: () => false, isFile: () => true },
      ] as any)

      vi.mocked(fs.stat).mockResolvedValue({
        size: 100,
        mtime: new Date(),
      } as any)
      vi.mocked(fs.readFile).mockResolvedValue(Buffer.from('content'))

      __mockGit.status.mockRejectedValueOnce(new Error('Not a git repository'))
      await manager.initialize()

      // This will internally call scanProjectFiles which uses shouldExclude
      await manager.createSnapshot('test-op')

      // Verify that excluded files are not processed
      // We can't directly test the private method, but we can verify the behavior
      expect(fs.copyFile).not.toHaveBeenCalledWith(
        expect.stringContaining('node_modules'),
        expect.any(String),
      )
    })
  })
})
