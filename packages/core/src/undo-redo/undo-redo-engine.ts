import type {
  Operation,
  OperationResult,
} from '../types/operation'
import type { RepositoryConfig, SnapshotMetadata, SnapshotStats } from '../types/repository'
import type { StorageConfig, StorageMetrics } from '../types/storage'
import { nanoid } from 'nanoid'
import { OperationTracker } from '../operations/operation-tracker'
import { ShadowRepositoryManager } from '../repository/shadow-repository-manager'
import { StorageManager } from '../storage/storage-manager'

export interface UndoRedoConfig {
  projectPath: string
  aiAgent: string
  maxSnapshots: number
  maxOperationChain: number
  storageConfig: StorageConfig
  repositoryConfig: RepositoryConfig
}

export interface UndoRedoStats {
  totalOperations: number
  undoableOperations: number
  redoableOperations: number
  currentPosition: number
  snapshotStats: SnapshotStats
  storageStats: StorageMetrics
}

export interface UndoRedoResult {
  success: boolean
  operationId?: string
  snapshotId?: string
  rollbackCount: number
  error?: Error
}

export class UndoRedoEngine {
  private storageManager: StorageManager
  private shadowRepository: ShadowRepositoryManager
  private operationTracker: OperationTracker
  private config: UndoRedoConfig
  private initialized = false

  constructor(config: UndoRedoConfig) {
    this.config = config
    this.storageManager = new StorageManager(config.storageConfig)
    this.shadowRepository = new ShadowRepositoryManager(config.repositoryConfig)
    this.operationTracker = new OperationTracker(this.storageManager, this.shadowRepository)
  }

  async initialize(): Promise<void> {
    if (this.initialized)
      return

    await this.storageManager.initialize()
    await this.shadowRepository.initialize()
    await this.operationTracker.initialize()

    this.initialized = true
  }

  async close(): Promise<void> {
    await this.storageManager.close()
    this.initialized = false
  }

  // 核心操作接口

  async recordOperation(
    type: Operation['type'],
    affectedFiles: string[],
    options: {
      description?: string
      beforeState?: any
      afterState?: any
      reversible?: boolean
      parentOperationId?: string
    } = {},
  ): Promise<OperationResult> {
    if (!this.initialized) {
      await this.initialize()
    }

    return await this.operationTracker.recordOperation({
      type,
      aiAgent: this.config.aiAgent,
      projectPath: this.config.projectPath,
      affectedFiles,
      description: options.description,
      beforeState: options.beforeState,
      afterState: options.afterState,
      reversible: options.reversible ?? true,
      parentOperationId: options.parentOperationId,
    })
  }

