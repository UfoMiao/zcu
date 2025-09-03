# ZCU前端UI/UX规范文档
**Frontend UI/UX Specification Document**

---

**文档信息**
- **项目名称**: ZCU (Z Claude Undo)
- **文档版本**: v1.0.0
- **创建日期**: 2025-09-03
- **最后更新**: 2025-09-03
- **文档类型**: 前端UI/UX规范文档
- **创建方法**: BMAD-METHOD™框架
- **参考标准**: BMad方法front-end-spec标准格式

---

## 1. 设计概览与架构

### 1.1 设计愿景
为ZCU用户提供跨平台统一的用户体验，通过React共享组件架构实现CLI (Ink) 和Web Dashboard的双重渲染，确保在终端和浏览器环境中都能提供直观、高效的undo/redo操作体验。

### 1.2 双重渲染架构

#### 1.2.1 核心架构设计
```typescript
// React共享组件架构
ZCU Frontend Architecture
├── @zcu/shared-components     // 共享组件库 (核心UI逻辑)
│   ├── core/                  // 核心组件 (业务无关)
│   ├── business/              // 业务组件 (ZCU特定)
│   └── hooks/                 // 共享Hooks和状态管理
├── @zcu/cli-ui               // CLI终端界面 (Ink渲染器)
│   ├── commands/              // 命令行交互组件
│   ├── layouts/               // 终端布局组件
│   └── renderers/             // Ink特定渲染器
├── @zcu/web-dashboard        // Web控制台界面 (React Web)
│   ├── pages/                 // Web页面组件
│   ├── layouts/               // Web布局组件
│   └── providers/             // Web特定上下文
└── @zcu/design-tokens        // 设计令牌系统
    ├── colors.ts              // 颜色定义
    ├── typography.ts          // 字体规范
    ├── spacing.ts             // 间距系统
    └── breakpoints.ts         // 响应式断点
```

#### 1.2.2 组件映射策略
```typescript
// 双重渲染组件映射关系
interface ComponentMapping {
  // 核心业务组件统一接口
  SnapshotList: {
    cli: InkSnapshotList;      // 终端列表组件
    web: WebSnapshotList;      // Web表格组件
  };
  
  ConflictResolver: {
    cli: InkConflictDialog;    // 终端对话框
    web: WebConflictModal;     // Web模态框
  };
  
  OperationHistory: {
    cli: InkHistoryTree;       // 终端树形结构
    web: WebTimelineView;      // Web时间线视图
  };
  
  DiffViewer: {
    cli: InkTextDiff;          // 终端文本对比
    web: WebSplitDiff;         // Web分屏对比
  };
}
```

### 1.3 设计原则

#### 1.3.1 一致性原则
- **行为一致**: 相同操作在CLI和Web中产生相同结果
- **数据一致**: 共享状态管理确保数据同步
- **概念一致**: 统一的术语、图标、交互模式

#### 1.3.2 适应性原则
- **平台适配**: 充分利用各平台特性优势
- **交互适配**: CLI键盘导航、Web鼠标交互
- **视觉适配**: 终端文本界面、Web图形界面

#### 1.3.3 易用性原则
- **学习成本最小**: 直观的操作流程和反馈
- **错误预防**: 危险操作前的明确确认
- **快速操作**: 支持键盘快捷键和批量操作

---

## 2. 设计系统与视觉规范

### 2.1 设计令牌 (Design Tokens)

#### 2.1.1 颜色系统
```typescript
// colors.ts - 统一颜色定义
export const colors = {
  // 主色调 - ZCU品牌色
  primary: {
    50: '#f0f9ff',   // 极浅蓝
    100: '#e0f2fe',  // 浅蓝
    500: '#0ea5e9',  // 标准蓝 (主色)
    600: '#0284c7',  // 深蓝
    900: '#0c4a6e',  // 极深蓝
  },
  
  // 语义色彩
  semantic: {
    success: '#10b981',    // 成功 (绿)
    warning: '#f59e0b',    // 警告 (黄)
    danger: '#ef4444',     // 危险 (红)
    info: '#3b82f6',       // 信息 (蓝)
  },
  
  // 状态色彩
  status: {
    active: '#10b981',      // 激活状态
    pending: '#f59e0b',     // 等待状态
    conflict: '#ef4444',    // 冲突状态
    resolved: '#6b7280',    // 已解决状态
  },
  
  // 中性色
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // CLI专用色彩 (ANSI兼容)
  cli: {
    text: '#f3f4f6',        // 终端文本
    highlight: '#0ea5e9',   // 高亮
    success: '#10b981',     // CLI成功
    error: '#ef4444',       // CLI错误
    dim: '#6b7280',         // 暗淡文本
  }
} as const;
```

#### 2.1.2 字体系统
```typescript
// typography.ts - 字体规范
export const typography = {
  // CLI字体 (等宽字体)
  cli: {
    family: 'Consolas, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
    }
  },
  
  // Web字体 (系统字体)
  web: {
    sans: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'Consolas, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
    sizes: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    }
  },
  
  // 共用行高
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  }
} as const;
```

#### 2.1.3 间距系统
```typescript
// spacing.ts - 间距规范
export const spacing = {
  // 基础间距单位 (4px基准)
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  
  // CLI特殊间距 (字符对齐)
  cli: {
    char: '1ch',      // 单字符宽度
    indent: '2ch',    // 缩进宽度
    padding: '1ch',   // 内边距
  }
} as const;
```

### 2.2 图标系统

#### 2.2.1 统一图标定义
```typescript
// icons.ts - 图标系统
export const icons = {
  // 核心操作图标
  operations: {
    undo: '↶',           // CLI字符 / Web使用SVG
    redo: '↷',
    save: '💾',
    restore: '🔄',
    delete: '🗑️',
  },
  
  // 状态图标
  status: {
    success: '✓',       // ✅ 在CLI中使用字符
    warning: '⚠',       // ⚠️
    error: '✗',         // ❌
    info: 'ⓘ',          // ℹ️
    pending: '◐',       // 进行中
  },
  
  // 文件操作图标
  files: {
    modified: 'M',      // Git风格标记
    added: 'A',
    deleted: 'D',
    renamed: 'R',
    conflict: '⚡',
  },
  
  // 导航图标
  navigation: {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
    enter: '↵',
  }
} as const;
```

### 2.3 主题系统

#### 2.3.1 主题定义
```typescript
// themes.ts - 主题系统
export const themes = {
  // 浅色主题
  light: {
    background: colors.gray[50],
    surface: colors.gray[100],
    text: colors.gray[900],
    textSecondary: colors.gray[600],
    border: colors.gray[200],
    accent: colors.primary[500],
  },
  
  // 深色主题
  dark: {
    background: colors.gray[900],
    surface: colors.gray[800],
    text: colors.gray[50],
    textSecondary: colors.gray[300],
    border: colors.gray[700],
    accent: colors.primary[400],
  },
  
  // CLI主题 (终端适配)
  cli: {
    background: 'transparent',
    text: colors.cli.text,
    highlight: colors.cli.highlight,
    dim: colors.cli.dim,
    accent: colors.primary[400],
  }
} as const;
```

---

## 3. 共享组件设计

### 3.1 核心组件库

#### 3.1.1 SnapshotList 快照列表组件
```typescript
// 共享接口定义
interface SnapshotListProps {
  snapshots: Snapshot[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

// 共享业务逻辑Hook
const useSnapshotList = (props: SnapshotListProps) => {
  // 键盘导航逻辑
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 筛选和排序逻辑
  const filteredSnapshots = useMemo(() => {
    return props.snapshots.sort((a, b) => b.timestamp - a.timestamp);
  }, [props.snapshots]);
  
  // 快捷键处理
  const handleKeyPress = useCallback((key: string) => {
    switch (key) {
      case 'ArrowUp': setCurrentIndex(i => Math.max(0, i - 1)); break;
      case 'ArrowDown': setCurrentIndex(i => Math.min(filteredSnapshots.length - 1, i + 1)); break;
      case 'Enter': props.onSelect(filteredSnapshots[currentIndex].id); break;
      case 'Delete': props.onDelete(filteredSnapshots[currentIndex].id); break;
    }
  }, [currentIndex, filteredSnapshots, props]);
  
  return { filteredSnapshots, currentIndex, handleKeyPress };
};
```

