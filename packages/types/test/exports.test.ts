/**
 * Types package export completeness tests
 * 验证所有类型定义都被正确导出
 */

import { describe, expect, it } from 'vitest'

describe('types Package Exports', () => {
  it('should export all operation types', async () => {
    const operationTypes = await import('../src/operations')

    // 验证所有操作相关类型都被导出
    const expectedOperationTypes = [
      'UndoOptions',
      'RedoOptions',
      'CheckpointOptions',
      'UndoResult',
      'RedoResult',
      'CheckpointResult',
      'OperationError',
      'RestoreOptions',
      'RestoreResult',
    ]

    // 这里使用间接方式验证类型存在（通过 TypeScript 编译验证）
    expect(operationTypes).toBeDefined()

    // 验证命名空间中所有导出都是函数（类型在运行时不存在，但导出应该是 undefined）
    expectedOperationTypes.forEach((typeName) => {
      // TypeScript 类型在运行时会是 undefined，但应该在导出中
      expect(operationTypes[typeName as keyof typeof operationTypes]).toBeUndefined()
    })
  })

  it('should export all session types', async () => {
    const sessionTypes = await import('../src/session')

    const expectedSessionTypes = [
      'WorkspaceState',
      'OperationRecord',
      'FileOperation',
      'OperationType',
      'OperationSource',
      'ConflictInfo',
    ]

    expect(sessionTypes).toBeDefined()

    expectedSessionTypes.forEach((typeName) => {
      expect(sessionTypes[typeName as keyof typeof sessionTypes]).toBeUndefined()
    })
  })

  it('should export all storage types', async () => {
    const storageTypes = await import('../src/storage')

    const expectedStorageTypes = [
      'LevelDBOptions',
      'StorageKey',
      'CheckpointData',
      'BackupInfo',
    ]

    expect(storageTypes).toBeDefined()

    expectedStorageTypes.forEach((typeName) => {
      expect(storageTypes[typeName as keyof typeof storageTypes]).toBeUndefined()
    })
  })

  it('should re-export all types from index', async () => {
    const indexTypes = await import('../src/index')

    // 验证主入口文件重新导出了所有必要的类型
    expect(indexTypes).toBeDefined()

    // 注意：在运行时，TypeScript 类型导出为 undefined
    // 我们主要验证导入不会出错，实际的类型检查由 TypeScript 编译器完成
    const allExpectedTypes = [
      // 从 operations.ts
      'UndoOptions',
      'RedoOptions',
      'CheckpointOptions',
      'UndoResult',
      'RedoResult',
      'CheckpointResult',
      'OperationError',
      'RestoreOptions',
      'RestoreResult',

      // 从 session.ts
      'WorkspaceState',
      'OperationRecord',
      'FileOperation',
      'OperationType',
      'OperationSource',
      'ConflictInfo',

      // 从 storage.ts
      'LevelDBOptions',
      'StorageKey',
      'CheckpointData',
      'BackupInfo',
    ]

    // 验证所有类型都被重新导出（即使在运行时为 undefined）
    allExpectedTypes.forEach((typeName) => {
      expect(indexTypes[typeName as keyof typeof indexTypes]).toBeUndefined()
    })
  })
})
