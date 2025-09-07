[Root Directory](../../CLAUDE.md) > [apps](../) > **cli**

# ZCU CLI Application

> 🖥️ **ZCU Command Line Interface** - Interactive CLI tool based on Ink + Commander

## Changelog

- **2025-09-07 21:26:40**: Create module documentation, define CLI architecture
- **2025-09-07**: Implement basic command framework and entry point

## Module Responsibility

ZCU CLI is the primary user interface of the project, providing a complete command-line interactive experience. Built on Commander.js for command system architecture, utilizing Ink (React CLI framework) to provide rich interactive interfaces.

### Core Features
- **Command Parsing**: Complete command system based on Commander.js
- **Interactive Interface**: Leveraging Ink to provide React-style CLI components
- **User Experience**: Colored output, progress bars, interactive selectors
- **Error Handling**: Unified error catching and user-friendly error messages

## Entry Points & Startup

### Main Entry
- **File**: `src/index.ts` (#!/usr/bin/env node)
- **Executable**: `dist/index.mjs`
- **Launch Methods**: 
  - Development mode: `pnpm dev` → `tsx src/index.ts`
  - Production mode: via built `dist/index.mjs`

### Command Registration Flow
```typescript
// 1. Basic program setup
program
  .name('zcu')
  .description('zero-config claude-code undo - A regret medicine of Claude Code for u')
  .version('0.1.0')

// 2. Command registration
program.command('undo').option('--interactive').action(handleUndo)
program.command('redo').option('--preview').action(handleRedo)
// ... other commands

// 3. Argument parsing and execution
program.parse()
```

## External Interfaces

### Command List

| Command | Alias | Description | Status | Options |
|---------|-------|-------------|--------|---------|
| `zcu undo` | - | Undo the most recent operations | 🚧 In Development | `-i, --interactive`, `-p, --preview`, `-f, --force` |
| `zcu redo` | - | Redo previously undone operations | 🚧 In Development | `-i, --interactive`, `-p, --preview`, `-f, --force` |
| `zcu cp [name]` | `checkpoint` | Create a new checkpoint | 🚧 In Development | `-d, --desc`, `-f, --force`, `--untracked` |
| `zcu list` | `ls` | List all available checkpoints | 🚧 In Development | `-a, --all`, `-n, --limit <number>` |
| `zcu restore <name>` | - | Restore to a specific checkpoint | 🚧 In Development | `-p, --preview`, `-f, --force` |
| `zcu status` | - | Show current workspace status | 🚧 In Development | `-v, --verbose` |

### Command Options Standards

#### Common Options
- `--interactive` / `-i`: Enable interactive mode
- `--preview` / `-p`: Preview operation without execution
- `--force` / `-f`: Force execution, skip confirmation
- `--verbose` / `-v`: Verbose output mode

#### Special Options
- `--desc <description>`: Checkpoint description (checkpoint only)
- `--untracked`: Include untracked files (checkpoint only)
- `--all`: Show all items (list only)
- `--limit <number>`: Limit display count (list only)

## Key Dependencies & Configuration

### Core Dependencies
```json
{
  "dependencies": {
    "@ufomiao/core": "workspace:*",      // Core logic engine
    "@ufomiao/types": "workspace:*",     // Type definitions
    "@ufomiao/ui": "workspace:*",        // UI component library
    "chalk": "catalog:ui",               // Terminal color output
    "commander": "catalog:ui",           // Command-line parsing framework
    "ink": "catalog:ui",                 // React CLI framework
    "react": "catalog:ui"                // React runtime
  }
}
```

### Dev Dependencies
```json
{
  "devDependencies": {
    "@antfu/utils": "catalog:inlined",   // Utility functions
    "@types/node": "catalog:types",      // Node.js type definitions
    "@types/react": "catalog:types",     // React type definitions
    "tsx": "catalog:cli",                // TypeScript executor
    "unbuild": "catalog:cli",            // Build tool
    "vitest": "catalog:testing",         // Test framework
    "yaml": "catalog:testing"            // YAML parser (for testing)
  }
}
```

### Build Configuration
- **Build Tool**: `unbuild` (based on Rollup)
- **Dev Mode**: `unbuild --stub` (symbolic link mode)
- **Output Format**: ESM (`.mjs`) + TypeScript declarations (`.d.mts`)

## Data Models

### Command Options Types

```typescript
// Undo command options
interface UndoCliOptions {
  interactive?: boolean
  preview?: boolean
  force?: boolean
}

// Common command options pattern
interface BaseCommandOptions {
  interactive?: boolean
  preview?: boolean
  force?: boolean
  verbose?: boolean
}
```

### Error Handling Model

```typescript
// Unified error handling
program.on('command:*', () => {
  console.error(chalk.red('Invalid command: %s'), program.args.join(' '))
  console.log(chalk.yellow('See --help for a list of available commands.'))
  process.exit(1)
})
```

## Testing & Quality

### Test Structure
```
test/
├── exports.test.ts      # Export integrity tests
├── index.test.ts        # Main entry tests
└── commands/            # Command handler tests (to be added)
    ├── undo.test.ts
    ├── redo.test.ts
    └── checkpoint.test.ts
```

### Testing Strategy
- **Export Tests**: Verify package export integrity (`vitest-package-exports`)
- **Command Tests**: Mock CLI arguments, verify command processing logic
- **Integration Tests**: Integration verification with `@ufomiao/core` package

### Quality Tools
- **ESLint**: Code standard checking (`@ufomiao/eslint-config`)
- **TypeScript**: Type checking
- **lint-staged**: Auto-formatting before Git commit

## FAQ

### Q: How to add new CLI commands?

A: Follow these steps:
1. Create command handler in `src/commands/`
2. Define command options type interface
3. Implement async command handler function
4. Register command in `src/index.ts`
5. Add corresponding test file

### Q: How to handle user input validation?

A: Use Commander.js built-in validation features:
```typescript
.option('-n, --limit <number>', 'Limit number', parseInt)
.action((options) => {
  if (isNaN(options.limit)) {
    console.error(chalk.red('Invalid number'))
    process.exit(1)
  }
})
```

### Q: How to implement interactive interfaces?

A: Plan to use Ink components:
```typescript
// Future implementation example
import { render } from 'ink'
import { InteractiveSelector } from '@ufomiao/ui'

function renderInteractiveUndo(options: UndoOptions) {
  render(<InteractiveSelector items={undoableOperations} />)
}
```

## Related File List

### Source Files
- `src/index.ts` - Main entry point, program setup and command registration
- `src/commands/undo.ts` - Undo command handler
- `src/commands/redo.ts` - Redo command handler  
- `src/commands/checkpoint.ts` - Checkpoint command handler
- `src/commands/list.ts` - List command handler
- `src/commands/restore.ts` - Restore command handler
- `src/commands/status.ts` - Status command handler

### Configuration Files
- `package.json` - Package config and dependency declarations
- `tsconfig.json` - TypeScript config (extends `@ufomiao/tsconfig/library`)
- `eslint.config.ts` - ESLint config (extends `@ufomiao/eslint-config/library`)
- `build.config.ts` - Unbuild build configuration
- `vitest.config.ts` - Vitest test configuration
- `lint-staged.config.ts` - Git hooks configuration

### Test Files
- `test/exports.test.ts` - Package export integrity verification
- `test/index.test.ts` - Main entry functionality tests

### Build Output
- `dist/index.mjs` - ESM format build output
- `dist/index.d.mts` - TypeScript declaration file
- `dist/index.d.cts` - CommonJS TypeScript declarations

---

*📍 This document reflects the module state at 2025-09-07 21:26:40 - CLI framework established, core features in development*