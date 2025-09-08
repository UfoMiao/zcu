/**
 * Session Manager Tests
 * Tests for multi-instance workspace isolation with 100% coverage
 */

import type { OperationRecord } from '@ufomiao/types'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SessionManager } from '../../src/session/session-manager'

// Mock Date for consistent testing
const mockDate = new Date('2025-09-07T12:00:00.000Z')

describe('sessionManager', () => {
  let sessionManager: SessionManager

  beforeEach(() => {
    sessionManager = new SessionManager()
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('constructor', () => {
    it('should create session manager with empty state', () => {
      const manager = new SessionManager()
      expect(manager.getCurrentSession()).toBeNull()
      expect(manager.listSessions()).toEqual([])
      expect(manager.getSessionCount()).toBe(0)
    })
  })

  describe('session creation', () => {
    it('should create new session successfully', () => {
      const sessionId = 'test-session-1'
      const aiAgent = 'claude-3'
      const projectPath = '/test/project'

      const session = sessionManager.createSession(sessionId, aiAgent, projectPath)

      expect(session).toEqual({
        sessionId,
        aiAgent,
        projectPath,
        operationChain: [],
        status: 'active',
        lastActivity: mockDate,
        metadata: {},
      })

      expect(sessionManager.getCurrentSession()).toEqual(session)
      expect(sessionManager.getSessionCount()).toBe(1)
    })

    it('should throw error for duplicate session ID', () => {
      const sessionId = 'duplicate-session'
      sessionManager.createSession(sessionId, 'claude-1', '/path1')

      expect(() => {
        sessionManager.createSession(sessionId, 'claude-2', '/path2')
      }).toThrow('Session duplicate-session already exists')
    })

    it('should set created session as current session', () => {
      const sessionId = 'test-session'
      const session = sessionManager.createSession(sessionId, 'claude', '/path')

      expect(sessionManager.getCurrentSession()).toEqual(session)
    })
  })

  describe('session retrieval', () => {
    beforeEach(() => {
      sessionManager.createSession('session-1', 'claude-1', '/path1')
      sessionManager.createSession('session-2', 'claude-2', '/path2')
    })

    it('should get current session', () => {
      const currentSession = sessionManager.getCurrentSession()
      expect(currentSession?.sessionId).toBe('session-2') // Last created becomes current
    })

    it('should return null when no current session', () => {
      const manager = new SessionManager()
      expect(manager.getCurrentSession()).toBeNull()
    })

    it('should return null when current session ID exists but session is missing from map', () => {
      // Create a session, then manually remove it from the map to test edge case
      sessionManager.createSession('test-session', 'claude', '/path')
      // Manually delete from map but keep currentSessionId
      const sessions = (sessionManager as any).sessions as Map<string, any>
      sessions.delete('test-session')

      expect(sessionManager.getCurrentSession()).toBeNull()
    })

    it('should get specific session by ID', () => {
      const session = sessionManager.getSession('session-1')
      expect(session?.sessionId).toBe('session-1')
      expect(session?.aiAgent).toBe('claude-1')
    })

    it('should return null for non-existent session', () => {
      const session = sessionManager.getSession('non-existent')
      expect(session).toBeNull()
    })

    it('should list all sessions', () => {
      const sessions = sessionManager.listSessions()
      expect(sessions).toHaveLength(2)
      expect(sessions.map(s => s.sessionId)).toEqual(['session-1', 'session-2'])
    })
  })

  describe('session switching', () => {
    beforeEach(() => {
      sessionManager.createSession('session-1', 'claude-1', '/path1')
      sessionManager.createSession('session-2', 'claude-2', '/path2')
    })

    it('should switch to existing session', () => {
      const success = sessionManager.switchSession('session-1')
      expect(success).toBe(true)
      expect(sessionManager.getCurrentSession()?.sessionId).toBe('session-1')
    })

    it('should fail to switch to non-existent session', () => {
      const success = sessionManager.switchSession('non-existent')
      expect(success).toBe(false)
      expect(sessionManager.getCurrentSession()?.sessionId).toBe('session-2') // Unchanged
    })
  })

  describe('session deletion', () => {
    beforeEach(() => {
      sessionManager.createSession('session-1', 'claude-1', '/path1')
      sessionManager.createSession('session-2', 'claude-2', '/path2')
    })

    it('should delete existing session', () => {
      const success = sessionManager.deleteSession('session-1')
      expect(success).toBe(true)
      expect(sessionManager.getSession('session-1')).toBeNull()
      expect(sessionManager.getSessionCount()).toBe(1)
    })

    it('should fail to delete non-existent session', () => {
      const success = sessionManager.deleteSession('non-existent')
      expect(success).toBe(false)
      expect(sessionManager.getSessionCount()).toBe(2)
    })

    it('should clear current session when deleting current session', () => {
      // session-2 is current session
      const success = sessionManager.deleteSession('session-2')
      expect(success).toBe(true)
      expect(sessionManager.getCurrentSession()).toBeNull()
    })

    it('should not affect current session when deleting non-current session', () => {
      sessionManager.switchSession('session-1')
      const success = sessionManager.deleteSession('session-2')
      expect(success).toBe(true)
      expect(sessionManager.getCurrentSession()?.sessionId).toBe('session-1')
    })
  })

  describe('activity updates', () => {
    beforeEach(() => {
      sessionManager.createSession('session-1', 'claude-1', '/path1')
      sessionManager.createSession('session-2', 'claude-2', '/path2')
    })

    it('should update activity for current session', () => {
      const newTime = new Date('2025-09-07T13:00:00.000Z')
      vi.setSystemTime(newTime)

      const success = sessionManager.updateActivity()
      expect(success).toBe(true)
      expect(sessionManager.getCurrentSession()?.lastActivity).toEqual(newTime)
    })

    it('should update activity for specific session', () => {
      const newTime = new Date('2025-09-07T13:00:00.000Z')
      vi.setSystemTime(newTime)

      const success = sessionManager.updateActivity('session-1')
      expect(success).toBe(true)
      expect(sessionManager.getSession('session-1')?.lastActivity).toEqual(newTime)
    })

    it('should fail when no current session', () => {
      const manager = new SessionManager()
      const success = manager.updateActivity()
      expect(success).toBe(false)
    })

    it('should fail for non-existent session', () => {
      const success = sessionManager.updateActivity('non-existent')
      expect(success).toBe(false)
    })
  })

  describe('operation management', () => {
    const mockOperation: OperationRecord = {
      id: 'op-1',
      type: 'file_create',
      timestamp: new Date(),
      source: 'user_manual',
      files: [{
        path: '/test/file.ts',
        action: 'create',
        content: 'test content',
      }],
      canUndo: true,
      canRedo: false,
    }

    beforeEach(() => {
      sessionManager.createSession('session-1', 'claude-1', '/path1')
      sessionManager.createSession('session-2', 'claude-2', '/path2')
    })

    it('should add operation to current session', () => {
      const newTime = new Date('2025-09-07T13:00:00.000Z')
      vi.setSystemTime(newTime)

      const success = sessionManager.addOperation(mockOperation)
      expect(success).toBe(true)

      const currentSession = sessionManager.getCurrentSession()
      expect(currentSession?.operationChain).toHaveLength(1)
      expect(currentSession?.operationChain[0]).toEqual(mockOperation)
      expect(currentSession?.lastActivity).toEqual(newTime)
    })

    it('should add operation to specific session', () => {
      const success = sessionManager.addOperation(mockOperation, 'session-1')
      expect(success).toBe(true)

      const session = sessionManager.getSession('session-1')
      expect(session?.operationChain).toHaveLength(1)
      expect(session?.operationChain[0]).toEqual(mockOperation)
    })

    it('should fail when no current session', () => {
      const manager = new SessionManager()
      const success = manager.addOperation(mockOperation)
      expect(success).toBe(false)
    })

    it('should fail for non-existent session', () => {
      const success = sessionManager.addOperation(mockOperation, 'non-existent')
      expect(success).toBe(false)
    })
  })

  describe('conflict detection', () => {
    it('should return no conflicts for single session', () => {
      sessionManager.createSession('session-1', 'claude-1', '/project1')
      const conflicts = sessionManager.detectConflicts('/project1')
      expect(conflicts).toEqual([])
    })

    it('should return no conflicts for different projects', () => {
      sessionManager.createSession('session-1', 'claude-1', '/project1')
      sessionManager.createSession('session-2', 'claude-2', '/project2')
      const conflicts = sessionManager.detectConflicts('/project1')
      expect(conflicts).toEqual([])
    })

    it('should detect conflicts for multiple active sessions on same project', () => {
      sessionManager.createSession('session-1', 'claude-1', '/project1')
      sessionManager.createSession('session-2', 'claude-2', '/project1')

      const conflicts = sessionManager.detectConflicts('/project1')
      expect(conflicts).toHaveLength(1)
      expect(conflicts[0]).toEqual({
        projectPath: '/project1',
        conflictingAgents: ['claude-1', 'claude-2'],
        conflictType: 'workspace_lock',
        detectedAt: mockDate,
        description: 'Multiple active sessions detected for project: /project1',
      })
    })

    it('should not detect conflicts for paused sessions', () => {
      sessionManager.createSession('session-1', 'claude-1', '/project1')
      sessionManager.createSession('session-2', 'claude-2', '/project1')
      sessionManager.pauseSession('session-1')

      const conflicts = sessionManager.detectConflicts('/project1')
      expect(conflicts).toEqual([]) // Only one active session remains
    })
  })

  describe('session status management', () => {
    beforeEach(() => {
      sessionManager.createSession('session-1', 'claude-1', '/path1')
    })

    it('should pause session successfully', () => {
      const newTime = new Date('2025-09-07T13:00:00.000Z')
      vi.setSystemTime(newTime)

      const success = sessionManager.pauseSession('session-1')
      expect(success).toBe(true)

      const session = sessionManager.getSession('session-1')
      expect(session?.status).toBe('paused')
      expect(session?.lastActivity).toEqual(newTime)
    })

    it('should fail to pause non-existent session', () => {
      const success = sessionManager.pauseSession('non-existent')
      expect(success).toBe(false)
    })

    it('should resume session successfully', () => {
      const newTime = new Date('2025-09-07T13:00:00.000Z')
      vi.setSystemTime(newTime)

      sessionManager.pauseSession('session-1')
      const success = sessionManager.resumeSession('session-1')
      expect(success).toBe(true)

      const session = sessionManager.getSession('session-1')
      expect(session?.status).toBe('active')
      expect(session?.lastActivity).toEqual(newTime)
    })

    it('should fail to resume non-existent session', () => {
      const success = sessionManager.resumeSession('non-existent')
      expect(success).toBe(false)
    })
  })

  describe('session count and cleanup', () => {
    it('should return correct session count', () => {
      expect(sessionManager.getSessionCount()).toBe(0)

      sessionManager.createSession('session-1', 'claude-1', '/path1')
      expect(sessionManager.getSessionCount()).toBe(1)

      sessionManager.createSession('session-2', 'claude-2', '/path2')
      expect(sessionManager.getSessionCount()).toBe(2)

      sessionManager.deleteSession('session-1')
      expect(sessionManager.getSessionCount()).toBe(1)
    })

    it('should clear all sessions', () => {
      sessionManager.createSession('session-1', 'claude-1', '/path1')
      sessionManager.createSession('session-2', 'claude-2', '/path2')
      sessionManager.createSession('session-3', 'claude-3', '/path3')

      const count = sessionManager.clearAllSessions()
      expect(count).toBe(3)
      expect(sessionManager.getSessionCount()).toBe(0)
      expect(sessionManager.getCurrentSession()).toBeNull()
      expect(sessionManager.listSessions()).toEqual([])
    })

    it('should handle clearing empty sessions', () => {
      const count = sessionManager.clearAllSessions()
      expect(count).toBe(0)
      expect(sessionManager.getSessionCount()).toBe(0)
    })
  })
})
