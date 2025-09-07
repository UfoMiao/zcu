[Root Directory](../../CLAUDE.md) > [packages](../) > **eslint-config**

# ZCU ESLint Config Package

> 🔧 **Code Quality Standards** - Comprehensive ESLint configurations for different project types

## Changelog

- **2025-09-07 21:26:40**: Create module documentation, define ESLint architecture
- **2025-09-07**: Implement multi-variant ESLint configurations (library, React app, React library)

## Module Responsibility

ZCU ESLint Config provides a comprehensive set of ESLint configurations tailored for different project types within the ZCU monorepo. Built on top of `@antfu/eslint-config` with customizations for library, React applications, and React libraries.

### Core Features
- **Multi-Variant**: Configurations for library, React app, and React library projects
- **TypeScript-First**: Full TypeScript support with strict type checking
- **React Integration**: Specialized rules for React applications and libraries
- **Consistent Standards**: Unified code style across the entire monorepo

## Entry Points & Startup

### Main Entry
- **File**: `src/index.ts`
- **Purpose**: Re-export all configuration variants
- **Usage**: `import config from '@ufomiao/eslint-config/{variant}'`

### Configuration Variants
```typescript
// Available configurations
export {
  base,          // Base configuration for general TypeScript projects
  library,       // Library-specific configuration
  reactApp,      // React application configuration
  reactLibrary   // React library configuration
}
```

## External Interfaces

### Configuration Variants

| Export | Target | Description | Usage |
|--------|--------|-------------|-------|
| `base` | General TS | Base TypeScript configuration | General projects |
| `library` | Libraries | Node.js library configuration | `packages/core`, `packages/types` |
| `reactApp` | React Apps | React application with DOM | `apps/web` |
| `reactLibrary` | React Libs | React component libraries | `packages/ui` |

### Usage Examples

```javascript
// For library packages (packages/core, packages/types, etc.)
import config from '@ufomiao/eslint-config/library'
export default config

// For React applications (apps/web)
import config from '@ufomiao/eslint-config/react-app'
export default config

// For React component libraries (packages/ui)
import config from '@ufomiao/eslint-config/react-library'
export default config
```

## Key Dependencies & Configuration

### Core Dependencies
```json
{
  "dependencies": {
    "@antfu/eslint-config": "catalog:cli",           // Base configuration
    "@eslint-react/eslint-plugin": "catalog:cli",    // Modern React linting
    "eslint-plugin-react-hooks": "catalog:cli",      // React hooks rules
    "eslint-plugin-react-refresh": "catalog:cli",    // React refresh support
    "defu": "catalog:utils"                          // Configuration merging
  }
}
```

### Dev Dependencies
```json
{
  "devDependencies": {
    "eslint": "catalog:cli",                         // ESLint core
    "typescript": "catalog:cli",                     // TypeScript support
    "unbuild": "catalog:cli"                         // Build tool
  }
}
```

### Base Configuration Features
- **@antfu/eslint-config**: Modern, opinionated ESLint configuration
- **TypeScript**: Full TypeScript support with type-aware linting
- **Auto-fixing**: Automatic code formatting and error fixing
- **Import Sorting**: Consistent import organization

## Data Models

### Configuration Structure

```typescript
// Base configuration interface
interface ESLintConfig {
  extends?: string[]
  plugins?: string[]
  rules?: Record<string, any>
  parser?: string
  parserOptions?: {
    ecmaVersion?: number
    sourceType?: 'module' | 'script'
    ecmaFeatures?: {
      jsx?: boolean
    }
  }
  env?: Record<string, boolean>
  settings?: Record<string, any>
}
```

### Rule Categories

```typescript
// Rule organization
interface RuleCategories {
  typescript: {
    '@typescript-eslint/no-unused-vars': 'error'
    '@typescript-eslint/explicit-function-return-type': 'off'
    // ... other TypeScript rules
  }
  react: {
    'react/react-in-jsx-scope': 'off'
    'react-hooks/rules-of-hooks': 'error'
    'react-hooks/exhaustive-deps': 'warn'
    // ... other React rules
  }
  imports: {
    'import/order': ['error', { /* import sorting config */ }]
    'import/no-unresolved': 'error'
    // ... other import rules
  }
}
```

## Testing & Quality

### Test Structure
```
test/
├── configs.test.ts      # Configuration loading tests
├── rules.test.ts        # Rule validation tests
└── integration.test.ts  # Integration with real files
```

### Testing Strategy
- **Configuration Loading**: Verify all config variants load correctly
- **Rule Validation**: Test that rules are properly applied
- **Integration Tests**: Test with sample TypeScript/React code
- **Backwards Compatibility**: Ensure configs work with different ESLint versions

### Quality Assurance
- **Self-Linting**: This package follows its own ESLint configuration
- **Rule Documentation**: Each custom rule is documented
- **Version Compatibility**: Tested with supported ESLint/TypeScript versions

## FAQ

### Q: Which configuration should I use?

A: Choose based on your project type:
- **packages/core, packages/types**: Use `library`
- **apps/web**: Use `react-app`
- **packages/ui**: Use `react-library`
- **CLI tools**: Use `base`

### Q: How do I customize rules for my project?

A: Extend the configuration:
```javascript
import config from '@ufomiao/eslint-config/library'

export default [
  ...config,
  {
    rules: {
      // Your custom rules here
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
]
```

### Q: Why not use one universal configuration?

A: Different project types have different needs:
- **Libraries**: Need stricter rules, no DOM globals
- **React Apps**: Need DOM globals, React-specific rules
- **CLI Tools**: Need Node.js globals, different import patterns

### Q: How often are rules updated?

A: Configuration updates follow:
1. **Major Updates**: With ESLint/TypeScript major releases
2. **Minor Updates**: Monthly rule refinements
3. **Patch Updates**: Bug fixes and compatibility updates
4. **Breaking Changes**: Only with major version bumps

## Related File List

### Source Files
- `src/index.ts` - Main export file with all configurations
- `src/base.ts` - Base TypeScript configuration
- `src/library.ts` - Library-specific configuration
- `src/react-app.ts` - React application configuration
- `src/react-library.ts` - React library configuration

### Configuration Files
- `package.json` - Package config with ESLint dependencies
- `tsconfig.json` - TypeScript configuration for build
- `build.config.ts` - Unbuild configuration
- `eslint.config.js` - Self-linting configuration (uses base)

### Build Output
- `dist/index.mjs` - ESM exports for all configurations
- `dist/base.mjs` - Base configuration
- `dist/library.mjs` - Library configuration
- `dist/react-app.mjs` - React app configuration
- `dist/react-library.mjs` - React library configuration

---

*📍 This document reflects the module state at 2025-09-07 21:26:40 - Multi-variant ESLint configurations implemented*