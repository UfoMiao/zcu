[Root Directory](../../CLAUDE.md) > [packages](../) > **unocss-config**

# ZCU UnoCSS Config Package

> 🎨 **Utility-First CSS Configuration** - Comprehensive UnoCSS setup with design system and theming

## Changelog

- **2025-09-07 21:26:40**: Create module documentation, define UnoCSS architecture
- **2025-09-07**: Initialize UnoCSS configuration with design system foundation

## Module Responsibility

ZCU UnoCSS Config provides a comprehensive UnoCSS configuration tailored for the ZCU ecosystem, enabling utility-first CSS with a consistent design system across both CLI (Ink) and Web interfaces. Includes custom presets, theme configuration, and design tokens.

### Core Features
- **Design System**: Consistent colors, typography, spacing, and component styles
- **Multi-Platform**: Optimized for both web and CLI environments
- **Custom Presets**: ZCU-specific utility classes and components
- **Theme Support**: Dark/light mode with CSS custom properties
- **Icon Integration**: Comprehensive icon support with Lucide and custom icons

## Entry Points & Startup

### Main Entry
- **File**: `src/index.ts`
- **Purpose**: Export UnoCSS configuration for different project types
- **Usage**: `import config from '@ufomiao/unocss-config'`

### Configuration Structure
```typescript
// UnoCSS configuration exports
export {
  base,          // Base UnoCSS configuration
  web,           // Web-optimized configuration
  cli,           // CLI/Ink-optimized configuration (planned)
}
```

## External Interfaces

### Configuration Variants

| Export | Target | Description | Features | Usage |
|--------|--------|-------------|----------|-------|
| `base` | General | Base UnoCSS configuration | Core utilities, theme | Foundation config |
| `web` | Web Apps | Web-optimized configuration | DOM utilities, transitions | React applications |
| `cli` | CLI Apps | CLI-optimized configuration | Text-only utilities | Ink applications (planned) |

### Usage Examples

```javascript
// For web applications (apps/web, packages/ui)
import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import config from '@ufomiao/unocss-config'

export default defineConfig({
  plugins: [
    UnoCSS(config),
    // ... other plugins
  ]
})

// For React component libraries with custom theme
import config from '@ufomiao/unocss-config'

export default {
  ...config,
  theme: {
    ...config.theme,
    colors: {
      ...config.theme.colors,
      // Custom brand colors
      brand: {
        primary: '#007acc',
        secondary: '#f39c12'
      }
    }
  }
}
```

## Key Dependencies & Configuration

### Core Dependencies
```json
{
  "dependencies": {
    "@unocss/preset-icons": "catalog:ui",        // Icon utilities
    "@unocss/reset": "catalog:ui",               // CSS reset
    "unocss": "catalog:ui",                      // Core UnoCSS
    "unocss-preset-shadcn": "catalog:ui"         // Shadcn/ui preset
  }
}
```

### Dev Dependencies
```json
{
  "devDependencies": {
    "@unocss/postcss": "catalog:ui",             // PostCSS integration
    "@unocss/vite": "catalog:ui",                // Vite plugin
    "typescript": "catalog:cli",                 // TypeScript support
    "unbuild": "catalog:cli"                     // Build tool
  }
}
```

### Preset Configuration
- **Preset Wind**: Tailwind CSS compatibility
- **Preset Icons**: Lucide icons and custom icon collections
- **Preset Shadcn**: Shadcn/ui component styling
- **Preset Typography**: Rich text formatting utilities

## Data Models

### Design System Tokens

```typescript
// Theme configuration
interface ThemeConfig {
  colors: {
    // Semantic colors
    primary: ColorScale
    secondary: ColorScale
    accent: ColorScale
    neutral: ColorScale
    
    // State colors
    success: ColorScale
    warning: ColorScale
    error: ColorScale
    info: ColorScale
    
    // Surface colors
    background: string
    foreground: string
    muted: string
    'muted-foreground': string
    
    // Border colors
    border: string
    input: string
    ring: string
  }
  
  spacing: SpacingScale
  typography: TypographyScale
  borderRadius: RadiusScale
  boxShadow: ShadowScale
}
```

### Color System

