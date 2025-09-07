[Root Directory](../../CLAUDE.md) > [packages](../) > **types**

# ZCU Types Package

> 📝 **TypeScript Type Definitions** - Centralized type definitions for the entire ZCU ecosystem

## Changelog

- **2025-09-07 21:26:40**: Create module documentation, define type system architecture
- **2025-09-07**: Implement core type definitions for operations, storage, and sessions

## Module Responsibility

ZCU Types provides a centralized type definition system for all ZCU packages, ensuring type safety and consistency across the entire ecosystem. It defines interfaces for operations, storage, sessions, and all data structures used throughout the system.

### Core Features
- **Operation Types**: Undo, redo, checkpoint, and restore operation interfaces
- **Storage Types**: Database schema, checkpoint data, and backup information
- **Session Types**: Workspace state, conflict resolution, and file operations
- **Error Types**: Standardized error handling across all packages

## Entry Points & Startup

### Main Entry
- **File**: `src/index.ts`
- **Purpose**: Re-export all type definitions for easy consumption
- **Usage**: `import type { ... } from '@ufomiao/types'`

### Type Organization
```typescript
// Type module structure
Types
├── operations.ts (Undo/Redo/Checkpoint operations)
├── storage.ts    (Database and file storage)
├── session.ts    (Workspace and session management)
└── index.ts      (Unified exports)
```

## External Interfaces

### Operation Types

| Interface | Description | Module | Usage |
|-----------|-------------|---------|--------|
| `UndoOptions` | Configuration for undo operations | operations.ts | CLI commands, Core engine |
| `RedoOptions` | Configuration for redo operations | operations.ts | CLI commands, Core engine |
| `CheckpointOptions` | Checkpoint creation parameters | operations.ts | CLI commands, Core engine |
| `RestoreOptions` | Restoration parameters | operations.ts | CLI commands, Core engine |

### Result Types

| Interface | Description | Fields | Used By |
|-----------|-------------|--------|---------|
| `UndoResult` | Undo operation results | `success`, `operationsUndone`, `affectedFiles` | Core, CLI |
| `RedoResult` | Redo operation results | `success`, `operationsRedone`, `affectedFiles` | Core, CLI |
| `CheckpointResult` | Checkpoint creation results | `checkpointId`, `filesIncluded`, `snapshotHash` | Core, CLI |
| `RestoreResult` | Restoration results | `restoredFiles`, `checkpointName`, `backupInfo` | Core, CLI |

### Storage Types

| Interface | Description | Purpose | Used By |
|-----------|-------------|---------|---------|
| `CheckpointData` | Checkpoint metadata structure | Database storage | Core, Web |
| `BackupInfo` | File backup information | Recovery operations | Core, CLI |
| `StorageKey` | Database key patterns | LevelDB operations | Core |
| `LevelDBOptions` | Database configuration | Storage initialization | Core |

## Key Dependencies & Configuration

### Dependencies
```json
{
  "dependencies": {
    // No runtime dependencies - types only
  },
  "devDependencies": {
    "@antfu/utils": "catalog:inlined",        // Development utilities
    "@types/node": "catalog:types",           // Node.js types
    "@ufomiao/eslint-config": "workspace:*",  // Code quality
    "@ufomiao/tsconfig": "workspace:*",       // TypeScript config
    "typescript": "catalog:cli",              // Compiler
    "unbuild": "catalog:cli",                 // Build tool
    "vitest": "catalog:testing"               // Testing framework
  }
}
```

### Build Configuration
- **Build Tool**: `unbuild` for type-only package
- **Output**: TypeScript declaration files (`.d.ts`)
- **Target**: ESM and CommonJS compatibility

## Data Models

### Operation Flow Types

