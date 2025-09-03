import type { StorageConfig } from '../types/storage'
import { Level } from 'level'
import { LevelDBSchema } from '../types/storage'

export class LevelDBStore {
  private db: Level<string, string>
  private config: StorageConfig

  constructor(config: StorageConfig) {
    this.config = config
    this.db = new Level<string, string>(config.dbPath, { valueEncoding: 'utf8' })
  }

  async initialize(): Promise<void> {
    await this.db.open()
    console.log(`LevelDB initialized at: ${this.config.dbPath}`)
  }

  async close(): Promise<void> {
    await this.db.close()
  }

  // Workspace operations
  async setWorkspaceActive(aiId: string, workspaceId: string): Promise<void> {
    const key = LevelDBSchema.workspace.active(aiId)
    await this.db.put(key, workspaceId)
  }

  async getActiveWorkspace(aiId: string): Promise<string | null> {
    try {
      const key = LevelDBSchema.workspace.active(aiId)
      return await this.db.get(key)
    } catch {
      // Level 10.x 可能使用不同的错误类型，直接返回null处理不存在的key
      return null
    }
  }

  async setWorkspaceMetadata(id: string, metadata: any): Promise<void> {
    const key = LevelDBSchema.workspace.metadata(id)
    await this.db.put(key, JSON.stringify(metadata))
  }

  async getWorkspaceMetadata(id: string): Promise<any | null> {
    try {
      const key = LevelDBSchema.workspace.metadata(id)
      const data = await this.db.get(key)
      return JSON.parse(data)
    } catch {
      // Level 10.x 可能使用不同的错误类型，直接返回null处理不存在的key
      return null
    }
  }

  // Operation operations
  async setLatestOperation(aiId: string, operationId: string): Promise<void> {
    const key = LevelDBSchema.operation.latest(aiId)
    await this.db.put(key, operationId)
  }

  async getLatestOperation(aiId: string): Promise<string | null> {
    try {
      const key = LevelDBSchema.operation.latest(aiId)
      return await this.db.get(key)
    } catch {
      // Level 10.x 可能使用不同的错误类型，直接返回null处理不存在的key
      return null
    }
  }

  async setOperationMetadata(id: string, metadata: any): Promise<void> {
    const key = LevelDBSchema.operation.metadata(id)
    await this.db.put(key, JSON.stringify(metadata))
  }

  async getOperationMetadata(id: string): Promise<any | null> {
    try {
      const key = LevelDBSchema.operation.metadata(id)
      const data = await this.db.get(key)
      return JSON.parse(data)
    } catch {
      // Level 10.x 可能使用不同的错误类型，直接返回null处理不存在的key
      return null
    }
  }

  // Generic get/put methods
  async put(key: string, value: string): Promise<void> {
    await this.db.put(key, value)
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.db.get(key)
    } catch {
      // Level 10.x 可能使用不同的错误类型，直接返回null处理不存在的key
      return null
    }
  }

  async delete(key: string): Promise<void> {
    await this.db.del(key)
  }

  // Batch operations
  async batch(operations: Array<{ type: 'put' | 'del', key: string, value?: string }>): Promise<void> {
    const batch = this.db.batch()

    for (const op of operations) {
      if (op.type === 'put' && op.value !== undefined) {
        batch.put(op.key, op.value)
      } else if (op.type === 'del') {
        batch.del(op.key)
      }
    }

    await batch.write()
  }

  // Statistics
  async getDbSize(): Promise<number> {
    // Approximate size calculation
    let count = 0
    // eslint-disable-next-line ts/no-unused-vars
    for await (const _ of this.db.iterator()) {
      count++
    }
    return count
  }
}