  // Undo操作 - 撤销最近的操作
  async undo(steps = 1): Promise<UndoRedoResult> {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      const chain = await this.operationTracker.getOperationChain(this.config.aiAgent)
      if (!chain || chain.currentIndex < 0) {
        return {
          success: false,
          rollbackCount: 0,
          error: new Error('No operations to undo'),
        }
      }

      let rollbackCount = 0
      let lastOperationId: string | undefined
      let lastSnapshotId: string | undefined

      // 执行指定步数的撤销
      for (let i = 0; i < steps && chain.currentIndex >= 0; i++) {
        const operation = chain.operations[chain.currentIndex]

        if (operation.reversible) {
          const result = await this.operationTracker.rollbackOperation(operation.id)
          if (result.success) {
            rollbackCount++
            lastOperationId = result.operationId
            lastSnapshotId = result.snapshotId
            chain.currentIndex-- // 移动到上一个操作
          } else {
            // 如果回滚失败，停止继续撤销
            break
          }
        } else {
          // 跳过不可逆操作，但移动索引
          chain.currentIndex--
        }
      }

      return {
        success: rollbackCount > 0,
        operationId: lastOperationId,
        snapshotId: lastSnapshotId,
        rollbackCount,
      }
    } catch (error) {
      return {
        success: false,
        rollbackCount: 0,
        error: error as Error,
      }
    }
  }

  // Redo操作 - 重做被撤销的操作
  async redo(steps = 1): Promise<UndoRedoResult> {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      const chain = await this.operationTracker.getOperationChain(this.config.aiAgent)
      if (!chain || chain.currentIndex >= chain.operations.length - 1) {
        return {
          success: false,
          rollbackCount: 0,
          error: new Error('No operations to redo'),
        }
      }

      let redoCount = 0
      let lastOperationId: string | undefined
      let lastSnapshotId: string | undefined

      // 执行指定步数的重做
      for (let i = 0; i < steps && chain.currentIndex < chain.operations.length - 1; i++) {
        const nextOperation = chain.operations[chain.currentIndex + 1]

        if (nextOperation.reversible) {
          // 重新应用操作（简化实现，实际需要更复杂的逻辑）
          const result = await this.reapplyOperation(nextOperation)
          if (result.success) {
            redoCount++
            lastOperationId = result.operationId
            lastSnapshotId = result.snapshotId
            chain.currentIndex++ // 移动到下一个操作
          } else {
            break
          }
        } else {
          chain.currentIndex++
        }
      }

      return {
        success: redoCount > 0,
        operationId: lastOperationId,
        snapshotId: lastSnapshotId,
        rollbackCount: redoCount,
      }
    } catch (error) {
      return {
        success: false,
        rollbackCount: 0,
        error: error as Error,
      }
    }
  }

  // 文件级回滚 - 回滚特定文件到指定快照
  async rollbackFile(filePath: string, snapshotId: string): Promise<UndoRedoResult> {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      // 使用ShadowRepository恢复特定文件
      await this.shadowRepository.restoreSnapshot(snapshotId, {
        targetPath: this.config.projectPath,
        includePatterns: [filePath],
        preserveTimestamps: true,
        createBackup: true,
      })

      // 记录文件级回滚操作
      const result = await this.recordOperation('file_change', [filePath], {
        description: `Rollback file ${filePath} to snapshot ${snapshotId}`,
        reversible: false, // 文件级回滚操作不可逆
      })

      return {
        success: result.success,
        operationId: result.operationId,
        snapshotId: result.snapshotId,
        rollbackCount: 1,
        error: result.error,
      }
    } catch (error) {
      return {
        success: false,
        rollbackCount: 0,
        error: error as Error,
      }
    }
  }

  // 项目级回滚 - 回滚整个项目到指定快照
  async rollbackProject(snapshotId: string): Promise<UndoRedoResult> {
    if (!this.initialized) {
      await this.initialize()
    }

    try {
      // 获取快照信息
      const snapshots = await this.shadowRepository.getSnapshotHistory(100)
      const targetSnapshot = snapshots.find((s) => s.id === snapshotId)

      if (!targetSnapshot) {
        throw new Error(`Snapshot ${snapshotId} not found`)
      }

      // 恢复整个项目
      await this.shadowRepository.restoreSnapshot(snapshotId, {
        targetPath: this.config.projectPath,
        preserveTimestamps: true,
        createBackup: true,
      })

      // 记录项目级回滚操作
      const result = await this.recordOperation('metadata_change', [], {
        description: `Rollback project to snapshot ${snapshotId}`,
        reversible: false, // 项目级回滚操作不可逆
      })

      return {
        success: result.success,
        operationId: result.operationId,
        snapshotId: result.snapshotId,
        rollbackCount: 1,
        error: result.error,
      }
    } catch (error) {
      return {
        success: false,
        rollbackCount: 0,
        error: error as Error,
      }
    }
  }

  // 快照点管理

  async createSnapshot(description?: string): Promise<SnapshotMetadata> {
    if (!this.initialized) {
      await this.initialize()
    }

    const operationId = nanoid(12)
    const snapshot = await this.shadowRepository.createSnapshot(operationId)

    // 记录快照创建操作
    await this.recordOperation('metadata_change', [], {
      description: description || `Manual snapshot: ${snapshot.id}`,
      reversible: false,
    })

    return snapshot
  }

  async getSnapshots(limit = 20): Promise<SnapshotMetadata[]> {
    if (!this.initialized) {
      await this.initialize()
    }

    return await this.shadowRepository.getSnapshotHistory(limit)
  }

  async deleteSnapshot(_snapshotId: string): Promise<boolean> {
    // 实际实现中需要从存储中删除快照
    // 这里简化处理
    return true
  }

  async cleanupOldSnapshots(): Promise<number> {
    const stats = await this.shadowRepository.getStats()
    if (stats.totalSnapshots <= this.config.maxSnapshots) {
      return 0
    }

    // 删除超出限制的旧快照
    const snapshots = await this.getSnapshots(1000)
    const toDelete = snapshots.slice(this.config.maxSnapshots)

    let deletedCount = 0
    for (const snapshot of toDelete) {
      const success = await this.deleteSnapshot(snapshot.id)
      if (success)
        deletedCount++
    }

    return deletedCount
  }

  // 查询和统计

  async getOperationHistory(limit = 50): Promise<Operation[]> {
    if (!this.initialized) {
      await this.initialize()
    }

    return await this.operationTracker.getOperationHistory(this.config.aiAgent, limit)
  }

  async getStats(): Promise<UndoRedoStats> {
    if (!this.initialized) {
      await this.initialize()
    }

    const chain = await this.operationTracker.getOperationChain(this.config.aiAgent)
    const snapshotStats = await this.shadowRepository.getStats()
    const storageStats = await this.storageManager.getMetrics()

    const undoableOps = chain
      ? chain.operations.slice(0, chain.currentIndex + 1).filter((op) => op.reversible).length
      : 0
    const redoableOps = chain
      ? chain.operations.slice(chain.currentIndex + 1).filter((op) => op.reversible).length
      : 0

    return {
      totalOperations: chain?.totalOperations || 0,
      undoableOperations: undoableOps,
      redoableOperations: redoableOps,
      currentPosition: chain?.currentIndex || -1,
      snapshotStats,
      storageStats,
    }
  }

  async canUndo(): Promise<boolean> {
    const chain = await this.operationTracker.getOperationChain(this.config.aiAgent)
    return chain !== null && chain.currentIndex >= 0
  }

  async canRedo(): Promise<boolean> {
    const chain = await this.operationTracker.getOperationChain(this.config.aiAgent)
    return chain !== null && chain.currentIndex < chain.operations.length - 1
  }

  // 私有辅助方法

  private async reapplyOperation(operation: Operation): Promise<OperationResult> {
    // 重新应用操作的简化实现
    // 实际实现中需要根据操作类型执行相应的文件系统操作

    if (!operation.snapshotId) {
      return {
        success: false,
        operationId: operation.id,
        error: new Error('No snapshot available for redo'),
        rollbackAvailable: false,
      }
    }

    try {
      // 恢复到操作后的状态
      await this.shadowRepository.restoreSnapshot(operation.snapshotId, {
        targetPath: this.config.projectPath,
        preserveTimestamps: true,
        createBackup: false, // redo时不需要备份
      })

      return {
        success: true,
        operationId: operation.id,
        snapshotId: operation.snapshotId,
        rollbackAvailable: true,
      }
    } catch (error) {
      return {
        success: false,
        operationId: operation.id,
        error: error as Error,
        rollbackAvailable: false,
      }
    }
  }
}
