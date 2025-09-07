[Root Directory](../../CLAUDE.md) > [packages](../) > **core**

# ZCU Core Package

> ⚡ **ZCU Core Logic Engine** - Storage system and operation engine for undo/redo functionality

## Changelog

- **2025-09-07 21:26:40**: Create module documentation, define core architecture
- **2025-09-07**: Initialize package structure and dependencies

## Module Responsibility

ZCU Core is the heart of the ZCU system, providing the fundamental storage engine, operation processing, and data management capabilities. It implements the Fusion Architecture with LevelDB storage and Shadow Git Repository for reliable file versioning.

### Core Features
- **Storage Engine**: LevelDB-based key-value storage for metadata and operations
- **Shadow Repository**: Git-based file versioning system with isolated snapshots
- **Operation Engine**: Atomic operation processing with two-phase commit
- **Session Management**: Multi-instance workspace isolation and conflict resolution

## Entry Points & Startup

### Main Entry
- **File**: `src/index.ts`
- **Exports**: Core APIs for CLI and Web applications
- **Initialization**: Automatic storage setup and configuration

### Architecture Components
```typescript
// Planned architecture
Core
├── StorageEngine (LevelDB wrapper)
├── ShadowRepository (Git operations)
├── OperationProcessor (atomic operations)
├── SessionManager (workspace isolation)
└── ConflictResolver (merge strategies)
```

## External Interfaces

### Storage Operations

| Function | Description | Status | Return Type |
|----------|-------------|--------|-------------|
| `initStorage(path)` | Initialize storage at given path | 🎯 Planned | `Promise<StorageEngine>` |
| `createCheckpoint(name, desc)` | Create new checkpoint | 🎯 Planned | `Promise<CheckpointResult>` |
| `listCheckpoints(options)` | List all checkpoints | 🎯 Planned | `Promise<CheckpointData[]>` |
| `restoreCheckpoint(name)` | Restore to checkpoint | 🎯 Planned | `Promise<RestoreResult>` |
| `deleteCheckpoint(name)` | Delete checkpoint | 🎯 Planned | `Promise<boolean>` |

### Operation Management

| Function | Description | Status | Return Type |
|----------|-------------|--------|-------------|
| `undo(options)` | Undo recent operations | 🎯 Planned | `Promise<UndoResult>` |
| `redo(options)` | Redo undone operations | 🎯 Planned | `Promise<RedoResult>` |
| `getOperationHistory()` | Get operation history | 🎯 Planned | `Promise<OperationRecord[]>` |
| `clearHistory(before)` | Clear old operations | 🎯 Planned | `Promise<number>` |

### Session Management

| Function | Description | Status | Return Type |
|----------|-------------|--------|-------------|
| `createSession(id)` | Create new session | 🎯 Planned | `Promise<Session>` |
| `getActiveSession()` | Get current session | 🎯 Planned | `Session \| null` |
| `switchSession(id)` | Switch to different session | 🎯 Planned | `Promise<boolean>` |
| `mergeSession(from, to)` | Merge sessions | 🎯 Planned | `Promise<ConflictInfo[]>` |

## Key Dependencies & Configuration

### Core Dependencies
```json
{
  "dependencies": {
    "@ufomiao/types": "workspace:*",     // Type definitions
    "chalk": "catalog:ui",               // Console output formatting
    "classic-level": "catalog:ui",       // LevelDB implementation
    "commander": "catalog:ui",           // CLI argument parsing
    "simple-git": "catalog:ui"           // Git operations wrapper
  }
}
```

### Dev Dependencies
```json
{
  "devDependencies": {
    "@antfu/utils": "catalog:inlined",   // Utility functions
    "@types/node": "catalog:types",      // Node.js types
    "@ufomiao/eslint-config": "workspace:*",  // ESLint configuration
    "@ufomiao/tsconfig": "workspace:*",  // TypeScript configuration
    "typescript": "catalog:cli",         // TypeScript compiler
    "unbuild": "catalog:cli",            // Build tool
    "vitest": "catalog:testing"          // Testing framework
  }
}
```

### Storage Configuration
- **Storage Backend**: LevelDB for high-performance key-value operations
- **Data Directory**: `~/.zcu/` (configurable)
- **Git Integration**: Separate shadow repository for file snapshots
- **Compression**: Optional LZ4 compression for large files

