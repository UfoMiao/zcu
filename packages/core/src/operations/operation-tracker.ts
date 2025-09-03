import type { Buffer } from 'node:buffer'
import type { ShadowRepositoryManager } from '../repository/shadow-repository-manager'
import type { StorageManager } from '../storage/storage-manager'
import type {
  ChainTraversalOptions,
  FileState,
  Operation,
  OperationChain,
  OperationResult,
  RollbackData,
} from '../types/operation'
import { nanoid } from 'nanoid'

export class OperationTracker {
  private storageManager: StorageManager
  private shadowRepository: ShadowRepositoryManager
  private activeChains: Map<string, OperationChain> = new Map()

  constructor(
    storageManager: StorageManager,
    shadowRepository: ShadowRepositoryManager,
  ) {
    this.storageManager = storageManager
    this.shadowRepository = shadowRepository
  }

  async initialize(): Promise<void> {
    // 初始化时加载活跃的操作链
    await this.loadActiveChains()
  }

  async recordOperation(operation: Partial<Operation>): Promise<OperationResult> {
    try {
      const fullOperation: Operation = {
        id: operation.id || nanoid(12),
        type: operation.type || 'file_change',
        timestamp: new Date(),
        aiAgent: operation.aiAgent!,
        projectPath: operation.projectPath!,
        beforeState: operation.beforeState,
        afterState: operation.afterState,
        affectedFiles: operation.affectedFiles || [],
        reversible: operation.reversible ?? true,
        parentOperationId: operation.parentOperationId,
        childOperationIds: [],
        description: operation.description || `${operation.type} operation`,
      }

      // 只为可逆操作创建快照和回滚数据
      if (fullOperation.reversible) {
        const snapshot = await this.shadowRepository.createSnapshot(fullOperation.id)
        fullOperation.snapshotId = snapshot.id
        fullOperation.rollbackData = await this.prepareRollbackData(fullOperation, snapshot.id)
      }

      // 存储操作
      await this.storageManager.storeOperation(fullOperation)

      // 更新操作链
      await this.addOperationToChain(fullOperation)

      // 如果有父操作，更新父操作的子操作列表
      if (fullOperation.parentOperationId) {
        await this.linkToParentOperation(fullOperation)
      }

      return {
        success: true,
        operationId: fullOperation.id,
        snapshotId: fullOperation.snapshotId,
        rollbackAvailable: fullOperation.reversible,
      }
    } catch (error) {
      return {
        success: false,
        operationId: operation.id || 'unknown',
        error: error as Error,
        rollbackAvailable: false,
      }
    }
  }

  async rollbackOperation(operationId: string): Promise<OperationResult> {
    try {
      // 获取操作详情
      const operationMeta = await this.storageManager.getOperation(operationId)
      if (!operationMeta) {
        throw new Error(`Operation ${operationId} not found`)
      }

      // 获取完整操作数据（这里简化，实际需要从存储中获取）
      const operation = await this.getFullOperation(operationId)
      if (!operation || !operation.rollbackData) {
        throw new Error(`Operation ${operationId} is not rollbackable`)
      }

      // 执行回滚
      await this.executeRollback(operation)

      // 记录回滚操作
      const rollbackOperation: Partial<Operation> = {
        type: 'metadata_change',
        aiAgent: operation.aiAgent,
        projectPath: operation.projectPath,
        description: `Rollback of operation ${operationId}`,
        affectedFiles: operation.affectedFiles,
        parentOperationId: operationId,
        reversible: false, // 回滚操作本身不可回滚
      }

      const result = await this.recordOperation(rollbackOperation)

      return {
        success: true,
        operationId: result.operationId,
        snapshotId: result.snapshotId,
        rollbackAvailable: false,
      }
    } catch (error) {
      return {
        success: false,
        operationId,
        error: error as Error,
        rollbackAvailable: false,
      }
    }
  }

  async getOperationChain(workspaceId: string): Promise<OperationChain | null> {
    return this.activeChains.get(workspaceId) || null
  }

  async traverseChain(
    workspaceId: string,
    options: ChainTraversalOptions = { direction: 'backward' },
  ): Promise<Operation[]> {
    const chain = await this.getOperationChain(workspaceId)
    if (!chain)
      return []

    const operations: Operation[] = []
    let currentIndex = options.direction === 'forward' ? 0 : chain.currentIndex
    let depth = 0
    const maxDepth = options.maxDepth || chain.operations.length

    while (
      currentIndex >= 0
      && currentIndex < chain.operations.length
      && depth < maxDepth
    ) {
      const operation = chain.operations[currentIndex]

      // 应用过滤器
      const shouldInclude = this.shouldIncludeOperation(operation, options)
      if (shouldInclude) {
        operations.push(operation)
      }

      // 移动到下一个操作
      currentIndex = options.direction === 'forward' ? currentIndex + 1 : currentIndex - 1
      depth++
    }

    return operations
  }

