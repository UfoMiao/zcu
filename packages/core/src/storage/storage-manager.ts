import type { Operation, OperationMetadata } from '../types/operation'
import type { StorageConfig, StorageMetrics } from '../types/storage'
import type { AIWorkspace, WorkspaceMetadata } from '../types/workspace'
import { LevelDBStore } from './leveldb-store'

export class StorageManager {
  private store: LevelDBStore
  private config: StorageConfig

  constructor(config: StorageConfig) {
    this.config = config
    this.store = new LevelDBStore(config)
  }

  async initialize(): Promise<void> {
    await this.store.initialize()
  }

  async close(): Promise<void> {
    await this.store.close()
  }

  // Workspace Management
  async createWorkspace(workspace: AIWorkspace): Promise<void> {
    const metadata: WorkspaceMetadata = {
      id: workspace.sessionId,
      aiAgent: workspace.aiAgent,
      projectPath: workspace.projectPath,
      state: workspace.workspaceState,
      operationCount: 0,
      conflictCount: 0,
    }

    await this.store.setWorkspaceMetadata(workspace.sessionId, metadata)
    await this.store.setWorkspaceActive(workspace.aiAgent, workspace.sessionId)
  }

  async getWorkspace(id: string): Promise<WorkspaceMetadata | null> {
    return await this.store.getWorkspaceMetadata(id)
  }

  async getActiveWorkspaceForAgent(aiId: string): Promise<string | null> {
    return await this.store.getActiveWorkspace(aiId)
  }

  // Operation Management
  async storeOperation(operation: Operation): Promise<void> {
    const metadata: OperationMetadata = {
      id: operation.id,
      type: operation.type,
      timestamp: operation.timestamp,
      size: JSON.stringify(operation).length,
      checksum: this.calculateChecksum(operation),
    }

    await this.store.setOperationMetadata(operation.id, metadata)
    await this.store.setLatestOperation(operation.aiAgent, operation.id)
  }

  async getOperation(id: string): Promise<OperationMetadata | null> {
    return await this.store.getOperationMetadata(id)
  }

  async getLatestOperationForAgent(aiId: string): Promise<string | null> {
    return await this.store.getLatestOperation(aiId)
  }

  // Statistics and Metrics
  async getMetrics(): Promise<StorageMetrics> {
    const dbSize = await this.store.getDbSize()

    return {
      dbSize,
      snapshotCount: 0, // To be implemented with shadow repository
      cacheHitRate: 0, // To be implemented with cache
      lastBackup: undefined,
    }
  }

  // Private utility methods
  private calculateChecksum(data: any): string {
    // Simple checksum implementation - in production use crypto.createHash
    const str = JSON.stringify(data)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }
}