##### CLI实现 (Ink)
```typescript
// InkSnapshotList.tsx
import { Box, Text, useInput } from 'ink';
import { useSnapshotList } from '../hooks/useSnapshotList';

export const InkSnapshotList: React.FC<SnapshotListProps> = (props) => {
  const { filteredSnapshots, currentIndex, handleKeyPress } = useSnapshotList(props);
  
  useInput(handleKeyPress);
  
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="blue">快照列表 ({filteredSnapshots.length})</Text>
      </Box>
      
      {filteredSnapshots.map((snapshot, index) => (
        <Box key={snapshot.id} marginBottom={0}>
          <Text 
            color={index === currentIndex ? 'blue' : 'white'}
            backgroundColor={index === currentIndex ? 'blue' : undefined}
          >
            {index === currentIndex ? '► ' : '  '}
            {formatTimestamp(snapshot.timestamp)} - {snapshot.description}
            <Text dim> ({snapshot.filesCount} files)</Text>
          </Text>
        </Box>
      ))}
      
      {props.loading && (
        <Box marginTop={1}>
          <Text dim>加载中...</Text>
        </Box>
      )}
    </Box>
  );
};
```

##### Web实现 (React)
```typescript
// WebSnapshotList.tsx
export const WebSnapshotList: React.FC<SnapshotListProps> = (props) => {
  const { filteredSnapshots, currentIndex, handleKeyPress } = useSnapshotList(props);
  
  // Web特定的键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      handleKeyPress(e.key);
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress]);
  
  return (
    <div className="snapshot-list">
      <div className="snapshot-list-header">
        <h3>快照列表 ({filteredSnapshots.length})</h3>
        <button onClick={() => window.location.reload()}>刷新</button>
      </div>
      
      <div className="snapshot-list-body">
        {filteredSnapshots.map((snapshot, index) => (
          <div 
            key={snapshot.id}
            className={`snapshot-item ${index === currentIndex ? 'active' : ''}`}
            onClick={() => props.onSelect(snapshot.id)}
          >
            <div className="snapshot-info">
              <span className="timestamp">{formatTimestamp(snapshot.timestamp)}</span>
              <span className="description">{snapshot.description}</span>
              <span className="files-count">{snapshot.filesCount} 个文件</span>
            </div>
            
            <div className="snapshot-actions">
              <button onClick={() => props.onRestore(snapshot.id)}>恢复</button>
              <button onClick={() => props.onDelete(snapshot.id)} className="danger">删除</button>
            </div>
          </div>
        ))}
      </div>
      
      {props.loading && (
        <div className="loading-indicator">
          <span>加载中...</span>
        </div>
      )}
    </div>
  );
};
```

#### 3.1.2 ConflictResolver 冲突解决组件
```typescript
// 冲突解决组件接口
interface ConflictResolverProps {
  conflict: ConflictInfo;
  onResolve: (resolution: ConflictResolution) => void;
  onCancel: () => void;
  visible: boolean;
}

interface ConflictInfo {
  id: string;
  filePath: string;
  source1: { name: string; content: string; aiAgent: string; };
  source2: { name: string; content: string; aiAgent: string; };
  timestamp: number;
}

interface ConflictResolution {
  action: 'keep_source1' | 'keep_source2' | 'merge_manual';
  mergedContent?: string;
}
```

##### CLI实现
```typescript
// InkConflictResolver.tsx
export const InkConflictResolver: React.FC<ConflictResolverProps> = (props) => {
  const [selectedOption, setSelectedOption] = useState(0);
  const [showDiff, setShowDiff] = useState(false);
  
  const options = [
    { key: 'keep_source1', label: `保留 ${props.conflict.source1.name}` },
    { key: 'keep_source2', label: `保留 ${props.conflict.source2.name}` },
    { key: 'merge_manual', label: '手动合并' },
    { key: 'cancel', label: '取消' }
  ];
  
  useInput((input, key) => {
    if (key.upArrow) setSelectedOption(i => Math.max(0, i - 1));
    if (key.downArrow) setSelectedOption(i => Math.min(options.length - 1, i + 1));
    if (key.return) handleSelect(options[selectedOption].key);
    if (input === 'd') setShowDiff(!showDiff);
    if (key.escape) props.onCancel();
  });
  
  if (!props.visible) return null;
  
  return (
    <Box flexDirection="column" padding={1} borderStyle="double" borderColor="red">
      <Box marginBottom={1}>
        <Text bold color="red">⚡ 检测到文件冲突</Text>
      </Box>
      
      <Box marginBottom={1}>
        <Text>文件: {props.conflict.filePath}</Text>
      </Box>
      
      <Box flexDirection="column" marginBottom={1}>
        <Text>来源1: {props.conflict.source1.aiAgent}</Text>
        <Text>来源2: {props.conflict.source2.aiAgent}</Text>
      </Box>
      
      <Box flexDirection="column">
        {options.map((option, index) => (
          <Text key={option.key} color={index === selectedOption ? 'blue' : 'white'}>
            {index === selectedOption ? '► ' : '  '}{option.label}
          </Text>
        ))}
      </Box>
      
      <Box marginTop={1}>
        <Text dim>按 d 查看差异，ESC 取消</Text>
      </Box>
      
      {showDiff && (
        <Box marginTop={1} borderStyle="single">
          <InkDiffViewer 
            left={props.conflict.source1.content}
            right={props.conflict.source2.content}
          />
        </Box>
      )}
    </Box>
  );
};
```

#### 3.1.3 WorkspaceStatus AI工作空间状态组件
```typescript
// 工作空间状态组件
interface WorkspaceStatusProps {
  workspaces: AIWorkspace[];
  currentWorkspaceId?: string;
  onSwitchWorkspace: (id: string) => void;
  compact?: boolean; // CLI紧凑模式
}

interface AIWorkspace {
  id: string;
  aiAgent: string;
  projectPath: string;
  state: 'active' | 'paused' | 'conflict';
  lastOperation?: string;
  operationsCount: number;
}
```

##### CLI实现
```typescript
// InkWorkspaceStatus.tsx
export const InkWorkspaceStatus: React.FC<WorkspaceStatusProps> = (props) => {
  const getStateColor = (state: AIWorkspace['state']) => {
    switch (state) {
      case 'active': return 'green';
      case 'paused': return 'yellow';
      case 'conflict': return 'red';
      default: return 'gray';
    }
  };
  
  const getStateIcon = (state: AIWorkspace['state']) => {
    switch (state) {
      case 'active': return '●';
      case 'paused': return '◐';
      case 'conflict': return '⚡';
      default: return '○';
    }
  };
  
  if (props.compact) {
    return (
      <Box>
        <Text>工作空间: </Text>
        {props.workspaces.map(workspace => (
          <Text key={workspace.id} color={getStateColor(workspace.state)}>
            {getStateIcon(workspace.state)}{workspace.aiAgent} 
          </Text>
        ))}
      </Box>
    );
  }
  
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>AI工作空间状态</Text>
      </Box>
      
      {props.workspaces.map(workspace => (
        <Box key={workspace.id} marginBottom={1}>
          <Box width={20}>
            <Text color={getStateColor(workspace.state)}>
              {getStateIcon(workspace.state)} {workspace.aiAgent}
            </Text>
          </Box>
          <Box>
            <Text dim>
              {workspace.operationsCount}个操作 | {workspace.lastOperation}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
};
```

### 3.2 状态管理架构

#### 3.2.1 Zustand状态管理
```typescript
// store/index.ts - 全局状态管理
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

interface ZCUState {
  // 快照管理
  snapshots: Snapshot[];
  currentSnapshotId?: string;
  loading: boolean;
  
  // AI工作空间
  workspaces: AIWorkspace[];
  activeWorkspaceId?: string;
  
  // 冲突管理
  conflicts: ConflictInfo[];
  
  // UI状态
  ui: {
    theme: 'light' | 'dark' | 'cli';
    sidebarOpen: boolean;
    currentView: 'snapshots' | 'history' | 'conflicts';
  };
  
  // Actions
  actions: {
    // 快照操作
    loadSnapshots: () => Promise<void>;
    createSnapshot: (description: string) => Promise<void>;
    restoreSnapshot: (id: string) => Promise<void>;
    deleteSnapshot: (id: string) => Promise<void>;
    
    // 工作空间操作
    switchWorkspace: (id: string) => void;
    pauseWorkspace: (id: string) => void;
    resumeWorkspace: (id: string) => void;
    
    // 冲突解决
    resolveConflict: (id: string, resolution: ConflictResolution) => Promise<void>;
    
    // UI操作
    setTheme: (theme: ZCUState['ui']['theme']) => void;
    toggleSidebar: () => void;
    setCurrentView: (view: ZCUState['ui']['currentView']) => void;
  };
}

export const useZCUStore = create<ZCUState>()(
  subscribeWithSelector((set, get) => ({
    // 初始状态
    snapshots: [],
    loading: false,
    workspaces: [],
    conflicts: [],
    ui: {
      theme: 'light',
      sidebarOpen: true,
      currentView: 'snapshots',
    },
    
    // Actions实现
    actions: {
      loadSnapshots: async () => {
        set({ loading: true });
        try {
          const snapshots = await zcuApi.getSnapshots();
          set({ snapshots, loading: false });
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      
      createSnapshot: async (description: string) => {
        const snapshot = await zcuApi.createSnapshot(description);
        set(state => ({ 
          snapshots: [snapshot, ...state.snapshots] 
        }));
      },
      
      // ... 其他actions实现
    }
  }))
);
```

