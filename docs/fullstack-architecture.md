# ZCU 全栈技术架构设计文档
**ZCU Full-Stack Architecture Design Document**

---

**文档信息**
- **项目名称**: ZCU (Z Claude Undo)
- **文档版本**: v1.2.0
- **创建日期**: 2025-09-03
- **最后更新**: 2025-01-03
- **文档类型**: 全栈技术架构设计文档
- **创建方法**: BMAD-METHOD™框架
- **架构标准**: BMad方法fullstack-architecture标准格式

---

## 1. 架构概览

### 1.1 系统架构愿景

ZCU采用现代化微服务架构设计，通过LevelDB + Shadow Repository的轻量级存储方案，结合React双重渲染架构（CLI + Web），实现跨平台统一的用户体验。核心创新在于AI工作空间隔离机制，解决多Claude实例并发操作的冲突问题，为Claude Code用户提供企业级的undo/redo功能。

### 1.2 核心架构原则

#### 1.2.1 设计哲学
- **用户主控**: 避免AI幻觉问题，所有关键操作由用户确认
- **轻量高效**: 最小化资源占用，快速响应用户操作
- **平台无关**: 一套代码，多端运行，保持功能和体验一致
- **容错设计**: 零数据丢失，故障自动恢复
- **扩展友好**: 模块化设计，支持插件化扩展

#### 1.2.2 技术选型原则
- **成熟稳定**: 优选经过大规模验证的技术栈
- **社区活跃**: 选择有活跃社区支持的开源方案
- **轻量优先**: 避免过度工程化，保持架构简洁
- **标准兼容**: 遵循Web标准和Node.js生态规范

### 1.3 整体系统架构

```mermaid
graph TB
    subgraph "客户端层 Client Layer"
        CLI[CLI Terminal UI<br/>Ink + React]
        WEB[Web Dashboard<br/>Next.js + React]
        CMD[Command Interface<br/>Natural Language]
    end
    
    subgraph "共享组件层 Shared Components"
        COMP[React共享组件库<br/>Business Logic + UI]
        HOOKS[共享Hooks<br/>State Management]
        UTILS[工具函数<br/>Common Utilities]
    end
    
    subgraph "API服务层 API Service Layer"
        CORE[ZCU Core API<br/>Express + TypeScript]
        AUTH[认证服务<br/>Session Management]
        HOOKS_SVC[Hook服务<br/>Event Processing]
    end
    
    subgraph "业务逻辑层 Business Logic Layer"
        UNDO[Undo/Redo Engine<br/>Operation Management]
        WORKSPACE[AI Workspace<br/>Isolation Manager]
        CONFLICT[Conflict Resolver<br/>Merge Engine]
        SNAPSHOT[Snapshot Manager<br/>Version Control]
    end
    
    subgraph "存储层 Storage Layer"
        LEVELDB[(LevelDB<br/>Metadata & Sessions)]
        SHADOW[(Shadow Repository<br/>File Snapshots)]
        CACHE[(Memory Cache<br/>Hot Data)]
    end
    
    subgraph "集成层 Integration Layer"
        CLAUDE[Claude Code Hooks<br/>AI Operation Events]
        GIT[Git Integration<br/>Version Control)]
        FS[File System<br/>Project Files]
    end
    
    CLI --> COMP
    WEB --> COMP
    CMD --> COMP
    
    COMP --> CORE
    HOOKS --> CORE
    UTILS --> CORE
    
    CORE --> UNDO
    CORE --> WORKSPACE
    CORE --> CONFLICT
    CORE --> SNAPSHOT
    
    UNDO --> LEVELDB
    WORKSPACE --> LEVELDB
    CONFLICT --> SHADOW
    SNAPSHOT --> SHADOW
    
    CORE --> CACHE
    
    HOOKS_SVC --> CLAUDE
    SNAPSHOT --> GIT
    UNDO --> FS
```

---

## 2. 前端架构设计

### 2.1 双重渲染架构

#### 2.1.1 架构设计理念

ZCU采用创新的React双重渲染架构，通过共享组件库实现CLI（Ink）和Web的统一开发体验。这种设计避免了重复开发，确保功能一致性，同时充分利用各平台特性优势。

```typescript
// 双重渲染架构核心设计
interface RenderTarget {
  type: 'cli' | 'web';
  renderer: InkRenderer | WebRenderer;
  platform: PlatformAdapter;
}

// 共享组件抽象
interface SharedComponent<TProps> {
  businessLogic: (props: TProps) => BusinessState;
  cliRenderer: (state: BusinessState) => InkElement;
  webRenderer: (state: BusinessState) => ReactElement;
}
```

#### 2.1.2 组件映射策略

```typescript
// 组件映射配置
export const componentMapping = {
  SnapshotList: {
    shared: useSnapshotListLogic,
    cli: InkSnapshotList,
    web: WebSnapshotList,
    props: SnapshotListProps
  },
  ConflictResolver: {
    shared: useConflictResolverLogic,
    cli: InkConflictDialog,
    web: WebConflictModal,
    props: ConflictResolverProps
  },
  WorkspaceMonitor: {
    shared: useWorkspaceLogic,
    cli: InkWorkspaceStatus,
    web: WebWorkspacePanel,
    props: WorkspaceMonitorProps
  }
} as const;
```

### 2.2 UI组件库架构

#### 2.2.1 设计系统集成

ZCU集成UnoCSS v0.63.4+作为原子化CSS框架，与shadcn/ui组件库深度整合，创建统一的设计语言系统。

> **重要说明**：ZCU项目完全采用UnoCSS替代Tailwind CSS，两者不可同时存在。UnoCSS提供了更好的性能（零运行时开销）、更小的包体积和更灵活的配置选项。通过`unocss-preset-shadcn`预设，实现了与shadcn/ui组件的完美兼容。

```typescript
// UnoCSS配置 - ZCU定制 (v0.63.4+)
import { defineConfig, presetUno, presetAttributify, presetTypography, presetWebFonts, transformerDirectives, transformerVariantGroup } from 'unocss'
import { presetShadcn } from 'unocss-preset-shadcn'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: 'Inter:400,500,600,700',
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas']
      }
    }),
    // shadcn/ui预设，确保兼容性
    presetShadcn({
      color: 'neutral',
      radius: 0.75
    })
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ],
  theme: {
    colors: {
      // ZCU品牌色系 - 与shadcn/ui兼容
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
        950: '#082f49'
      },
      // 状态色彩 - shadcn/ui标准
      success: {
        DEFAULT: '#10b981',
        foreground: '#ffffff'
      },
      warning: {
        DEFAULT: '#f59e0b',
        foreground: '#ffffff'
      },
      destructive: {
        DEFAULT: '#ef4444',
        foreground: '#ffffff'
      },
      // CLI专用色彩 (ANSI兼容)
      cli: {
        text: '#f1f5f9',
        highlight: '#0ea5e9',
        dim: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      }
    },
    fontFamily: {
      mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'SF Mono', 'Monaco', 'monospace'],
      sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
    },
    borderRadius: {
      lg: '0.75rem',
      md: '0.5rem',
      sm: '0.25rem'
    }
  },
  shortcuts: {
    // ZCU快捷样式类 - shadcn/ui兼容
    'zcu-btn-primary': 'bg-primary-500 text-primary-foreground hover:bg-primary-600 px-4 py-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    'zcu-btn-secondary': 'bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md font-medium transition-colors',
    'zcu-btn-destructive': 'bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-md font-medium transition-colors',
    'zcu-card': 'rounded-lg border bg-card text-card-foreground shadow-sm',
    'zcu-input': 'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50'
  },
  content: {
    filesystem: ['./src/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}']
  }
})
```

#### 2.2.2 shadcn/ui组件适配

##### Web环境标准实现
```typescript
// shadcn/ui Web组件 - UnoCSS兼容版本
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Clock, FileText } from 'lucide-react'

export const WebSnapshotCard: React.FC<SnapshotCardProps> = ({ snapshot, onRestore }) => {
  return (
    <Card className="zcu-card hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          {snapshot.description}
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatTimestamp(snapshot.timestamp)}
          <Badge variant="secondary" className="ml-auto">
            {snapshot.filesCount} 个文件
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            ID: {snapshot.id.slice(0, 8)}...
          </div>
          <Button 
            onClick={() => onRestore(snapshot.id)} 
            size="sm"
            className="zcu-btn-primary"
          >
            恢复快照
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

##### CLI环境适配方案
```typescript
// shadcn/ui CLI适配层 - 增强版本
import { Box, Text, Spacer } from 'ink'
import { useState, useCallback } from 'react'
import figures from 'figures'
import chalk from 'chalk'

// 增强的shadcn/ui组件Ink适配器
export const adaptShadcnForInk = {
  Button: ({ children, onClick, variant = 'default', size = 'default', disabled = false }: ButtonProps) => {
    const [isHovered, setIsHovered] = useState(false)
    
    const variants = {
      default: { bg: 'bgWhite', fg: 'black', hoverBg: 'bgGray' },
      primary: { bg: 'bgBlue', fg: 'white', hoverBg: 'bgBlueBright' },
      destructive: { bg: 'bgRed', fg: 'white', hoverBg: 'bgRedBright' },
      secondary: { bg: 'bgGray', fg: 'white', hoverBg: 'bgWhite' }
    }
    
    const sizes = {
      sm: { padding: 0, prefix: ' ', suffix: ' ' },
      default: { padding: 1, prefix: ' ', suffix: ' ' },
      lg: { padding: 1, prefix: '  ', suffix: '  ' }
    }
    
    const style = variants[variant]
    const sizeStyle = sizes[size]
    
    return (
      <Box borderStyle="single" paddingX={sizeStyle.padding}>
        <Text 
          color={disabled ? 'gray' : style.fg}
          backgroundColor={disabled ? 'bgGray' : (isHovered ? style.hoverBg : style.bg)}
          bold={!disabled}
        >
          {sizeStyle.prefix}{figures.pointer} {children}{sizeStyle.suffix}
        </Text>
      </Box>
    )
  },
  
  Card: ({ children, className }: CardProps) => (
    <Box 
      borderStyle="round" 
      padding={1} 
      marginY={1}
      borderColor="gray"
    >
      <Box flexDirection="column">
        {children}
      </Box>
    </Box>
  ),
  
  CardHeader: ({ children }: CardHeaderProps) => (
    <Box marginBottom={1}>
      {children}
    </Box>
  ),
  
  CardContent: ({ children }: CardContentProps) => (
    <Box>
      {children}
    </Box>
  ),
  
  Badge: ({ children, variant = 'default' }: BadgeProps) => {
    const variants = {
      default: 'bgGray',
      secondary: 'bgBlue',
      destructive: 'bgRed',
      outline: 'gray'
    }
    
    return (
      <Text 
        backgroundColor={variants[variant]}
        color={variant === 'outline' ? 'gray' : 'white'}
        bold
      >
        [{children}]
      </Text>
    )
  },
  
  Dialog: ({ children, open }: DialogProps) => {
    if (!open) return null
    return (
      <Box 
        borderStyle="double" 
        padding={2}
        borderColor="blue"
        justifyContent="center"
        alignItems="center"
      >
        <Box maxWidth={60}>
          {children}
        </Box>
      </Box>
    )
  }
}

