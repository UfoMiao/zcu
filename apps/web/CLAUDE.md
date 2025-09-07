[Root Directory](../../CLAUDE.md) > [apps](../) > **web**

# ZCU Web Application

> 🌐 **ZCU Web Control Panel** - React-based web interface for visual ZCU management

## Changelog

- **2025-09-07 21:26:40**: Create module documentation, define Web app architecture
- **2025-09-07**: Initialize project structure and dependencies

## Module Responsibility

ZCU Web is the visual control panel for the ZCU system, providing a user-friendly web interface for managing checkpoints, visualizing file changes, and performing undo/redo operations through a graphical interface.

### Core Features
- **Visual Dashboard**: Overview of workspace status and recent operations
- **Checkpoint Management**: Create, browse, and restore checkpoints with visual diff
- **File Change Visualization**: Interactive file tree with change highlights
- **Operation History**: Timeline view of all operations with rollback capabilities

## Entry Points & Startup

### Main Entry
- **File**: `src/index.ts`
- **Launch Methods**: 
  - Development mode: `pnpm dev` (planned)
  - Production build: `pnpm build` → static files

### Application Architecture
```typescript
// Planned structure
App
├── Dashboard (workspace overview)
├── CheckpointManager (checkpoint CRUD)
├── FileExplorer (file tree with changes)
├── OperationHistory (timeline view)
└── Settings (configuration panel)
```

## External Interfaces

### Planned Routes

| Route | Component | Description | Status |
|-------|-----------|-------------|--------|
| `/` | Dashboard | Main dashboard with workspace overview | 🎯 Planned |
| `/checkpoints` | CheckpointList | List and manage checkpoints | 🎯 Planned |
| `/checkpoints/:id` | CheckpointDetail | Detailed checkpoint view with diff | 🎯 Planned |
| `/history` | OperationHistory | Timeline of all operations | 🎯 Planned |
| `/files` | FileExplorer | Interactive file tree browser | 🎯 Planned |
| `/settings` | Settings | Application configuration | 🎯 Planned |

### API Integration
- **Backend**: Integration with `@ufomiao/core` package
- **Real-time**: WebSocket connection for live updates (planned)
- **REST API**: RESTful endpoints for CRUD operations (planned)

## Key Dependencies & Configuration

### Core Dependencies
```json
{
  "dependencies": {
    "@ufomiao/core": "workspace:*",      // Core logic engine
    "@ufomiao/ui": "workspace:*",        // Shared UI components
    "@ufomiao/types": "workspace:*",     // Type definitions
    "react": "catalog:ui",               // React framework
    "react-dom": "catalog:ui"            // React DOM renderer
  }
}
```

### Dev Dependencies
```json
{
  "devDependencies": {
    "@ufomiao/eslint-config": "workspace:*",     // ESLint config
    "@ufomiao/tsconfig": "workspace:*",          // TypeScript config
    "@ufomiao/unocss-config": "workspace:*",     // UnoCSS styling
    "@vitejs/plugin-react": "catalog:ui",        // Vite React plugin
    "typescript": "catalog:cli",                 // TypeScript compiler
    "vite": "catalog:cli"                        // Build tool
  }
}
```

### Build Configuration
- **Build Tool**: Vite (fast development server and build)
- **Styling**: UnoCSS with custom configuration
- **Output**: Static files for deployment

## Data Models

### Component State Types

```typescript
// Dashboard state
interface DashboardState {
  workspaceStatus: WorkspaceState
  recentOperations: OperationRecord[]
  checkpointCount: number
  totalFiles: number
}

// Checkpoint list state
interface CheckpointListState {
  checkpoints: CheckpointData[]
  loading: boolean
  selectedIds: string[]
  sortBy: 'date' | 'name'
  sortOrder: 'asc' | 'desc'
}
```

### API Response Types

```typescript
// Planned API response types
interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
  timestamp: number
}

interface CheckpointApiResponse extends ApiResponse<CheckpointData[]> {}
interface OperationApiResponse extends ApiResponse<OperationRecord[]> {}
```

## Testing & Quality

### Test Structure (Planned)
```
test/
├── components/          # Component unit tests
│   ├── Dashboard.test.tsx
│   ├── CheckpointList.test.tsx
│   └── FileExplorer.test.tsx
├── hooks/              # Custom hooks tests
├── utils/              # Utility function tests
└── integration/        # Integration tests
```

### Testing Strategy
- **Component Tests**: React Testing Library for UI components
- **Integration Tests**: API integration and data flow testing
- **E2E Tests**: Playwright for end-to-end user workflows (future)

### Quality Tools
- **ESLint**: Code standard checking (`@ufomiao/eslint-config/react-app`)
- **TypeScript**: Type checking
- **UnoCSS**: Utility-first CSS with design system consistency

## FAQ

### Q: How is this different from the CLI?

A: The Web app provides:
- Visual interface for users who prefer GUI
- Better visualization of file changes and diffs
- Bulk operations and advanced filtering
- Integration with external tools and services

### Q: Will it replace the CLI?

A: No, both interfaces serve different use cases:
- CLI: Fast, scriptable, developer-focused
- Web: Visual, exploratory, team collaboration

### Q: How does it communicate with the core?

A: Planned architecture:
1. Direct integration with `@ufomiao/core` package
2. Future: REST API layer for remote access
3. WebSocket for real-time updates

## Related File List

### Source Files (Planned)
- `src/index.ts` - Application entry point
- `src/App.tsx` - Root component
- `src/components/` - React components
- `src/hooks/` - Custom React hooks
- `src/utils/` - Utility functions
- `src/styles/` - Styling and themes

### Configuration Files
- `package.json` - Package config and dependencies
- `tsconfig.json` - TypeScript config (extends `@ufomiao/tsconfig/react-app`)
- `eslint.config.ts` - ESLint config (extends `@ufomiao/eslint-config/react-app`)
- `vite.config.ts` - Vite build configuration (planned)

### Build Output (Future)
- `dist/` - Static build files
- `dist/index.html` - Main HTML file
- `dist/assets/` - JS/CSS bundles

---

*📍 This document reflects the module state at 2025-09-07 21:26:40 - Web app structure planned, implementation pending*