#### 3.2.2 共享Hooks
```typescript
// hooks/useSnapshotOperations.ts - 快照操作Hook
export const useSnapshotOperations = () => {
  const { snapshots, loading, actions } = useZCUStore(state => ({
    snapshots: state.snapshots,
    loading: state.loading,
    actions: state.actions
  }));
  
  // 创建快照
  const createSnapshot = useCallback(async (description: string) => {
    try {
      await actions.createSnapshot(description);
      toast.success('快照创建成功');
    } catch (error) {
      toast.error('快照创建失败');
      throw error;
    }
  }, [actions]);
  
  // 恢复快照
  const restoreSnapshot = useCallback(async (id: string) => {
    const confirmed = await confirm('确认恢复此快照吗？当前未保存的更改将丢失。');
    if (!confirmed) return;
    
    try {
      await actions.restoreSnapshot(id);
      toast.success('快照恢复成功');
    } catch (error) {
      toast.error('快照恢复失败');
      throw error;
    }
  }, [actions]);
  
  return {
    snapshots,
    loading,
    createSnapshot,
    restoreSnapshot,
    deleteSnapshot: actions.deleteSnapshot,
  };
};
```

---

## 4. 核心功能交互流程设计

### 4.1 Undo/Redo操作界面

#### 4.1.1 快捷撤销流程
```typescript
// 快捷撤销操作流程
interface QuickUndoFlow {
  trigger: 'hotkey' | 'command' | 'ui_button';
  steps: [
    'detect_last_operation',    // 检测最近操作
    'create_confirmation',      // 生成确认信息
    'user_confirmation',        // 用户确认
    'execute_undo',             // 执行撤销
    'update_ui_state'           // 更新界面状态
  ];
}
```

##### CLI交互流程
```typescript
// CLI快捷撤销组件
export const QuickUndoAction: React.FC = () => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastOperation, setLastOperation] = useState<Operation | null>(null);
  
  useInput((input, key) => {
    // Ctrl+Z 触发撤销
    if (key.ctrl && input === 'z') {
      triggerUndo();
    }
    // Ctrl+Y 触发重做
    if (key.ctrl && input === 'y') {
      triggerRedo();
    }
  });
  
  const triggerUndo = async () => {
    const operation = await zcuApi.getLastOperation();
    if (!operation) {
      toast.error('没有可撤销的操作');
      return;
    }
    
    setLastOperation(operation);
    setShowConfirmation(true);
  };
  
  if (showConfirmation && lastOperation) {
    return (
      <Box borderStyle="single" padding={1}>
        <Box flexDirection="column">
          <Text bold color="yellow">⚠ 确认撤销操作</Text>
          <Text>操作: {lastOperation.description}</Text>
          <Text>时间: {formatTimestamp(lastOperation.timestamp)}</Text>
          <Text>影响: {lastOperation.affectedFiles.length} 个文件</Text>
          
          <Box marginTop={1}>
            <Text>按 Y 确认，按 N 取消</Text>
          </Box>
        </Box>
      </Box>
    );
  }
  
  return null;
};
```

#### 4.1.2 批量撤销界面
```typescript
// 批量撤销选择器
interface BatchUndoSelectorProps {
  operations: Operation[];
  onSelect: (operationIds: string[]) => void;
  onCancel: () => void;
}

// CLI批量选择实现
export const InkBatchUndoSelector: React.FC<BatchUndoSelectorProps> = (props) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useInput((input, key) => {
    if (key.upArrow) setCurrentIndex(i => Math.max(0, i - 1));
    if (key.downArrow) setCurrentIndex(i => Math.min(props.operations.length - 1, i + 1));
    
    // 空格键切换选择
    if (input === ' ') {
      const currentId = props.operations[currentIndex].id;
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(currentId)) {
          newSet.delete(currentId);
        } else {
          newSet.add(currentId);
        }
        return newSet;
      });
    }
    
    // 回车键确认选择
    if (key.return) {
      props.onSelect(Array.from(selectedIds));
    }
    
    // ESC取消
    if (key.escape) {
      props.onCancel();
    }
  });
  
  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Box marginBottom={1}>
        <Text bold>选择要撤销的操作 (空格选择，回车确认)</Text>
      </Box>
      
      {props.operations.map((operation, index) => (
        <Box key={operation.id}>
          <Text color={index === currentIndex ? 'blue' : 'white'}>
            {selectedIds.has(operation.id) ? '☑' : '☐'} 
            {index === currentIndex ? '► ' : '  '}
            {operation.description} 
            <Text dim>({formatTimestamp(operation.timestamp)})</Text>
          </Text>
        </Box>
      ))}
      
      <Box marginTop={1}>
        <Text dim>已选择 {selectedIds.size} 个操作</Text>
      </Box>
    </Box>
  );
};
```

### 4.2 AI工作空间状态显示

#### 4.2.1 实时状态监控
```typescript
// 工作空间状态监控组件
export const WorkspaceMonitor: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<AIWorkspace[]>([]);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  // 实时更新工作空间状态
  useEffect(() => {
    const interval = setInterval(async () => {
      const updatedWorkspaces = await zcuApi.getWorkspaces();
      setWorkspaces(updatedWorkspaces);
      setLastUpdate(Date.now());
    }, 1000); // 每秒更新
    
    return () => clearInterval(interval);
  }, []);
  
  // WebSocket实时通知
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001/workspace-status');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setWorkspaces(prev => 
        prev.map(workspace => 
          workspace.id === update.workspaceId 
            ? { ...workspace, ...update.changes }
            : workspace
        )
      );
    };
    
    return () => ws.close();
  }, []);
  
  return <WorkspaceStatusDisplay workspaces={workspaces} lastUpdate={lastUpdate} />;
};
```

#### 4.2.2 工作空间详情面板
```typescript
// CLI工作空间详情
export const InkWorkspaceDetail: React.FC<{workspace: AIWorkspace}> = ({workspace}) => {
  const [showOperations, setShowOperations] = useState(false);
  
  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Box>
        <Text bold color={getWorkspaceColor(workspace.state)}>
          {getWorkspaceIcon(workspace.state)} {workspace.aiAgent}
        </Text>
      </Box>
      
      <Box flexDirection="column" marginLeft={2}>
        <Text>状态: <Text color={getWorkspaceColor(workspace.state)}>{workspace.state}</Text></Text>
        <Text>项目: {workspace.projectPath}</Text>
        <Text>操作数: {workspace.operationsCount}</Text>
        {workspace.lastOperation && (
          <Text>最近: {workspace.lastOperation}</Text>
        )}
      </Box>
      
      {workspace.state === 'conflict' && (
        <Box marginTop={1} borderStyle="single" borderColor="red">
          <Text color="red">⚡ 检测到冲突</Text>
          <Text dim>按 R 解决冲突</Text>
        </Box>
      )}
      
      {showOperations && (
        <Box marginTop={1}>
          <OperationHistory workspaceId={workspace.id} compact />
        </Box>
      )}
    </Box>
  );
};
```

### 4.3 冲突检测和解决界面

#### 4.3.1 智能冲突检测
```typescript
// 冲突检测服务
class ConflictDetectionService {
  private activeWorkspaces = new Map<string, AIWorkspace>();
  
  // 实时监控文件操作
  async detectConflicts(operation: FileOperation): Promise<ConflictInfo[]> {
    const conflicts: ConflictInfo[] = [];
    const affectedFiles = operation.files;
    
    for (const file of affectedFiles) {
      // 检查是否有其他AI实例正在操作同一文件
      const concurrentOperations = await this.getConcurrentOperations(
        file.path, 
        operation.workspaceId
      );
      
      if (concurrentOperations.length > 0) {
        conflicts.push({
          id: generateId(),
          filePath: file.path,
          source1: {
            name: operation.workspaceId,
            content: file.newContent,
            aiAgent: operation.aiAgent
          },
          source2: {
            name: concurrentOperations[0].workspaceId,
            content: concurrentOperations[0].content,
            aiAgent: concurrentOperations[0].aiAgent
          },
          timestamp: Date.now()
        });
      }
    }
    
    return conflicts;
  }
  
  // 预防性冲突检测
  async preventiveCheck(workspaceId: string, files: string[]): Promise<boolean> {
    const locks = await this.getFileLocks(files);
    const conflicts = locks.filter(lock => lock.workspaceId !== workspaceId);
    
    if (conflicts.length > 0) {
      // 发送警告给相关工作空间
      this.notifyPotentialConflict(conflicts);
      return false;
    }
    
    return true;
  }
}
```