// CLI适配的快照卡片 - 增强版本
export const InkSnapshotCard: React.FC<SnapshotCardProps> = ({ snapshot, onRestore }) => {
  const AdaptedCard = adaptShadcnForInk.Card
  const AdaptedButton = adaptShadcnForInk.Button
  const AdaptedBadge = adaptShadcnForInk.Badge
  
  return (
    <AdaptedCard>
      <Box marginBottom={1}>
        <Text color="blue" bold>
          {figures.folder} {snapshot.description}
        </Text>
      </Box>
      
      <Box marginBottom={1}>
        <Text dimColor>
          {figures.clock} {formatTimestamp(snapshot.timestamp)}
        </Text>
        <Spacer />
        <AdaptedBadge variant="secondary">
          {snapshot.filesCount} 文件
        </AdaptedBadge>
      </Box>
      
      <Box>
        <Text dimColor>
          ID: {snapshot.id.slice(0, 8)}...
        </Text>
        <Spacer />
        <AdaptedButton 
          onClick={() => onRestore(snapshot.id)} 
          variant="primary"
          size="sm"
        >
          恢复快照
        </AdaptedButton>
      </Box>
    </AdaptedCard>
  )
}
```

### 2.3 国际化架构

#### 2.3.1 i18next集成方案

参考ZCF项目的成功实践，ZCU采用i18next作为国际化解决方案，支持动态语言切换和资源懒加载。

```typescript
// i18n配置 - 参考ZCF实现
import i18n from 'i18next'
import Backend from 'i18next-fs-backend'
import { initReactI18next } from 'react-i18next'

export const initI18n = async () => {
  await i18n
    .use(Backend)
    .use(initReactI18next)
    .init({
      lng: 'zh-CN', // 默认中文
      fallbackLng: 'en',
      
      backend: {
        loadPath: './locales/{{lng}}/{{ns}}.json'
      },
      
      ns: ['common', 'ui', 'errors', 'cli'],
      defaultNS: 'common',
      
      interpolation: {
        escapeValue: false
      },
      
      react: {
        useSuspense: false // CLI环境兼容
      }
    })
}

// 命名空间组织
export const i18nNamespaces = {
  common: {
    snapshot: '快照',
    workspace: '工作空间',
    conflict: '冲突',
    operation: '操作'
  },
  ui: {
    buttons: {
      restore: '恢复',
      delete: '删除',
      confirm: '确认',
      cancel: '取消'
    },
    messages: {
      success: '操作成功',
      error: '操作失败',
      loading: '加载中...'
    }
  },
  cli: {
    prompts: {
      selectSnapshot: '请选择要恢复的快照',
      confirmRestore: '确认要恢复此快照吗？'
    }
  }
} as const;
```

#### 2.3.2 CLI和Web双环境i18n

```typescript
// CLI环境国际化Hook
export const useCliI18n = () => {
  const { t } = useTranslation(['common', 'cli'])
  
  // CLI特有的格式化函数
  const formatCliMessage = (key: string, options?: any) => {
    const message = t(key, options)
    // CLI消息添加前缀图标
    if (key.includes('error')) return `❌ ${message}`
    if (key.includes('success')) return `✅ ${message}`
    if (key.includes('warning')) return `⚠️  ${message}`
    return message
  }
  
  return { t, formatCliMessage }
}

// Web环境国际化Hook
export const useWebI18n = () => {
  const { t, i18n } = useTranslation(['common', 'ui'])
  
  // Web特有的语言切换
  const switchLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng)
    // 持久化语言设置
    localStorage.setItem('zcu-language', lng)
  }
  
  return { t, switchLanguage, currentLang: i18n.language }
}
```

---

## 3. 后端架构设计

### 3.1 核心API架构

#### 3.1.1 微服务架构设计

```typescript
// 核心API服务架构
interface ZCUCoreService {
  // Undo/Redo引擎
  undoEngine: UndoRedoEngine;
  // AI工作空间管理
  workspaceManager: WorkspaceManager;
  // 冲突解决引擎
  conflictResolver: ConflictResolver;
  // 快照管理器
  snapshotManager: SnapshotManager;
  // Hook事件处理
  hookProcessor: HookEventProcessor;
}

// Express服务器配置
export const createZCUServer = (config: ZCUConfig) => {
  const app = express();
  
  // 中间件配置
  app.use(cors());
  app.use(express.json({ limit: '100mb' }));
  app.use(compression());
  
  // API路由
  app.use('/api/snapshots', snapshotRoutes);
  app.use('/api/workspaces', workspaceRoutes);
  app.use('/api/conflicts', conflictRoutes);
  app.use('/api/operations', operationRoutes);
  
  // WebSocket支持
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: "*" }
  });
  
  // 实时通信
  io.on('connection', (socket) => {
    socket.on('workspace:subscribe', handleWorkspaceSubscription);
    socket.on('conflict:subscribe', handleConflictSubscription);
  });
  
  return { app, server, io };
};
```

#### 3.1.2 RESTful API设计

```typescript
// API端点定义
export const apiEndpoints = {
  // 快照管理
  snapshots: {
    list: 'GET /api/snapshots',
    create: 'POST /api/snapshots',
    get: 'GET /api/snapshots/:id',
    restore: 'POST /api/snapshots/:id/restore',
    delete: 'DELETE /api/snapshots/:id'
  },
  
  // 工作空间管理
  workspaces: {
    list: 'GET /api/workspaces',
    get: 'GET /api/workspaces/:id',
    pause: 'POST /api/workspaces/:id/pause',
    resume: 'POST /api/workspaces/:id/resume',
    status: 'GET /api/workspaces/:id/status'
  },
  
  // 冲突管理
  conflicts: {
    list: 'GET /api/conflicts',
    get: 'GET /api/conflicts/:id',
    resolve: 'POST /api/conflicts/:id/resolve',
    preview: 'GET /api/conflicts/:id/preview'
  },
  
  // 操作管理
  operations: {
    history: 'GET /api/operations/history',
    undo: 'POST /api/operations/undo',
    redo: 'POST /api/operations/redo',
    batch: 'POST /api/operations/batch'
  }
} as const;

// 类型安全的API客户端
export class ZCUApiClient {
  constructor(private baseURL: string) {}
  
  async createSnapshot(description: string): Promise<Snapshot> {
    const response = await fetch(`${this.baseURL}/api/snapshots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    return response.json();
  }
  
  async getWorkspaces(): Promise<Workspace[]> {
    const response = await fetch(`${this.baseURL}/api/workspaces`);
    return response.json();
  }
  
  async resolveConflict(id: string, resolution: ConflictResolution): Promise<void> {
    await fetch(`${this.baseURL}/api/conflicts/${id}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resolution)
    });
  }
}
```

### 3.2 AI工作空间隔离机制

#### 3.2.1 核心隔离算法

```typescript
// AI工作空间隔离引擎
export class WorkspaceIsolationEngine {
  private workspaces = new Map<string, AIWorkspace>();
  private fileLocks = new Map<string, WorkspaceLock>();
  
  // 创建或获取工作空间
  async getOrCreateWorkspace(sessionId: string, aiAgent: string, projectPath: string): Promise<AIWorkspace> {
    const workspaceId = this.generateWorkspaceId(sessionId, aiAgent);
    
    if (this.workspaces.has(workspaceId)) {
      return this.workspaces.get(workspaceId)!;
    }
    
    const workspace: AIWorkspace = {
      id: workspaceId,
      sessionId,
      aiAgent,
      projectPath,
      state: 'active',
      operationChain: [],
      createdAt: Date.now(),
      lastActivity: Date.now()
    };
    
    this.workspaces.set(workspaceId, workspace);
    await this.persistWorkspace(workspace);
    
    return workspace;
  }
  
  // 预防性冲突检测
  async checkConflicts(workspaceId: string, files: string[]): Promise<ConflictInfo[]> {
    const conflicts: ConflictInfo[] = [];
    
    for (const filePath of files) {
      const existingLock = this.fileLocks.get(filePath);
      
      if (existingLock && existingLock.workspaceId !== workspaceId) {
        // 检测到文件锁冲突
        conflicts.push({
          id: generateId(),
          filePath,
          sourceWorkspace: workspaceId,
          conflictWorkspace: existingLock.workspaceId,
          type: 'file_lock_conflict',
          timestamp: Date.now()
        });
      }
    }
    
    return conflicts;
  }
  
  // 文件锁管理
  async acquireFileLocks(workspaceId: string, files: string[]): Promise<boolean> {
    const conflicts = await this.checkConflicts(workspaceId, files);
    
    if (conflicts.length > 0) {
      // 通知冲突给相关工作空间
      await this.notifyConflicts(conflicts);
      return false;
    }
    
    // 获取文件锁
    for (const filePath of files) {
      this.fileLocks.set(filePath, {
        workspaceId,
        filePath,
        acquiredAt: Date.now()
      });
    }
    
    return true;
  }
  
  // 释放文件锁
  async releaseFileLocks(workspaceId: string, files: string[]): Promise<void> {
    for (const filePath of files) {
      const lock = this.fileLocks.get(filePath);
      if (lock && lock.workspaceId === workspaceId) {
        this.fileLocks.delete(filePath);
      }
    }
  }
}
```

#### 3.2.2 冲突检测与解决

```typescript
// 智能冲突检测系统
export class ConflictDetectionSystem {
  private detectionStrategies: ConflictDetectionStrategy[] = [
    new FileContentConflictDetector(),
    new TimestampConflictDetector(), 
    new SemanticConflictDetector(),
    new DependencyConflictDetector()
  ];
  
  async detectConflicts(operation: FileOperation): Promise<ConflictInfo[]> {
    const allConflicts: ConflictInfo[] = [];
    
    for (const strategy of this.detectionStrategies) {
      const conflicts = await strategy.detect(operation);
      allConflicts.push(...conflicts);
    }
    
    // 去重和优先级排序
    return this.deduplicateAndPrioritize(allConflicts);
  }
  
  // 文件内容冲突检测器
  private class FileContentConflictDetector implements ConflictDetectionStrategy {
    async detect(operation: FileOperation): Promise<ConflictInfo[]> {
      const conflicts: ConflictInfo[] = [];
      
      for (const file of operation.files) {
        // 检查是否有其他工作空间同时修改了相同文件
        const concurrentOperations = await this.getConcurrentOperations(
          file.path, 
          operation.workspaceId,
          operation.timestamp
        );
        
        for (const concurrent of concurrentOperations) {
          const conflict = await this.analyzeContentConflict(
            file,
            concurrent,
            operation
          );
          
          if (conflict) {
            conflicts.push(conflict);
          }
        }
      }
      
      return conflicts;
    }
  }
  
  // 语义冲突检测器
  private class SemanticConflictDetector implements ConflictDetectionStrategy {
    async detect(operation: FileOperation): Promise<ConflictInfo[]> {
      // 基于AST分析的语义冲突检测
      // 检测函数重命名、导入依赖变化等语义级冲突
      const conflicts: ConflictInfo[] = [];
      
      for (const file of operation.files) {
        if (this.isCodeFile(file.path)) {
          const semanticConflicts = await this.analyzeSemanticChanges(file);
          conflicts.push(...semanticConflicts);
        }
      }
      
      return conflicts;
    }
  }
}
```

---

## 4. 存储架构设计

### 4.1 LevelDB + Shadow Repository存储架构

#### 4.1.1 分层存储设计

```typescript
// 存储层架构设计
interface StorageArchitecture {
  // 元数据层 - LevelDB
  metadata: {
    workspaces: Map<string, WorkspaceMetadata>;
    sessions: Map<string, SessionInfo>;
    operations: Map<string, OperationMetadata>;
    conflicts: Map<string, ConflictMetadata>;
  };
  
  // 文件快照层 - Shadow Repository
  snapshots: {
    repository: GitRepository;
    branches: Map<string, SnapshotBranch>;
    commits: Map<string, SnapshotCommit>;
  };
  
  // 缓存层 - Memory Cache
  cache: {
    hotSnapshots: LRUCache<Snapshot>;
    activeWorkspaces: Map<string, AIWorkspace>;
    recentOperations: CircularBuffer<Operation>;
  };
}

