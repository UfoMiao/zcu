# ZCU - Z Claude Undo 项目简介

> **最后更新**: 2025-09-03  
> **项目版本**: v1.0.0-alpha  
> **文档版本**: v1.0  

## 项目概述

### 项目名称
**ZCU (Z Claude Undo)** - 集成多种开源方案优势的Claude Code undo功能最佳实践方案

### 使命声明
为Claude Code用户提供最完善的undo/redo功能，支持多方协作、会话隔离，集成现有优秀开源方案的最佳实践，打造开发者友好的智能回滚系统。

### 核心价值主张
- **集成式设计**: 融合ccundo、ccheckpoints、Rewind-MCP、ClaudePoint等优秀开源方案的核心优势
- **AI工作空间隔离**: 解决多Claude实例并发操作的冲突问题
- **用户主控**: 避免AI幻觉问题，所有关键操作由用户确认
- **轻量高效**: 基于LevelDB + Shadow Repository的轻量级存储方案
- **统一UI体验**: React共享组件支持终端(Ink)和Web双重渲染

## 市场定位与竞争分析

### 目标市场
- **主要用户**: Claude Code重度使用者、AI辅助开发团队
- **细分市场**: 多人协作AI开发项目、企业级AI开发工作流
- **市场规模**: 随Claude Code生态增长而扩展的垂直市场

### 竞争态势
| 产品 | 优势 | 劣势 | ZCU差异化 |
|------|------|------|-----------|
| ccundo | Session隔离成熟 | 存储效率一般 | 更轻量的LevelDB存储 |
| ccheckpoints | 项目路径识别 | 缺少多实例处理 | AI工作空间隔离机制 |
| Rewind-MCP | Shadow Repository设计优秀 | 复杂度较高 | 简化实现+增强易用性 |
| ClaudePoint | 基础功能完整 | UI体验欠佳 | 统一的React双重渲染 |

### 独特卖点 (USP)
1. **唯一集成多方案优势**: 不是重新发明轮子，而是最佳实践整合
2. **AI实例隔离机制**: 业界首个解决多Claude并发操作的完整方案
3. **双重UI架构**: 终端和Web共享组件，开发者工作流无缝切换
4. **实用主义设计**: 用户主控+智能辅助，避开AI幻觉陷阱

## 技术架构与解决方案

### 核心技术栈

#### 存储层
```typescript
// 存储架构设计
LevelDB + Shadow Repository + 内存缓存
├── LevelDB: 轻量KV存储(~200KB)，存储元数据和会话信息
├── Shadow Repository: Git仓库管理文件快照，支持增量存储
└── 内存缓存: 提升读写性能，缓存热点数据
```

#### UI层架构
```typescript
// React共享组件架构
ZCU Core API Server
├── React共享组件库 (通用UI逻辑)
├── Ink终端UI (React Ink渲染)
├── Web Dashboard (React Web渲染)
└── ZCF命令集成 (白话操作支持)
```

#### 会话管理
```typescript
// AI工作空间隔离设计
interface AIWorkspace {
  sessionId: string;           // claude_workspace_uuid
  aiAgent: string;            // 区分不同Claude实例
  projectPath: string;        // 项目路径
  workspaceState: WorkspaceState; // active|paused|conflict
  operationChain: Operation[]; // 操作链追踪
  conflictDetection: ConflictManager; // 冲突检测机制
}
```

### 核心创新点

#### 1. Shadow Repository集成 (从Rewind-MCP借鉴)
- **隔离式状态管理**: 独立Git仓库避免污染主项目
- **两阶段提交**: 借鉴数据库事务机制确保操作原子性
- **增量快照**: 只存储变化部分，节省存储空间

#### 2. AI工作空间隔离机制 (首创)
```javascript
// LevelDB键值对设计
'workspace:{aiId}:active' → session metadata
'operation:{aiId}:latest' → 最新操作记录
'conflict:{projectPath}' → 冲突状态追踪
'safety:{operationId}' → 回滚安全等级评估
```

#### 3. Hook事件增强处理
```typescript
// 智能事件处理机制
HookEvent = {
  eventType: 'ai_operation_start' | 'ai_operation_complete' | 'user_manual_edit' | 'session_conflict_detected',
  source: 'claude_ai' | 'user_manual' | 'external',
  sessionId: string,
  toolCallId: string, // AI操作专用标识
  timestamp: number,
  fileChanges: FileChange[]
}
```

### 技术决策依据

#### 选择LevelDB而非SQLite的原因
- **轻量级**: ~200KB vs SQLite的几MB
- **零配置**: 无需数据库设置和维护
- **跨平台**: Node.js原生支持，Windows/Mac/Linux一致体验
- **KV存储**: 完美匹配项目存储需求

#### React双重渲染架构优势
- **代码复用**: 一套组件代码，两种渲染目标
- **技术成熟**: React生态完善，Ink技术验证
- **开发效率**: 减少UI重复开发，专注核心逻辑

## 产品功能规划

### MVP (最小可行产品)
**发布时间**: 2-3个月内

#### 核心功能
1. **基础Undo/Redo**
   - 基于LevelDB的轻量级存储
   - Shadow Repository文件快照管理
   - 基础的回滚和重做功能

2. **AI工作空间隔离**
   - 基于Claude实例ID的会话隔离
   - 基础冲突检测和提示
   - 操作链追踪

3. **终端UI (Ink)**
   - 基础命令行操作界面
   - 快照列表和选择功能
   - 简单的diff展示

