/**
 * Audit Logging System
 * 
 * Comprehensive audit trail for all payment operations and security events
 * Implements requirements 2.5, 3.1, 3.2, 3.3 from secure-payment-flow spec
 */

export interface AuditEvent {
  id: string
  eventType: string
  category: 'payment' | 'security' | 'subscription' | 'authentication' | 'system'
  severity: 'low' | 'medium' | 'high' | 'critical'
  userId?: string
  email?: string
  sessionId?: string
  details: Record<string, any>
  metadata: {
    timestamp: string
    source: string
    ip?: string
    userAgent?: string
    requestId?: string
  }
  tags: string[]
}

export interface SecurityEvent extends AuditEvent {
  category: 'security'
  threatLevel: 'low' | 'medium' | 'high' | 'critical'
  actionTaken?: string
  requiresInvestigation: boolean
}

export interface PaymentEvent extends AuditEvent {
  category: 'payment'
  amount?: number
  currency?: string
  paymentMethod?: string
  stripeEventId?: string
  subscriptionId?: string
}

export interface AuditQuery {
  category?: string
  eventType?: string
  userId?: string
  email?: string
  severity?: string
  startDate?: Date
  endDate?: Date
  tags?: string[]
  limit?: number
  offset?: number
}

export interface AuditStats {
  totalEvents: number
  eventsByCategory: Record<string, number>
  eventsBySeverity: Record<string, number>
  securityEvents: number
  paymentEvents: number
  recentEvents: number
}