// LevelDB键值设计
export const LevelDBSchema = {
  // 工作空间相关
  workspace: {
    active: (aiId: string) => `workspace:${aiId}:active`,
    metadata: (id: string) => `workspace:${id}:metadata`,
    operations: (id: string) => `workspace:${id}:operations`,
    state: (id: string) => `workspace:${id}:state`
  },
  
  // 操作记录
  operation: {
    latest: (aiId: string) => `operation:${aiId}:latest`,
    history: (aiId: string) => `operation:${aiId}:history`,
    metadata: (id: string) => `operation:${id}:metadata`
  },
  
  // 冲突管理
  conflict: {
    active: (projectPath: string) => `conflict:${projectPath}:active`,
    resolved: (id: string) => `conflict:${id}:resolved`,
    pending: () => `conflict:pending`
  },
  
  // 安全相关
  safety: {
    level: (operationId: string) => `safety:${operationId}:level`,
    rollback: (id: string) => `safety:${id}:rollback`
  }
} as const;
```

#### 4.1.2 Shadow Repository实现

```typescript
// Shadow Repository管理器
export class ShadowRepositoryManager {
  private shadowRepo: SimpleGit;
  private repoPath: string;
  
  constructor(projectPath: string) {
    this.repoPath = path.join(projectPath, '.zcu', 'shadow');
    this.shadowRepo = simpleGit(this.repoPath);
  }
  
  // 初始化Shadow Repository
  async initialize(): Promise<void> {
    if (!await this.exists()) {
      await fs.ensureDir(this.repoPath);
      await this.shadowRepo.init();
      await this.createInitialCommit();
    }
  }
  
  // 创建文件快照
  async createSnapshot(description: string, files: FileChange[]): Promise<string> {
    const snapshotId = generateSnapshotId();
    const branchName = `snapshot/${snapshotId}`;
    
    // 创建新分支
    await this.shadowRepo.checkoutLocalBranch(branchName);
    
    // 应用文件变更
    for (const file of files) {
      const targetPath = path.join(this.repoPath, file.relativePath);
      
      switch (file.operation) {
        case 'create':
        case 'modify':
          await fs.writeFile(targetPath, file.content);
          await this.shadowRepo.add(file.relativePath);
          break;
        case 'delete':
          await fs.remove(targetPath);
          await this.shadowRepo.rm(file.relativePath);
          break;
        case 'rename':
          await this.shadowRepo.mv(file.oldPath, file.relativePath);
          break;
      }
    }
    
    // 提交快照
    await this.shadowRepo.commit(description, {
      '--author': `"ZCU System <zcu@system>"`,
      '--date': new Date().toISOString()
    });
    
    // 返回主分支
    await this.shadowRepo.checkout('main');
    
    return snapshotId;
  }
  
  // 恢复快照
  async restoreSnapshot(snapshotId: string, targetPath: string): Promise<void> {
    const branchName = `snapshot/${snapshotId}`;
    
    // 检出快照分支
    await this.shadowRepo.checkout(branchName);
    
    // 获取快照内容
    const files = await this.getSnapshotFiles(snapshotId);
    
    // 恢复文件到目标路径
    for (const file of files) {
      const sourcePath = path.join(this.repoPath, file.relativePath);
      const targetFilePath = path.join(targetPath, file.relativePath);
      
      if (file.operation === 'delete') {
        await fs.remove(targetFilePath);
      } else {
        await fs.copy(sourcePath, targetFilePath);
      }
    }
    
    // 返回主分支
    await this.shadowRepo.checkout('main');
  }
  
  // 增量存储优化
  async createIncrementalSnapshot(
    baseSnapshotId: string,
    changes: FileChange[]
  ): Promise<string> {
    const newSnapshotId = generateSnapshotId();
    const baseBranch = `snapshot/${baseSnapshotId}`;
    const newBranch = `snapshot/${newSnapshotId}`;
    
    // 基于基础快照创建新分支
    await this.shadowRepo.checkoutBranch(newBranch, baseBranch);
    
    // 只应用增量变更
    const incrementalChanges = await this.calculateDelta(baseSnapshotId, changes);
    await this.applyChanges(incrementalChanges);
    
    return newSnapshotId;
  }
}
```

### 4.2 缓存策略设计

#### 4.2.1 多层缓存架构

```typescript
// 缓存管理系统
export class CacheManager {
  private l1Cache: Map<string, any> = new Map(); // 内存缓存
  private l2Cache: LRUCache<string, any>; // LRU缓存
  private l3Cache: AsyncLRUCache<string, any>; // 持久化缓存
  
  constructor() {
    this.l2Cache = new LRUCache({ max: 1000, ttl: 1000 * 60 * 15 }); // 15分钟
    this.l3Cache = new AsyncLRUCache({
      max: 10000,
      ttl: 1000 * 60 * 60 * 24, // 24小时
      storage: new LevelDBAdapter(path.join('.zcu', 'cache'))
    });
  }
  
  // 智能缓存获取
  async get<T>(key: string, factory?: () => Promise<T>): Promise<T | undefined> {
    // L1缓存 - 内存
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }
    
    // L2缓存 - LRU
    const l2Value = this.l2Cache.get(key);
    if (l2Value !== undefined) {
      this.l1Cache.set(key, l2Value);
      return l2Value;
    }
    
    // L3缓存 - 持久化
    const l3Value = await this.l3Cache.get(key);
    if (l3Value !== undefined) {
      this.l2Cache.set(key, l3Value);
      this.l1Cache.set(key, l3Value);
      return l3Value;
    }
    
    // 缓存未命中，使用工厂方法
    if (factory) {
      const value = await factory();
      await this.set(key, value);
      return value;
    }
    
    return undefined;
  }
  
  // 缓存写入
  async set<T>(key: string, value: T): Promise<void> {
    this.l1Cache.set(key, value);
    this.l2Cache.set(key, value);
    await this.l3Cache.set(key, value);
  }
  
  // 缓存失效策略
  async invalidate(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    
    // 清理L1缓存
    for (const [key] of this.l1Cache) {
      if (regex.test(key)) {
        this.l1Cache.delete(key);
      }
    }
    
    // 清理L2缓存
    this.l2Cache.clear();
    
    // 清理L3缓存
    await this.l3Cache.clear();
  }
}

// 缓存预热策略
export class CacheWarmupStrategy {
  async warmupWorkspaceCache(workspaceId: string): Promise<void> {
    // 预加载工作空间元数据
    await cacheManager.get(`workspace:${workspaceId}`, 
      () => workspaceManager.getWorkspace(workspaceId)
    );
    
    // 预加载最近操作
    await cacheManager.get(`operations:${workspaceId}:recent`,
      () => operationManager.getRecentOperations(workspaceId, 10)
    );
    
    // 预加载热门快照
    await cacheManager.get(`snapshots:${workspaceId}:hot`,
      () => snapshotManager.getHotSnapshots(workspaceId)
    );
  }
}
```

---

## 5. 性能优化架构

### 5.1 前端性能优化

#### 5.1.1 虚拟滚动和懒加载

```typescript
// 虚拟滚动优化
export class VirtualScrollOptimizer {
  private visibleRange = { start: 0, end: 0 };
  private itemHeight = 60;
  private bufferSize = 5;
  
  calculateVisibleRange(scrollTop: number, containerHeight: number, totalItems: number) {
    const start = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.bufferSize);
    const end = Math.min(
      totalItems,
      start + Math.ceil(containerHeight / this.itemHeight) + this.bufferSize * 2
    );
    
    return { start, end };
  }
  
  shouldUpdate(newRange: { start: number, end: number }): boolean {
    return newRange.start !== this.visibleRange.start || 
           newRange.end !== this.visibleRange.end;
  }
}

// React虚拟滚动Hook
export const useVirtualScroll = <T>(
  items: T[],
  containerHeight: number,
  itemHeight: number = 60
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const optimizer = useMemo(() => new VirtualScrollOptimizer(), []);
  
  const visibleRange = useMemo(() => {
    return optimizer.calculateVisibleRange(scrollTop, containerHeight, items.length);
  }, [scrollTop, containerHeight, items.length, optimizer]);
  
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      top: (visibleRange.start + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);
  
  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    scrollTop,
    setScrollTop,
    visibleRange
  };
};
```

#### 5.1.2 状态管理优化

```typescript
// Zustand状态管理优化
import { subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export const useZCUStore = create<ZCUState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // 状态分片
      snapshots: {
        items: [],
        loading: false,
        error: null,
        pagination: { page: 1, size: 50, total: 0 }
      },
      
      workspaces: {
        active: [],
        inactive: [],
        conflicts: []
      },
      
      ui: {
        theme: 'light',
        sidebarOpen: true,
        currentView: 'snapshots',
        notifications: []
      },
      
      // 优化的Actions
      actions: {
        // 批量状态更新
        batchUpdate: (updates: Partial<ZCUState>) => {
          set((state) => {
            Object.assign(state, updates);
          });
        },
        
        // 智能缓存更新
        updateSnapshots: (snapshots: Snapshot[]) => {
          set((state) => {
            state.snapshots.items = snapshots;
            state.snapshots.loading = false;
          });
          
          // 更新缓存
          cacheManager.set('snapshots:recent', snapshots);
        },
        
        // 增量状态更新
        updateWorkspaceStatus: (workspaceId: string, status: WorkspaceStatus) => {
          set((state) => {
            const workspace = state.workspaces.active.find(w => w.id === workspaceId);
            if (workspace) {
              workspace.status = status;
            }
          });
        }
      }
    }))
  )
);

// 选择器优化
export const selectSnapshots = (state: ZCUState) => state.snapshots.items;
export const selectActiveWorkspaces = (state: ZCUState) => state.workspaces.active;
export const selectUIState = (state: ZCUState) => state.ui;

// 订阅优化
export const useSnapshotSubscription = () => {
  const snapshots = useZCUStore(selectSnapshots);
  const [localSnapshots, setLocalSnapshots] = useState(snapshots);
  
  // 防抖更新
  const debouncedUpdate = useMemo(
    () => debounce(setLocalSnapshots, 100),
    []
  );
  
  useEffect(() => {
    debouncedUpdate(snapshots);
  }, [snapshots, debouncedUpdate]);
  
  return localSnapshots;
};
```

### 5.2 后端性能优化

#### 5.2.1 数据库查询优化

```typescript
// LevelDB查询优化
export class OptimizedLevelDBClient {
  private db: Level;
  private batchQueue: BatchOperation[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  
  constructor(dbPath: string) {
    this.db = new Level(dbPath, { 
      valueEncoding: 'json',
      cacheSize: 32 * 1024 * 1024 // 32MB缓存
    });
  }
  
  // 批量操作优化
  async batchPut(key: string, value: any): Promise<void> {
    this.batchQueue.push({ type: 'put', key, value });
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    // 批量提交延迟
    this.batchTimeout = setTimeout(() => {
      this.flushBatch();
    }, 10); // 10ms内的操作合并
  }
  
  private async flushBatch(): Promise<void> {
    if (this.batchQueue.length === 0) return;
    
    const batch = this.db.batch();
    
    for (const operation of this.batchQueue) {
      switch (operation.type) {
        case 'put':
          batch.put(operation.key, operation.value);
          break;
        case 'del':
          batch.del(operation.key);
          break;
      }
    }
    
    await batch.write();
    this.batchQueue = [];
    this.batchTimeout = null;
  }
  
  // 范围查询优化
  async getByPrefix(prefix: string, limit = 100): Promise<Array<{key: string, value: any}>> {
    const results: Array<{key: string, value: any}> = [];
    
    const iterator = this.db.iterator({
      gte: prefix,
      lt: prefix + '\xFF',
      limit
    });
    
    for await (const [key, value] of iterator) {
      results.push({ key, value });
    }
    
    return results;
  }
  
  // 并发查询优化
  async parallelGet(keys: string[]): Promise<Map<string, any>> {
    const results = new Map();
    const chunks = this.chunkArray(keys, 50); // 分批查询
    
    const promises = chunks.map(async (chunk) => {
      const chunkResults = await Promise.allSettled(
        chunk.map(key => this.db.get(key))
      );
      
      chunk.forEach((key, index) => {
        const result = chunkResults[index];
        if (result.status === 'fulfilled') {
          results.set(key, result.value);
        }
      });
    });
    
    await Promise.all(promises);
    return results;
  }
}
```

#### 5.2.2 文件操作优化

```typescript
// 文件操作优化器
export class FileOperationOptimizer {
  private operationQueue: FileOperation[] = [];
  private processing = false;
  
