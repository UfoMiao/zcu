# ZCU Development Plan - Fusion Architecture Implementation

**Project**: Zero-Config Claude-Code Undo  
**Architecture**: Fusion Architecture (Combining all 4 reference projects)  
**Created**: 2025-09-07  
**Status**: Initial Setup Complete

## Project Overview

ZCU is a comprehensive undo/redo system for Claude Code CLI, designed to provide:
- **`zcu undo`**: Undo recent operations  
- **`zcu redo`**: Redo previously undone operations
- **`zcu cp [name]`**: Create checkpoints
- **`zcu list`**: List available checkpoints
- **`zcu restore <name>`**: Restore to specific checkpoint
- **`zcu status`**: Show workspace status

## Architecture Design

### Core Technical Stack
- **Language**: TypeScript (consistent with monorepo)
- **Package Manager**: pnpm with catalogs classification
- **Build Tool**: Turbo (configured)
- **Project Structure**: Monorepo architecture

### Fusion Architecture Components

```typescript
// ZCU Fusion Architecture
interface ZCUCore {
  storage: LevelDBManager;           // Lightweight KV storage (replaces SQLite)
  shadowRepo: GitRepository;        // Isolated Git repository for file snapshots  
  sessionManager: AIWorkspaceManager; // AI workspace isolation + multi-instance support
  operationEngine: AtomicOperationEngine; // Two-phase commit for atomicity
  ui: SharedUIComponents;           // React shared components for Ink CLI + Web Dashboard
}
```

### Reference Project Integration

| Project | Core Technology | Adopted Features | Enhancements |
|---------|----------------|------------------|--------------|
| **ClaudePoint** | MCP + Hooks + Full snapshots | Automation & integration capabilities | AI workspace isolation |
| **ccundo** | Session parsing + Operation-level recovery | Fine-grained undo + preview functionality | Multi-instance support |
| **Rewind-MCP** | Stack-based checkpoints + Multi-file recovery | Intuitive simplicity & fast recovery | Enhanced extensibility |
| **ccheckpoints** | Hooks + Web Dashboard + SQLite | Visualization & user experience | LevelDB optimization |

## Project Structure

```
zcu/
├── apps/
│   ├── cli/              # Ink CLI Application
│   │   ├── src/
│   │   │   ├── index.ts  # CLI entry point
│   │   │   └── commands/ # Command handlers
│   │   ├── package.json  # Dependencies & scripts
│   │   ├── tsconfig.json
│   │   ├── eslint.config.ts
│   │   └── lint-staged.config.ts
│   └── web/              # Web Dashboard  
│       ├── src/
│       │   ├── pages/    # Dashboard pages
│       │   ├── components/
│       │   └── api/
│       └── package.json
├── packages/
│   ├── core/             # Core Logic
│   │   ├── src/
│   │   │   ├── storage/  # LevelDB + Shadow Repository
│   │   │   ├── session/  # AI workspace management
│   │   │   ├── engine/   # Atomic operation engine
│   │   │   ├── hooks/    # Claude Code hooks integration
│   │   │   └── commands/ # Core command implementations
│   │   └── package.json
│   ├── ui/               # Shared UI Components
│   │   ├── src/
│   │   │   ├── components/ # React components
│   │   │   ├── adapters/   # Ink & Web rendering adapters
│   │   │   └── hooks/      # Shared React hooks
│   │   └── package.json
│   ├── i18n/             # Multi-language Internationalization
│   │   ├── src/
│   │   │   ├── locales/    # Translation files (en, zh-CN)
│   │   │   │   ├── en/     # English translations
│   │   │   │   └── zh-CN/  # Chinese translations
│   │   │   ├── index.ts    # i18n initialization & configuration
│   │   │   └── types.ts    # Language & namespace types
│   │   └── package.json
│   ├── unocss-config/     # UnoCSS Styling Configuration
│   │   ├── src/
│   │   │   ├── index.ts    # Main configuration exports
│   │   │   └── base.ts     # Base UnoCSS setup with design system
│   │   ├── uno.config.ts   # UnoCSS configuration
│   │   └── package.json
│   └── types/            # TypeScript Type Definitions
│       ├── src/
│       │   ├── storage.ts
│       │   ├── session.ts
│       │   └── operations.ts
│       └── package.json
└── .claude/
    └── plan/
        └── zcu-development.md # This document
```

## Development Timeline

### Phase 1: Core Storage System (2-3 weeks) ✅ Architecture Complete
**Status**: Project structure, dependencies, and styling system configured