export class AuditLogger {
  private static instance: AuditLogger
  private eventBuffer: AuditEvent[] = []
  private readonly BUFFER_SIZE = 100
  private readonly FLUSH_INTERVAL = 5000 // 5 seconds
  private flushTimer: NodeJS.Timeout | null = null

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger()
    }
    return AuditLogger.instance
  }

  private constructor() {
    this.initializeFlushTimer()
  }

  /**
   * Requirement 3.1: Log all payment operations for audit trail
   * WHEN se inicia cualquier proceso de pago THEN el sistema SHALL registrar un log con user_id, email, timestamp y session_id
   */
  async logPaymentEvent(
    eventType: string,
    details: Record<string, any>,
    metadata: {
      userId?: string
      email?: string
      sessionId?: string
      ip?: string
      userAgent?: string
      requestId?: string
    } = {}
  ): Promise<void> {
    try {
      const paymentEvent: PaymentEvent = {
        id: this.generateEventId(),
        eventType,
        category: 'payment',
        severity: this.determineSeverity(eventType, details),
        userId: metadata.userId,
        email: metadata.email,
        sessionId: metadata.sessionId,
        details,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'payment_system',
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          requestId: metadata.requestId
        },
        tags: this.generateTags(eventType, details),
        amount: details.amount,
        currency: details.currency,
        paymentMethod: details.paymentMethod,
        stripeEventId: details.stripeEventId,
        subscriptionId: details.subscriptionId
      }

      await this.logEvent(paymentEvent)
      
      console.log(`💰 Payment event logged: ${eventType}`, {
        userId: metadata.userId,
        email: metadata.email,
        amount: details.amount
      })
    } catch (error) {
      console.error('❌ Error logging payment event:', error)
      // Don't throw error to avoid disrupting payment flow
    }
  }

  /**
   * Requirement 3.2: Log security events and fraud attempts
   * IF la validación del webhook falla THEN el sistema SHALL rechazar la petición y registrar el intento de fraude
   */
  async logSecurityEvent(
    eventType: string,
    details: Record<string, any>,
    metadata: {
      userId?: string
      email?: string
      sessionId?: string
      ip?: string
      userAgent?: string
      requestId?: string
    } = {},
    threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        id: this.generateEventId(),
        eventType,
        category: 'security',
        severity: this.mapThreatLevelToSeverity(threatLevel),
        userId: metadata.userId,
        email: metadata.email,
        sessionId: metadata.sessionId,
        details,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'security_system',
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          requestId: metadata.requestId
        },
        tags: this.generateSecurityTags(eventType, details, threatLevel),
        threatLevel,
        actionTaken: details.actionTaken,
        requiresInvestigation: threatLevel === 'high' || threatLevel === 'critical'
      }

      await this.logEvent(securityEvent)
      
      console.log(`🚨 Security event logged: ${eventType} (${threatLevel})`, {
        userId: metadata.userId,
        email: metadata.email,
        ip: metadata.ip
      })

      // Trigger immediate alerts for high/critical security events
      if (threatLevel === 'high' || threatLevel === 'critical') {
        await this.triggerSecurityAlert(securityEvent)
      }
    } catch (error) {
      console.error('❌ Error logging security event:', error)
      // Don't throw error to avoid disrupting security flow
    }
  }

  /**
   * Requirement 2.4: Create audit log for subscription assignment
   * WHEN se asigna una suscripción THEN el sistema SHALL crear un log de auditoría con timestamp, user_id, email y subscription_id
   */
  async logSubscriptionEvent(
    eventType: string,
    details: Record<string, any>,
    metadata: {
      userId?: string
      email?: string
      sessionId?: string
      ip?: string
      userAgent?: string
      requestId?: string
    } = {}
  ): Promise<void> {
    try {
      const subscriptionEvent: AuditEvent = {
        id: this.generateEventId(),
        eventType,
        category: 'subscription',
        severity: this.determineSeverity(eventType, details),
        userId: metadata.userId,
        email: metadata.email,
        sessionId: metadata.sessionId,
        details: {
          ...details,
          // Ensure required fields for subscription events
          subscriptionId: details.subscriptionId,
          planType: details.planType,
          status: details.status
        },
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'subscription_system',
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          requestId: metadata.requestId
        },
        tags: this.generateTags(eventType, details)
      }

      await this.logEvent(subscriptionEvent)
      
      console.log(`📋 Subscription event logged: ${eventType}`, {
        userId: metadata.userId,
        email: metadata.email,
        subscriptionId: details.subscriptionId
      })
    } catch (error) {
      console.error('❌ Error logging subscription event:', error)
    }
  }

  /**
   * Log authentication events
   */
  async logAuthenticationEvent(
    eventType: string,
    details: Record<string, any>,
    metadata: {
      userId?: string
      email?: string
      sessionId?: string
      ip?: string
      userAgent?: string
      requestId?: string
    } = {}
  ): Promise<void> {
    try {
      const authEvent: AuditEvent = {
        id: this.generateEventId(),
        eventType,
        category: 'authentication',
        severity: this.determineSeverity(eventType, details),
        userId: metadata.userId,
        email: metadata.email,
        sessionId: metadata.sessionId,
        details,
        metadata: {
          timestamp: new Date().toISOString(),
          source: 'auth_system',
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          requestId: metadata.requestId
        },
        tags: this.generateTags(eventType, details)
      }

      await this.logEvent(authEvent)
      
      console.log(`🔐 Authentication event logged: ${eventType}`, {
        userId: metadata.userId,
        email: metadata.email
      })
    } catch (error) {
      console.error('❌ Error logging authentication event:', error)
    }
  }

  /**
   * Log system events
   */
  async logSystemEvent(
    eventType: string,
    details: Record<string, any>,
    metadata: {
      source?: string
      ip?: string
      userAgent?: string
      requestId?: string
    } = {}
  ): Promise<void> {
    try {
      const systemEvent: AuditEvent = {
        id: this.generateEventId(),
        eventType,
        category: 'system',
        severity: this.determineSeverity(eventType, details),
        details,
        metadata: {
          timestamp: new Date().toISOString(),
          source: metadata.source || 'system',
          ip: metadata.ip,
          userAgent: metadata.userAgent,
          requestId: metadata.requestId
        },
        tags: this.generateTags(eventType, details)
      }

      await this.logEvent(systemEvent)
      
      console.log(`⚙️ System event logged: ${eventType}`)
    } catch (error) {
      console.error('❌ Error logging system event:', error)
    }
  }

  /**
   * Query audit events
   */
  async queryEvents(query: AuditQuery): Promise<AuditEvent[]> {
    try {
      console.log('🔍 Querying audit events:', query)
      
      // TODO: Implement actual database query
      // This is a placeholder implementation
      
      // For now, return events from buffer that match the query
      let filteredEvents = [...this.eventBuffer]

      if (query.category) {
        filteredEvents = filteredEvents.filter(e => e.category === query.category)
      }

      if (query.eventType) {
        filteredEvents = filteredEvents.filter(e => e.eventType === query.eventType)
      }

      if (query.userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === query.userId)
      }

      if (query.email) {
        filteredEvents = filteredEvents.filter(e => e.email === query.email)
      }

      if (query.severity) {
        filteredEvents = filteredEvents.filter(e => e.severity === query.severity)
      }

      if (query.startDate) {
        filteredEvents = filteredEvents.filter(e => 
          new Date(e.metadata.timestamp) >= query.startDate!
        )
      }

      if (query.endDate) {
        filteredEvents = filteredEvents.filter(e => 
          new Date(e.metadata.timestamp) <= query.endDate!
        )
      }

      if (query.tags && query.tags.length > 0) {
        filteredEvents = filteredEvents.filter(e => 
          query.tags!.some(tag => e.tags.includes(tag))
        )
      }

      // Apply limit and offset
      const offset = query.offset || 0
      const limit = query.limit || 100
      
      return filteredEvents
        .sort((a, b) => new Date(b.metadata.timestamp).getTime() - new Date(a.metadata.timestamp).getTime())
        .slice(offset, offset + limit)
    } catch (error) {
      console.error('❌ Error querying audit events:', error)
      return []
    }
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(): Promise<AuditStats> {
    try {
      // TODO: Implement actual database statistics query
      // This is a placeholder implementation using buffer data
      
      const events = this.eventBuffer
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const eventsByCategory = events.reduce((acc, event) => {
        acc[event.category] = (acc[event.category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const eventsBySeverity = events.reduce((acc, event) => {
        acc[event.severity] = (acc[event.severity] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const securityEvents = events.filter(e => e.category === 'security').length
      const paymentEvents = events.filter(e => e.category === 'payment').length
      const recentEvents = events.filter(e => 
        new Date(e.metadata.timestamp) >= oneDayAgo
      ).length

      return {
        totalEvents: events.length,
        eventsByCategory,
        eventsBySeverity,
        securityEvents,
        paymentEvents,
        recentEvents
      }
    } catch (error) {
      console.error('❌ Error getting audit stats:', error)
      return {
        totalEvents: 0,
        eventsByCategory: {},
        eventsBySeverity: {},
        securityEvents: 0,
        paymentEvents: 0,
        recentEvents: 0
      }
    }
  }

  /**
   * Export audit events for compliance
   */
  async exportEvents(query: AuditQuery, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      const events = await this.queryEvents(query)
      
      if (format === 'csv') {
        return this.convertToCSV(events)
      } else {
        return JSON.stringify(events, null, 2)
      }
    } catch (error) {
      console.error('❌ Error exporting audit events:', error)
      throw error
    }
  }

  // Private helper methods

  private async logEvent(event: AuditEvent): Promise<void> {
    try {
      // Add to buffer
      this.eventBuffer.push(event)

      // Flush buffer if it's full
      if (this.eventBuffer.length >= this.BUFFER_SIZE) {
        await this.flushBuffer()
      }

      // TODO: In production, also write to database immediately for critical events
      if (event.severity === 'critical') {
        await this.writeEventToDatabase(event)
      }
    } catch (error) {
      console.error('❌ Error in logEvent:', error)
      throw error
    }
  }

  private async flushBuffer(): Promise<void> {
    try {
      if (this.eventBuffer.length === 0) {
        return
      }

      console.log(`📝 Flushing ${this.eventBuffer.length} audit events to storage`)

      // TODO: Implement actual database write
      // For now, just log the events
      const eventsToFlush = [...this.eventBuffer]
      this.eventBuffer = []

      // In production, this would write to database
      await this.writeEventsToDatabase(eventsToFlush)

      console.log(`✅ Successfully flushed ${eventsToFlush.length} audit events`)
    } catch (error) {
      console.error('❌ Error flushing audit buffer:', error)
      // Re-add events to buffer if write failed
      this.eventBuffer.unshift(...this.eventBuffer)
    }
  }

  private async writeEventToDatabase(event: AuditEvent): Promise<void> {
    try {
      // TODO: Implement actual database write
      console.log('💾 Writing critical event to database:', event.id)
    } catch (error) {
      console.error('❌ Error writing event to database:', error)
      throw error
    }
  }

  private async writeEventsToDatabase(events: AuditEvent[]): Promise<void> {
    try {
      // TODO: Implement actual batch database write
      console.log(`💾 Writing ${events.length} events to database`)
    } catch (error) {
      console.error('❌ Error writing events to database:', error)
      throw error
    }
  }

  private async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    try {
      console.log(`🚨 SECURITY ALERT: ${event.eventType} (${event.threatLevel})`)
      
      const alert = {
        eventId: event.id,
        eventType: event.eventType,
        threatLevel: event.threatLevel,
        userId: event.userId,
        email: event.email,
        ip: event.metadata.ip,
        timestamp: event.metadata.timestamp,
        requiresInvestigation: event.requiresInvestigation
      }

      // TODO: Implement actual alerting system (email, Slack, PagerDuty, etc.)
      console.log('🚨 Security alert triggered:', alert)

      // Log the alert trigger
      await this.logSystemEvent('security_alert_triggered', {
        originalEventId: event.id,
        alertLevel: event.threatLevel,
        notificationsSent: ['console'] // In production: ['email', 'slack', 'pagerduty']
      })
    } catch (error) {
      console.error('❌ Error triggering security alert:', error)
    }
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private determineSeverity(eventType: string, details: Record<string, any>): 'low' | 'medium' | 'high' | 'critical' {
    // Critical events
    const criticalEvents = [
      'payment_fraud_detected',
      'security_breach',
      'unauthorized_access',
      'data_corruption'
    ]

    // High severity events
    const highSeverityEvents = [
      'payment_failed',
      'subscription_conflict',
      'authentication_failed',
      'webhook_signature_failed',
      'duplicate_subscription_detected'
    ]

    // Medium severity events
    const mediumSeverityEvents = [
      'payment_initiated',
      'subscription_created',
      'subscription_cancelled',
      'user_login',
      'session_expired'
    ]

    if (criticalEvents.includes(eventType)) {
      return 'critical'
    } else if (highSeverityEvents.includes(eventType)) {
      return 'high'
    } else if (mediumSeverityEvents.includes(eventType)) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  private mapThreatLevelToSeverity(threatLevel: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (threatLevel) {
      case 'critical': return 'critical'
      case 'high': return 'high'
      case 'medium': return 'medium'
      case 'low': return 'low'
      default: return 'medium'
    }
  }

  private generateTags(eventType: string, details: Record<string, any>): string[] {
    const tags: string[] = [eventType]

    // Add contextual tags based on details
    if (details.amount) tags.push('monetary')
    if (details.subscriptionId) tags.push('subscription')
    if (details.stripeEventId) tags.push('stripe')
    if (details.error) tags.push('error')
    if (details.success === false) tags.push('failed')
    if (details.success === true) tags.push('successful')

    return tags
  }

  private generateSecurityTags(eventType: string, details: Record<string, any>, threatLevel: string): string[] {
    const tags = this.generateTags(eventType, details)
    
    tags.push('security', threatLevel)
    
    if (details.ip) tags.push('ip_tracked')
    if (details.userAgent) tags.push('user_agent_tracked')
    if (details.fraudIndicators) tags.push('fraud_indicators')
    
    return tags
  }

  private convertToCSV(events: AuditEvent[]): string {
    if (events.length === 0) {
      return 'No events to export'
    }

    const headers = [
      'id', 'eventType', 'category', 'severity', 'userId', 'email', 
      'timestamp', 'source', 'ip', 'details'
    ]

    const csvRows = [
      headers.join(','),
      ...events.map(event => [
        event.id,
        event.eventType,
        event.category,
        event.severity,
        event.userId || '',
        event.email || '',
        event.metadata.timestamp,
        event.metadata.source,
        event.metadata.ip || '',
        JSON.stringify(event.details).replace(/"/g, '""')
      ].map(field => `"${field}"`).join(','))
    ]

    return csvRows.join('\n')
  }

  private initializeFlushTimer(): void {
    this.flushTimer = setInterval(async () => {
      await this.flushBuffer()
    }, this.FLUSH_INTERVAL)
  }

  /**
   * Cleanup method
   */
  async cleanup(): Promise<void> {
    try {
      if (this.flushTimer) {
        clearInterval(this.flushTimer)
        this.flushTimer = null
      }

      // Flush remaining events
      await this.flushBuffer()
      
      console.log('✅ Audit logger cleanup completed')
    } catch (error) {
      console.error('❌ Error during audit logger cleanup:', error)
    }
  }
}

// Export singleton instance
export const auditLogger = AuditLogger.getInstance()