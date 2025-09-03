import type { Operation } from '../types/operation'
import type { StorageConfig } from '../types/storage'
import type { AIWorkspace, WorkspaceState } from '../types/workspace'
import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LevelDBStore } from '../storage/leveldb-store'
import { StorageManager } from '../storage/storage-manager'

const testDbPath = path.join(process.cwd(), 'test-db')
const testShadowPath = path.join(process.cwd(), 'test-shadow')

const testConfig: StorageConfig = {
  dbPath: testDbPath,
  shadowPath: testShadowPath,
  maxSnapshots: 20,
}

describe('levelDBStore', () => {
  let store: LevelDBStore

  beforeEach(async () => {
    store = new LevelDBStore(testConfig)
    await store.initialize()
  })

  afterEach(async () => {
    await store.close()
    if (existsSync(testDbPath)) {
      await rm(testDbPath, { recursive: true, force: true })
    }
  })

  it('should initialize and close properly', async () => {
    expect(store).toBeDefined()
  })

  it('should handle workspace operations', async () => {
    const aiId = 'test-ai-1'
    const workspaceId = 'workspace-123'

    await store.setWorkspaceActive(aiId, workspaceId)
    const result = await store.getActiveWorkspace(aiId)

    expect(result).toBe(workspaceId)
  })

  it('should handle operation metadata', async () => {
    const operationId = 'op-123'
    const timestamp = new Date()
    const metadata = {
      id: operationId,
      type: 'file_change',
      timestamp,
      size: 1024,
    }

    await store.setOperationMetadata(operationId, metadata)
    const result = await store.getOperationMetadata(operationId)

    expect(result.id).toBe(metadata.id)
    expect(result.type).toBe(metadata.type)
    expect(result.size).toBe(metadata.size)
    expect(new Date(result.timestamp).getTime()).toBe(timestamp.getTime())
  })

  it('should return null for non-existent keys', async () => {
    const result = await store.getActiveWorkspace('non-existent')
    expect(result).toBeFalsy() // null or undefined are both acceptable
  })
})

describe('storageManager', () => {
  let manager: StorageManager

  beforeEach(async () => {
    manager = new StorageManager(testConfig)
    await manager.initialize()
  })

  afterEach(async () => {
    await manager.close()
    if (existsSync(testDbPath)) {
      await rm(testDbPath, { recursive: true, force: true })
    }
  })

  it('should create and retrieve workspaces', async () => {
    const workspace: AIWorkspace = {
      sessionId: 'session-123',
      aiAgent: 'claude-1',
      projectPath: '/test/project',
      workspaceState: 'active' as WorkspaceState,
      operationChain: [],
      conflictDetection: {
        detectConflict: () => false,
        resolveConflict: async () => {},
        getActiveConflicts: () => [],
      },
      createdAt: new Date(),
      lastActiveAt: new Date(),
    }

    await manager.createWorkspace(workspace)
    const retrieved = await manager.getWorkspace(workspace.sessionId)

    expect(retrieved).toBeDefined()
    expect(retrieved!.id).toBe(workspace.sessionId)
    expect(retrieved!.aiAgent).toBe(workspace.aiAgent)
  })

  it('should store and retrieve operations', async () => {
    const operation: Operation = {
      id: 'op-456',
      type: 'file_change',
      timestamp: new Date(),
      aiAgent: 'claude-1',
      projectPath: '/test/project',
      affectedFiles: ['test'],
      reversible: true,
    }

    await manager.storeOperation(operation)
    const retrieved = await manager.getOperation(operation.id)

    expect(retrieved).toBeDefined()
    expect(retrieved!.id).toBe(operation.id)
    expect(retrieved!.type).toBe(operation.type)
  })

  it('should get storage metrics', async () => {
    const metrics = await manager.getMetrics()

    expect(metrics).toBeDefined()
    expect(typeof metrics.dbSize).toBe('number')
    expect(typeof metrics.snapshotCount).toBe('number')
  })
})
