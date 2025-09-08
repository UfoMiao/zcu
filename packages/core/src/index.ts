/**
 * ZCU Core - Core functionality for undo/redo operations
 * Main entry point for core package, exports all core functionality
 */

export { OperationEngine } from './operations/operation-engine'
export { SessionManager } from './session/session-manager'
export { StorageEngine } from './storage/storage-engine'

// Re-export types from types package for convenience
export type {
  CheckpointOptions,
  CheckpointResult,
  OperationError,
  RedoOptions,
  RedoResult,
  RestoreOptions,
  RestoreResult,
  UndoOptions,
  UndoResult,
} from '@ufomiao/types'

// Core version information
export const version = '0.0.0'

// Core status indicators
export const status = {
  ready: false,
  initialized: false,
} as const
