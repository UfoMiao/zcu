import type { Buffer } from 'node:buffer'
import type { SimpleGit } from 'simple-git'
import type {
  FileSnapshot,
  RepositoryConfig,
  RestoreOptions,
  SnapshotDiff,
  SnapshotMetadata,
  SnapshotStats,
} from '../types/repository'
import { promises as fs } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { nanoid } from 'nanoid'
import { simpleGit } from 'simple-git'

export class ShadowRepositoryManager {
  private git: SimpleGit
  private config: RepositoryConfig
  private initialized = false

  constructor(config: RepositoryConfig) {
    this.config = {
      maxSnapshots: 20,
      enableCompression: true,
      excludePatterns: ['.git', 'node_modules', '.zcu', '*.log'],
      ...config,
    }
    this.git = simpleGit(this.config.shadowPath)
  }

  async initialize(): Promise<void> {
    if (this.initialized)
      return

    await this.ensureShadowDirectory()
    await this.initializeGitRepository()
    this.initialized = true
  }

  async createSnapshot(operationId: string): Promise<SnapshotMetadata> {
    if (!this.initialized) {
      await this.initialize()
    }

    const snapshotId = nanoid(12)
    const timestamp = new Date()

    // 创建增量快照
    const diff = await this.calculateDiff()
    await this.copyChangedFiles(diff)

    // 提交到Git
    await this.git.add('.')
    const commitResult = await this.git.commit(`Snapshot ${snapshotId} for operation ${operationId}`, {
      '--author': 'ZCU Shadow <zcu@local>',
    })

    const fileCount = diff.added.length + diff.modified.length
    const size = await this.calculateSnapshotSize(diff)

    const metadata: SnapshotMetadata = {
      id: snapshotId,
      timestamp,
      operationId,
      projectPath: this.config.projectPath,
      commitHash: commitResult.commit,
      fileCount,
      size,
      isIncremental: true,
      parentSnapshotId: await this.getLatestSnapshotId(),
    }

    // 清理旧快照
    await this.cleanupOldSnapshots()

    return metadata
  }

  async restoreSnapshot(snapshotId: string, options: RestoreOptions = {
    preserveTimestamps: true,
    createBackup: false,
  }): Promise<void> {
    if (!this.initialized) {
      await this.initialize()
    }

    const targetPath = options.targetPath || this.config.projectPath

    if (options.createBackup) {
      await this.createBackup(targetPath)
    }

    // 恢复到指定快照
    await this.git.checkout(snapshotId)

    // 复制文件到目标目录
    await this.copySnapshot(this.config.shadowPath, targetPath, options)

    // 返回到最新状态
    await this.git.checkout('main')
  }

  async getSnapshotHistory(limit = 20): Promise<SnapshotMetadata[]> {
    if (!this.initialized) {
      await this.initialize()
    }

    const log = await this.git.log({ maxCount: limit })
    return log.all.map((commit) => {
      const match = commit.message.match(/Snapshot (\w+) for operation (\w+)/)
      return {
        id: match?.[1] || commit.hash.substring(0, 12),
        timestamp: new Date(commit.date),
        operationId: match?.[2] || 'unknown',
        projectPath: this.config.projectPath,
        commitHash: commit.hash,
        fileCount: 0, // 需要从commit中计算
        size: 0, // 需要从commit中计算
        isIncremental: true,
        parentSnapshotId: commit.refs.length > 1 ? commit.refs[1] : undefined,
      }
    })
  }

  async getStats(): Promise<SnapshotStats> {
    if (!this.initialized) {
      await this.initialize()
    }

    const history = await this.getSnapshotHistory(1000)

    if (history.length === 0) {
      return {
        totalSnapshots: 0,
        totalSize: 0,
        oldestSnapshot: new Date(),
        newestSnapshot: new Date(),
        averageSize: 0,
        compressionRatio: 1.0,
      }
    }

    const totalSize = history.reduce((sum, snap) => sum + snap.size, 0)
    const timestamps = history.map((h) => h.timestamp).sort()

    return {
      totalSnapshots: history.length,
      totalSize,
      oldestSnapshot: timestamps[0],
      newestSnapshot: timestamps[timestamps.length - 1],
      averageSize: totalSize / history.length,
      compressionRatio: this.config.enableCompression ? 0.7 : 1.0, // 估算压缩比
    }
  }

  // 私有方法

  private async ensureShadowDirectory(): Promise<void> {
    try {
      await fs.access(this.config.shadowPath)
    } catch {
      await fs.mkdir(this.config.shadowPath, { recursive: true })
    }
  }

