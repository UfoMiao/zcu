# ZCU i18n React 集成改进计划

> 🌍 **为ZCU项目添加React i18next最佳实践支持** - 混合Backend架构方案

## 任务概述

基于深度研究的i18next最佳实践，为ZCU monorepo项目实施混合Backend架构，支持：
- CLI环境继续使用 `i18next-fs-backend`
- React Web/UI组件使用 `react-i18next` + `i18next-http-backend`
- 统一的i18n包管理所有国际化逻辑

## 架构设计

### 当前状态
- ✅ 完整的i18n共享包(`@ufomiao/i18n`)
- ✅ fs-backend用于CLI环境
- ✅ 扁平化JSON翻译文件结构
- ✅ TypeScript支持

### 目标架构
```
@ufomiao/i18n
├── src/
│   ├── index.ts        # 主要导出（CLI兼容）
│   ├── react.ts        # React专用导出
│   ├── web.ts         # Web应用初始化
│   ├── backends.ts    # Backend选择逻辑
│   └── types.ts       # 类型定义
├── locales/           # 翻译文件
└── dist/
    └── locales/       # 构建输出的翻译文件
```

## 实施步骤

### 步骤 1：添加React i18n依赖
**文件**：`packages/i18n/package.json`
**变更**：添加新依赖项
```json
{
  "dependencies": {
    "react-i18next": "catalog:react",
    "i18next-http-backend": "catalog:utils"
  }
}
```

### 步骤 2：创建Backend选择逻辑
**文件**：`packages/i18n/src/backends.ts`
**功能**：环境检测和Backend选择
```typescript
// 浏览器环境检测
const isBrowser = typeof window !== 'undefined'

// 动态导入避免bundle包含不需要的backend
export async function getBackend() {
  if (isBrowser) {
    const { default: HttpBackend } = await import('i18next-http-backend')
    return HttpBackend
  } else {
    const { default: FsBackend } = await import('i18next-fs-backend')  
    return FsBackend
  }
}

// Backend配置
export function getBackendOptions() {
  return isBrowser ? {
    loadPath: '/locales/{{lng}}/{{ns}}.json'
  } : {
    loadPath: /* 现有fs路径逻辑 */
  }
}
```

### 步骤 3：扩展核心初始化配置
**文件**：`packages/i18n/src/index.ts`
**功能**：支持环境自适应Backend
```typescript
export async function initI18n(language: SupportedLang = 'en') {
  if (i18n.isInitialized) {
    // 现有逻辑保持不变
  }
  
  const Backend = await getBackend()
  const backendOptions = getBackendOptions()
  
  await i18n.use(Backend).init({
    // 现有配置
    backend: backendOptions
  })
}
```

### 步骤 4：添加React Hook集成
**文件**：`packages/i18n/src/react.ts`
**功能**：React专用导出
```typescript
// 重新导出react-i18next核心功能
export { 
  useTranslation, 
  Trans, 
  I18nextProvider,
  initReactI18next 
} from 'react-i18next'

// 预配置的Provider组件
export function ZCUi18nProvider({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </I18nextProvider>
  )
}

// 语言切换Hook
export function useLanguageSwitcher() {
  const { i18n } = useTranslation()
  
  const changeLanguage = useCallback(async (lng: SupportedLang) => {
    await i18n.changeLanguage(lng)
  }, [i18n])
  
  return {
    currentLanguage: i18n.language as SupportedLang,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGS
  }
}
```

### 步骤 5：创建Web应用专用初始化
**文件**：`packages/i18n/src/web.ts`
**功能**：Web环境优化的初始化
```typescript
export async function initI18nForWeb(options = {}) {
  const Backend = await import('i18next-http-backend')
  
  await i18n
    .use(Backend.default)
    .use(initReactI18next)
    .init({
      lng: options.language || 'en',
      fallbackLng: 'en',
      
      backend: {
        loadPath: '/locales/{{lng}}/{{ns}}.json',
        crossDomain: false,
        requestOptions: {
          cache: 'default'
        }
      },
      
      // React优化配置
      react: {
        useSuspense: true
      },
      
      // 现有配置保持
      ns: NAMESPACES,
      defaultNS: 'common',
      keySeparator: false,
      nsSeparator: ':'
    })
}
```

### 步骤 6：配置静态文件服务
**文件**：`packages/i18n/build.config.ts`
**功能**：确保翻译文件可通过HTTP访问
```typescript
export default defineBuildConfig({
  // 现有配置
  entries: ['src/index'],
  
  // 复制locales到dist目录
  hooks: {
    'build:done': () => {
      copySync('src/locales', 'dist/locales')
    }
  }
})
```

### 步骤 7：更新Web应用集成
**文件**：`apps/web/src/App.tsx`
**变更**：使用React hooks替代直接i18n调用
```typescript
// 替换
import { i18n } from '@ufomiao/i18n'

// 为
import { useTranslation } from '@ufomiao/i18n/react'

// 在组件中
function App() {
  const { t, i18n } = useTranslation()
  
  return (
    <div>
      <h1>{t('commands:status_title')}</h1>
      {/* 现有JSX使用t()替代i18n.t() */}
    </div>
  )
}
```

### 步骤 8：更新语言切换器
**文件**：`apps/web/src/components/LanguageSwitcher.tsx`
**变更**：使用自定义Hook
```typescript
import { useLanguageSwitcher } from '@ufomiao/i18n/react'

export function LanguageSwitcher() {
  const { currentLanguage, changeLanguage, supportedLanguages } = useLanguageSwitcher()
  
  // 简化的实现，移除手动事件监听
}
```

### 步骤 9：更新UI组件
**文件**：`packages/ui/src/components/Button.tsx`
**变更**：使用useTranslation hook
```typescript
import { useTranslation } from '@ufomiao/i18n/react'

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ i18nKey, children, ...props }, ref) => {
    const { t } = useTranslation()
    const displayText = i18nKey && !children ? t(`ui:${i18nKey}`) : children
    
    // 组件逻辑保持不变
  }
)
```

### 步骤 10：添加测试覆盖
**文件**：`packages/i18n/test/` 新测试文件
**功能**：验证所有新功能
- `backends.test.ts` - Backend选择逻辑测试
- `react.test.ts` - React hooks集成测试  
- `web.test.ts` - Web初始化测试

### 步骤 11：更新导出和文档
**文件**：`packages/i18n/src/index.ts`, `packages/i18n/package.json`
**功能**：完善API导出
```json
{
  "exports": {
    ".": "./dist/index.mjs",
    "./react": "./dist/react.mjs",
    "./web": "./dist/web.mjs",
    "./package.json": "./package.json"
  }
}
```

## 成功标准

1. ✅ CLI功能保持100%兼容
2. ✅ Web应用使用React hooks模式
3. ✅ UI组件支持响应式翻译更新
4. ✅ 按需加载和懒加载工作正常
5. ✅ TypeScript类型支持完整
6. ✅ 测试覆盖率 ≥ 80%

## 风险评估

**低风险**：
- 保持现有API向后兼容
- 渐进式改进，不破坏现有功能

**中等风险**：
- 需要确保Web应用能正确加载静态翻译文件
- React组件渲染优化需要仔细测试

**缓解措施**：
- 详细测试每个步骤
- 保持现有功能作为fallback
- 分阶段实施，逐步验证

---

*📍 计划创建时间：2025-09-08 - 基于i18next最佳实践研究*