  // 智能文件差异计算
  async calculateOptimizedDiff(
    baseSnapshot: string,
    targetSnapshot: string
  ): Promise<OptimizedDiff> {
    // 使用二进制差异算法
    const baseBinary = await this.readFileBinary(baseSnapshot);
    const targetBinary = await this.readFileBinary(targetSnapshot);
    
    // Myers算法优化的差异计算
    const diff = await this.myersDiff(baseBinary, targetBinary);
    
    // 压缩差异数据
    const compressedDiff = await this.compressDiff(diff);
    
    return {
      type: 'optimized',
      baseSnapshot,
      targetSnapshot,
      diff: compressedDiff,
      compressionRatio: baseBinary.length / compressedDiff.length
    };
  }
  
  // 并行文件处理
  async processFilesInParallel<T>(
    files: string[],
    processor: (file: string) => Promise<T>,
    concurrency = 10
  ): Promise<T[]> {
    const results: T[] = [];
    const chunks = this.chunkArray(files, concurrency);
    
    for (const chunk of chunks) {
      const chunkResults = await Promise.all(
        chunk.map(file => processor(file))
      );
      results.push(...chunkResults);
    }
    
    return results;
  }
  
  // 增量同步优化
  async incrementalSync(
    sourceDir: string,
    targetDir: string,
    lastSyncTimestamp: number
  ): Promise<SyncResult> {
    // 只同步变更的文件
    const changedFiles = await this.getChangedFiles(sourceDir, lastSyncTimestamp);
    
    const syncOperations = await Promise.all(
      changedFiles.map(async (file) => {
        const sourcePath = path.join(sourceDir, file.path);
        const targetPath = path.join(targetDir, file.path);
        
        switch (file.operation) {
          case 'create':
          case 'modify':
            await fs.copy(sourcePath, targetPath);
            break;
          case 'delete':
            await fs.remove(targetPath);
            break;
          case 'rename':
            await fs.move(
              path.join(targetDir, file.oldPath),
              targetPath
            );
            break;
        }
        
        return { file: file.path, operation: file.operation };
      })
    );
    
    return {
      syncedFiles: syncOperations.length,
      operations: syncOperations,
      duration: Date.now() - performance.now()
    };
  }
}
```

---

## 6. 安全架构设计

### 6.1 数据安全策略

#### 6.1.1 加密存储方案

```typescript
// 数据加密管理器
export class DataEncryptionManager {
  private readonly algorithm = 'aes-256-gcm';
  private encryptionKey: Buffer;
  
  constructor() {
    this.encryptionKey = this.deriveEncryptionKey();
  }
  
  // 敏感数据加密
  async encryptSensitiveData(data: any): Promise<EncryptedData> {
    const jsonData = JSON.stringify(data);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
    cipher.setAAD(Buffer.from('zcu-metadata'));
    
    let encrypted = cipher.update(jsonData, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      timestamp: Date.now()
    };
  }
  
  // 数据解密
  async decryptSensitiveData(encryptedData: EncryptedData): Promise<any> {
    const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
    decipher.setAAD(Buffer.from('zcu-metadata'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  }
  
  // 密钥派生
  private deriveEncryptionKey(): Buffer {
    const password = process.env.ZCU_ENCRYPTION_PASSWORD || 'zcu-default-key';
    const salt = Buffer.from('zcu-salt-2025', 'utf8');
    
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  }
}

// 数据脱敏处理
export class DataSanitizer {
  private sensitivePatterns = [
    /api[_-]?key/i,
    /password/i,
    /secret/i,
    /token/i,
    /auth/i,
    /credential/i
  ];
  
  // 自动脱敏
  sanitizeData(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      
      for (const [key, value] of Object.entries(data)) {
        if (this.isSensitiveKey(key)) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      
      return sanitized;
    }
    
    return data;
  }
  
  private isSensitiveKey(key: string): boolean {
    return this.sensitivePatterns.some(pattern => pattern.test(key));
  }
  
  private sanitizeString(str: string): string {
    // 移除可能的敏感信息
    return str
      .replace(/sk-[a-zA-Z0-9]{48}/g, '[API_KEY_REDACTED]')
      .replace(/\b[A-Za-z0-9]{32,}\b/g, '[HASH_REDACTED]');
  }
}
```

### 6.2 操作安全控制

#### 6.2.1 权限验证系统

```typescript
// 操作权限管理
export class OperationPermissionManager {
  private permissionMatrix: Map<string, PermissionRule[]> = new Map();
  
  constructor() {
    this.initializePermissionRules();
  }
  
  // 操作权限验证
  async checkOperationPermission(
    operation: Operation,
    context: OperationContext
  ): Promise<PermissionResult> {
    const rules = this.permissionMatrix.get(operation.type) || [];
    
    for (const rule of rules) {
      const result = await this.evaluateRule(rule, operation, context);
      
      if (!result.allowed) {
        return {
          allowed: false,
          reason: result.reason,
          requiredConfirmation: result.confirmation
        };
      }
    }
    
    return { allowed: true };
  }
  
  // 危险操作检测
  async detectDangerousOperation(operation: Operation): Promise<DangerAssessment> {
    const riskFactors: RiskFactor[] = [];
    
    // 检测大规模文件删除
    if (operation.type === 'delete' && operation.files.length > 10) {
      riskFactors.push({
        type: 'mass_deletion',
        severity: 'high',
        description: `将删除 ${operation.files.length} 个文件`
      });
    }
    
    // 检测系统文件操作
    const systemFiles = operation.files.filter(f => 
      f.path.includes('node_modules') || 
      f.path.includes('.git') ||
      f.path.startsWith('/')
    );
    
    if (systemFiles.length > 0) {
      riskFactors.push({
        type: 'system_file_access',
        severity: 'medium',
        description: '操作涉及系统关键文件'
      });
    }
    
    // 计算总体风险等级
    const riskLevel = this.calculateRiskLevel(riskFactors);
    
    return {
      riskLevel,
      riskFactors,
      requiresConfirmation: riskLevel >= 'medium',
      recommendedActions: this.getRecommendedActions(riskFactors)
    };
  }
  
  private initializePermissionRules(): void {
    // Undo操作权限规则
    this.permissionMatrix.set('undo', [
      {
        name: 'recent_operation_check',
        evaluator: async (op, ctx) => {
          const lastOperation = await this.getLastOperation(ctx.workspaceId);
          const timeDiff = Date.now() - lastOperation.timestamp;
          
          if (timeDiff > 3600000) { // 1小时
            return {
              allowed: false,
              reason: '操作时间过久，为安全起见需要确认',
              confirmation: 'extended_time_warning'
            };
          }
          
          return { allowed: true };
        }
      }
    ]);
    
    // 删除操作权限规则
    this.permissionMatrix.set('delete', [
      {
        name: 'file_count_limit',
        evaluator: async (op, ctx) => {
          if (op.files.length > 50) {
            return {
              allowed: false,
              reason: '单次删除文件数量过多',
              confirmation: 'mass_deletion_warning'
            };
          }
          return { allowed: true };
        }
      }
    ]);
  }
}

// 操作确认系统
export class OperationConfirmationSystem {
  // 生成确认提示
  generateConfirmationPrompt(
    operation: Operation,
    dangerAssessment: DangerAssessment
  ): ConfirmationPrompt {
    const prompt: ConfirmationPrompt = {
      title: this.getOperationTitle(operation),
      description: this.getOperationDescription(operation),
      riskLevel: dangerAssessment.riskLevel,
      warnings: dangerAssessment.riskFactors.map(factor => factor.description),
      actions: [
        {
          label: '确认执行',
          action: 'confirm',
          variant: dangerAssessment.riskLevel === 'high' ? 'danger' : 'primary'
        },
        {
          label: '取消',
          action: 'cancel',
          variant: 'secondary'
        }
      ]
    };
    
    // 高风险操作需要额外确认
    if (dangerAssessment.riskLevel === 'high') {
      prompt.requiresTypeConfirmation = true;
      prompt.typeConfirmationText = 'CONFIRM';
    }
    
    return prompt;
  }
  
  // CLI确认界面
  async showCLIConfirmation(prompt: ConfirmationPrompt): Promise<boolean> {
    console.log(chalk.yellow.bold(`⚠️  ${prompt.title}`));
    console.log(chalk.gray(prompt.description));
    
    if (prompt.warnings.length > 0) {
      console.log(chalk.red('\n风险警告:'));
      prompt.warnings.forEach(warning => {
        console.log(chalk.red(`  • ${warning}`));
      });
    }
    
    if (prompt.requiresTypeConfirmation) {
      const typeConfirmation = await inquirer.prompt([{
        type: 'input',
        name: 'confirmation',
        message: `请输入 "${prompt.typeConfirmationText}" 以确认操作:`
      }]);
      
      if (typeConfirmation.confirmation !== prompt.typeConfirmationText) {
        return false;
      }
    }
    
    const answer = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: '确认要继续吗?',
      default: false
    }]);
    
    return answer.proceed;
  }
}
```

---

## 7. 监控与运维架构

### 7.1 监控系统设计

#### 7.1.1 性能监控

```typescript
// 性能监控系统
export class PerformanceMonitor {
  private metrics: Map<string, MetricCollector> = new Map();
  private alerts: AlertManager;
  
  constructor() {
    this.alerts = new AlertManager();
    this.initializeMetricCollectors();
  }
  
  // 操作性能监控
  async monitorOperation<T>(
    operationName: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    const memoryBefore = process.memoryUsage();
    
    try {
      const result = await operation();
      const duration = performance.now() - startTime;
      const memoryAfter = process.memoryUsage();
      
      await this.recordMetric({
        name: operationName,
        duration,
        memoryDelta: memoryAfter.heapUsed - memoryBefore.heapUsed,
        success: true,
        timestamp: Date.now()
      });
      
      // 性能警告检查
      if (duration > this.getThreshold(operationName)) {
        await this.alerts.triggerAlert({
          type: 'performance_warning',
          operation: operationName,
          duration,
          threshold: this.getThreshold(operationName)
        });
      }
      
      return result;
      
    } catch (error) {
      await this.recordMetric({
        name: operationName,
        duration: performance.now() - startTime,
        error: error.message,
        success: false,
        timestamp: Date.now()
      });
      
      throw error;
    }
  }
  
  // 系统资源监控
  async collectSystemMetrics(): Promise<SystemMetrics> {
    const cpuUsage = await this.getCPUUsage();
    const memoryUsage = process.memoryUsage();
    const diskUsage = await this.getDiskUsage();
    
    const metrics: SystemMetrics = {
      cpu: {
        usage: cpuUsage,
        loadAverage: os.loadavg()
      },
      memory: {
        used: memoryUsage.heapUsed,
        total: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss
      },
      disk: diskUsage,
      timestamp: Date.now()
    };
    
    // 资源警告检查
    await this.checkResourceAlerts(metrics);
    
    return metrics;
  }
  
  // 业务指标监控
  async trackBusinessMetrics(): Promise<BusinessMetrics> {
    const db = await this.getDatabase();
    
    const metrics: BusinessMetrics = {
      // 操作统计
      operations: {
        undoCount: await db.count('operation:*:undo'),
        redoCount: await db.count('operation:*:redo'),
        snapshotCount: await db.count('snapshot:*'),
        conflictCount: await db.count('conflict:*:active')
      },
      
      // 工作空间统计
      workspaces: {
        activeCount: await db.count('workspace:*:active'),
        totalCount: await db.count('workspace:*'),
        conflictWorkspaces: await db.count('workspace:*:conflict')
      },
      
      // 性能统计
      performance: {
        averageUndoTime: await this.calculateAverageMetric('undo_operation'),
        averageSnapshotSize: await this.calculateAverageMetric('snapshot_size'),
        cacheHitRate: await this.calculateCacheHitRate()
      },
      
      timestamp: Date.now()
    };
    
    return metrics;
  }
}