#### 技术指标
- 支持项目大小: ≤100MB
- 快照创建时间: ≤3秒
- 内存占用: ≤50MB
- 支持并发AI实例: 3个

### 完整版 (v1.0)
**发布时间**: 4-6个月内

#### 增强功能
1. **Web Dashboard**
   - 可视化时间线浏览
   - 图形化diff对比
   - 批量操作管理

2. **高级冲突解决**
   - 智能三方合并工具
   - 可视化冲突解决界面
   - 自动冲突检测优化

3. **ZCF深度集成**
   - 白话命令支持: "撤销刚才的修改并创建检查点"
   - 智能操作建议
   - 工作流自动化

4. **性能优化**
   - 大型项目支持(≤1GB)
   - 增量同步优化
   - 内存使用优化

#### 企业功能 (v2.0+)
- 团队协作同步
- 审计日志系统
- 插件化扩展支持
- 分布式checkpoint同步

## 开发规范与标准

### 项目结构 (遵循ZCF规范)
```
zcu/
├── src/                    # 源代码
│   ├── core/              # 核心逻辑
│   ├── storage/           # 存储层
│   ├── ui/                # UI组件
│   └── integrations/      # 集成模块
├── tests/                 # 测试文件
├── docs/                  # 文档
├── config/                # 配置文件
├── scripts/               # 构建脚本
└── examples/              # 使用示例
```

### 技术标准
- **TypeScript**: 严格模式，ES2022目标
- **构建工具**: unbuild (与ZCF保持一致)
- **测试框架**: Vitest，覆盖率≥80%
- **代码质量**: ESLint + @antfu/config
- **包管理**: pnpm + changeset版本管理

### 开发工作流
1. **TDD驱动**: 测试先行开发模式
2. **模块化设计**: 单个文件≤500行
3. **语义化版本**: 遵循semver规范
4. **自动化CI/CD**: GitHub Actions集成
5. **文档驱动**: 代码即文档，注释完整

## 商业模式与盈利策略

### 开源策略
- **核心功能开源**: MIT许可证，完整的基础功能
- **社区驱动**: 接受贡献，建立活跃的开发者社区
- **文档完善**: 详细的API文档和使用指南

### 潜在盈利模式
1. **企业版功能**: 团队协作、审计、高级安全特性
2. **技术支持服务**: 企业级技术支持和定制开发
3. **Claude生态集成**: 作为Claude官方工具生态的一部分

## 风险评估与应对策略

### 技术风险
| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|----------|
| LevelDB性能瓶颈 | 中 | 中 | 提前基准测试，备选SQLite方案 |
| Shadow Repository复杂度 | 高 | 高 | 简化实现，分阶段开发 |
| 多平台兼容性 | 中 | 高 | 早期跨平台测试，CI/CD验证 |
| AI工作空间隔离实现难度 | 高 | 高 | 原型验证，参考现有实现 |

### 市场风险
- **Claude Code政策变更**: 保持与官方沟通，适应性设计
- **竞品快速迭代**: 专注差异化功能，建立技术壁垒
- **用户采用率**: 重视用户体验，社区建设

### 应对措施
1. **技术原型优先**: 核心技术先验证可行性
2. **模块化设计**: 便于替换和升级核心组件
3. **社区建设**: 早期用户反馈，快速迭代
4. **文档完善**: 降低使用门槛，提高采用率

## 成功指标与KPI

### 技术指标
- **性能**: 快照创建≤3秒，内存占用≤50MB
- **稳定性**: 崩溃率≤0.1%，数据丢失率=0%
- **兼容性**: 支持Windows/Mac/Linux三大平台

### 用户指标
- **采用率**: 6个月内GitHub stars≥1000
- **活跃度**: 月活跃用户≥500人
- **满意度**: 用户反馈评分≥4.5/5.0

### 生态指标
- **集成度**: 与主流Claude工作流工具集成
- **贡献度**: 外部贡献者≥10人
- **文档完善**: API文档覆盖率100%

## 团队与资源需求

### 核心团队构成
- **项目负责人**: 1人，负责整体规划和技术决策
- **后端架构师**: 1人，负责存储层和核心逻辑
- **前端工程师**: 1人，负责UI层和用户体验
- **测试工程师**: 1人，负责质量保证和自动化测试

### 开发时间线
```
阶段1 (1-2个月): 核心架构MVP
├── LevelDB存储层实现
├── Shadow Repository集成
├── 基础AI工作空间隔离
└── 终端UI原型

阶段2 (2-3个月): 功能完善
├── Web Dashboard开发
├── 高级冲突解决
├── Claude code command集成和白话命令
└── 性能优化和测试

阶段3 (1个月): 发布准备
├── 文档完善
├── 社区建设
├── 最终测试
└── 正式发布
```

## 总结

ZCU项目旨在成为Claude Code生态中最完善的undo/redo解决方案，通过集成现有优秀开源项目的最佳实践，结合独创的AI工作空间隔离机制和统一UI架构，为开发者提供专业级的代码回滚体验。

项目坚持实用主义设计原则，避开AI幻觉陷阱，让用户保持主控地位。通过分阶段开发和社区驱动的开源策略，预期将成为Claude Code用户的必备工具。

---

**文档维护说明**: 本文档将随项目进展持续更新，重要变更将通过changelog记录。如有技术问题或建议，请通过GitHub Issues提交。

**创建基于**: BMAD-METHOD™框架  
**头脑风暴来源**: 47+个创意和技术方案  
**技术标准参考**: ZCF项目开发规范  
**最后审核**: 2025-09-03