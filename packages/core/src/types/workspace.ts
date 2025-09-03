// Workspace and AI isolation types
import type { Operation } from './operation'

export type WorkspaceState = 'active' | 'paused' | 'conflict'

export interface AIWorkspace {
  sessionId: string // claude_workspace_uuid
  aiAgent: string // 区分不同Claude实例
  projectPath: string // 项目路径
  workspaceState: WorkspaceState // active|paused|conflict
  operationChain: Operation[] // 操作链追踪
  conflictDetection: ConflictManager // 冲突检测机制
  createdAt: Date
  lastActiveAt: Date
}

export interface WorkspaceMetadata {
  id: string
  aiAgent: string
  projectPath: string
  state: WorkspaceState
  operationCount: number
  conflictCount: number
}

export interface ConflictManager {
  detectConflict: (operation: any) => boolean
  resolveConflict: (conflictId: string) => Promise<void>
  getActiveConflicts: () => string[]
}