#### 4.3.2 三方合并界面
```typescript
// 三方合并组件
interface ThreeWayMergeProps {
  conflict: ConflictInfo;
  baseContent: string; // 共同祖先版本
  onMerged: (mergedContent: string) => void;
  onCancel: () => void;
}

// CLI三方合并界面
export const InkThreeWayMerge: React.FC<ThreeWayMergeProps> = (props) => {
  const [currentView, setCurrentView] = useState<'diff' | 'edit'>('diff');
  const [mergedContent, setMergedContent] = useState(props.baseContent);
  
  useInput((input, key) => {
    if (input === '1') acceptSource1();
    if (input === '2') acceptSource2();
    if (input === 'e') setCurrentView('edit');
    if (input === 'd') setCurrentView('diff');
    if (key.escape) props.onCancel();
  });
  
  if (currentView === 'diff') {
    return (
      <Box flexDirection="column" borderStyle="double" padding={1}>
        <Box marginBottom={1}>
          <Text bold color="red">三方合并 - {props.conflict.filePath}</Text>
        </Box>
        
        <Box flexDirection="row">
          {/* 左侧：源1 */}
          <Box width="33%" borderStyle="single" marginRight={1}>
            <Box marginBottom={1}>
              <Text bold color="blue">源1: {props.conflict.source1.aiAgent}</Text>
            </Box>
            <Box>
              <Text>{props.conflict.source1.content}</Text>
            </Box>
          </Box>
          
          {/* 中间：基础版本 */}
          <Box width="33%" borderStyle="single" marginRight={1}>
            <Box marginBottom={1}>
              <Text bold color="gray">基础版本</Text>
            </Box>
            <Box>
              <Text dim>{props.baseContent}</Text>
            </Box>
          </Box>
          
          {/* 右侧：源2 */}
          <Box width="33%" borderStyle="single">
            <Box marginBottom={1}>
              <Text bold color="green">源2: {props.conflict.source2.aiAgent}</Text>
            </Box>
            <Box>
              <Text>{props.conflict.source2.content}</Text>
            </Box>
          </Box>
        </Box>
        
        <Box marginTop={1}>
          <Text>按 1 选择源1，按 2 选择源2，按 e 进入编辑模式</Text>
        </Box>
      </Box>
    );
  }
  
  return (
    <Box flexDirection="column" borderStyle="double" padding={1}>
      <Box marginBottom={1}>
        <Text bold>编辑合并结果</Text>
      </Box>
      
      <Box>
        <InkTextEditor 
          content={mergedContent}
          onChange={setMergedContent}
          onSave={() => props.onMerged(mergedContent)}
        />
      </Box>
      
      <Box marginTop={1}>
        <Text>Ctrl+S 保存，ESC 取消</Text>
      </Box>
    </Box>
  );
};
```

### 4.4 Checkpoint管理界面

#### 4.4.1 检查点创建向导
```typescript
// 检查点创建向导
export const CheckpointWizard: React.FC = () => {
  const [step, setStep] = useState<'info' | 'files' | 'confirm'>('info');
  const [checkpointData, setCheckpointData] = useState({
    name: '',
    description: '',
    includeFiles: [] as string[],
    tags: [] as string[]
  });
  
  const steps = {
    info: () => (
      <Box flexDirection="column">
        <Text bold>创建检查点 - 基本信息</Text>
        <Box marginTop={1}>
          <Text>名称: </Text>
          <TextInput 
            value={checkpointData.name}
            onChange={(value) => setCheckpointData(prev => ({...prev, name: value}))}
          />
        </Box>
        <Box marginTop={1}>
          <Text>描述: </Text>
          <TextInput 
            value={checkpointData.description}
            onChange={(value) => setCheckpointData(prev => ({...prev, description: value}))}
          />
        </Box>
      </Box>
    ),
    
    files: () => (
      <FileSelector 
        selectedFiles={checkpointData.includeFiles}
        onFilesChange={(files) => setCheckpointData(prev => ({...prev, includeFiles: files}))}
      />
    ),
    
    confirm: () => (
      <CheckpointPreview 
        data={checkpointData}
        onConfirm={createCheckpoint}
        onCancel={() => setStep('info')}
      />
    )
  };
  
  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      {steps[step]()}
    </Box>
  );
};
```

#### 4.4.2 检查点时间线视图
```typescript
// 检查点时间线组件
interface CheckpointTimelineProps {
  checkpoints: Checkpoint[];
  currentId?: string;
  onSelect: (id: string) => void;
  onRestore: (id: string) => void;
}

// CLI时间线实现
export const InkCheckpointTimeline: React.FC<CheckpointTimelineProps> = (props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>检查点时间线</Text>
      </Box>
      
      {props.checkpoints.map((checkpoint, index) => {
        const isSelected = index === selectedIndex;
        const isCurrent = checkpoint.id === props.currentId;
        
        return (
          <Box key={checkpoint.id} marginBottom={1}>
            {/* 时间线连接线 */}
            <Box width={4}>
              <Text color="gray">
                {index === 0 ? '●' : '│'}
                {isCurrent && '◄'}
              </Text>
            </Box>
            
            {/* 检查点信息 */}
            <Box flexGrow={1}>
              <Text 
                bold={isSelected}
                color={isSelected ? 'blue' : isCurrent ? 'green' : 'white'}
              >
                {checkpoint.name}
              </Text>
              <Text dim> - {formatRelativeTime(checkpoint.timestamp)}</Text>
              <Box>
                <Text dim>{checkpoint.description}</Text>
              </Box>
              {checkpoint.tags.length > 0 && (
                <Box>
                  {checkpoint.tags.map(tag => (
                    <Text key={tag} color="cyan">#{tag} </Text>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
```

### 4.5 白话命令输入界面

#### 4.5.1 自然语言命令解析
```typescript
// 自然语言命令处理系统
class NaturalLanguageProcessor {
  private commandPatterns = {
    undo: [
      /撤销|undo|回退/i,
      /取消.*操作/i,
      /回滚到.*之前/i
    ],
    redo: [
      /重做|redo|恢复/i,
      /重新.*操作/i
    ],
    create_checkpoint: [
      /创建.*检查点|checkpoint/i,
      /保存.*状态/i,
      /做个.*备份/i
    ],
    restore_checkpoint: [
      /恢复.*检查点/i,
      /回到.*状态/i,
      /切换到.*/i
    ]
  };
  
  async parseCommand(input: string): Promise<ParsedCommand> {
    // 预处理：去除标点，转换为小写
    const cleanInput = input.replace(/[^\w\s\u4e00-\u9fff]/g, '').toLowerCase();
    
    // 意图识别
    const intent = this.identifyIntent(cleanInput);
    
    // 实体提取
    const entities = this.extractEntities(cleanInput, intent);
    
    // 生成执行计划
    const executionPlan = this.generateExecutionPlan(intent, entities);
    
    return {
      intent,
      entities,
      executionPlan,
      confidence: this.calculateConfidence(cleanInput, intent),
      suggestions: this.generateSuggestions(cleanInput)
    };
  }
  
  private identifyIntent(input: string): CommandIntent {
    for (const [intent, patterns] of Object.entries(this.commandPatterns)) {
      if (patterns.some(pattern => pattern.test(input))) {
        return intent as CommandIntent;
      }
    }
    return 'unknown';
  }
  
  private extractEntities(input: string, intent: CommandIntent): CommandEntity[] {
    const entities: CommandEntity[] = [];
    
    // 时间实体提取
    const timeMatches = input.match(/(\d+)(分钟|小时|天)前|上.*次|最近|刚才/g);
    if (timeMatches) {
      entities.push({
        type: 'time',
        value: timeMatches[0],
        confidence: 0.8
      });
    }
    
    // 文件路径实体提取
    const fileMatches = input.match(/([a-zA-Z0-9_\-\/\.]+\.[a-zA-Z]+)/g);
    if (fileMatches) {
      entities.push({
        type: 'file_path',
        value: fileMatches[0],
        confidence: 0.9
      });
    }
    
    return entities;
  }
}
```

