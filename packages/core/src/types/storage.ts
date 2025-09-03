// Storage layer type definitions

export interface StorageConfig {
  dbPath: string
  shadowPath: string
  maxSnapshots?: number
  cacheSize?: number
}

export interface StorageMetrics {
  dbSize: number
  snapshotCount: number
  cacheHitRate: number
  lastBackup?: Date
}

// LevelDB Schema Keys
export const LevelDBSchema = {
  // 工作空间相关
  workspace: {
    active: (aiId: string) => `workspace:${aiId}:active`,
    metadata: (id: string) => `workspace:${id}:metadata`,
    operations: (id: string) => `workspace:${id}:operations`,
    state: (id: string) => `workspace:${id}:state`,
  },

  // 操作记录
  operation: {
    latest: (aiId: string) => `operation:${aiId}:latest`,
    history: (aiId: string) => `operation:${aiId}:history`,
    metadata: (id: string) => `operation:${id}:metadata`,
  },

  // 冲突管理
  conflict: {
    active: (projectPath: string) => `conflict:${projectPath}:active`,
    resolved: (id: string) => `conflict:${id}:resolved`,
    pending: () => `conflict:pending`,
  },

  // 安全相关
  safety: {
    level: (operationId: string) => `safety:${operationId}:level`,
    rollback: (id: string) => `safety:${id}:rollback`,
  },
} as const
