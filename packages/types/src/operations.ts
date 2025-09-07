/**
 * 操作引擎相关的类型定义
 * Operation engine type definitions
 */

// 从 storage.ts 导入
import type { BackupInfo } from './storage.js'

export interface UndoOptions {
  operationId?: string
  interactive?: boolean
  preview?: boolean
  force?: boolean
}

export interface RedoOptions {
  operationId?: string
  interactive?: boolean
  preview?: boolean
  force?: boolean
}

export interface CheckpointOptions {
  name?: string
  description?: string
  force?: boolean
  includeUntracked?: boolean
}

export interface UndoResult {
  success: boolean
  operationsUndone: number
  affectedFiles: string[]
  backupInfo?: BackupInfo
  errors?: OperationError[]
}

export interface RedoResult {
  success: boolean
  operationsRedone: number
  affectedFiles: string[]
  backupInfo?: BackupInfo
  errors?: OperationError[]
}

export interface CheckpointResult {
  success: boolean
  checkpointId: string
  checkpointName?: string
  filesIncluded: number
  snapshotHash: string
  errors?: OperationError[]
}

export interface OperationError {
  code: string
  message: string
  file?: string
  operation?: string
  recoverable: boolean
}

export interface RestoreOptions {
  checkpointId: string
  interactive?: boolean
  preview?: boolean
  force?: boolean
  targetPath?: string
}

export interface RestoreResult {
  success: boolean
  restoredFiles: number
  checkpointName?: string
  backupInfo?: BackupInfo
  errors?: OperationError[]
}
