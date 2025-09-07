[Root Directory](../../CLAUDE.md) > [packages](../) > **ui**

# ZCU UI Package

> 🎨 **Cross-platform UI Components** - Shared React UI component library for CLI and Web interfaces

## Changelog

- **2025-09-07 21:26:40**: Create module documentation, define UI component architecture
- **2025-09-07**: Initialize package structure with Radix UI and design system dependencies

## Module Responsibility

ZCU UI provides a comprehensive component library that works across both CLI (via Ink) and Web environments. Built on top of Radix UI primitives with custom styling using UnoCSS and tailwind-merge for consistent design system implementation.

### Core Features
- **Cross-Platform**: Components work in both CLI (Ink) and Web (React) environments
- **Design System**: Consistent styling with class-variance-authority (CVA)
- **Accessibility**: Built on Radix UI primitives for excellent a11y support
- **Interactive**: Rich components for CLI interactions (selectors, inputs, progress bars)

## Entry Points & Startup

### Main Entry
- **File**: `src/index.ts`
- **Purpose**: Export all UI components and utilities
- **Usage**: `import { Button, Select, InteractiveList } from '@ufomiao/ui'`

### Component Organization
```typescript
// Component structure (planned)
UI
├── components/
│   ├── primitives/     // Basic building blocks
│   ├── interactive/    // CLI-specific interactive components
│   ├── forms/         // Form components
│   └── layout/        // Layout and container components
├── hooks/             // Custom React hooks
└── utils/            // Styling and utility functions
```

## External Interfaces

### Primitive Components (Planned)

| Component | Description | Environment | Status |
|-----------|-------------|-------------|--------|
| `Button` | Interactive button with variants | CLI + Web | 🎯 Planned |
| `Input` | Text input with validation | CLI + Web | 🎯 Planned |
| `Select` | Dropdown selection component | CLI + Web | 🎯 Planned |
| `Checkbox` | Boolean input component | CLI + Web | 🎯 Planned |
| `Dialog` | Modal dialog component | CLI + Web | 🎯 Planned |

### Interactive Components (CLI-specific)

| Component | Description | Use Case | Status |
|-----------|-------------|----------|--------|
| `InteractiveList` | Multi-select list with keyboard nav | Operation selection | 🎯 Planned |
| `ProgressBar` | Progress indicator for long operations | File processing | 🎯 Planned |
| `FileTree` | Interactive file system browser | File selection | 🎯 Planned |
| `ConfirmPrompt` | Yes/No confirmation dialog | Dangerous operations | 🎯 Planned |
| `Spinner` | Loading indicator | Async operations | 🎯 Planned |

### Layout Components

| Component | Description | Purpose | Status |
|-----------|-------------|---------|--------|
| `Box` | Flexible container | Layout building block | 🎯 Planned |
| `Stack` | Vertical/horizontal stack layout | Component spacing | 🎯 Planned |
| `Grid` | CSS Grid wrapper | Complex layouts | 🎯 Planned |
| `Card` | Content container with styling | Information grouping | 🎯 Planned |

## Key Dependencies & Configuration

### UI Dependencies
```json
{
  "dependencies": {
    "@ufomiao/types": "workspace:*",             // Type definitions
    "@ufomiao/unocss-config": "workspace:*",     // Styling configuration
    "react": "catalog:ui",                       // React runtime
    
    // Radix UI Primitives
    "@radix-ui/react-accordion": "catalog:ui",
    "@radix-ui/react-alert-dialog": "catalog:ui",
    "@radix-ui/react-avatar": "catalog:ui",
    "@radix-ui/react-checkbox": "catalog:ui",
    "@radix-ui/react-dialog": "catalog:ui",
    "@radix-ui/react-dropdown-menu": "catalog:ui",
    "@radix-ui/react-select": "catalog:ui",
    // ... other Radix components
    
    // Styling and Utilities
    "class-variance-authority": "catalog:ui",    // Component variants
    "clsx": "catalog:ui",                       // Conditional classes
    "tailwind-merge": "catalog:ui",             // Class deduplication
    "lucide-react": "catalog:ui",               // Icon library
    
    // CLI-specific
    "ink": "catalog:ui",                        // React CLI framework
    "enquirer": "catalog:ui"                    // CLI prompts
  }
}
```