#### 4.5.2 智能命令提示界面
```typescript
// 智能命令输入组件
export const IntelligentCommandInput: React.FC = () => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<CommandSuggestion[]>([]);
  const [parsing, setParsing] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  
  const nlp = new NaturalLanguageProcessor();
  
  // 实时解析命令
  useEffect(() => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setParsing(true);
      try {
        const parsed = await nlp.parseCommand(input);
        setSuggestions(parsed.suggestions);
      } finally {
        setParsing(false);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [input]);
  
  return (
    <Box flexDirection="column" borderStyle="single" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="blue">💬 AI命令助手</Text>
      </Box>
      
      <Box>
        <Text>请输入命令: </Text>
        <TextInput
          value={input}
          onChange={setInput}
          placeholder="例如: 撤销最近的修改并创建检查点"
        />
      </Box>
      
      {parsing && (
        <Box marginTop={1}>
          <Text dim color="yellow">正在解析命令...</Text>
        </Box>
      )}
      
      {suggestions.length > 0 && (
        <Box flexDirection="column" marginTop={1} borderStyle="single">
          <Text bold>建议的操作:</Text>
          {suggestions.map((suggestion, index) => (
            <Box key={index}>
              <Text color={index === selectedSuggestion ? 'blue' : 'white'}>
                {index === selectedSuggestion ? '► ' : '  '}
                {suggestion.command} 
                <Text dim>({Math.round(suggestion.confidence * 100)}%)</Text>
              </Text>
            </Box>
          ))}
          
          <Box marginTop={1}>
            <Text dim>按 ↑↓ 选择，回车执行</Text>
          </Box>
        </Box>
      )}
      
      <Box marginTop={1}>
        <Text dim>
          示例命令：
          • "撤销最近3个操作"
          • "创建检查点：功能开发完成"
          • "回滚到上个小时的状态"
          • "显示冲突解决选项"
        </Text>
      </Box>
    </Box>
  );
};
```

---

## 5. 响应式设计与适配规范

### 5.1 终端界面适配

#### 5.1.1 终端尺寸适配
```typescript
// 终端尺寸适配策略
export const useTerminalSize = () => {
  const [size, setSize] = useState({ width: 80, height: 24 });
  
  useEffect(() => {
    const updateSize = () => {
      setSize({
        width: process.stdout.columns || 80,
        height: process.stdout.rows || 24
      });
    };
    
    process.stdout.on('resize', updateSize);
    updateSize();
    
    return () => {
      process.stdout.removeListener('resize', updateSize);
    };
  }, []);
  
  return {
    ...size,
    isSmall: size.width < 80 || size.height < 24,
    isMedium: size.width >= 80 && size.width < 120,
    isLarge: size.width >= 120,
    
    // 计算可用空间
    contentWidth: Math.max(60, size.width - 4), // 减去边距
    contentHeight: Math.max(20, size.height - 4)
  };
};

// 响应式布局组件
export const ResponsiveLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
  const { width, height, isSmall } = useTerminalSize();
  
  if (isSmall) {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text color="yellow">⚠ 终端尺寸较小，建议调整为至少 80x24</Text>
        </Box>
        <Box>{children}</Box>
      </Box>
    );
  }
  
  return <Box>{children}</Box>;
};
```

#### 5.1.2 终端兼容性处理
```typescript
// 终端兼容性检测
export class TerminalCompatibility {
  static checkFeatures() {
    return {
      colors: process.env.COLORTERM !== undefined || process.env.TERM?.includes('color'),
      unicode: process.env.LANG?.includes('UTF-8') || process.platform === 'darwin',
      mouse: process.env.TERM?.includes('xterm') || process.platform === 'darwin',
      clipboard: process.platform === 'darwin' || process.platform === 'linux'
    };
  }
  
  static getFallbackChars() {
    const features = this.checkFeatures();
    
    return {
      // Unicode优雅降级
      checkbox: {
        checked: features.unicode ? '☑' : '[x]',
        unchecked: features.unicode ? '☐' : '[ ]'
      },
      
      // 状态图标降级
      status: {
        success: features.unicode ? '✓' : 'OK',
        error: features.unicode ? '✗' : 'ERR',
        warning: features.unicode ? '⚠' : '!',
        info: features.unicode ? 'ⓘ' : 'i'
      },
      
      // 导航图标降级
      navigation: {
        up: features.unicode ? '↑' : '^',
        down: features.unicode ? '↓' : 'v',
        left: features.unicode ? '←' : '<',
        right: features.unicode ? '→' : '>',
        select: features.unicode ? '►' : '>'
      }
    };
  }
}
```

### 5.2 Web界面响应式设计

