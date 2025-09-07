/**
 * 存储相关的类型定义
 * Storage-related type definitions
 */

export interface LevelDBOptions {
  valueEncoding: 'json' | 'utf8' | 'buffer'
  createIfMissing?: boolean
  compression?: boolean
}

export interface StorageKey {
  workspace: (aiId: string, status?: 'active' | 'paused') => string
  operation: (aiId: string, timestamp: number) => string
  checkpoint: (projectPath: string, id: string) => string
  conflict: (projectPath: string) => string
}

export interface CheckpointData {
  id: string
  name?: string
  description?: string
  timestamp: Date
  files: string[]
  snapshotHash: string
  projectPath: string
  aiAgent: string
}

export interface BackupInfo {
  id: string
  originalPath: string
  backupPath: string
  timestamp: Date
  operation: 'undo' | 'redo' | 'restore'
}