// 告警管理系统
export class AlertManager {
  private alertHandlers: Map<string, AlertHandler[]> = new Map();
  private alertHistory: Alert[] = [];
  
  // 注册告警处理器
  registerHandler(alertType: string, handler: AlertHandler): void {
    if (!this.alertHandlers.has(alertType)) {
      this.alertHandlers.set(alertType, []);
    }
    
    this.alertHandlers.get(alertType)!.push(handler);
  }
  
  // 触发告警
  async triggerAlert(alert: Alert): Promise<void> {
    // 告警去重
    if (this.isDuplicateAlert(alert)) {
      return;
    }
    
    this.alertHistory.push(alert);
    
    const handlers = this.alertHandlers.get(alert.type) || [];
    
    await Promise.all(handlers.map(handler => 
      this.safeExecuteHandler(handler, alert)
    ));
  }
  
  private async safeExecuteHandler(handler: AlertHandler, alert: Alert): Promise<void> {
    try {
      await handler.handle(alert);
    } catch (error) {
      console.error(`Alert handler failed for ${alert.type}:`, error);
    }
  }
  
  private isDuplicateAlert(alert: Alert): boolean {
    const recentAlerts = this.alertHistory.filter(
      a => a.type === alert.type && Date.now() - a.timestamp < 300000 // 5分钟
    );
    
    return recentAlerts.length > 0;
  }
}
```

#### 7.1.2 日志系统

```typescript
// 结构化日志系统
export class StructuredLogger {
  private logLevel: LogLevel = 'info';
  private logStream: WriteStream;
  
  constructor(config: LoggerConfig) {
    this.logLevel = config.level || 'info';
    this.logStream = fs.createWriteStream(config.logFile, { flags: 'a' });
  }
  
  // 结构化日志记录
  async log(level: LogLevel, message: string, context?: LogContext): Promise<void> {
    if (!this.shouldLog(level)) return;
    
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeContext(context),
      traceId: context?.traceId || generateTraceId(),
      service: 'zcu-core'
    };
    
    const logLine = JSON.stringify(logEntry) + '\n';
    
    // 异步写入
    this.logStream.write(logLine);
    
    // 同时输出到控制台（开发模式）
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(logEntry);
    }
  }
  
  // 操作审计日志
  async auditLog(operation: Operation, result: OperationResult): Promise<void> {
    const auditEntry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      operationType: operation.type,
      operationId: operation.id,
      workspaceId: operation.workspaceId,
      userId: operation.userId || 'system',
      success: result.success,
      duration: result.duration,
      filesAffected: operation.files?.length || 0,
      errorMessage: result.error?.message,
      metadata: {
        userAgent: operation.userAgent,
        source: operation.source,
        autoGenerated: operation.autoGenerated
      }
    };
    
    // 写入审计日志文件
    const auditLogPath = path.join('.zcu', 'logs', 'audit.log');
    await fs.appendFile(auditLogPath, JSON.stringify(auditEntry) + '\n');
  }
  
  // 错误追踪
  async errorLog(error: Error, context: ErrorContext): Promise<void> {
    const errorEntry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message: error.message,
      stack: error.stack,
      context: this.sanitizeContext(context),
      errorType: error.constructor.name,
      traceId: context.traceId || generateTraceId()
    };
    
    await this.log('error', error.message, context);
    
    // 严重错误发送告警
    if (context.severity === 'critical') {
      await this.sendErrorAlert(errorEntry);
    }
  }
  
  private sanitizeContext(context?: any): any {
    if (!context) return {};
    
    const sanitizer = new DataSanitizer();
    return sanitizer.sanitizeData(context);
  }
}

// 日志轮转管理
export class LogRotationManager {
  private rotationConfig: LogRotationConfig;
  
  constructor(config: LogRotationConfig) {
    this.rotationConfig = config;
    this.scheduleRotation();
  }
  
  // 日志轮转
  async rotateLog(logFile: string): Promise<void> {
    const stats = await fs.stat(logFile);
    
    // 检查是否需要轮转
    if (stats.size < this.rotationConfig.maxSize && 
        Date.now() - stats.mtime.getTime() < this.rotationConfig.maxAge) {
      return;
    }
    
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const rotatedFile = `${logFile}.${timestamp}`;
    
    // 重命名当前日志文件
    await fs.rename(logFile, rotatedFile);
    
    // 创建新的日志文件
    await fs.writeFile(logFile, '');
    
    // 压缩旧文件
    if (this.rotationConfig.compress) {
      await this.compressLogFile(rotatedFile);
    }
    
    // 清理过期文件
    await this.cleanupOldLogs(path.dirname(logFile));
  }
  
  private async compressLogFile(logFile: string): Promise<void> {
    const gzip = zlib.createGzip();
    const source = fs.createReadStream(logFile);
    const destination = fs.createWriteStream(`${logFile}.gz`);
    
    return new Promise((resolve, reject) => {
      source.pipe(gzip).pipe(destination)
        .on('finish', async () => {
          await fs.unlink(logFile); // 删除原文件
          resolve();
        })
        .on('error', reject);
    });
  }
}
```

### 7.2 错误恢复机制

#### 7.2.1 自动故障恢复

```typescript
// 故障恢复系统
export class FailureRecoverySystem {
  private recoveryStrategies: Map<string, RecoveryStrategy> = new Map();
  private recoveryHistory: RecoveryAttempt[] = [];
  
  constructor() {
    this.initializeRecoveryStrategies();
  }
  
  // 自动恢复处理
  async handleFailure(error: SystemError, context: FailureContext): Promise<RecoveryResult> {
    const strategy = this.selectRecoveryStrategy(error, context);
    
    if (!strategy) {
      return {
        success: false,
        reason: 'No suitable recovery strategy found',
        recommendation: 'Manual intervention required'
      };
    }
    
    const attempt: RecoveryAttempt = {
      id: generateId(),
      errorType: error.type,
      strategy: strategy.name,
      timestamp: Date.now(),
      context
    };
    
    try {
      const result = await strategy.recover(error, context);
      
      attempt.success = result.success;
      attempt.duration = Date.now() - attempt.timestamp;
      
      this.recoveryHistory.push(attempt);
      
      if (result.success) {
        await this.logRecoverySuccess(attempt, result);
      } else {
        await this.logRecoveryFailure(attempt, result);
      }
      
      return result;
      
    } catch (recoveryError) {
      attempt.success = false;
      attempt.error = recoveryError.message;
      attempt.duration = Date.now() - attempt.timestamp;
      
      this.recoveryHistory.push(attempt);
      
      return {
        success: false,
        reason: 'Recovery strategy failed',
        error: recoveryError,
        recommendation: 'Escalate to manual recovery'
      };
    }
  }
  
  private initializeRecoveryStrategies(): void {
    // 数据库连接失败恢复
    this.recoveryStrategies.set('database_connection_failed', {
      name: 'database_reconnect',
      recover: async (error, context) => {
        // 重新初始化数据库连接
        await this.reinitializeDatabase();
        
        // 验证连接
        const isHealthy = await this.verifyDatabaseHealth();
        
        return {
          success: isHealthy,
          reason: isHealthy ? 'Database reconnected successfully' : 'Database still unhealthy',
          actions: ['database_reconnected']
        };
      }
    });
    
    // 文件系统错误恢复
    this.recoveryStrategies.set('file_system_error', {
      name: 'file_system_recovery',
      recover: async (error, context) => {
        const actions: string[] = [];
        
        // 检查磁盘空间
        const diskSpace = await this.checkDiskSpace();
        if (diskSpace.available < 100 * 1024 * 1024) { // 100MB
          await this.cleanupTempFiles();
          actions.push('temp_files_cleaned');
        }
        
        // 修复文件权限
        if (error.message.includes('permission')) {
          await this.fixFilePermissions(context.projectPath);
          actions.push('permissions_fixed');
        }
        
        // 创建缺失目录
        if (error.message.includes('ENOENT')) {
          await fs.ensureDir(path.dirname(context.filePath));
          actions.push('directories_created');
        }
        
        return {
          success: actions.length > 0,
          reason: actions.length > 0 ? 'File system issues resolved' : 'No recovery actions needed',
          actions
        };
      }
    });
    
    // 内存不足恢复
    this.recoveryStrategies.set('out_of_memory', {
      name: 'memory_recovery',
      recover: async (error, context) => {
        const actions: string[] = [];
        
        // 清理缓存
        await cacheManager.clear();
        actions.push('cache_cleared');
        
        // 强制垃圾回收
        if (global.gc) {
          global.gc();
          actions.push('garbage_collected');
        }
        
        // 降级操作模式
        this.enableLowMemoryMode();
        actions.push('low_memory_mode_enabled');
        
        return {
          success: true,
          reason: 'Memory pressure reduced',
          actions,
          recommendation: 'Consider upgrading system memory'
        };
      }
    });
  }
  
  // 健康检查
  async performHealthCheck(): Promise<HealthCheckResult> {
    const checks: HealthCheck[] = [
      {
        name: 'database_health',
        check: async () => {
          const db = await this.getDatabase();
          await db.get('health_check');
          return { healthy: true };
        }
      },
      {
        name: 'file_system_health', 
        check: async () => {
          const testFile = path.join('.zcu', 'health_check.tmp');
          await fs.writeFile(testFile, 'health_check');
          await fs.unlink(testFile);
          return { healthy: true };
        }
      },
      {
        name: 'memory_health',
        check: async () => {
          const memoryUsage = process.memoryUsage();
          const isHealthy = memoryUsage.heapUsed < memoryUsage.heapTotal * 0.9;
          return { 
            healthy: isHealthy,
            details: { memoryUsage: memoryUsage.heapUsed / 1024 / 1024 }
          };
        }
      }
    ];
    
    const results = await Promise.all(
      checks.map(async (check) => {
        try {
          const result = await check.check();
          return { name: check.name, ...result };
        } catch (error) {
          return { 
            name: check.name, 
            healthy: false, 
            error: error.message 
          };
        }
      })
    );
    
    const overallHealth = results.every(r => r.healthy);
    
    return {
      healthy: overallHealth,
      checks: results,
      timestamp: Date.now()
    };
  }
}
```

---

## 8. 集成与部署架构

### 8.1 CI/CD流水线设计

#### 8.1.1 自动化构建流程

```yaml
# .github/workflows/ci.yml
name: ZCU CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
        os: [ubuntu-latest, windows-latest, macos-latest]
    
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Run type check
        run: pnpm typecheck
      
      - name: Run linting
        run: pnpm lint
      
      - name: Run unit tests
        run: pnpm test:coverage
      
      - name: Run integration tests
        run: pnpm test:integration
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info

  e2e-test:
    runs-on: ubuntu-latest
    needs: test
    
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build application
        run: pnpm build
      
      - name: Run E2E tests
        run: pnpm test:e2e

  build:
    runs-on: ubuntu-latest
    needs: [test, e2e-test]
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build packages
        run: pnpm build
      
      - name: Package CLI binary
        run: pnpm package
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: zcu-build
          path: |
            dist/
            bin/
            packages/

  release:
    runs-on: ubuntu-latest
    needs: build
    if: startsWith(github.ref, 'refs/tags/v')
    
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
          registry-url: 'https://registry.npmjs.org'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      
      - name: Build and package
        run: pnpm build && pnpm package
      
      - name: Publish to npm
        run: pnpm publish --no-git-checks
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: ZCU ${{ github.ref }}
          body: |
            ## 新功能 What's New
            
            ### ✨ 功能增强 Features
            - 改进的快照管理界面
            - 增强的AI工作空间隔离
            - 优化的冲突解决机制
            
            ### 🐛 错误修复 Bug Fixes  
            - 修复大文件处理性能问题
            - 解决跨平台兼容性问题
            
            ### 🔧 技术改进 Technical Improvements
            - 升级依赖项版本
            - 优化构建流程
            - 改进错误处理
            
            ## 安装和升级 Installation & Upgrade
            
            ```bash
            # 全新安装
            npm install -g zcu
            
            # 从旧版本升级
            npm update -g zcu
            ```
            
            ## 破坏性变更 Breaking Changes
            
            无破坏性变更
            
            ## 完整变更日志
            
            查看 [CHANGELOG.md](CHANGELOG.md) 获取详细变更信息。
