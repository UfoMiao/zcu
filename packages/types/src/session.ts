/**
 * 会话管理相关的类型定义
 * Session management type definitions
 */

export interface WorkspaceState {
  sessionId: string
  aiAgent: string // Claude实例ID
  projectPath: string
  operationChain: OperationRecord[]
  status: 'active' | 'paused' | 'conflict'
  lastActivity: Date
  metadata?: Record<string, unknown>
}

export interface OperationRecord {
  id: string
  type: OperationType
  timestamp: Date
  toolCallId?: string // AI操作专用
  source: OperationSource
  files: FileOperation[]
  description?: string
  canUndo: boolean
  canRedo: boolean
}

export interface FileOperation {
  path: string
  action: 'create' | 'modify' | 'delete' | 'rename'
  oldPath?: string // 用于重命名操作
  content?: string // 文件内容 (用于恢复)
  oldContent?: string // 原始内容 (用于撤销)
}

export type OperationType
  = | 'file_edit'
    | 'file_create'
    | 'file_delete'
    | 'file_rename'
    | 'bash_command'
    | 'checkpoint_manual'
    | 'checkpoint_auto'

export type OperationSource
  = | 'claude_ai'
    | 'user_manual'
    | 'external'
    | 'system'

export interface ConflictInfo {
  projectPath: string
  conflictingAgents: string[]
  conflictType: 'file_modification' | 'operation_chain' | 'workspace_lock'
  detectedAt: Date
  description: string
}