```typescript
// Operation configuration
interface UndoOptions {
  operationId?: string      // Specific operation to undo
  interactive?: boolean     // Enable interactive selection
  preview?: boolean        // Preview without executing
  force?: boolean          // Skip confirmations
}

// Operation results
interface UndoResult {
  success: boolean
  operationsUndone: number
  affectedFiles: string[]
  backupInfo?: BackupInfo
  errors?: OperationError[]
}
```

### Storage Schema Types

```typescript
// Checkpoint data structure
interface CheckpointData {
  id: string
  name: string
  description?: string
  timestamp: number
  fileHashes: Record<string, string>
  gitCommit: string
  creator: string
  size: number
}

// Storage key patterns
type StorageKey = 
  | `cp:${string}`       // Checkpoints
  | `op:${number}`       // Operations
  | `session:${string}`  // Sessions
  | `meta:${string}`     // Metadata
```

### Session Management Types

```typescript
// Workspace state tracking
interface WorkspaceState {
  currentSession: string
  activeOperations: OperationRecord[]
  pendingChanges: FileOperation[]
  lastCheckpoint?: string
  conflictStatus: ConflictInfo[]
}

// File operation details
interface FileOperation {
  path: string
  type: OperationType
  timestamp: number
  hash?: string
  size?: number
  source?: OperationSource
}
```

## Testing & Quality

### Test Structure
```
test/
├── exports.test.ts      # Export completeness verification
├── operations.test.ts   # Operation type validation
├── storage.test.ts      # Storage type validation
└── session.test.ts      # Session type validation
```

### Testing Strategy
- **Export Tests**: Verify all types are properly exported (`vitest-package-exports`)
- **Type Tests**: Compile-time type checking and validation
- **Integration Tests**: Type compatibility across packages

### Quality Tools
- **ESLint**: Code quality and consistency (`@ufomiao/eslint-config/library`)
- **TypeScript**: Strict type checking with comprehensive coverage
- **Type Coverage**: Ensure 100% type coverage for all exports

## FAQ

### Q: Why separate types package instead of inline types?

A: Benefits of centralized types:
- **Consistency**: Single source of truth for all interfaces
- **Reusability**: Shared types across CLI, Web, and Core packages
- **Maintainability**: Easier to update types across entire ecosystem
- **Development**: Better IDE support and type checking

### Q: How to add new types?

A: Follow these steps:
1. Add interface to appropriate module (`operations.ts`, `storage.ts`, etc.)
2. Export from module file
3. Re-export from `src/index.ts`
4. Add corresponding tests
5. Update documentation

### Q: Are runtime type checking included?

A: No, this package contains TypeScript types only:
- Compile-time type safety
- No runtime overhead
- Pure type definitions
- For runtime validation, use libraries like `zod` or `joi`

### Q: How to handle breaking changes?

A: Type versioning strategy:
1. Use semantic versioning for type changes
2. Deprecate old types before removal
3. Provide migration guides
4. Use TypeScript utility types for compatibility

## Related File List

### Source Files
- `src/index.ts` - Main export file with all type re-exports
- `src/operations.ts` - Operation-related types (undo, redo, checkpoint)
- `src/storage.ts` - Storage and database-related types
- `src/session.ts` - Session management and workspace types

### Configuration Files
- `package.json` - Package configuration (no runtime dependencies)
- `tsconfig.json` - TypeScript config (extends `@ufomiao/tsconfig/library`)
- `eslint.config.ts` - ESLint config (extends `@ufomiao/eslint-config/library`)
- `build.config.ts` - Unbuild configuration for type generation
- `vitest.config.ts` - Test configuration

### Build Output
- `dist/index.d.mts` - ESM TypeScript declarations
- `dist/index.d.cts` - CommonJS TypeScript declarations
- `dist/operations.d.ts` - Individual module declarations
- `dist/storage.d.ts` - Storage type declarations
- `dist/session.d.ts` - Session type declarations

---

*📍 This document reflects the module state at 2025-09-07 21:26:40 - Core type definitions implemented, comprehensive type system established*