#### 5.2.1 断点系统
```typescript
// breakpoints.ts - 响应式断点
export const breakpoints = {
  xs: '320px',   // 小屏手机
  sm: '640px',   // 大屏手机
  md: '768px',   // 平板
  lg: '1024px',  // 桌面
  xl: '1280px',  // 大屏桌面
  '2xl': '1536px' // 超大屏
} as const;

// 媒体查询Hook
export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    
    media.addEventListener('change', listener);
    setMatches(media.matches);
    
    return () => media.removeEventListener('change', listener);
  }, [query]);
  
  return matches;
};

// 断点Hook
export const useBreakpoint = () => {
  const isXs = useMediaQuery(`(max-width: ${breakpoints.sm})`);
  const isSm = useMediaQuery(`(min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`);
  const isMd = useMediaQuery(`(min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`);
  const isLg = useMediaQuery(`(min-width: ${breakpoints.lg})`);
  
  return { isXs, isSm, isMd, isLg };
};
```

#### 5.2.2 自适应布局组件
```typescript
// Web响应式快照列表
export const ResponsiveSnapshotList: React.FC<SnapshotListProps> = (props) => {
  const { isXs, isSm } = useBreakpoint();
  
  // 移动端使用卡片布局
  if (isXs || isSm) {
    return (
      <div className="snapshot-list-mobile">
        {props.snapshots.map(snapshot => (
          <div key={snapshot.id} className="snapshot-card">
            <div className="snapshot-card-header">
              <span className="timestamp">{formatTimestamp(snapshot.timestamp)}</span>
              <div className="actions">
                <button onClick={() => props.onRestore(snapshot.id)} className="btn-sm">恢复</button>
              </div>
            </div>
            <div className="snapshot-card-body">
              <p className="description">{snapshot.description}</p>
              <span className="files-count">{snapshot.filesCount} 个文件</span>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // 桌面端使用表格布局
  return (
    <div className="snapshot-list-desktop">
      <table className="snapshot-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>描述</th>
            <th>文件数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {props.snapshots.map(snapshot => (
            <tr key={snapshot.id}>
              <td>{formatTimestamp(snapshot.timestamp)}</td>
              <td>{snapshot.description}</td>
              <td>{snapshot.filesCount}</td>
              <td>
                <button onClick={() => props.onRestore(snapshot.id)}>恢复</button>
                <button onClick={() => props.onDelete(snapshot.id)} className="danger">删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## 6. 可访问性与无障碍设计

### 6.1 键盘导航规范

#### 6.1.1 统一快捷键系统
```typescript
// 全局快捷键定义
export const keyBindings = {
  // 基础导航
  navigation: {
    up: ['ArrowUp', 'k'],
    down: ['ArrowDown', 'j'],
    left: ['ArrowLeft', 'h'],
    right: ['ArrowRight', 'l'],
    select: ['Enter', 'Space'],
    back: ['Escape', 'Backspace']
  },
  
  // 快速操作
  actions: {
    undo: ['ctrl+z', 'cmd+z'],
    redo: ['ctrl+y', 'cmd+shift+z'],
    save: ['ctrl+s', 'cmd+s'],
    refresh: ['F5', 'ctrl+r'],
    search: ['ctrl+f', 'cmd+f'],
    help: ['F1', '?']
  },
  
  // 视图切换
  views: {
    snapshots: ['1'],
    history: ['2'],
    conflicts: ['3'],
    workspace: ['4'],
    settings: ['0']
  }
} as const;

// 快捷键处理Hook
export const useKeyBindings = (bindings: Record<string, string[]>, handlers: Record<string, () => void>) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      const combo = [
        event.ctrlKey && 'ctrl',
        event.metaKey && 'cmd',
        event.shiftKey && 'shift',
        event.altKey && 'alt',
        key.toLowerCase()
      ].filter(Boolean).join('+');
      
      for (const [action, keys] of Object.entries(bindings)) {
        if (keys.includes(key) || keys.includes(combo)) {
          event.preventDefault();
          handlers[action]?.();
          break;
        }
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [bindings, handlers]);
};
```

#### 6.1.2 焦点管理系统
```typescript
// 焦点管理Hook
export const useFocusManager = (containerRef: React.RefObject<HTMLElement>) => {
  const [focusIndex, setFocusIndex] = useState(0);
  const [focusableElements, setFocusableElements] = useState<HTMLElement[]>([]);
  
  // 查找可聚焦元素
  useEffect(() => {
    if (!containerRef.current) return;
    
    const focusable = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    setFocusableElements(Array.from(focusable));
  }, [containerRef]);
  
  // 焦点导航
  const moveFocus = useCallback((direction: 'next' | 'prev' | 'first' | 'last') => {
    if (focusableElements.length === 0) return;
    
    let newIndex = focusIndex;
    
    switch (direction) {
      case 'next':
        newIndex = (focusIndex + 1) % focusableElements.length;
        break;
      case 'prev':
        newIndex = focusIndex === 0 ? focusableElements.length - 1 : focusIndex - 1;
        break;
      case 'first':
        newIndex = 0;
        break;
      case 'last':
        newIndex = focusableElements.length - 1;
        break;
    }
    
    setFocusIndex(newIndex);
    focusableElements[newIndex]?.focus();
  }, [focusIndex, focusableElements]);
  
  return { moveFocus, focusIndex, focusableElements };
};
```

### 6.2 屏幕阅读器支持

#### 6.2.1 ARIA标签规范
```typescript
// ARIA标签生成工具
export const generateARIA = {
  // 列表标签
  list: (itemCount: number, selectedIndex?: number) => ({
    role: 'listbox',
    'aria-label': `快照列表，共 ${itemCount} 项`,
    'aria-activedescendant': selectedIndex !== undefined ? `item-${selectedIndex}` : undefined
  }),
  
  // 列表项标签
  listItem: (index: number, selected: boolean, snapshot: Snapshot) => ({
    role: 'option',
    id: `item-${index}`,
    'aria-selected': selected,
    'aria-label': `快照 ${snapshot.description}，创建于 ${formatTimestamp(snapshot.timestamp)}，包含 ${snapshot.filesCount} 个文件`
  }),
  
  // 操作按钮标签
  button: (action: string, target?: string) => ({
    'aria-label': target ? `${action} ${target}` : action,
    'aria-describedby': `${action}-help`
  }),
  
  // 状态指示器标签
  status: (state: 'active' | 'paused' | 'conflict', workspace: string) => ({
    role: 'status',
    'aria-label': `工作空间 ${workspace} 状态：${state}`,
    'aria-live': 'polite'
  })
};

// ARIA增强的快照列表组件
export const AccessibleSnapshotList: React.FC<SnapshotListProps> = (props) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={listRef}
      {...generateARIA.list(props.snapshots.length, selectedIndex)}
    >
      {props.snapshots.map((snapshot, index) => (
        <div
          key={snapshot.id}
          {...generateARIA.listItem(index, index === selectedIndex, snapshot)}
          onClick={() => setSelectedIndex(index)}
        >
          <span className="snapshot-info">
            {snapshot.description} - {formatTimestamp(snapshot.timestamp)}
          </span>
          
          <div className="snapshot-actions">
            <button {...generateARIA.button('恢复快照', snapshot.description)}>
              恢复
            </button>
            <button {...generateARIA.button('删除快照', snapshot.description)}>
              删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

### 6.3 高对比度与色彩无障碍

#### 6.3.1 高对比度主题
```typescript
// 高对比度主题定义
export const highContrastTheme = {
  light: {
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#000000',
    textSecondary: '#212529',
    border: '#000000',
    accent: '#0052cc',
    success: '#006600',
    warning: '#cc6600',
    danger: '#cc0000',
    info: '#0066cc'
  },
  
  dark: {
    background: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#e9ecef',
    border: '#ffffff',
    accent: '#66b3ff',
    success: '#00ff00',
    warning: '#ffcc00',
    danger: '#ff6666',
    info: '#66ccff'
  }
} as const;

// 色彩对比度检查
export const checkColorContrast = (foreground: string, background: string): boolean => {
  // 简化的对比度计算 (实际实现应使用WCAG标准)
  const getLuminance = (color: string) => {
    // RGB转换为相对亮度
    const rgb = color.match(/\w\w/g)?.map(x => parseInt(x, 16) / 255) || [0, 0, 0];
    return rgb.reduce((acc, val) => acc + val * 0.299, 0); // 简化计算
  };
  
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  
  const contrast = Math.abs(fgLuminance - bgLuminance);
  return contrast >= 0.5; // 简化的对比度要求
};
```

---

## 7. 性能优化规范

### 7.1 渲染性能优化

#### 7.1.1 虚拟滚动实现
```typescript
// 虚拟滚动Hook
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);
  
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
    setScrollTop
  };
};

// 虚拟快照列表组件
export const VirtualSnapshotList: React.FC<SnapshotListProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(400);
  
  const { visibleItems, totalHeight, setScrollTop } = useVirtualScroll(
    props.snapshots,
    60, // 每项高度
    containerHeight
  );
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };
  
  return (
    <div 
      ref={containerRef}
      className="virtual-scroll-container"
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={item.id}
            className="snapshot-item"
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: 60
            }}
          >
            <SnapshotItem snapshot={item} index={index} {...props} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### 7.1.2 状态更新优化
```typescript
// 防抖状态更新Hook
export const useDebouncedState = <T>(initialValue: T, delay: number = 300) => {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [value, delay]);
  
  return [debouncedValue, setValue] as const;
};

// 批量状态更新
export const useBatchedUpdates = () => {
  const [updates, setUpdates] = useState<(() => void)[]>([]);
  
  const batchUpdate = useCallback((updateFn: () => void) => {
    setUpdates(prev => [...prev, updateFn]);
  }, []);
  
  useEffect(() => {
    if (updates.length > 0) {
      const timeoutId = setTimeout(() => {
        updates.forEach(fn => fn());
        setUpdates([]);
      }, 16); // 一帧的时间
      
      return () => clearTimeout(timeoutId);
    }
  }, [updates]);
  
  return { batchUpdate };
};
```

### 7.2 内存管理优化

#### 7.2.1 组件卸载清理
```typescript
// 内存清理Hook
export const useCleanup = (cleanupFn: () => void, deps: React.DependencyList = []) => {
  useEffect(() => {
    return cleanupFn;
  }, deps);
};

// WebSocket连接管理
export const useWebSocketConnection = (url: string) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  useEffect(() => {
    const socket = new WebSocket(url);
    
    socket.onopen = () => {
      setConnectionState('connected');
      setWs(socket);
    };
    
    socket.onclose = () => {
      setConnectionState('disconnected');
      setWs(null);
    };
    
    socket.onerror = () => {
      setConnectionState('disconnected');
    };
    
    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [url]);
  
  // 清理WebSocket连接
  useCleanup(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });
  
  return { ws, connectionState };
};
```

---

## 8. 错误处理与用户反馈

### 8.1 错误边界设计

#### 8.1.1 全局错误边界
```typescript
// 全局错误边界组件
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class GlobalErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // 错误上报
    console.error('ZCU Error Boundary caught an error:', error, errorInfo);
    
    // 发送错误报告到日志服务
    this.reportError(error, errorInfo);
  }
  
  private async reportError(error: Error, errorInfo: ErrorInfo) {
    try {
      await fetch('/api/error-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      );
    }
    
    return this.props.children;
  }
}

// 错误回退UI组件
const ErrorFallback: React.FC<{error?: Error, resetError: () => void}> = ({ error, resetError }) => {
  return (
    <div className="error-boundary">
      <div className="error-content">
        <h2>🚨 出现了一个错误</h2>
        <p>很抱歉，ZCU遇到了一个意外错误。</p>
        
        {error && (
          <details className="error-details">
            <summary>错误详情</summary>
            <pre>{error.message}</pre>
            {error.stack && <pre>{error.stack}</pre>}
          </details>
        )}
        
        <div className="error-actions">
          <button onClick={resetError} className="btn-primary">
            重试
          </button>
          <button onClick={() => window.location.reload()} className="btn-secondary">
            刷新页面
          </button>
          <button onClick={() => window.open('https://github.com/your-org/zcu/issues', '_blank')}>
            报告问题
          </button>
        </div>
      </div>
    </div>
  );
};
```

### 8.2 用户反馈机制

#### 8.2.1 Toast通知系统
```typescript
// Toast通知管理
interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
  }>;
}

class ToastManager {
  private messages: ToastMessage[] = [];
  private listeners: Array<(messages: ToastMessage[]) => void> = [];
  
  show(toast: Omit<ToastMessage, 'id'>): string {
    const id = generateId();
    const message: ToastMessage = { id, ...toast };
    
    this.messages.push(message);
    this.notifyListeners();
    
    // 自动移除 (如果设置了duration)
    if (toast.duration !== 0) {
      setTimeout(() => {
        this.remove(id);
      }, toast.duration || 5000);
    }
    
    return id;
  }
  
  remove(id: string) {
    this.messages = this.messages.filter(msg => msg.id !== id);
    this.notifyListeners();
  }
  
  subscribe(listener: (messages: ToastMessage[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.messages]));
  }
}

export const toast = new ToastManager();

