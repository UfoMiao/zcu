/**
 * Core package test setup
 * 为 Core 包测试提供公共设置和模拟
 */

import { beforeEach, vi } from 'vitest'

// 模拟文件系统操作
vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
    writeFile: vi.fn(),
    mkdir: vi.fn(),
    stat: vi.fn(),
    readdir: vi.fn(),
  },
  existsSync: vi.fn(),
}))

// 模拟 LevelDB
vi.mock('classic-level', () => ({
  Level: vi.fn().mockImplementation(() => ({
    open: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    get: vi.fn(),
    put: vi.fn(),
    del: vi.fn(),
    iterator: vi.fn(),
  })),
}))

// 模拟 simple-git
vi.mock('simple-git', () => ({
  simpleGit: vi.fn().mockImplementation(() => ({
    init: vi.fn().mockResolvedValue({}),
    add: vi.fn().mockResolvedValue({}),
    commit: vi.fn().mockResolvedValue({}),
    checkout: vi.fn().mockResolvedValue({}),
    log: vi.fn().mockResolvedValue({ all: [] }),
    status: vi.fn().mockResolvedValue({ files: [] }),
  })),
}))

beforeEach(() => {
  // 清理模拟状态
  vi.clearAllMocks()

  // 重置 console.log 以避免测试输出干扰
  vi.spyOn(console, 'log').mockImplementation(() => {})
})