**Components**:
- ✅ LevelDB integration and encapsulation (`packages/core/src/storage/leveldb-manager.ts`)
- ✅ Shadow Repository implementation (`packages/core/src/storage/shadow-repository.ts`)
- ✅ Basic CLI framework (`apps/cli/src/index.ts`)
- ✅ Multi-language i18n support (`packages/i18n/src/index.ts`)
- ✅ Translation files for English and Chinese (`packages/i18n/src/locales/`)
- ✅ UnoCSS styling configuration (`packages/unocss-config/src/base.ts`)
- ✅ Shadcn/ui integration with UnoCSS preset (`unocss-preset-shadcn`)
- ✅ Dependency architecture optimization (UI → unocss-config → UnoCSS)

**Next Steps**:
- [ ] Implement LevelDB operations
- [ ] Create Shadow Repository with Git integration
- [ ] Basic checkpoint creation functionality
- [ ] Integrate i18n into CLI commands and error messages

### Phase 2: AI Workspace Isolation (2-4 weeks)
**Components**:
- [ ] Session management system (`packages/core/src/session/workspace-manager.ts`)
- [ ] Hook system integration (`packages/core/src/hooks/claude-hooks.ts`)
- [ ] Multi-instance conflict detection

**Key Features**:
- Support for multiple Claude instances concurrently
- Intelligent filtering for high-risk operations
- Session conflict detection and resolution

### Phase 3: Atomic Operation Engine (3-4 weeks)
**Components**:
- [ ] Two-phase commit implementation
- [ ] Core command implementations (undo/redo/checkpoint)
- [ ] Operation result handling

**Key Features**:
- Guaranteed atomicity for undo/redo operations  
- Data safety through backup mechanisms
- Error recovery and rollback capabilities

### Phase 4: Shared UI Architecture (3-4 weeks)
**Components**:
- [ ] React shared component library
- [ ] Ink CLI interface implementation
- [ ] Web Dashboard (optional for MVP)

**Key Features**:
- Platform-agnostic React components
- Dual rendering for CLI and Web
- Interactive CLI experience with Ink

## Technical Dependencies

### Catalog Configuration
```yaml
# pnpm-workspace.yaml catalogs
catalogs:
  cli: # Build & development tools
    typescript: ^5.9.2
    unbuild: ^3.6.1
    vite: ^7.1.4
    
  ui: # UI & styling libraries
    react: ^19.1.1
    ink: ^6.2.3
    chalk: ^5.6.0
    commander: ^14.0.0
    classic-level: ^3.0.0
    simple-git: ^3.28.0
    '@radix-ui/react-*': ^1.2.x # Radix UI components
    '@unocss/postcss': ^66.5.0
    '@unocss/preset-icons': ^66.5.0
    '@unocss/reset': ^66.5.0
    '@unocss/vite': ^66.5.0
    unocss: ^66.5.0
    unocss-preset-shadcn: ^1.0.1
    class-variance-authority: ^0.7.1
    clsx: ^2.1.1
    tailwind-merge: ^3.3.1
    lucide-react: ^0.542.0
    
  utils: # Utility libraries
    i18next: ^25.4.2
    i18next-fs-backend: ^2.7.0
    pathe: ^1.1.2
    
  types: # Type definitions
    '@types/node': ^24.3.1
    '@types/react': ^19.1.12
```

### Core Dependencies
- **`classic-level`**: LevelDB database (~200KB, zero-config)
- **`ink`**: React CLI framework
- **`simple-git`**: Git operations wrapper
- **`commander`**: CLI command parsing
- **`chalk`**: Terminal color output
- **`enquirer`**: Interactive CLI components
- **`i18next`**: Internationalization framework for multi-language support
- **`i18next-fs-backend`**: File system backend for loading translation files
- **`pathe`**: Cross-platform path utilities
- **`unocss`**: Utility-first CSS engine for rapid UI development
- **`unocss-preset-shadcn`**: Shadcn/ui integration preset for modern component styling
- **`@radix-ui/react-*`**: Comprehensive accessible React component primitives

## MVP Definition (Minimum Viable Product)

### Core Functionality
- ✅ `zcu cp [name]` - Create checkpoint
- ✅ `zcu undo` - Undo most recent operation
- ✅ `zcu redo` - Redo previously undone operation  
- ✅ `zcu list` - Display checkpoint list
- ✅ `zcu restore <name>` - Restore to specific checkpoint
- ✅ `zcu status` - Show workspace status

