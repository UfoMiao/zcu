// Shadow Repository and snapshot types

export interface SnapshotMetadata {
  id: string
  timestamp: Date
  operationId: string
  projectPath: string
  commitHash?: string
  fileCount: number
  size: number
  isIncremental: boolean
  parentSnapshotId?: string
}

export interface RepositoryConfig {
  projectPath: string
  shadowPath: string
  maxSnapshots: number
  enableCompression: boolean
  excludePatterns: string[]
}

export interface FileSnapshot {
  path: string
  relativePath: string
  hash: string
  size: number
  mtime: Date
  isDeleted: boolean
}

export interface SnapshotDiff {
  added: FileSnapshot[]
  modified: FileSnapshot[]
  deleted: FileSnapshot[]
  unchanged: FileSnapshot[]
}

export interface RestoreOptions {
  targetPath?: string
  includePatterns?: string[]
  excludePatterns?: string[]
  preserveTimestamps: boolean
  createBackup: boolean
}

export interface SnapshotStats {
  totalSnapshots: number
  totalSize: number
  oldestSnapshot: Date
  newestSnapshot: Date
  averageSize: number
  compressionRatio: number
}