```

#### 8.1.2 多平台打包策略

```typescript
// build.config.ts - unbuild配置
export default defineBuildConfig([
  // CLI核心包
  {
    name: 'zcu-core',
    entries: ['src/index'],
    outDir: 'dist',
    clean: true,
    declaration: true,
    rollup: {
      emitCJS: true,
      esbuild: {
        target: 'node16'
      }
    },
    externals: [
      'leveldown',
      'fsevents' // macOS特定依赖
    ]
  },
  
  // CLI二进制
  {
    name: 'zcu-cli',
    entries: ['src/cli'],
    outDir: 'bin',
    clean: false,
    rollup: {
      emitCJS: true,
      inlineDynamicImports: true,
      esbuild: {
        target: 'node16',
        banner: '#!/usr/bin/env node'
      }
    }
  },
  
  // Web Dashboard
  {
    name: 'zcu-web',
    entries: ['src/web/index'],
    outDir: 'dist/web',
    rollup: {
      emitCJS: false,
      esbuild: {
        target: 'es2020',
        format: 'esm'
      }
    }
  }
])

// package.config.ts - 多平台打包
export const packageConfig = {
  targets: [
    {
      platform: 'win32',
      arch: 'x64',
      output: 'zcu-win-x64.exe'
    },
    {
      platform: 'darwin', 
      arch: 'x64',
      output: 'zcu-mac-x64'
    },
    {
      platform: 'darwin',
      arch: 'arm64', 
      output: 'zcu-mac-arm64'
    },
    {
      platform: 'linux',
      arch: 'x64',
      output: 'zcu-linux-x64'
    }
  ],
  
  // 平台特定配置
  platformSpecific: {
    win32: {
      icon: 'assets/icon.ico',
      productName: 'ZCU - Z Claude Undo',
      productDescription: 'Advanced undo/redo for Claude Code'
    },
    darwin: {
      icon: 'assets/icon.icns',
      category: 'public.app-category.developer-tools'
    },
    linux: {
      icon: 'assets/icon.png',
      desktop: {
        Name: 'ZCU',
        Comment: 'Advanced undo/redo for Claude Code',
        Categories: 'Development;'
      }
    }
  }
}
```

### 8.2 部署策略

#### 8.2.1 容器化部署

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# 复制包管理文件
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./

# 安装依赖
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm build

# 生产镜像
FROM node:18-alpine AS runtime

WORKDIR /app

# 安装生产依赖
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/bin ./bin

# 创建非root用户
RUN addgroup -g 1001 -S zcu
RUN adduser -S zcu -u 1001
USER zcu

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node bin/zcu.mjs --health-check

EXPOSE 3001

CMD ["node", "bin/zcu.mjs", "serve"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  zcu-server:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - ZCU_DATA_DIR=/data
      - ZCU_LOG_LEVEL=info
    volumes:
      - zcu_data:/data
      - zcu_logs:/app/logs
    healthcheck:
      test: ["CMD", "node", "bin/zcu.mjs", "--health-check"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    
  # 可选：Redis缓存
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped
    
  # 可选：监控
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    restart: unless-stopped

volumes:
  zcu_data:
  zcu_logs:
  redis_data:
  prometheus_data:
```

#### 8.2.2 云服务部署

```typescript
// deploy/aws-lambda.ts - Lambda部署配置
export const lambdaConfig = {
  functionName: 'zcu-api-handler',
  runtime: 'nodejs18.x',
  handler: 'dist/lambda.handler',
  memorySize: 1024,
  timeout: 30,
  
  environment: {
    NODE_ENV: 'production',
    ZCU_DATA_BUCKET: 'zcu-data-bucket',
    ZCU_LOG_LEVEL: 'info'
  },
  
  layers: [
    'arn:aws:lambda:us-east-1:123456789012:layer:zcu-dependencies:1'
  ],
  
  vpc: {
    securityGroupIds: ['sg-12345678'],
    subnetIds: ['subnet-12345678', 'subnet-87654321']
  }
}

// next.config.js - Next.js 15配置（UnoCSS集成）
import UnoCSS from '@unocss/next'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // React 19 和 Next.js 15 新特性
  experimental: {
    // appDir 在 Next.js 15 中已稳定，不再需要
    serverExternalPackages: ['@zcu/core'], // 更新的配置名
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  transpilePackages: ['@zcu/shared'],
  env: {
    ZCU_API_URL: process.env.ZCU_API_URL || 'http://localhost:3001',
  },
  // React 19 优化
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default UnoCSS(nextConfig)

// deploy/vercel.ts - Vercel部署配置  
export const vercelConfig = {
  name: 'zcu-web-dashboard',
  version: 2,
  
  builds: [
    {
      src: 'src/web/**/*',
      use: '@vercel/next'
    },
    {
      src: 'src/api/**/*',
      use: '@vercel/node'
    }
  ],
  
  routes: [
    {
      src: '/api/(.*)',
      dest: '/src/api/$1'
    },
    {
      src: '/(.*)',
      dest: '/src/web/$1'
    }
  ],
  
  env: {
    ZCU_API_URL: 'https://api.zcu.dev',
    NODE_ENV: 'production',
    UNOCSS_MODE: 'production'
  }
}
```

---

## 9. 项目结构与依赖管理

### 9.1 Monorepo架构

```
zcu/
├── packages/
│   ├── core/                   # 核心库
│   │   ├── src/
│   │   │   ├── storage/        # 存储层
│   │   │   ├── workspace/      # 工作空间管理
│   │   │   ├── operations/     # 操作引擎
│   │   │   └── types/          # 类型定义
│   │   └── package.json
│   ├── cli/                    # CLI界面
│   │   ├── src/
│   │   │   ├── commands/       # 命令实现
│   │   │   ├── ui/            # Ink组件
│   │   │   └── adapters/       # 适配器
│   │   └── package.json  
│   ├── web/                    # Web Dashboard
│   │   ├── src/
│   │   │   ├── pages/          # Next.js页面
│   │   │   ├── components/     # React组件
│   │   │   └── lib/           # 工具函数
│   │   └── package.json
│   ├── shared/                 # 共享组件库
│   │   ├── src/
│   │   │   ├── components/     # UI组件
│   │   │   ├── hooks/          # React Hooks
│   │   │   ├── utils/          # 工具函数
│   │   │   └── types/          # 共享类型
│   │   └── package.json
│   └── adapters/               # 平台适配器
│       ├── shadcn-ink/         # shadcn/ui Ink适配
│       ├── unocss-config/      # UnoCSS配置 (移除Tailwind兼容)
│       │   ├── shadcn-preset.ts          # shadcn/ui UnoCSS预设
│       │   ├── cli-preset.ts             # CLI专用预设
│       │   └── web-preset.ts             # Web专用预设
│       └── i18n-config/        # 国际化配置
├── apps/
│   ├── desktop/                # 桌面应用(Electron)
│   └── vscode-extension/       # VS Code扩展
├── tools/
│   ├── build/                  # 构建工具
│   ├── test/                   # 测试工具
│   └── deploy/                 # 部署脚本
├── docs/                       # 文档
├── examples/                   # 使用示例
└── scripts/                    # 项目脚本
```

### 9.2 依赖管理策略

#### 9.2.1 package.json配置

```json
{
  "name": "zcu",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.15.1",
  "description": "Z Claude Undo - Advanced undo/redo for Claude Code",
  "keywords": ["claude-code", "undo", "redo", "ai", "workspace", "shadcn", "unocss"],
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/your-org/zcu.git"
  },
  
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "test:e2e": "turbo run test:e2e",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish"
  },
  
  "devDependencies": {
    "@changesets/cli": "^2.29.6",
    "@types/node": "^22.18.0",
    "@antfu/eslint-config": "^5.2.1",
    "@vitest/coverage-v8": "^3.2.4",
    "@vitest/ui": "^3.2.4",
    "eslint": "^9.34.0",
    "eslint-plugin-format": "^1.0.1",
    "prettier": "^3.3.3",
    "turbo": "^2.3.3",
    "typescript": "^5.9.2",
    "unbuild": "^3.6.1",
    "vitest": "^3.2.4"
  },
  
  "pnpm": {
    "overrides": {
      "@types/react": "^19.1.1",
      "@types/react-dom": "^19.1.1"
    },
    "peerDependencyRules": {
      "ignoreMissing": [
        "@types/react",
        "@types/react-dom"
      ]
    }
  }
}
```

#### 9.2.2 pnpm-workspace.yaml 和 Catalog 配置

采用 catalog 管理依赖版本，实现集中化版本控制 (参考 haitai-solar-monorepo 模式)：

```yaml
# pnpm-workspace.yaml
packages:
  - packages/*
  - apps/*
  - tools/*
  - '!**/node_modules'
  
catalog:
  # React 生态系统
  'react': ^19.1.1
  'react-dom': ^19.1.1
  '@types/react': ^19.1.1
  '@types/react-dom': ^19.1.1
  
  # Next.js 和构建工具
  'next': ^15.5.2
  'typescript': ^5.9.2
  'unbuild': ^3.6.1
  'turbo': ^2.3.3
  'vite': ^6.0.11
  
  # ESLint 配置 (使用 @antfu/eslint-config)
  '@antfu/eslint-config': ^5.2.1
  'eslint': ^9.34.0
  'eslint-plugin-format': ^1.0.1
  
  # 测试框架
  'vitest': ^3.2.4
  '@vitest/coverage-v8': ^3.2.4
  '@vitest/ui': ^3.2.4
  
  # UnoCSS 相关
  'unocss': ^66.4.2
  '@unocss/next': ^66.4.2
  '@unocss/reset': ^66.4.2
  'unocss-preset-shadcn': ^0.3.2
  
  # UI 组件库
  '@radix-ui/react-slot': ^1.1.0
  '@radix-ui/react-avatar': ^1.1.1
  '@radix-ui/react-dialog': ^1.1.2
  '@radix-ui/react-dropdown-menu': ^2.1.2
  '@radix-ui/react-toast': ^1.2.2
  '@radix-ui/react-tooltip': ^1.1.3
  '@radix-ui/react-popover': ^1.1.2
  '@radix-ui/react-select': ^2.1.2
  '@radix-ui/react-tabs': ^1.1.1
  'lucide-react': ^0.473.0
  'class-variance-authority': ^0.7.1
  'clsx': ^2.1.1
  'tailwind-merge': ^2.6.0
  
  # 状态管理和工具
  'zustand': ^4.5.5
  'dayjs': ^1.11.13
  'semver': ^7.7.2
  'zod': ^3.24.1
  
  # 国际化
  'i18next': ^25.4.2
  'react-i18next': ^15.0.2
  'i18next-fs-backend': ^2.6.0
  
  # CLI 工具
  'ink': ^5.0.1
  'commander': ^12.1.0
  'chalk': ^5.3.0
  'enquirer': ^2.4.1
  'ora': ^8.2.0
  'figures': ^6.1.0
  
  # 系统工具
  '@types/node': ^22.18.0
  'level': ^8.0.1
  'simple-git': ^3.25.0
  'fs-extra': ^11.2.0
  
  # 版本管理
  '@changesets/cli': ^2.29.6
  
  # 包管理器
  'pnpm': ^10.15.1
  
onlyBuiltDependencies:
  - '@swc/core'
  - 'sharp'
  - 'level'
  - 'sqlite3'
```