### Dev Dependencies
```json
{
  "devDependencies": {
    "@antfu/utils": "catalog:inlined",          // Utility functions
    "@types/node": "catalog:types",             // Node.js types
    "@types/react": "catalog:types",            // React types
    "@ufomiao/eslint-config": "workspace:*",    // ESLint config
    "@ufomiao/tsconfig": "workspace:*",         // TypeScript config
    "@unocss/vite": "catalog:ui",               // UnoCSS Vite plugin
    "typescript": "catalog:cli",                // TypeScript compiler
    "unbuild": "catalog:cli",                   // Build tool
    "unocss": "catalog:ui",                     // CSS engine
    "vitest": "catalog:testing"                 // Testing framework
  }
}
```

## Data Models

### Component Variant System

```typescript
// Using class-variance-authority (CVA)
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline'
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
)

type ButtonProps = VariantProps<typeof buttonVariants>
```

### CLI Component Props

```typescript
// Interactive list component
interface InteractiveListProps {
  items: Array<{
    id: string
    label: string
    description?: string
    disabled?: boolean
  }>
  multiple?: boolean
  onSelect: (selected: string[]) => void
  onCancel?: () => void
  searchable?: boolean
  maxHeight?: number
}

// File tree component
interface FileTreeProps {
  rootPath: string
  selectedPaths: string[]
  onPathSelect: (paths: string[]) => void
  showHidden?: boolean
  expandedPaths?: string[]
  onPathExpand?: (path: string) => void
}
```

## Testing & Quality

### Test Structure (Planned)
```
test/
├── components/         # Component unit tests
│   ├── Button.test.tsx
│   ├── InteractiveList.test.tsx
│   └── FileTree.test.tsx
├── hooks/             # Custom hooks tests
├── utils/             # Utility function tests
└── integration/       # Cross-platform tests
    ├── cli.test.tsx   # Ink rendering tests
    └── web.test.tsx   # DOM rendering tests
```

### Testing Strategy
- **Component Tests**: React Testing Library for component behavior
- **Visual Tests**: Storybook stories for component documentation
- **CLI Tests**: Ink testing utilities for CLI component rendering
- **Cross-platform**: Ensure components work in both environments

### Quality Tools
- **ESLint**: React-specific rules (`@ufomiao/eslint-config/react-library`)
- **TypeScript**: Strict typing for props and component APIs
- **UnoCSS**: Consistent styling with design tokens

## FAQ

### Q: How do components work in both CLI and Web?

A: Component adaptation strategy:
1. **Shared Logic**: Common component logic and props
2. **Conditional Rendering**: Detect environment (Ink vs DOM)
3. **Platform Adapters**: Different renderers for CLI and Web
4. **Styling**: UnoCSS works in both environments

### Q: What's the relationship with Radix UI?

A: Radix UI integration:
- **Web Components**: Built on Radix primitives
- **CLI Components**: Custom implementations with similar APIs
- **Accessibility**: Inherit Radix's accessibility features for web
- **Consistency**: Shared component patterns and behaviors

### Q: How is styling handled?

A: Styling approach:
- **UnoCSS**: Utility-first CSS with design tokens
- **CVA**: Component variants with TypeScript support
- **Tailwind Merge**: Automatic class deduplication
- **Theme System**: Consistent colors, spacing, and typography

### Q: Can I use these components outside ZCU?

A: Yes, designed for reusability:
- **Generic Components**: Not tied to ZCU-specific logic
- **TypeScript**: Full type support for external consumption
- **Documentation**: Comprehensive component docs and examples
- **Versioning**: Semantic versioning for external dependencies

## Related File List

### Source Files (Planned)
- `src/index.ts` - Main exports and component registry
- `src/components/` - Component implementations
  - `primitives/` - Basic UI building blocks
  - `interactive/` - CLI-specific interactive components
  - `forms/` - Form and input components
  - `layout/` - Layout and container components
- `src/hooks/` - Custom React hooks for common patterns
- `src/utils/` - Styling utilities and helpers
- `src/styles/` - Design tokens and global styles

### Configuration Files
- `package.json` - Package config with comprehensive UI dependencies
- `tsconfig.json` - TypeScript config (extends `@ufomiao/tsconfig/react-library`)
- `eslint.config.ts` - ESLint config (extends `@ufomiao/eslint-config/react-library`)
- `build.config.ts` - Unbuild configuration for component building
- `vitest.config.ts` - Test configuration with UI testing setup

### Build Output
- `dist/index.mjs` - ESM component exports
- `dist/index.d.mts` - TypeScript declarations
- `dist/components/` - Individual component builds
- `dist/styles/` - CSS build output

---

*📍 This document reflects the module state at 2025-09-07 21:26:40 - UI architecture planned, component system design established*