## Data Models

### Storage Schema

```typescript
// Storage key patterns
interface StorageKey {
  checkpoints: `cp:${string}`           // cp:checkpoint-name
  operations: `op:${number}`            // op:timestamp
  sessions: `session:${string}`         // session:session-id
  metadata: `meta:${string}`            // meta:config-key
}

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
```

### Operation Records

```typescript
// Operation tracking
interface OperationRecord {
  id: string
  type: OperationType
  timestamp: number
  sessionId: string
  files: FileOperation[]
  metadata: Record<string, any>
  reversible: boolean
}

// File operation types
type OperationType = 
  | 'create' | 'modify' | 'delete' | 'rename' | 'move'
  | 'checkpoint' | 'restore' | 'merge'
```

### Session Management

```typescript
// Session state tracking
interface WorkspaceState {
  currentSession: string
  activeOperations: OperationRecord[]
  pendingChanges: FileOperation[]
  lastCheckpoint?: string
  conflictStatus: ConflictInfo[]
}
```

## Testing & Quality

### Test Structure (Planned)
```
test/
├── storage/            # Storage engine tests
│   ├── leveldb.test.ts
│   ├── migration.test.ts
│   └── performance.test.ts
├── operations/         # Operation engine tests
│   ├── undo.test.ts
│   ├── redo.test.ts
│   └── atomic.test.ts
├── git/               # Git integration tests
│   ├── shadow-repo.test.ts
│   ├── merge.test.ts
│   └── conflicts.test.ts
└── integration/       # Cross-component tests
```

### Testing Strategy
- **Unit Tests**: Individual component testing with mocked dependencies
- **Integration Tests**: Full workflow testing with real storage
- **Performance Tests**: Benchmarking with large repositories
- **Concurrency Tests**: Multi-session and race condition testing

### Quality Tools
- **ESLint**: Code standard checking (`@ufomiao/eslint-config/library`)
- **TypeScript**: Strict type checking with comprehensive coverage
- **Vitest**: Fast testing with snapshot and mock capabilities

## FAQ

### Q: Why LevelDB instead of SQLite?

A: LevelDB advantages:
- Higher performance for key-value operations
- Better concurrency handling
- Smaller memory footprint
- Optimized for write-heavy workloads (common in version control)

### Q: How does the Shadow Repository work?

A: Shadow Repository architecture:
1. Separate Git repository for file snapshots
2. Isolated from main working directory
3. Atomic commits for each checkpoint
4. Efficient storage with Git's deduplication

### Q: How are conflicts handled?

A: Conflict resolution strategies:
1. **Detection**: Compare file hashes and timestamps
2. **Resolution**: User-defined merge strategies
3. **Recovery**: Automatic rollback on conflict
4. **Reporting**: Detailed conflict information

### Q: Can multiple instances run simultaneously?

A: Yes, through session management:
- Each instance gets unique session ID
- File-level locking prevents corruption
- Merge capabilities for combining sessions
- Automatic conflict detection and resolution

## Related File List

### Source Files (Planned)
- `src/index.ts` - Main exports and initialization
- `src/storage/` - Storage engine implementation
  - `leveldb.ts` - LevelDB wrapper
  - `migration.ts` - Schema migrations
- `src/git/` - Git integration
  - `shadow-repo.ts` - Shadow repository management
  - `operations.ts` - Git operation wrappers
- `src/operations/` - Operation processing
  - `engine.ts` - Main operation processor
  - `atomic.ts` - Two-phase commit implementation
- `src/session/` - Session management
  - `manager.ts` - Session lifecycle
  - `conflicts.ts` - Conflict resolution

### Configuration Files
- `package.json` - Package configuration and dependencies
- `tsconfig.json` - TypeScript config (extends `@ufomiao/tsconfig/library`)
- `eslint.config.ts` - ESLint config (extends `@ufomiao/eslint-config/library`)
- `build.config.ts` - Unbuild configuration
- `vitest.config.ts` - Test configuration

### Build Output
- `dist/index.mjs` - ESM build output
- `dist/index.d.mts` - TypeScript declarations
- `dist/types/` - Additional type definition files

---

*📍 This document reflects the module state at 2025-09-07 21:26:40 - Core architecture planned, implementation in progress*