**Catalog 使用方式：**

```json
// 在各个 package.json 中使用 catalog: 引用
{
  "dependencies": {
    "react": "catalog:",
    "next": "catalog:",
    "zod": "catalog:"
  },
  "devDependencies": {
    "@antfu/eslint-config": "catalog:",
    "vitest": "catalog:",
    "typescript": "catalog:"
  }
}
```

#### 9.2.3 核心包依赖

```json
// packages/core/package.json
{
  "name": "@zcu/core",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.mjs",
  "module": "dist/index.mjs", 
  "types": "dist/index.d.mts",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "types": "./dist/index.d.mts"
    },
    "./storage": {
      "import": "./dist/storage.mjs",
      "types": "./dist/storage.d.mts"  
    },
    "./workspace": {
      "import": "./dist/workspace.mjs",
      "types": "./dist/workspace.d.mts"
    }
  },
  
  "dependencies": {
    "level": "catalog:",
    "simple-git": "catalog:",
    "semver": "catalog:",
    "dayjs": "catalog:",
    "zod": "catalog:",
    "fs-extra": "catalog:",
    "crypto": "^1.0.1"
  },
  
  "peerDependencies": {
    "typescript": ">=5.0.0"
  }
}
```

```json
// packages/shared/package.json
{
  "name": "@zcu/shared",
  "version": "1.0.0", 
  "type": "module",
  "main": "dist/index.mjs",
  "types": "dist/index.d.mts",
  "exports": {
    ".": "./dist/index.mjs",
    "./components": "./dist/components.mjs",
    "./hooks": "./dist/hooks.mjs",
    "./utils": "./dist/utils.mjs"
  },
  
  "dependencies": {
    "@zcu/core": "workspace:*",
    "react": "catalog:",
    "zustand": "catalog:",
    "i18next": "catalog:",
    "react-i18next": "catalog:",
    "@radix-ui/react-slot": "catalog:",
    "class-variance-authority": "catalog:",
    "clsx": "catalog:",
    "tailwind-merge": "catalog:"
  },
  
  "peerDependencies": {
    "react": ">=19.1.1"
  }
}
```

#### 9.2.3 UI组件包依赖

```json
// packages/cli/package.json
{
  "name": "@zcu/cli",
  "version": "1.0.0",
  "type": "module", 
  "bin": {
    "zcu": "./bin/zcu.mjs"
  },
  
  "dependencies": {
    "@zcu/core": "workspace:*",
    "@zcu/shared": "workspace:*",
    "ink": "catalog:",
    "react": "catalog:",
    "commander": "catalog:",
    "chalk": "catalog:",
    "enquirer": "catalog:",
    "ora": "catalog:",
    "figures": "catalog:",
    "ink-select-input": "^6.0.0",
    "ink-text-input": "^6.0.0",
    "ink-spinner": "^5.0.0"
  }
}
```

```json
// packages/web/package.json
{
  "name": "@zcu/web",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start"
  },
  
  "dependencies": {
    "@zcu/core": "workspace:*",
    "@zcu/shared": "workspace:*", 
    "next": "catalog:",
    "react": "catalog:",
    "react-dom": "catalog:",
    "@radix-ui/react-avatar": "catalog:",
    "@radix-ui/react-slot": "catalog:",
    "@radix-ui/react-dialog": "catalog:",
    "@radix-ui/react-dropdown-menu": "catalog:",
    "@radix-ui/react-toast": "catalog:",
    "@radix-ui/react-tooltip": "catalog:",
    "@radix-ui/react-popover": "catalog:",
    "@radix-ui/react-select": "catalog:",
    "@radix-ui/react-tabs": "catalog:",
    "class-variance-authority": "catalog:",
    "clsx": "catalog:",
    "lucide-react": "catalog:",
    "tailwind-merge": "catalog:"
  },
  
  "devDependencies": {
    "@types/react": "catalog:",
    "@types/react-dom": "catalog:",
    "@unocss/next": "catalog:",
    "unocss": "catalog:",
    "unocss-preset-shadcn": "catalog:"
  }
}
```

---

## 10. 测试策略与质量保证

### 10.1 测试架构

#### 10.1.1 测试金字塔

```typescript
// 测试配置 - vitest.config.ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    // Vitest 3.x 新特性：改进的并行处理
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 4
      }
    },
    // 优化文件监听
    watch: {
      ignore: ['**/node_modules/**', '**/dist/**']
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.spec.ts', 
        'src/types/**',
        'node_modules/**',
        'dist/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        }
      },
      // Vitest 3.x: 支持增量覆盖率报告
      reportOnFailure: true,
      cleanOnRerun: true
    },
    // 新增：更好的错误报告
    outputFile: {
      junit: './reports/junit.xml',
      json: './reports/test-results.json'
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@zcu/core': path.resolve(__dirname, './packages/core/src'),
      '@zcu/shared': path.resolve(__dirname, './packages/shared/src')
    }
  }
})

// 测试设置 - tests/setup.ts
import { vi } from 'vitest'

// Mock LevelDB for tests
vi.mock('level', () => ({
  Level: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    put: vi.fn(), 
    del: vi.fn(),
    batch: vi.fn().mockReturnValue({
      put: vi.fn(),
      del: vi.fn(),
      write: vi.fn()
    }),
    iterator: vi.fn(),
    close: vi.fn()
  }))
}))

// Mock file system operations
vi.mock('node:fs/promises', async () => {
  const actual = await vi.importActual('node:fs/promises')
  return {
    ...actual,
    readFile: vi.fn(),
    writeFile: vi.fn(),
    unlink: vi.fn(),
    stat: vi.fn()
  }
})

// 全局测试工具
global.createMockWorkspace = () => ({
  id: 'test-workspace',
  sessionId: 'test-session',
  aiAgent: 'claude-test',
  projectPath: '/test/project',
  state: 'active' as const,
  operationChain: [],
  createdAt: Date.now(),
  lastActivity: Date.now()
})

global.createMockSnapshot = () => ({
  id: 'test-snapshot',
  description: 'Test snapshot',
  timestamp: Date.now(),
  filesCount: 3,
  workspaceId: 'test-workspace',
  checksum: 'test-checksum'
})
```

#### 10.1.2 单元测试示例

```typescript
// packages/core/src/workspace/WorkspaceManager.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { WorkspaceManager } from './WorkspaceManager'
import type { AIWorkspace } from '../types'

describe('WorkspaceManager', () => {
  let workspaceManager: WorkspaceManager
  let mockDb: any
  
  beforeEach(() => {
    mockDb = {
      get: vi.fn(),
      put: vi.fn(),
      del: vi.fn()
    }
    workspaceManager = new WorkspaceManager(mockDb)
  })
  
  describe('createWorkspace', () => {
    it('should create a new workspace with correct properties', async () => {
      const sessionId = 'test-session-123'
      const aiAgent = 'claude-3-sonnet'
      const projectPath = '/test/project'
      
      const workspace = await workspaceManager.createWorkspace(
        sessionId,
        aiAgent,
        projectPath
      )
      
      expect(workspace).toMatchObject({
        sessionId,
        aiAgent,
        projectPath,
        state: 'active',
        operationChain: []
      })
      
      expect(workspace.id).toBeDefined()
      expect(workspace.createdAt).toBeTypeOf('number')
      expect(workspace.lastActivity).toBeTypeOf('number')
    })
    
    it('should persist workspace to database', async () => {
      const workspace = await workspaceManager.createWorkspace(
        'session',
        'claude',
        '/project'
      )
      
      expect(mockDb.put).toHaveBeenCalledWith(
        `workspace:${workspace.id}:metadata`,
        expect.objectContaining({
          id: workspace.id,
          sessionId: 'session',
          aiAgent: 'claude'
        })
      )
    })
    
    it('should handle duplicate workspace creation', async () => {
      // 模拟已存在的工作空间
      mockDb.get.mockResolvedValue({
        id: 'existing-workspace',
        sessionId: 'session',
        aiAgent: 'claude'
      })
      
      const workspace = await workspaceManager.getOrCreateWorkspace(
        'session',
        'claude', 
        '/project'
      )
      
      expect(workspace.id).toBe('existing-workspace')
      expect(mockDb.put).not.toHaveBeenCalled()
    })
  })
  
  describe('conflict detection', () => {
    it('should detect file lock conflicts', async () => {
      const workspace1 = createMockWorkspace()
      const workspace2 = { ...createMockWorkspace(), id: 'workspace-2' }
      
      // 工作空间1获取文件锁
      await workspaceManager.acquireFileLocks(workspace1.id, ['file1.ts'])
      
      // 工作空间2尝试获取相同文件锁
      const conflicts = await workspaceManager.checkConflicts(
        workspace2.id,
        ['file1.ts']
      )
      
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]).toMatchObject({
        filePath: 'file1.ts',
        sourceWorkspace: workspace2.id,
        conflictWorkspace: workspace1.id,
        type: 'file_lock_conflict'
      })
    })
    
    it('should allow non-conflicting file operations', async () => {
      const workspace1 = createMockWorkspace()
      const workspace2 = { ...createMockWorkspace(), id: 'workspace-2' }
      
      await workspaceManager.acquireFileLocks(workspace1.id, ['file1.ts'])
      
      const conflicts = await workspaceManager.checkConflicts(
        workspace2.id,
        ['file2.ts'] // 不同文件
      )
      
      expect(conflicts).toHaveLength(0)
    })
  })
})
```

#### 10.1.3 集成测试

```typescript
// tests/integration/snapshot.integration.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { SnapshotManager } from '@zcu/core/snapshot'
import { ShadowRepositoryManager } from '@zcu/core/storage'

describe('Snapshot Integration Tests', () => {
  let testDir: string
  let snapshotManager: SnapshotManager
  let shadowRepo: ShadowRepositoryManager
  
  beforeEach(async () => {
    // 创建临时测试目录
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'zcu-integration-'))
    
    shadowRepo = new ShadowRepositoryManager(testDir)
    await shadowRepo.initialize()
    
    snapshotManager = new SnapshotManager(testDir, shadowRepo)
  })
  
  afterEach(async () => {
    // 清理测试目录
    await fs.rm(testDir, { recursive: true, force: true })
  })
  
  it('should create and restore snapshots correctly', async () => {
    // 创建测试文件
    const testFile = path.join(testDir, 'test.txt')
    const originalContent = 'original content'
    await fs.writeFile(testFile, originalContent)
    
    // 创建快照
    const snapshot = await snapshotManager.createSnapshot(
      'Initial snapshot',
      [{ path: 'test.txt', content: originalContent, operation: 'create' }]
    )
    
    expect(snapshot).toBeDefined()
    expect(snapshot.description).toBe('Initial snapshot')
    
    // 修改文件
    const modifiedContent = 'modified content'
    await fs.writeFile(testFile, modifiedContent)
    
    // 恢复快照
    await snapshotManager.restoreSnapshot(snapshot.id, testDir)
    
    // 验证文件已恢复
    const restoredContent = await fs.readFile(testFile, 'utf8')
    expect(restoredContent).toBe(originalContent)
  })
  
  it('should handle multiple file operations', async () => {
    const files = [
      { name: 'file1.txt', content: 'content 1' },
      { name: 'file2.txt', content: 'content 2' },
      { name: 'file3.txt', content: 'content 3' }
    ]
    
    // 创建多个文件
    for (const file of files) {
      await fs.writeFile(path.join(testDir, file.name), file.content)
    }
    
    // 创建快照
    const snapshot = await snapshotManager.createSnapshot(
      'Multi-file snapshot',
      files.map(f => ({
        path: f.name,
        content: f.content,
        operation: 'create' as const
      }))
    )
    
    // 删除所有文件
    for (const file of files) {
      await fs.unlink(path.join(testDir, file.name))
    }
    
    // 恢复快照
    await snapshotManager.restoreSnapshot(snapshot.id, testDir)
    
    // 验证所有文件已恢复
    for (const file of files) {
      const restoredContent = await fs.readFile(
        path.join(testDir, file.name),
        'utf8'
      )
      expect(restoredContent).toBe(file.content)
    }
  })
  
  it('should track snapshot history correctly', async () => {
    const snapshots = []
    
    // 创建多个快照
    for (let i = 1; i <= 3; i++) {
      await fs.writeFile(
        path.join(testDir, `file${i}.txt`),
        `content ${i}`
      )
      
      const snapshot = await snapshotManager.createSnapshot(
        `Snapshot ${i}`,
        [{ 
          path: `file${i}.txt`, 
          content: `content ${i}`, 
          operation: 'create' 
        }]
      )
      
      snapshots.push(snapshot)
    }
    
    // 获取快照历史
    const history = await snapshotManager.getSnapshotHistory()
    
    expect(history).toHaveLength(3)
    expect(history.map(s => s.description)).toEqual([
      'Snapshot 3', // 最新的在前
      'Snapshot 2',
      'Snapshot 1'
    ])
  })
})
```

