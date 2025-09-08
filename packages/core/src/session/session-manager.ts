/**
 * Session Manager - Handle multi-instance workspace isolation
 * Manages AI agent sessions and prevents workspace conflicts
 */

import type { ConflictInfo, OperationRecord, WorkspaceState } from '@ufomiao/types'

export class SessionManager {
  private sessions: Map<string, WorkspaceState> = new Map()
  private currentSessionId: string | null = null

  /**
   * Create new session
   */
  createSession(sessionId: string, aiAgent: string, projectPath: string): WorkspaceState {
    if (this.sessions.has(sessionId)) {
      throw new Error(`Session ${sessionId} already exists`)
    }

    const session: WorkspaceState = {
      sessionId,
      aiAgent,
      projectPath,
      operationChain: [],
      status: 'active',
      lastActivity: new Date(),
      metadata: {},
    }

    this.sessions.set(sessionId, session)
    this.currentSessionId = sessionId

    return session
  }

  /**
   * Get current active session
   */
  getCurrentSession(): WorkspaceState | null {
    if (!this.currentSessionId) {
      return null
    }
    return this.sessions.get(this.currentSessionId) || null
  }

  /**
   * Switch to specified session
   */
  switchSession(sessionId: string): boolean {
    if (!this.sessions.has(sessionId)) {
      return false
    }

    this.currentSessionId = sessionId
    return true
  }

  /**
   * Get specified session by ID
   */
  getSession(sessionId: string): WorkspaceState | null {
    return this.sessions.get(sessionId) || null
  }

  /**
   * List all sessions
   */
  listSessions(): WorkspaceState[] {
    return Array.from(this.sessions.values())
  }

  /**
   * Delete session
   */
  deleteSession(sessionId: string): boolean {
    if (!this.sessions.has(sessionId)) {
      return false
    }

    this.sessions.delete(sessionId)

    // If deleting current session, clear current session ID
    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null
    }

    return true
  }

  /**
   * Update session activity timestamp
   */
  updateActivity(sessionId?: string): boolean {
    const targetSessionId = sessionId || this.currentSessionId

    if (!targetSessionId) {
      return false
    }

    const session = this.sessions.get(targetSessionId)
    if (!session) {
      return false
    }

    session.lastActivity = new Date()
    return true
  }

  /**
   * Add operation record to session
   */
  addOperation(operation: OperationRecord, sessionId?: string): boolean {
    const targetSessionId = sessionId || this.currentSessionId

    if (!targetSessionId) {
      return false
    }

    const session = this.sessions.get(targetSessionId)
    if (!session) {
      return false
    }

    session.operationChain.push(operation)
    session.lastActivity = new Date()

    return true
  }

  /**
   * Detect conflicts between sessions
   */
  detectConflicts(projectPath: string): ConflictInfo[] {
    const conflicts: ConflictInfo[] = []
    const sessionsForProject = this.listSessions().filter(s => s.projectPath === projectPath)

    if (sessionsForProject.length <= 1) {
      return conflicts
    }

    const activeSessions = sessionsForProject.filter(s => s.status === 'active')

    if (activeSessions.length > 1) {
      conflicts.push({
        projectPath,
        conflictingAgents: activeSessions.map(s => s.aiAgent),
        conflictType: 'workspace_lock',
        detectedAt: new Date(),
        description: `Multiple active sessions detected for project: ${projectPath}`,
      })
    }

    return conflicts
  }

  /**
   * Pause session
   */
  pauseSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return false
    }

    session.status = 'paused'
    session.lastActivity = new Date()

    return true
  }

  /**
   * Resume session
   */
  resumeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return false
    }

    session.status = 'active'
    session.lastActivity = new Date()

    return true
  }

  /**
   * Get total session count
   */
  getSessionCount(): number {
    return this.sessions.size
  }

  /**
   * Clear all sessions
   */
  clearAllSessions(): number {
    const count = this.sessions.size
    this.sessions.clear()
    this.currentSessionId = null
    return count
  }
}