// 便捷方法
toast.success = (title: string, message = '') => toast.show({ type: 'success', title, message });
toast.error = (title: string, message = '') => toast.show({ type: 'error', title, message });
toast.warning = (title: string, message = '') => toast.show({ type: 'warning', title, message });
toast.info = (title: string, message = '') => toast.show({ type: 'info', title, message });
```

#### 8.2.2 CLI错误处理
```typescript
// CLI错误处理组件
export const CLIErrorHandler: React.FC = () => {
  const [error, setError] = useState<Error | null>(null);
  const [recovering, setRecovering] = useState(false);
  
  useEffect(() => {
    const handleError = (error: Error) => {
      setError(error);
    };
    
    // 监听未处理的错误
    process.on('uncaughtException', handleError);
    process.on('unhandledRejection', handleError);
    
    return () => {
      process.removeListener('uncaughtException', handleError);
      process.removeListener('unhandledRejection', handleError);
    };
  }, []);
  
  const handleRecovery = async () => {
    setRecovering(true);
    try {
      // 尝试恢复操作
      await zcuApi.recoveryCheck();
      setError(null);
    } catch (recoveryError) {
      console.error('Recovery failed:', recoveryError);
    } finally {
      setRecovering(false);
    }
  };
  
  if (!error) return null;
  
  return (
    <Box flexDirection="column" borderStyle="double" borderColor="red" padding={1}>
      <Box marginBottom={1}>
        <Text bold color="red">💥 ZCU遇到了一个错误</Text>
      </Box>
      
      <Box marginBottom={1}>
        <Text>错误信息: {error.message}</Text>
      </Box>
      
      {recovering ? (
        <Box>
          <Text color="yellow">⚡ 正在尝试恢复...</Text>
        </Box>
      ) : (
        <Box flexDirection="column">
          <Text>可用操作:</Text>
          <Text>• 按 R 尝试恢复</Text>
          <Text>• 按 Q 退出程序</Text>
          <Text>• 按 L 查看详细日志</Text>
        </Box>
      )}
    </Box>
  );
};
```

---

## 9. 测试规范

### 9.1 组件测试标准

#### 9.1.1 共享组件测试
```typescript
// SnapshotList组件测试
describe('SnapshotList', () => {
  const mockSnapshots: Snapshot[] = [
    {
      id: '1',
      description: 'Initial commit',
      timestamp: Date.now(),
      filesCount: 5
    },
    {
      id: '2', 
      description: 'Added features',
      timestamp: Date.now() - 1000,
      filesCount: 3
    }
  ];
  
  const defaultProps = {
    snapshots: mockSnapshots,
    onSelect: jest.fn(),
    onRestore: jest.fn(),
    onDelete: jest.fn()
  };
  
  describe('CLI Implementation', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    
    it('should render all snapshots', () => {
      const { getByText } = render(<InkSnapshotList {...defaultProps} />);
      
      expect(getByText('Initial commit')).toBeDefined();
      expect(getByText('Added features')).toBeDefined();
    });
    
    it('should handle keyboard navigation', () => {
      const { stdin } = render(<InkSnapshotList {...defaultProps} />);
      
      // 模拟键盘输入
      stdin.write('\u001B[B'); // Arrow Down
      stdin.write('\r'); // Enter
      
      expect(defaultProps.onSelect).toHaveBeenCalledWith('2');
    });
    
    it('should handle deletion confirmation', () => {
      const { stdin } = render(<InkSnapshotList {...defaultProps} />);
      
      stdin.write('\u007F'); // Delete key
      
      // 应该显示确认对话框
      // 具体实现取决于确认机制
    });
  });
  
  describe('Web Implementation', () => {
    it('should render snapshots in table format', () => {
      render(<WebSnapshotList {...defaultProps} />);
      
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getByText('Initial commit')).toBeInTheDocument();
      expect(screen.getByText('Added features')).toBeInTheDocument();
    });
    
    it('should handle click events', () => {
      render(<WebSnapshotList {...defaultProps} />);
      
      const restoreButton = screen.getAllByText('恢复')[0];
      fireEvent.click(restoreButton);
      
      expect(defaultProps.onRestore).toHaveBeenCalledWith('1');
    });
  });
  
  describe('Shared Business Logic', () => {
    it('should sort snapshots by timestamp', () => {
      const { result } = renderHook(() => 
        useSnapshotList(defaultProps)
      );
      
      const { filteredSnapshots } = result.current;
      expect(filteredSnapshots[0].description).toBe('Initial commit');
      expect(filteredSnapshots[1].description).toBe('Added features');
    });
    
    it('should handle keyboard shortcuts', () => {
      const { result } = renderHook(() => 
        useSnapshotList(defaultProps)
      );
      
      act(() => {
        result.current.handleKeyPress('Delete');
      });
      
      expect(defaultProps.onDelete).toHaveBeenCalled();
    });
  });
});
```

#### 9.1.2 E2E测试场景
```typescript
// E2E测试用例
describe('ZCU End-to-End Tests', () => {
  let page: Page;
  
  beforeAll(async () => {
    page = await browser.newPage();
  });
  
  describe('Complete Undo/Redo Workflow', () => {
    it('should complete full undo/redo cycle', async () => {
      // 1. 启动ZCU Web界面
      await page.goto('http://localhost:3000');
      
      // 2. 等待快照列表加载
      await page.waitForSelector('[data-testid="snapshot-list"]');
      
      // 3. 创建新快照
      await page.click('[data-testid="create-snapshot-btn"]');
      await page.fill('[data-testid="snapshot-description"]', 'Test snapshot');
      await page.click('[data-testid="confirm-create"]');
      
      // 4. 验证快照创建成功
      await expect(page.locator('text=Test snapshot')).toBeVisible();
      
      // 5. 执行撤销操作
      await page.click('[data-testid="undo-btn"]');
      await page.click('[data-testid="confirm-undo"]');
      
      // 6. 验证撤销成功
      await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
      
      // 7. 执行重做操作
      await page.click('[data-testid="redo-btn"]');
      
      // 8. 验证重做成功
      await expect(page.locator('text=Test snapshot')).toBeVisible();
    });
  });
  
  describe('Conflict Resolution Workflow', () => {
    it('should handle file conflicts correctly', async () => {
      // 模拟多工作空间冲突场景
      await simulateConflictScenario();
      
      // 等待冲突通知显示
      await page.waitForSelector('[data-testid="conflict-notification"]');
      
      // 打开冲突解决器
      await page.click('[data-testid="resolve-conflict-btn"]');
      
      // 选择解决方案
      await page.click('[data-testid="keep-source1"]');
      await page.click('[data-testid="confirm-resolution"]');
      
      // 验证冲突解决
      await expect(page.locator('[data-testid="conflict-resolved-toast"]')).toBeVisible();
    });
  });
});