```typescript
// Color scale definition
interface ColorScale {
  50: string    // Lightest
  100: string
  200: string
  300: string
  400: string
  500: string   // Base color
  600: string
  700: string
  800: string
  900: string
  950: string   // Darkest
  
  // Semantic aliases
  DEFAULT: string        // = 500
  foreground: string     // Contrasting text color
}

// ZCU brand colors
const zcuColors = {
  brand: {
    50: '#f0f9ff',
    500: '#0ea5e9',      // ZCU primary blue
    900: '#0c4a6e',
    DEFAULT: '#0ea5e9',
    foreground: '#ffffff'
  }
}
```

### Component Utilities

```typescript
// Custom utility classes
interface CustomUtilities {
  // ZCU-specific components
  '.zcu-button': ComponentDefinition
  '.zcu-input': ComponentDefinition
  '.zcu-card': ComponentDefinition
  '.zcu-badge': ComponentDefinition
  
  // CLI-specific utilities
  '.cli-text': ComponentDefinition
  '.cli-border': ComponentDefinition
  '.cli-highlight': ComponentDefinition
}
```

### Animation System

```typescript
// Animation configuration
interface AnimationConfig {
  keyframes: {
    'fade-in': KeyframeDefinition
    'slide-in': KeyframeDefinition
    'pulse-subtle': KeyframeDefinition
    'spin-slow': KeyframeDefinition
  }
  
  animation: {
    'fade-in': string
    'slide-in-from-top': string
    'pulse-subtle': string
    'spin-slow': string
  }
}
```

## Testing & Quality

### Configuration Validation
- **Build Testing**: Ensure configurations build correctly
- **Utility Generation**: Test that all utilities are generated
- **Theme Consistency**: Verify theme tokens are applied correctly
- **Cross-Platform**: Test both web and CLI utility generation

### Quality Assurance
- **Design Token Validation**: Ensure all tokens follow design system
- **Performance**: Optimize for fast CSS generation
- **Bundle Size**: Monitor generated CSS size

## FAQ

### Q: How do I use ZCU design tokens in my component?

A: Use utility classes with design tokens:
```tsx
// Using semantic colors
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Primary Button
</button>

// Using spacing scale
<div className="p-4 m-2 gap-3">
  Content with consistent spacing
</div>

// Using typography scale
<h1 className="text-2xl font-bold tracking-tight">
  Consistent Typography
</h1>
```

### Q: How do I customize the theme for my project?

A: Extend the base configuration:
```javascript
import config from '@ufomiao/unocss-config'

export default {
  ...config,
  theme: {
    ...config.theme,
    colors: {
      ...config.theme.colors,
      // Add custom colors
      brand: {
        primary: '#custom-color',
        secondary: '#another-color'
      }
    }
  }
}
```

### Q: What's the difference between web and CLI configurations?

A: Different optimizations:
- **Web Config**: Full utilities, transitions, hover states, responsive design
- **CLI Config**: Text-focused utilities, no visual effects, optimized for terminal rendering

### Q: How do I add custom utility classes?

A: Add to the rules array:
```javascript
export default {
  rules: [
    // Custom utility: .text-brand
    ['text-brand', { color: 'var(--color-brand-primary)' }],
    
    // Pattern-based utility: .grid-cols-{n}
    [/^grid-cols-(\d+)$/, ([, d]) => ({ 'grid-template-columns': `repeat(${d}, minmax(0, 1fr))` })]
  ]
}
```

### Q: How does this work with Tailwind CSS?

A: UnoCSS provides Tailwind compatibility:
- Most Tailwind utilities work out of the box
- Additional utilities and optimizations for ZCU
- Better performance with on-demand generation
- Enhanced theming capabilities

## Related File List

### Source Files
- `src/index.ts` - Main configuration exports
- `src/base.ts` - Base UnoCSS configuration with design system
- `src/presets/` - Custom presets and utilities (planned)
  - `zcu-components.ts` - ZCU-specific component utilities
  - `cli-optimized.ts` - CLI/terminal-optimized utilities

### Configuration Files
- `package.json` - Package config with UnoCSS dependencies
- `tsconfig.json` - TypeScript configuration
- `build.config.ts` - Unbuild configuration
- `eslint.config.js` - ESLint configuration

### Build Output
- `dist/index.mjs` - ESM configuration exports
- `dist/base.mjs` - Base configuration
- `dist/index.d.mts` - TypeScript declarations

### Theme Assets (Planned)
- `assets/` - Design system assets
  - `colors.json` - Color palette definitions
  - `tokens.json` - Design token specifications
  - `icons/` - Custom icon definitions

---

*📍 This document reflects the module state at 2025-09-07 21:26:40 - UnoCSS configuration with design system foundation established*