[Root Directory](../../CLAUDE.md) > [packages](../) > **tsconfig**

# ZCU TypeScript Config Package

> ⚙️ **TypeScript Configuration Templates** - Shared TypeScript configurations for different project types

## Changelog

- **2025-09-07 21:26:40**: Create module documentation, define TypeScript config architecture
- **2025-09-07**: Implement multiple TypeScript configurations (base, library, React app, React library)

## Module Responsibility

ZCU TypeScript Config provides a collection of TypeScript configuration templates optimized for different project types within the ZCU monorepo. Each configuration is tailored for specific environments and use cases while maintaining consistency across the codebase.

### Core Features
- **Multi-Template**: Configurations for base, library, React app, and React library projects
- **Strict Type Checking**: Comprehensive type safety with modern TypeScript features
- **Path Mapping**: Consistent module resolution across the monorepo
- **Build Optimization**: Optimized compilation settings for different targets

## Entry Points & Startup

### Configuration Templates
- **File Structure**: JSON configuration files for different project types
- **Usage**: Referenced via `extends` in project `tsconfig.json` files
- **Inheritance**: Hierarchical configuration with base settings

### Template Organization
```
templates/
├── base.json           # Base TypeScript configuration
├── library.json        # Library-specific settings
├── react-app.json      # React application configuration
├── react-library.json  # React library configuration
└── node.json          # Node.js specific settings
```

## External Interfaces

### Configuration Templates

| Template | Target | Description | Extends | Usage |
|----------|--------|-------------|---------|-------|
| `base.json` | General | Base TypeScript settings | - | Foundation for all configs |
| `library.json` | Libraries | Node.js library settings | `base.json` | `packages/core`, `packages/types` |
| `react-app.json` | React Apps | React application with DOM | `base.json` | `apps/web` |
| `react-library.json` | React Libs | React component libraries | `library.json` | `packages/ui` |
| `node.json` | Node Apps | Node.js applications | `base.json` | `apps/cli` |

### Usage Examples

```json
// For library packages (packages/core, packages/types)
{
  "extends": "@ufomiao/tsconfig/library",
  "compilerOptions": {
    // Project-specific overrides
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "node_modules"]
}

// For React applications (apps/web)
{
  "extends": "@ufomiao/tsconfig/react-app",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

## Key Dependencies & Configuration

### Dev Dependencies
```json
{
  "devDependencies": {
    "typescript": "catalog:cli",                     // TypeScript compiler
    "vite": "catalog:cli"                           // For Vite-specific settings
  }
}
```

### Base Configuration Features
- **Strict Mode**: Comprehensive strict type checking enabled
- **Modern Target**: ES2022 target with modern language features
- **Module Resolution**: Node.js module resolution with ESM support
- **Source Maps**: Development-friendly source map generation

## Data Models

### Base Configuration

```json
// base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "allowJs": false,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Library Configuration

```json
// library.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2022"],
    "declaration": true,
    "declarationMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["dist", "**/*.test.*", "**/*.spec.*"]
}
```

### React Application Configuration

```json
// react-app.json
{
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "allowJs": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

### React Library Configuration

```json
// react-library.json
{
  "extends": "./library.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx"
  }
}
```

## Testing & Quality

### Validation Strategy
- **Configuration Validation**: Ensure all templates are valid TypeScript configs
- **Inheritance Testing**: Verify configuration inheritance works correctly
- **Compilation Testing**: Test compilation with sample projects
- **IDE Integration**: Ensure configurations work well with VS Code

### Quality Assurance
- **Self-Testing**: All configurations tested with real project scenarios
- **Version Compatibility**: Tested with supported TypeScript versions
- **Performance**: Optimized for fast compilation and type checking

## FAQ

### Q: Which configuration should I use?

A: Choose based on your project type:
- **packages/core, packages/types, packages/i18n**: Use `library`
- **apps/web**: Use `react-app` 
- **packages/ui**: Use `react-library`
- **apps/cli**: Use `node` (extends base with Node.js types)

### Q: How do I customize compiler options?

A: Extend and override in your project's `tsconfig.json`:
```json
{
  "extends": "@ufomiao/tsconfig/library",
  "compilerOptions": {
    "strict": false,           // Override strict mode
    "baseUrl": ".",           // Add base URL
    "paths": {                // Add path mapping
      "@/*": ["src/*"]
    }
  }
}
```

### Q: Why are configurations split by project type?

A: Different projects have different needs:
- **Libraries**: Need declaration files, no DOM types
- **React Apps**: Need DOM types, JSX support, no declaration files
- **Node Apps**: Need Node.js types, different module resolution

### Q: How do I handle path mapping in a monorepo?

A: Use workspace-relative paths:
```json
{
  "compilerOptions": {
    "paths": {
      "@ufomiao/core": ["../packages/core/src"],
      "@ufomiao/types": ["../packages/types/src"]
    }
  }
}
```

### Q: Are these configurations compatible with build tools?

A: Yes, optimized for:
- **Vite**: Modern bundler-style module resolution
- **Unbuild**: Library building with declaration generation
- **TSX**: Direct TypeScript execution
- **VS Code**: Enhanced IDE experience

## Related File List

### Configuration Templates
- `base.json` - Base TypeScript configuration for all projects
- `library.json` - Library-specific configuration (extends base)
- `react-app.json` - React application configuration (extends base)
- `react-library.json` - React library configuration (extends library)
- `node.json` - Node.js application configuration (extends base)

### Package Files
- `package.json` - Package configuration and TypeScript dependency
- `README.md` - Usage documentation and examples

### Reference Examples
- `examples/` - Sample `tsconfig.json` files for each template (planned)
  - `library-example.json` - Example library configuration
  - `react-app-example.json` - Example React app configuration
  - `react-library-example.json` - Example React library configuration

---

*📍 This document reflects the module state at 2025-09-07 21:26:40 - Multiple TypeScript configuration templates implemented*