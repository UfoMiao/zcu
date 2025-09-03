// Operation and undo/redo types

export interface Operation {
  id: string
  type: 'file_change' | 'directory_change' | 'metadata_change' | 'batch_operation'
  timestamp: Date
  aiAgent: string
  projectPath: string
  beforeState?: any
  afterState?: any
  affectedFiles: string[]
  reversible: boolean
  parentOperationId?: string // 用于链式追踪
  childOperationIds: string[] // 子操作列表
  snapshotId?: string // 关联的快照ID
  description?: string // 操作描述
  rollbackData?: RollbackData // 回滚所需数据
}

export interface OperationChain {
  workspaceId: string
  operations: Operation[]
  currentIndex: number
  maxLength: number
  headOperationId: string // 链头操作ID
  totalOperations: number // 总操作数
  createdAt: Date
  lastModified: Date
}

export interface OperationMetadata {
  id: string
  type: string
  timestamp: Date
  size: number
  checksum: string
}

export interface RollbackData {
  snapshotId: string // 回滚点快照ID
  fileStates: FileState[] // 文件状态信息
  dependentOperations: string[] // 依赖的操作列表
}

export interface FileState {
  path: string
  relativePath: string
  hash: string
  size: number
  mtime: Date
  exists: boolean
}

export interface OperationResult {
  success: boolean
  operationId: string
  snapshotId?: string
  error?: Error
  rollbackAvailable: boolean
}

export interface ChainTraversalOptions {
  direction: 'forward' | 'backward'
  maxDepth?: number
  includeNonReversible?: boolean
  filterTypes?: Operation['type'][]
}