  private async initializeGitRepository(): Promise<void> {
    try {
      await this.git.status()
    } catch {
      await this.git.init()
      await this.git.checkout(['-b', 'main'])

      // 创建初始提交
      const gitignoreContent = this.config.excludePatterns.join('\n')
      await fs.writeFile(join(this.config.shadowPath, '.gitignore'), gitignoreContent)
      await this.git.add('.gitignore')
      await this.git.commit('Initial shadow repository setup', {
        '--author': 'ZCU Shadow <zcu@local>',
      })
    }
  }

  private async calculateDiff(): Promise<SnapshotDiff> {
    const currentFiles = await this.scanProjectFiles()
    const shadowFiles = await this.scanShadowFiles()

    const currentMap = new Map(currentFiles.map((f) => [f.relativePath, f]))
    const shadowMap = new Map(shadowFiles.map((f) => [f.relativePath, f]))

    const added: FileSnapshot[] = []
    const modified: FileSnapshot[] = []
    const deleted: FileSnapshot[] = []
    const unchanged: FileSnapshot[] = []

    // 检查当前文件
    for (const [path, current] of currentMap) {
      const shadow = shadowMap.get(path)

      if (!shadow) {
        added.push(current)
      } else if (current.hash !== shadow.hash) {
        modified.push(current)
      } else {
        unchanged.push(current)
      }
    }

    // 检查已删除的文件
    for (const [path, shadow] of shadowMap) {
      if (!currentMap.has(path)) {
        deleted.push({ ...shadow, isDeleted: true })
      }
    }

    return { added, modified, deleted, unchanged }
  }

  private async scanProjectFiles(): Promise<FileSnapshot[]> {
    const files: FileSnapshot[] = []

    async function scanDir(dirPath: string, basePath: string): Promise<void> {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name)
        const relativePath = relative(basePath, fullPath)

        // 跳过排除的模式
        if (this.shouldExclude(relativePath)) {
          continue
        }

        if (entry.isDirectory()) {
          await scanDir(fullPath, basePath)
        } else if (entry.isFile()) {
          const stat = await fs.stat(fullPath)
          const content = await fs.readFile(fullPath)
          const hash = this.calculateFileHash(content)

          files.push({
            path: fullPath,
            relativePath,
            hash,
            size: stat.size,
            mtime: stat.mtime,
            isDeleted: false,
          })
        }
      }
    }

    await scanDir.call(this, this.config.projectPath, this.config.projectPath)
    return files
  }

  private async scanShadowFiles(): Promise<FileSnapshot[]> {
    try {
      return await this.scanProjectFiles()
    } catch {
      return []
    }
  }

  private shouldExclude(relativePath: string): boolean {
    return this.config.excludePatterns.some((pattern) => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'))
        return regex.test(relativePath)
      }
      return relativePath.includes(pattern)
    })
  }

  private calculateFileHash(content: Buffer): string {
    // 简单的hash实现，生产环境应该使用crypto
    let hash = 0
    const str = content.toString('binary')
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return Math.abs(hash).toString(16)
  }

  private async copyChangedFiles(diff: SnapshotDiff): Promise<void> {
    // 复制新增和修改的文件
    for (const file of [...diff.added, ...diff.modified]) {
      const targetPath = join(this.config.shadowPath, file.relativePath)
      await fs.mkdir(dirname(targetPath), { recursive: true })
      await fs.copyFile(file.path, targetPath)
    }

    // 删除已删除的文件
    for (const file of diff.deleted) {
      const targetPath = join(this.config.shadowPath, file.relativePath)
      try {
        await fs.unlink(targetPath)
      } catch {
        // 文件可能已经不存在
      }
    }
  }

  private async calculateSnapshotSize(diff: SnapshotDiff): Promise<number> {
    let totalSize = 0
    for (const file of [...diff.added, ...diff.modified]) {
      totalSize += file.size
    }
    return totalSize
  }

  private async getLatestSnapshotId(): Promise<string | undefined> {
    try {
      const log = await this.git.log({ maxCount: 1 })
      const latest = log.latest
      if (latest) {
        const match = latest.message.match(/Snapshot (\w+)/)
        return match?.[1]
      }
    } catch {
      // 忽略错误
    }
    return undefined
  }

  private async cleanupOldSnapshots(): Promise<void> {
    const history = await this.getSnapshotHistory()
    if (history.length > this.config.maxSnapshots) {
      // const toDelete = history.slice(this.config.maxSnapshots)
      // 在实际实现中，这里应该删除旧的提交
      // Git不支持简单的提交删除，需要使用rebase等高级操作
    }
  }

  private async createBackup(_targetPath: string): Promise<void> {
    // const backupPath = `${targetPath}.zcu-backup-${Date.now()}`
    // 创建目标目录的备份
    // 简化实现，实际需要递归复制
  }

  private async copySnapshot(_sourcePath: string, _targetPath: string, _options: RestoreOptions): Promise<void> {
    // 将快照内容复制到目标路径
    // 需要处理包含/排除模式、时间戳保持等选项
  }
}
