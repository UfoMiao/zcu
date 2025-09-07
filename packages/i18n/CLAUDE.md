[Root Directory](../../CLAUDE.md) > [packages](../) > **i18n**

# ZCU i18n Package

> 🌍 **Internationalization Support** - Comprehensive i18n solution for Chinese/English bilingual interface

## Changelog

- **2025-09-07 21:26:40**: Create module documentation, define i18n architecture
- **2025-09-07**: Implement complete i18n system with Chinese/English translations

## Module Responsibility

ZCU i18n provides comprehensive internationalization support for the entire ZCU ecosystem, enabling seamless bilingual experience (Chinese and English) across CLI and Web interfaces. Built on i18next with filesystem backend for reliable translation loading.

### Core Features
- **Bilingual Support**: Complete Chinese (zh-CN) and English (en) translations
- **Namespace Organization**: Structured translations by feature areas
- **Dynamic Loading**: Efficient translation loading with fallback mechanisms
- **CLI Integration**: Seamless integration with CLI commands and messages
- **Type Safety**: TypeScript support for translation keys and functions

## Entry Points & Startup

### Main Entry
- **File**: `src/index.ts`
- **Purpose**: Initialize i18n system and export translation functions
- **Usage**: `import { initI18n, t, tc, tCli } from '@ufomiao/i18n'`

### Translation Organization
```
locales/
├── en/                  # English translations
│   ├── common.json      # Common/shared terms
│   ├── cli.json         # CLI interface messages
│   ├── commands.json    # Command descriptions
│   ├── errors.json      # Error messages (planned)
│   └── messages.json    # User messages (planned)
└── zh-CN/              # Chinese (Simplified) translations
    ├── common.json      # 通用术语
    ├── cli.json         # CLI 界面信息
    ├── commands.json    # 命令描述
    ├── errors.json      # 错误信息 (计划中)
    └── messages.json    # 用户信息 (计划中)
```

## External Interfaces

### Initialization Functions

| Function | Description | Usage | Return Type |
|----------|-------------|-------|-------------|
| `initI18n(language?)` | Initialize i18n system | CLI startup, Web app init | `Promise<void>` |
| `changeLanguage(lng)` | Switch language dynamically | Settings, user preference | `Promise<void>` |
| `getCurrentLanguage()` | Get current language | Status checking | `SupportedLang` |
| `ensureI18nInitialized()` | Safety check for initialization | Utility functions | `void` |

### Translation Functions

| Function | Description | Namespace | Example |
|----------|-------------|-----------|---------|
| `t(key, options?)` | Generic translation | Any | `t('cli:welcome')` |
| `tc(key, options?)` | Common translations | common | `tc('yes')` |
| `tCli(key, options?)` | CLI interface | cli | `tCli('startup_message')` |
| `tCmd(key, options?)` | Commands | commands | `tCmd('undo_description')` |
| `tErr(key, options?)` | Error messages | errors | `tErr('file_not_found')` |
| `tMsg(key, options?)` | User messages | messages | `tMsg('operation_success')` |

### Utility Functions

| Function | Description | Use Case | Return Type |
|----------|-------------|----------|-------------|
| `format(template, values)` | Legacy string formatting | Simple interpolation | `string` |
| `SUPPORTED_LANGS` | Available languages array | Language selection UI | `readonly string[]` |
| `LANG_LABELS` | Language display names | Language picker | `Record<string, string>` |

## Key Dependencies & Configuration

### Core Dependencies
```json
{
  "dependencies": {
    "i18next": "catalog:utils",              // Core i18n framework
    "i18next-fs-backend": "catalog:utils",   // Filesystem backend
    "pathe": "catalog:utils"                 // Cross-platform path utilities
  }
}
```

### Dev Dependencies
```json
{
  "devDependencies": {
    "@antfu/utils": "catalog:inlined",       // Development utilities
    "@types/node": "catalog:types",          // Node.js types
    "@ufomiao/eslint-config": "workspace:*", // Code quality
    "@ufomiao/tsconfig": "workspace:*",      // TypeScript config
    "typescript": "catalog:cli",             // Compiler
    "unbuild": "catalog:cli",                // Build tool
    "vite": "catalog:cli",                   // Dev server
    "vitest": "catalog:testing"              // Testing framework
  }
}
```

### i18next Configuration
```typescript
// Initialization options
{
  lng: 'en',                    // Default language
  fallbackLng: 'en',           // Fallback language
  ns: ['common', 'cli', 'commands', 'errors', 'messages'],
  defaultNS: 'common',         // Default namespace
  keySeparator: false,         // Use flat keys
  nsSeparator: ':',            // Namespace separator
  debug: false                 // Production mode
}
```