#### 10.1.4 E2E测试

```typescript
// tests/e2e/cli-workflow.e2e.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { spawn, ChildProcess } from 'node:child_process'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'

describe('CLI E2E Tests', () => {
  let testProject: string
  let cliProcess: ChildProcess | null = null
  
  beforeEach(async () => {
    testProject = await fs.mkdtemp(path.join(os.tmpdir(), 'zcu-e2e-'))
    
    // 创建测试项目结构
    await fs.mkdir(path.join(testProject, 'src'))
    await fs.writeFile(
      path.join(testProject, 'src', 'index.ts'),
      'console.log("Hello ZCU")'
    )
  })
  
  afterEach(async () => {
    if (cliProcess) {
      cliProcess.kill()
      cliProcess = null
    }
    
    await fs.rm(testProject, { recursive: true, force: true })
  })
  
  const runCLICommand = (args: string[], input?: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const process = spawn('node', ['../bin/zcu.mjs', ...args], {
        cwd: testProject,
        stdio: ['pipe', 'pipe', 'pipe']
      })
      
      let output = ''
      let error = ''
      
      process.stdout.on('data', (data) => {
        output += data.toString()
      })
      
      process.stderr.on('data', (data) => {
        error += data.toString()
      })
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(output)
        } else {
          reject(new Error(`CLI exited with code ${code}: ${error}`))
        }
      })
      
      if (input) {
        process.stdin.write(input)
        process.stdin.end()
      }
    })
  }
  
  it('should initialize ZCU in project', async () => {
    const output = await runCLICommand(['init'])
    
    expect(output).toContain('ZCU initialized successfully')
    
    // 验证初始化文件存在
    const configExists = await fs.access(
      path.join(testProject, '.zcu', 'config.json')
    ).then(() => true).catch(() => false)
    
    expect(configExists).toBe(true)
  })
  
  it('should create and list snapshots', async () => {
    // 初始化
    await runCLICommand(['init'])
    
    // 创建快照
    const createOutput = await runCLICommand([
      'snapshot',
      'create',
      '--description',
      'Initial snapshot'
    ])
    
    expect(createOutput).toContain('Snapshot created successfully')
    
    // 列出快照
    const listOutput = await runCLICommand(['snapshot', 'list'])
    
    expect(listOutput).toContain('Initial snapshot')
  })
  
  it('should handle undo/redo operations', async () => {
    await runCLICommand(['init'])
    
    // 创建初始快照
    await runCLICommand(['snapshot', 'create', '-d', 'Initial'])
    
    // 修改文件
    await fs.writeFile(
      path.join(testProject, 'src', 'index.ts'),
      'console.log("Modified content")'
    )
    
    // 创建修改后快照
    await runCLICommand(['snapshot', 'create', '-d', 'Modified'])
    
    // 执行撤销
    const undoOutput = await runCLICommand(['undo'])
    
    expect(undoOutput).toContain('Undo completed successfully')
    
    // 验证文件已恢复
    const restoredContent = await fs.readFile(
      path.join(testProject, 'src', 'index.ts'),
      'utf8'
    )
    
    expect(restoredContent).toBe('console.log("Hello ZCU")')
    
    // 执行重做
    const redoOutput = await runCLICommand(['redo'])
    
    expect(redoOutput).toContain('Redo completed successfully')
    
    // 验证文件已重做
    const redoneContent = await fs.readFile(
      path.join(testProject, 'src', 'index.ts'),
      'utf8'
    )
    
    expect(redoneContent).toBe('console.log("Modified content")')
  })
  
  it('should detect and handle conflicts', async () => {
    await runCLICommand(['init'])
    
    // 模拟多工作空间冲突场景
    // 这需要更复杂的设置来模拟多个AI实例
    // 此处简化为基本冲突检测测试
    
    const output = await runCLICommand(['workspace', 'status'])
    
    expect(output).toContain('Active workspaces')
  })
})
```

### 10.2 性能测试

#### 10.2.1 基准测试

```typescript
// tests/performance/benchmark.test.ts
import { describe, it, expect } from 'vitest'
import { performance } from 'node:perf_hooks'
import { SnapshotManager } from '@zcu/core/snapshot'
import { WorkspaceManager } from '@zcu/core/workspace'

describe('Performance Benchmarks', () => {
  it('should create snapshots within performance budget', async () => {
    const snapshotManager = new SnapshotManager()
    
    // 生成大量文件数据
    const files = Array.from({ length: 100 }, (_, i) => ({
      path: `test-file-${i}.ts`,
      content: `// Generated test file ${i}\n`.repeat(100),
      operation: 'create' as const
    }))
    
    const startTime = performance.now()
    
    const snapshot = await snapshotManager.createSnapshot(
      'Performance test snapshot',
      files
    )
    
    const duration = performance.now() - startTime
    
    expect(snapshot).toBeDefined()
    expect(duration).toBeLessThan(3000) // 3秒以内
  })
  
  it('should handle concurrent workspace operations efficiently', async () => {
    const workspaceManager = new WorkspaceManager()
    
    const startTime = performance.now()
    
    // 并发创建多个工作空间
    const promises = Array.from({ length: 10 }, (_, i) => 
      workspaceManager.createWorkspace(
        `session-${i}`,
        `claude-${i}`,
        `/project-${i}`
      )
    )
    
    const workspaces = await Promise.all(promises)
    
    const duration = performance.now() - startTime
    
    expect(workspaces).toHaveLength(10)
    expect(duration).toBeLessThan(1000) // 1秒以内
  })
  
  it('should maintain memory usage within limits', async () => {
    const initialMemory = process.memoryUsage().heapUsed
    
    const snapshotManager = new SnapshotManager()
    
    // 创建大量快照
    for (let i = 0; i < 50; i++) {
      await snapshotManager.createSnapshot(
        `Memory test snapshot ${i}`,
        [{
          path: `file-${i}.ts`,
          content: 'x'.repeat(10000), // 10KB per file
          operation: 'create'
        }]
      )
    }
    
    const finalMemory = process.memoryUsage().heapUsed
    const memoryIncrease = finalMemory - initialMemory
    
    // 内存增长应控制在50MB以内
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
  })
})
```

---

## 11. 总结与技术亮点

### 11.1 核心技术创新

#### 11.1.1 AI工作空间隔离机制
- **业界首创**：基于Claude实例ID的会话隔离系统
- **技术创新**：LevelDB键值对设计 + 实时冲突检测
- **解决痛点**：多Claude实例并发操作的冲突问题
- **技术价值**：为AI开发工具提供了标准化的隔离模式

#### 11.1.2 React双重渲染架构
- **架构创新**：共享组件库支持CLI（Ink）和Web双重渲染
- **shadcn/ui适配**：创新的组件适配层，实现UI组件跨平台复用
- **UnoCSS集成**：原子化CSS与组件系统的深度整合
- **开发效率**：一套代码，双端运行，减少50%开发工作量

#### 11.1.3 LevelDB + Shadow Repository存储方案
- **轻量高效**：200KB元数据存储 + 增量快照管理
- **性能优化**：三层缓存架构，99%查询性能提升
- **数据安全**：AES-256加密 + 自动备份恢复机制
- **扩展性好**：支持TB级项目数据管理

### 11.2 技术架构优势

#### 11.2.1 性能表现
- **快照创建**：≤2秒（100MB项目）
- **内存占用**：≤40MB（基础模式）
- **响应时间**：≤300ms（UI操作）
- **并发支持**：≥15个AI实例同时工作
- **UnoCSS编译**：≤100ms（增量构建）

#### 11.2.2 可扩展性
- **模块化设计**：插件化架构，支持第三方扩展
- **跨平台支持**：Windows/Mac/Linux一致体验
- **云原生支持**：容器化部署，支持K8s集群
- **API优先**：完整的RESTful API，便于集成

#### 11.2.3 用户体验
- **零配置启动**：开箱即用，30秒完成初始化
- **多语言支持**：基于i18next的完整国际化方案
- **无障碍友好**：WCAG 2.1 AA级别合规
- **错误恢复**：自动故障检测和恢复机制

### 11.3 技术选型合理性

#### 11.3.1 前端技术栈
- **React 19.1.1**：最新稳定版本，新编译器、Server Actions、Form Actions
- **Ink 5**：最新版CLI界面框架，React 19兼容，性能提升30%
- **UnoCSS 66.4.2+**：现代原子CSS框架，零运行时开销，极佳性能表现
- **shadcn/ui + UnoCSS预设**：完整的组件系统和样式解决方案
- **Zustand 4.5**：轻量状态管理，React 19兼容，TypeScript支持更好

#### 11.3.2 后端技术栈
- **Node.js 20+**：LTS版本，性能提升20%
- **LevelDB 8**：最新版本，更好的错误处理
- **Express**：成熟的Web框架，中间件生态丰富
- **simple-git 3.25**：最新版本，更好的Git集成

#### 11.3.3 工程化工具
- **pnpm 10.15**：最快的包管理器，支持Catalog依赖管理
- **unbuild 3.6**：现代化构建工具，完整ESM支持，性能优化
- **Vitest 3.2**：最新测试框架，并行处理优化，测试性能大幅提升
- **TypeScript 5.9**：最新稳定版本，更好的类型推导和编译性能
- **Turbo 2.3**：Monorepo构建加速，缓存策略优化

### 11.4 项目技术价值

#### 11.4.1 开源贡献价值
- **技术标准**：为Claude Code生态提供undo/redo标准实现
- **最佳实践**：AI工具开发的完整参考方案
- **生态推动**：促进Claude Code工具链的成熟发展

#### 11.4.2 商业应用价值
- **企业级特性**：完整的审计日志、权限管理、团队协作
- **技术服务**：提供定制开发、技术支持等增值服务
- **生态合作**：与Claude官方、第三方工具的深度集成

#### 11.4.3 技术影响力
- **创新引领**：AI工作空间隔离的概念和实现
- **标准制定**：可能成为AI开发工具的行业标准
- **技术传播**：推动相关技术在开发者社区的普及

---

**文档状态**: ✅ 已完成  
**技术审核**: 📋 待审核  
**实施优先级**: 🔥 高优先级  
**预计开发周期**: 4-6个月  

---

*本全栈技术架构文档基于BMAD-METHOD™框架创建，结合ZCU产品需求、前端UI/UX规范和项目简介的技术要求，为ZCU项目提供了完整的技术实施指南。文档涵盖前端、后端、存储、安全、监控、部署等全栈技术方案，特别关注UnoCSS与shadcn/ui在双重渲染架构中的深度集成方案，提供现代化CSS框架与React生态系统的最佳实践。*