// CLI E2E测试
describe('CLI End-to-End Tests', () => {
  it('should handle CLI undo operation', async () => {
    const cli = spawn('zcu', ['undo'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // 等待界面出现
    await waitForOutput(cli.stdout, 'ZCU - Z Claude Undo');
    
    // 选择快照
    cli.stdin.write('\u001B[B'); // Arrow Down
    cli.stdin.write('\r'); // Enter
    
    // 确认操作
    cli.stdin.write('y'); // Yes
    
    // 等待完成
    const output = await waitForOutput(cli.stdout, '✓ 撤销操作完成');
    expect(output).toContain('撤销操作完成');
    
    cli.kill();
  });
});
```

### 9.2 性能测试标准

#### 9.2.1 渲染性能测试
```typescript
// 渲染性能基准测试
describe('Performance Benchmarks', () => {
  it('should render large snapshot list within performance budget', async () => {
    // 生成大量测试数据
    const largeSnapshotList = Array.from({ length: 1000 }, (_, index) => ({
      id: `snapshot-${index}`,
      description: `Test snapshot ${index}`,
      timestamp: Date.now() - index * 1000,
      filesCount: Math.floor(Math.random() * 20) + 1
    }));
    
    const startTime = performance.now();
    
    render(<WebSnapshotList snapshots={largeSnapshotList} {...defaultProps} />);
    
    const renderTime = performance.now() - startTime;
    
    // 渲染时间应该小于100ms
    expect(renderTime).toBeLessThan(100);
  });
  
  it('should handle rapid state updates efficiently', async () => {
    const { rerender } = render(<InkSnapshotList {...defaultProps} />);
    
    const startTime = performance.now();
    
    // 快速更新状态100次
    for (let i = 0; i < 100; i++) {
      rerender(
        <InkSnapshotList 
          {...defaultProps} 
          snapshots={[...mockSnapshots, {
            id: `new-${i}`,
            description: `New snapshot ${i}`,
            timestamp: Date.now(),
            filesCount: 1
          }]}
        />
      );
    }
    
    const updateTime = performance.now() - startTime;
    
    // 100次更新应该在200ms内完成
    expect(updateTime).toBeLessThan(200);
  });
});
```

---

## 10. 发布与维护规范

### 10.1 版本发布流程

#### 10.1.1 渐进式发布策略
```typescript
// 发布配置
export const releaseConfig = {
  stages: {
    alpha: {
      audience: 'internal',
      features: ['core', 'cli'],
      rollout: 0.1, // 10%用户
      duration: '1 week'
    },
    beta: {
      audience: 'early_adopters',
      features: ['core', 'cli', 'web_basic'],
      rollout: 0.3, // 30%用户
      duration: '2 weeks'
    },
    rc: {
      audience: 'power_users',
      features: ['core', 'cli', 'web_full'],
      rollout: 0.7, // 70%用户
      duration: '1 week'
    },
    stable: {
      audience: 'all',
      features: ['all'],
      rollout: 1.0, // 100%用户
      duration: 'permanent'
    }
  },
  
  rollbackCriteria: {
    errorRate: 0.05, // 错误率超过5%
    crashRate: 0.01, // 崩溃率超过1%
    userFeedback: -0.5, // 用户反馈评分低于-0.5
    performanceRegression: 0.2 // 性能下降超过20%
  }
};
```

#### 10.1.2 自动化发布流程
```yaml
# .github/workflows/release.yml
name: ZCU Release Pipeline

on:
  push:
    tags: ['v*']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: pnpm install
      - run: pnpm test
      - run: pnpm lint
      - run: pnpm build
  
  release:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: ZCU ${{ github.ref }}
          body: |
            ## 新功能
            - 改进的快照管理界面
            - 增强的冲突解决机制
            - 性能优化和bug修复
            
            ## 破坏性变更
            无
            
            ## 升级指南
            ```bash
            npm update zcu-cli
            ```
          draft: false
          prerelease: false
```

### 10.2 用户反馈收集

#### 10.2.1 反馈收集机制
```typescript
// 用户反馈系统
class FeedbackCollector {
  private apiEndpoint = process.env.ZCU_FEEDBACK_API || 'https://api.zcu.dev/feedback';
  
  async collectUsageFeedback(event: UsageEvent) {
    // 收集使用情况数据 (匿名化)
    const feedbackData = {
      event: event.type,
      timestamp: Date.now(),
      version: process.env.ZCU_VERSION,
      platform: process.platform,
      sessionId: this.getAnonymousSessionId(),
      metadata: event.metadata
    };
    
    try {
      await fetch(`${this.apiEndpoint}/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
    } catch (error) {
      // 失败时不影响用户体验
      console.debug('Failed to send usage feedback:', error);
    }
  }
  
  async collectErrorFeedback(error: Error, context: ErrorContext) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      context: context.sanitize(), // 移除敏感信息
      timestamp: Date.now(),
      version: process.env.ZCU_VERSION,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'CLI'
    };
    
    try {
      await fetch(`${this.apiEndpoint}/errors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }
  
  async collectUserSatisfaction(rating: number, feedback: string) {
    const satisfactionData = {
      rating,
      feedback,
      timestamp: Date.now(),
      version: process.env.ZCU_VERSION,
      sessionDuration: this.getSessionDuration()
    };
    
    await fetch(`${this.apiEndpoint}/satisfaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(satisfactionData)
    });
  }
  
  private getAnonymousSessionId(): string {
    // 生成匿名会话ID (不包含个人信息)
    return crypto.randomUUID();
  }
}
```

### 10.3 文档维护规范

#### 10.3.1 文档自动生成
```typescript
// API文档自动生成
import { generateApiDocs } from './doc-generator';

const documentationConfig = {
  input: './src',
  output: './docs/api',
  formats: ['markdown', 'html', 'json'],
  
  sections: {
    components: {
      pattern: '**/*.tsx',
      template: 'component.md.hbs'
    },
    hooks: {
      pattern: '**/use*.ts',
      template: 'hook.md.hbs'
    },
    utilities: {
      pattern: '**/utils/*.ts',
      template: 'utility.md.hbs'
    }
  },
  
  examples: {
    includeTests: true,
    includeStorybook: true,
    generatePlayground: true
  }
};

// 生成文档
generateApiDocs(documentationConfig);
```

---

## 11. 附录

### 11.1 设计决策记录 (ADR)

#### ADR-001: React共享组件架构
**状态**: 已采纳  
**日期**: 2025-09-03  

**背景**: 需要为CLI和Web界面提供一致的UI体验，同时避免重复开发。

**决策**: 采用React共享组件架构，通过不同渲染器支持Ink (CLI) 和Web双重渲染。

**后果**: 
- 正面：减少重复开发，保持UI一致性
- 负面：增加架构复杂度，需要抽象共同接口

#### ADR-002: LevelDB存储选择
**状态**: 已采纳  
**日期**: 2025-09-03  

**背景**: 需要轻量级的本地存储方案，支持快速读写和跨平台。

**决策**: 选择LevelDB作为主要存储引擎。

**后果**:
- 正面：轻量级、高性能、零配置
- 负面：功能相对简单，复杂查询需要应用层实现

### 11.2 组件清单

#### 11.2.1 共享组件列表
| 组件名称 | CLI实现 | Web实现 | 功能描述 |
|---------|---------|---------|----------|
| SnapshotList | InkSnapshotList | WebSnapshotList | 快照列表显示和操作 |
| ConflictResolver | InkConflictDialog | WebConflictModal | 冲突解决界面 |
| WorkspaceStatus | InkWorkspaceStatus | WebWorkspacePanel | AI工作空间状态显示 |
| OperationHistory | InkHistoryTree | WebTimelineView | 操作历史时间线 |
| DiffViewer | InkTextDiff | WebSplitDiff | 文件差异对比 |
| CommandInput | InkCommandInput | WebCommandBar | 白话命令输入 |
| CheckpointManager | InkCheckpointList | WebCheckpointGrid | 检查点管理界面 |

#### 11.2.2 平台特定组件
| 组件类型 | CLI专用 | Web专用 | 说明 |
|---------|---------|---------|------|
| 布局组件 | InkLayout | WebLayout | 平台特定布局容器 |
| 导航组件 | InkNavigator | WebSidebar | 导航和菜单系统 |
| 输入组件 | InkTextInput | WebFormInput | 输入控件适配 |
| 通知组件 | InkToast | WebToast | 消息通知显示 |

### 11.3 技术栈详细清单

#### 11.3.1 核心依赖
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "ink": "^4.4.1",
    "zustand": "^4.4.1",
    "leveldb": "^6.2.1",
    "simple-git": "^3.19.1",
    "commander": "^11.0.0",
    "chalk": "^5.3.0",
    "enquirer": "^2.4.1"
  },
  "devDependencies": {
    "typescript": "^5.1.6",
    "vitest": "^0.34.2",
    "@testing-library/react": "^13.4.0",
    "@types/react": "^18.2.20",
    "eslint": "^8.47.0",
    "@antfu/eslint-config": "^0.43.1",
    "unbuild": "^1.2.1"
  }
}
```

#### 11.3.2 Web特定依赖
```json
{
  "webDependencies": {
    "next": "^13.4.19",
    "tailwindcss": "^3.3.3",
    "framer-motion": "^10.16.1",
    "react-hot-toast": "^2.4.1",
    "react-hook-form": "^7.45.4",
    "@headlessui/react": "^1.7.17"
  }
}
```

### 11.4 浏览器支持清单

| 浏览器 | 最低版本 | 支持状态 | 备注 |
|--------|----------|----------|------|
| Chrome | 90+ | 完全支持 | 推荐浏览器 |
| Firefox | 88+ | 完全支持 | 完整功能支持 |
| Safari | 14+ | 完全支持 | macOS/iOS |
| Edge | 90+ | 完全支持 | Chromium内核 |
| IE | - | 不支持 | 已停止支持 |

### 11.5 键盘快捷键完整清单

#### 11.5.1 全局快捷键
| 功能 | CLI快捷键 | Web快捷键 | 说明 |
|------|-----------|-----------|------|
| 撤销操作 | `Ctrl+Z` | `Ctrl+Z` / `Cmd+Z` | 快速撤销 |
| 重做操作 | `Ctrl+Y` | `Ctrl+Y` / `Cmd+Shift+Z` | 快速重做 |
| 创建快照 | `Ctrl+S` | `Ctrl+S` / `Cmd+S` | 创建快照 |
| 刷新界面 | `F5` | `F5` / `Ctrl+R` | 刷新数据 |
| 显示帮助 | `F1` / `?` | `F1` / `?` | 帮助信息 |

#### 11.5.2 导航快捷键
| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 向上导航 | `↑` / `k` | 上一项 |
| 向下导航 | `↓` / `j` | 下一项 |
| 向左导航 | `←` / `h` | 左侧/返回 |
| 向右导航 | `→` / `l` | 右侧/进入 |
| 选择项目 | `Enter` / `Space` | 确认选择 |
| 取消操作 | `Esc` | 取消/返回 |

---

**文档状态**: ✅ 已完成  
**审核状态**: 📋 待审核  
**下一步行动**: 开始前端组件开发和UI实现

---

*本前端UI/UX规范文档基于BMAD-METHOD™框架创建，结合了PRD文档要求和项目简介的技术规划，为ZCU项目的前端开发提供了详细的设计指导和实现规范。*