## Data Models

### Language Configuration

```typescript
// Supported languages
export const SUPPORTED_LANGS = ['zh-CN', 'en'] as const
export type SupportedLang = (typeof SUPPORTED_LANGS)[number]

// Language display labels
export const LANG_LABELS = {
  'zh-CN': '简体中文',
  'en': 'English',
} as const
```

### Translation File Structure

```typescript
// Common translations example
interface CommonTranslations {
  yes: string
  no: string
  cancel: string
  confirm: string
  loading: string
  error: string
  success: string
  warning: string
}

// CLI interface translations
interface CliTranslations {
  welcome: string
  startup_message: string
  help_text: string
  version_info: string
  invalid_command: string
}

// Command descriptions
interface CommandTranslations {
  undo_description: string
  redo_description: string
  checkpoint_description: string
  list_description: string
  restore_description: string
  status_description: string
}
```

### Translation Options

```typescript
// i18next interpolation options
interface TranslationOptions {
  [key: string]: string | number | boolean
  count?: number           // For pluralization
  context?: string         // For context-specific translations
  defaultValue?: string    // Fallback value
}
```

## Testing & Quality

### Test Structure
```
test/
├── initialization.test.ts   # i18n system initialization
├── translations.test.ts     # Translation function testing
├── fallback.test.ts        # Fallback mechanism testing
└── locales/                # Translation file validation
    ├── en.test.ts          # English translation completeness
    └── zh-CN.test.ts       # Chinese translation completeness
```

### Testing Strategy
- **Initialization**: Test i18n system setup and configuration
- **Translation Functions**: Verify all helper functions work correctly
- **File Loading**: Test translation file loading from different paths
- **Fallback Behavior**: Ensure graceful degradation when translations missing
- **Completeness**: Verify all translation keys exist in both languages

### Quality Tools
- **ESLint**: Code quality (`@ufomiao/eslint-config/library`)
- **TypeScript**: Type checking for translation functions
- **JSON Validation**: Ensure translation files are valid JSON

## FAQ

### Q: How to add new translation keys?

A: Follow these steps:
1. Add key to both `en/` and `zh-CN/` JSON files
2. Use consistent naming (e.g., `snake_case`)
3. Add to appropriate namespace (`common`, `cli`, etc.)
4. Update TypeScript interfaces if needed
5. Test with both languages

### Q: How to handle pluralization?

A: Use i18next pluralization:
```json
{
  "file": "file",
  "file_plural": "files"
}
```
```typescript
t('file', { count: 1 })     // "file"
t('file', { count: 5 })     // "files"
```

### Q: How to handle dynamic values?

A: Use interpolation:
```json
{
  "welcome_user": "Welcome, {{name}}!"
}
```
```typescript
t('welcome_user', { name: 'Alice' })  // "Welcome, Alice!"
```

### Q: What if a translation is missing?

A: Fallback behavior:
1. Try current language
2. Fall back to English
3. Return translation key if all else fails
4. Log warning in development mode

### Q: How to switch language at runtime?

A: Use the changeLanguage function:
```typescript
import { changeLanguage } from '@ufomiao/i18n'
await changeLanguage('zh-CN')  // Switch to Chinese
```

## Related File List

### Source Files
- `src/index.ts` - Main i18n initialization and export functions
- `src/locales/` - Translation files organized by language
  - `en/common.json` - English common terms
  - `en/cli.json` - English CLI interface
  - `en/commands.json` - English command descriptions
  - `zh-CN/common.json` - Chinese common terms
  - `zh-CN/cli.json` - Chinese CLI interface
  - `zh-CN/commands.json` - Chinese command descriptions

### Configuration Files
- `package.json` - Package config with i18n dependencies
- `tsconfig.json` - TypeScript config (extends `@ufomiao/tsconfig/library`)
- `eslint.config.ts` - ESLint config (extends `@ufomiao/eslint-config/library`)
- `build.config.ts` - Unbuild configuration (includes JSON files)
- `vitest.config.ts` - Test configuration

### Build Output
- `dist/index.mjs` - ESM build with i18n functions
- `dist/index.d.mts` - TypeScript declarations
- `dist/locales/` - Built translation files
  - `en/` - English translations
  - `zh-CN/` - Chinese translations

---

*📍 This document reflects the module state at 2025-09-07 21:26:40 - Complete i18n system implemented with bilingual support*