  async getOperationHistory(
    workspaceId: string,
    limit = 50,
  ): Promise<Operation[]> {
    return this.traverseChain(workspaceId, {
      direction: 'backward',
      maxDepth: limit,
      includeNonReversible: true,
    })
  }

  async findDependentOperations(operationId: string): Promise<Operation[]> {
    const dependents: Operation[] = []

    // 递归查找所有依赖当前操作的操作
    await this.findDependentsRecursive(operationId, dependents, new Set())

    return dependents
  }

  // 私有方法

  private async loadActiveChains(): Promise<void> {
    // 从存储中加载所有活跃的操作链
    // 这里简化实现，实际应该从存储中查询
    this.activeChains.clear()
  }

  private async addOperationToChain(operation: Operation): Promise<void> {
    const workspaceId = operation.aiAgent // 简化，实际应该从workspace获取

    let chain = this.activeChains.get(workspaceId)
    if (!chain) {
      chain = {
        workspaceId,
        operations: [],
        currentIndex: -1,
        maxLength: 100, // 可配置
        headOperationId: operation.id,
        totalOperations: 0,
        createdAt: new Date(),
        lastModified: new Date(),
      }
      this.activeChains.set(workspaceId, chain)
    }

    // 添加操作到链中
    chain.operations.push(operation)
    chain.currentIndex = chain.operations.length - 1
    chain.totalOperations++
    chain.lastModified = new Date()
    chain.headOperationId = operation.id

    // 如果超过最大长度，移除最老的操作
    if (chain.operations.length > chain.maxLength) {
      const removed = chain.operations.shift()
      chain.currentIndex--
      if (removed) {
        // 清理旧操作的存储数据
        await this.cleanupOldOperation(removed)
      }
    }
  }

  private async linkToParentOperation(operation: Operation): Promise<void> {
    if (!operation.parentOperationId)
      return

    // 获取父操作并更新其子操作列表
    const parentOperation = await this.getFullOperation(operation.parentOperationId)
    if (parentOperation) {
      parentOperation.childOperationIds.push(operation.id)
      await this.storageManager.storeOperation(parentOperation)
    }
  }

  private async prepareRollbackData(
    operation: Operation,
    snapshotId: string,
  ): Promise<RollbackData> {
    const fileStates: FileState[] = []

    // 为每个受影响的文件准备状态信息
    for (const filePath of operation.affectedFiles) {
      try {
        const fs = await import('node:fs/promises')
        const stat = await fs.stat(filePath)
        const content = await fs.readFile(filePath)

        fileStates.push({
          path: filePath,
          relativePath: filePath.replace(operation.projectPath, ''),
          hash: this.calculateHash(content),
          size: stat.size,
          mtime: stat.mtime,
          exists: true,
        })
      } catch {
        // 文件可能不存在
        fileStates.push({
          path: filePath,
          relativePath: filePath.replace(operation.projectPath, ''),
          hash: '',
          size: 0,
          mtime: new Date(),
          exists: false,
        })
      }
    }

    return {
      snapshotId,
      fileStates,
      dependentOperations: [], // 暂时为空，可以后续扩展
    }
  }

  private async executeRollback(operation: Operation): Promise<void> {
    if (!operation.rollbackData || !operation.snapshotId) {
      throw new Error('No rollback data available')
    }

    // 使用Shadow Repository恢复快照
    await this.shadowRepository.restoreSnapshot(operation.snapshotId, {
      targetPath: operation.projectPath,
      preserveTimestamps: true,
      createBackup: true,
    })
  }

  private async getFullOperation(_operationId: string): Promise<Operation | null> {
    // 这里需要扩展StorageManager来存储完整的Operation对象
    // 暂时返回null，实际实现需要从存储中获取完整数据
    return null
  }

  private shouldIncludeOperation(
    operation: Operation,
    options: ChainTraversalOptions,
  ): boolean {
    // 检查是否包含不可逆操作
    if (!options.includeNonReversible && !operation.reversible) {
      return false
    }

    // 检查类型过滤器
    if (options.filterTypes && !options.filterTypes.includes(operation.type)) {
      return false
    }

    return true
  }

  private async findDependentsRecursive(
    operationId: string,
    dependents: Operation[],
    visited: Set<string>,
  ): Promise<void> {
    if (visited.has(operationId))
      return
    visited.add(operationId)

    const operation = await this.getFullOperation(operationId)
    if (!operation)
      return

    // 查找所有子操作
    for (const childId of operation.childOperationIds) {
      const child = await this.getFullOperation(childId)
      if (child) {
        dependents.push(child)
        await this.findDependentsRecursive(childId, dependents, visited)
      }
    }
  }

  private async cleanupOldOperation(_operation: Operation): Promise<void> {
    // 清理旧操作相关的快照和存储数据
    if (_operation.snapshotId) {
      // 这里可以选择性删除快照，或标记为可清理
    }
  }

  private calculateHash(content: Buffer): string {
    // 简单hash实现，生产环境应使用crypto
    let hash = 0
    const str = content.toString('binary')
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(16)
  }
}
