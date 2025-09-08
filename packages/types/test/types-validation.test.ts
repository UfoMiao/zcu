/**
 * Types validation tests
 * 验证类型定义的正确性和一致性
 * 使用编译时检查确保类型系统的完整性
 */

import type {
  BackupInfo,
  CheckpointData,
  CheckpointOptions,
  CheckpointResult,
  ConflictInfo,
  FileOperation,
  // Storage types
  LevelDBOptions,
  OperationError,
  OperationRecord,

  OperationSource,
  OperationType,
  RedoOptions,
  RedoResult,
  RestoreOptions,
  RestoreResult,

  StorageKey,
  // Operation types
  UndoOptions,
  UndoResult,
  // Session types
  WorkspaceState,
} from '../src/index'
import { describe, expectTypeOf, it } from 'vitest'

describe('operation Types Validation', () => {
  it('should have correct UndoOptions interface', () => {
    expectTypeOf<UndoOptions>().toEqualTypeOf<{
      operationId?: string
      interactive?: boolean
      preview?: boolean
      force?: boolean
    }>()
  })

  it('should have correct RedoOptions interface', () => {
    expectTypeOf<RedoOptions>().toEqualTypeOf<{
      operationId?: string
      interactive?: boolean
      preview?: boolean
      force?: boolean
    }>()
  })

  it('should have correct CheckpointOptions interface', () => {
    expectTypeOf<CheckpointOptions>().toEqualTypeOf<{
      name?: string
      description?: string
      force?: boolean
      includeUntracked?: boolean
    }>()
  })

  it('should have correct UndoResult interface', () => {
    expectTypeOf<UndoResult>().toEqualTypeOf<{
      success: boolean
      operationsUndone: number
      affectedFiles: string[]
      backupInfo?: BackupInfo
      errors?: OperationError[]
    }>()
  })

  it('should have correct RedoResult interface', () => {
    expectTypeOf<RedoResult>().toEqualTypeOf<{
      success: boolean
      operationsRedone: number
      affectedFiles: string[]
      backupInfo?: BackupInfo
      errors?: OperationError[]
    }>()
  })

  it('should have correct CheckpointResult interface', () => {
    expectTypeOf<CheckpointResult>().toEqualTypeOf<{
      success: boolean
      checkpointId: string
      checkpointName?: string
      filesIncluded: number
      snapshotHash: string
      errors?: OperationError[]
    }>()
  })

  it('should have correct RestoreOptions interface', () => {
    expectTypeOf<RestoreOptions>().toEqualTypeOf<{
      checkpointId: string
      interactive?: boolean
      preview?: boolean
      force?: boolean
      targetPath?: string
    }>()
  })

  it('should have correct RestoreResult interface', () => {
    expectTypeOf<RestoreResult>().toEqualTypeOf<{
      success: boolean
      restoredFiles: number
      checkpointName?: string
      backupInfo?: BackupInfo
      errors?: OperationError[]
    }>()
  })

  it('should have correct OperationError interface', () => {
    expectTypeOf<OperationError>().toEqualTypeOf<{
      code: string
      message: string
      file?: string
      operation?: string
      recoverable: boolean
    }>()
  })
})