### Technical Requirements
- ✅ LevelDB lightweight storage
- ✅ Shadow Repository file management
- ✅ Basic AI workspace isolation
- ✅ Ink CLI interface
- ✅ Two-phase commit safety guarantees
- ✅ Multi-language support (English/Chinese)

## Key Insights from Reference Projects

### Technical Insights
- **Shadow Repository design is key breakthrough**: Resolves core contradiction between state isolation and Git integration
- **AI hallucination issues cannot be ignored**: Must maintain user control, AI only assists
- **Session isolation is core for multi-party collaboration**: Distinguish different AI operations through instance ID
- **Two-phase commit ensures data safety**: Borrow database transaction mechanisms to ensure operation atomicity

### Implementation Priorities
1. **Core Architecture MVP**: LevelDB + Shadow Repository basic architecture
2. **Session Isolation Mechanism**: AI workspace isolation + Hook integration
3. **Shared UI Architecture**: React + Ink dual rendering architecture

## Current Status

### Completed ✅
- [x] Analyzed brainstorming document and extracted core architecture requirements
- [x] Deep research into four reference projects' technical implementations
- [x] Designed ZCU core architecture solution
- [x] Created detailed development plan  
- [x] Corrected project structure naming conventions
- [x] Configured all dependencies according to monorepo standards
- [x] Configured eslint/ts/lint-staged for each sub-package
- [x] Created CLI entry file with command structure
- [x] Implemented i18n multi-language support package
- [x] Created translation files for English (en) and Chinese (zh-CN)
- [x] Configured i18next with file system backend for translation loading

### Next Steps 🚀
1. **Implement LevelDB Manager**: Core storage layer with KV operations
2. **Create Shadow Repository**: Git-based file snapshot management
3. **Develop Core Commands**: Basic undo/redo/checkpoint functionality
4. **Add Session Management**: AI workspace isolation capabilities

## Notes for Future Development

### Performance Considerations
- LevelDB vs SQLite performance comparison needed with specific benchmark tests
- Ink UI complex interaction capabilities need verification for complex tables and charts
- Shadow Repository performance with GB-scale projects
- Cross-platform compatibility details for Windows/Mac/Linux environments

### Recommended Future Brainstorming Techniques
- **Prototype-driven design meetings**: Verify core technical assumptions through rapid prototypes
- **User scenario analysis meetings**: Deep analysis of different developers' use cases and requirements  
- **Technical risk assessment meetings**: Systematic assessment of potential risks for each technical choice

## Recent Architecture Updates

### Design System & Styling Architecture (2025-09-07)

**Completed**:
- ✅ **UnoCSS Configuration Package**: Created centralized styling configuration (`packages/unocss-config`)
- ✅ **Shadcn/ui Integration**: Added `unocss-preset-shadcn@1.0.1` for modern React component styling
- ✅ **Dependency Architecture Optimization**: Established clean dependency hierarchy
  - UI Library → UnoCSS Config → UnoCSS Core
  - Eliminated redundant dependencies and circular references
- ✅ **Design System Foundation**: Implemented comprehensive design tokens and utility classes
- ✅ **Catalog Classification**: Organized all styling dependencies under `ui` catalog for better management

**Key Improvements**:
- **Performance**: On-demand CSS generation with UnoCSS
- **Maintainability**: Centralized styling configuration across all packages
- **Developer Experience**: Type-safe utility classes with full IntelliSense support
- **Consistency**: Shared design system between CLI (Ink) and Web interfaces
- **Modern Stack**: Integration with Shadcn/ui for production-ready component styling

**Technical Implementation**:
```typescript
// packages/unocss-config/src/base.ts - Unified styling configuration
export function unocssBase(config: UserConfig = {}): UserConfig {
  return mergeConfigs([baseConfig, config])
}

// Presets: Wind4 + Typography + Icons + Shadcn
// Usage: Web App → import config from '@ufomiao/unocss-config'
```

**Architecture Benefits**:
- Zero redundant dependencies (UI lib doesn't directly depend on UnoCSS)
- Consistent theming across CLI and Web applications  
- Type-safe component variants with `class-variance-authority`
- Seamless Radix UI + UnoCSS integration via Shadcn preset

---

**Generated by**: ZCU Development Planning Session  
**Framework**: Fusion Architecture combining ClaudePoint + ccundo + Rewind-MCP + ccheckpoints  
**Version**: v1.2  
**Last Updated**: 2025-09-07 (Added UnoCSS design system & styling architecture)