describe('session Types Validation', () => {
  it('should have correct WorkspaceState interface', () => {
    expectTypeOf<WorkspaceState>().toEqualTypeOf<{
      sessionId: string
      aiAgent: string
      projectPath: string
      operationChain: OperationRecord[]
      status: 'active' | 'paused' | 'conflict'
      lastActivity: Date
      metadata?: Record<string, unknown>
    }>()
  })

  it('should have correct OperationRecord interface', () => {
    expectTypeOf<OperationRecord>().toEqualTypeOf<{
      id: string
      type: OperationType
      timestamp: Date
      toolCallId?: string
      source: OperationSource
      files: FileOperation[]
      description?: string
      canUndo: boolean
      canRedo: boolean
    }>()
  })

  it('should have correct FileOperation interface', () => {
    expectTypeOf<FileOperation>().toEqualTypeOf<{
      path: string
      action: 'create' | 'modify' | 'delete' | 'rename'
      oldPath?: string
      content?: string
      oldContent?: string
    }>()
  })

  it('should have correct OperationType union', () => {
    expectTypeOf<OperationType>().toEqualTypeOf<
      | 'file_edit'
      | 'file_create'
      | 'file_delete'
      | 'file_rename'
      | 'bash_command'
      | 'checkpoint_manual'
      | 'checkpoint_auto'
    >()
  })

  it('should have correct OperationSource union', () => {
    expectTypeOf<OperationSource>().toEqualTypeOf<
      | 'claude_ai'
      | 'user_manual'
      | 'external'
      | 'system'
    >()
  })

  it('should have correct ConflictInfo interface', () => {
    expectTypeOf<ConflictInfo>().toEqualTypeOf<{
      projectPath: string
      conflictingAgents: string[]
      conflictType: 'file_modification' | 'operation_chain' | 'workspace_lock'
      detectedAt: Date
      description: string
    }>()
  })
})

describe('storage Types Validation', () => {
  it('should have correct LevelDBOptions interface', () => {
    expectTypeOf<LevelDBOptions>().toEqualTypeOf<{
      valueEncoding: 'json' | 'utf8' | 'buffer'
      createIfMissing?: boolean
      compression?: boolean
    }>()
  })

  it('should have correct StorageKey interface', () => {
    expectTypeOf<StorageKey>().toEqualTypeOf<{
      workspace: (aiId: string, status?: 'active' | 'paused') => string
      operation: (aiId: string, timestamp: number) => string
      checkpoint: (projectPath: string, id: string) => string
      conflict: (projectPath: string) => string
    }>()
  })

  it('should have correct CheckpointData interface', () => {
    expectTypeOf<CheckpointData>().toEqualTypeOf<{
      id: string
      name?: string
      description?: string
      timestamp: Date
      files: string[]
      snapshotHash: string
      projectPath: string
      aiAgent: string
    }>()
  })

  it('should have correct BackupInfo interface', () => {
    expectTypeOf<BackupInfo>().toEqualTypeOf<{
      id: string
      originalPath: string
      backupPath: string
      timestamp: Date
      operation: 'undo' | 'redo' | 'restore'
    }>()
  })
})

describe('type Compatibility Tests', () => {
  it('should ensure Result types contain consistent error handling', () => {
    // 验证所有结果类型都有一致的错误处理
    expectTypeOf<UndoResult['errors']>().toEqualTypeOf<OperationError[] | undefined>()
    expectTypeOf<RedoResult['errors']>().toEqualTypeOf<OperationError[] | undefined>()
    expectTypeOf<CheckpointResult['errors']>().toEqualTypeOf<OperationError[] | undefined>()
    expectTypeOf<RestoreResult['errors']>().toEqualTypeOf<OperationError[] | undefined>()
  })

  it('should ensure consistent backup info usage', () => {
    // 验证备份信息在各种结果中使用一致
    expectTypeOf<UndoResult['backupInfo']>().toEqualTypeOf<BackupInfo | undefined>()
    expectTypeOf<RedoResult['backupInfo']>().toEqualTypeOf<BackupInfo | undefined>()
    expectTypeOf<RestoreResult['backupInfo']>().toEqualTypeOf<BackupInfo | undefined>()
  })

  it('should ensure options types have consistent structure', () => {
    // 验证选项类型有一致的基础结构
    interface BaseOptions {
      interactive?: boolean
      preview?: boolean
      force?: boolean
    }

    expectTypeOf<UndoOptions>().toMatchTypeOf<BaseOptions>()
    expectTypeOf<RedoOptions>().toMatchTypeOf<BaseOptions>()
    expectTypeOf<RestoreOptions>().toMatchTypeOf<BaseOptions>()
  })
})
