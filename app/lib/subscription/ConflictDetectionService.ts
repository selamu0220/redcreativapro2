/**
 * Subscription Conflict Detection Service
 * 
 * Implements duplicate subscription detection and conflict resolution
 * Implements requirements 3.4, 4.4 from secure-payment-flow spec
 */

import { getUserByEmailAsync, createOrUpdateUserAsync } from '../database'

export interface SubscriptionData {
  id: string
  userId: string
  email: string
  stripeSubscriptionId: string
  stripeCustomerId: string
  planType: string
  status: 'active' | 'inactive' | 'cancelled' | 'past_due' | 'unpaid'
  createdAt: Date
  updatedAt: Date
  expiresAt?: Date
}

export interface ConflictDetectionResult {
  hasConflicts: boolean
  conflicts: SubscriptionConflict[]
  recommendations: ConflictResolution[]
}

export interface SubscriptionConflict {
  type: 'duplicate_active' | 'multiple_plans' | 'status_mismatch' | 'orphaned_subscription'
  severity: 'low' | 'medium' | 'high'
  description: string
  affectedSubscriptions: SubscriptionData[]
  detectedAt: Date
}

export interface ConflictResolution {
  action: 'consolidate' | 'cancel_duplicate' | 'update_status' | 'manual_review'
  priority: 'low' | 'medium' | 'high'
  description: string
  subscriptionIds: string[]
  autoExecutable: boolean
}

export class ConflictDetectionService {
  private static instance: ConflictDetectionService

  static getInstance(): ConflictDetectionService {
    if (!ConflictDetectionService.instance) {
      ConflictDetectionService.instance = new ConflictDetectionService()
    }
    return ConflictDetectionService.instance
  }

  /**
   * Requirement 3.4: Check for duplicate subscriptions before assignment
   * WHEN se asigna una suscripción THEN el sistema SHALL verificar que no exista otra suscripción activa para el mismo usuario
   */
  async detectSubscriptionConflicts(email: string): Promise<ConflictDetectionResult> {
    try {
      console.log(`🔍 Detecting subscription conflicts for: ${email}`)

      // Get user data
      const userData = await getUserByEmailAsync(email)
      if (!userData) {
        console.log(`ℹ️ No user found for email: ${email}`)
        return {
          hasConflicts: false,
          conflicts: [],
          recommendations: []
        }
      }

      // Get all subscriptions for this user
      const userSubscriptions = await this.getUserSubscriptions(email)
      
      if (userSubscriptions.length === 0) {
        console.log(`ℹ️ No subscriptions found for user: ${email}`)
        return {
          hasConflicts: false,
          conflicts: [],
          recommendations: []
        }
      }

      console.log(`📋 Found ${userSubscriptions.length} subscriptions for user: ${email}`)

      const conflicts: SubscriptionConflict[] = []
      const recommendations: ConflictResolution[] = []

      // Check for duplicate active subscriptions
      const duplicateConflicts = await this.detectDuplicateActiveSubscriptions(userSubscriptions)
      conflicts.push(...duplicateConflicts.conflicts)
      recommendations.push(...duplicateConflicts.recommendations)

      // Check for multiple plan types
      const planConflicts = await this.detectMultiplePlanTypes(userSubscriptions)
      conflicts.push(...planConflicts.conflicts)
      recommendations.push(...planConflicts.recommendations)

      // Check for status mismatches
      const statusConflicts = await this.detectStatusMismatches(userSubscriptions)
      conflicts.push(...statusConflicts.conflicts)
      recommendations.push(...statusConflicts.recommendations)

      // Check for orphaned subscriptions
      const orphanedConflicts = await this.detectOrphanedSubscriptions(userSubscriptions)
      conflicts.push(...orphanedConflicts.conflicts)
      recommendations.push(...orphanedConflicts.recommendations)

      const hasConflicts = conflicts.length > 0

      if (hasConflicts) {
        console.warn(`⚠️ Detected ${conflicts.length} subscription conflicts for user: ${email}`)
        
        // Log conflicts for audit trail
        await this.logConflictDetection(email, conflicts)
      } else {
        console.log(`✅ No subscription conflicts detected for user: ${email}`)
      }

      return {
        hasConflicts,
        conflicts,
        recommendations
      }
    } catch (error) {
      console.error('❌ Error detecting subscription conflicts:', error)
      throw new Error(`Failed to detect subscription conflicts: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Requirement 4.4: Consolidate duplicate subscriptions automatically
   * WHEN se detecta una suscripción duplicada THEN el sistema SHALL consolidar automáticamente o notificar para resolución
   */
  async consolidateSubscriptions(email: string, subscriptionIds: string[]): Promise<{
    success: boolean
    consolidatedSubscription?: SubscriptionData
    cancelledSubscriptions?: string[]
    error?: string
  }> {
    try {
      console.log(`🔄 Consolidating subscriptions for user: ${email}`)
      console.log(`📋 Subscription IDs to consolidate: ${subscriptionIds.join(', ')}`)

      if (subscriptionIds.length < 2) {
        return {
          success: false,
          error: 'At least 2 subscriptions required for consolidation'
        }
      }

      // Get subscription details
      const subscriptions = await this.getSubscriptionsByIds(subscriptionIds)
      
      if (subscriptions.length !== subscriptionIds.length) {
        return {
          success: false,
          error: 'Some subscriptions not found'
        }
      }

      // Validate all subscriptions belong to the same user
      const userEmails = [...new Set(subscriptions.map(s => s.email))]
      if (userEmails.length > 1 || userEmails[0] !== email) {
        return {
          success: false,
          error: 'Subscriptions belong to different users'
        }
      }

      // Find the best subscription to keep (most recent active one)
      const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
      const primarySubscription = activeSubscriptions.length > 0 
        ? activeSubscriptions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
        : subscriptions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]

      // Cancel other subscriptions
      const subscriptionsToCancel = subscriptions.filter(s => s.id !== primarySubscription.id)
      const cancelledIds: string[] = []

      for (const subscription of subscriptionsToCancel) {
        try {
          await this.cancelSubscription(subscription.id)
          cancelledIds.push(subscription.id)
          console.log(`✅ Cancelled duplicate subscription: ${subscription.id}`)
        } catch (error) {
          console.error(`❌ Failed to cancel subscription ${subscription.id}:`, error)
        }
      }

      // Update primary subscription status if needed
      if (primarySubscription.status !== 'active' && activeSubscriptions.length > 0) {
        await this.updateSubscriptionStatus(primarySubscription.id, 'active')
      }

      // Log consolidation for audit trail
      await this.logSubscriptionConsolidation(email, primarySubscription.id, cancelledIds)

      console.log(`✅ Successfully consolidated subscriptions for user: ${email}`)
      console.log(`📋 Primary subscription: ${primarySubscription.id}`)
      console.log(`📋 Cancelled subscriptions: ${cancelledIds.join(', ')}`)

      return {
        success: true,
        consolidatedSubscription: primarySubscription,
        cancelledSubscriptions: cancelledIds
      }
    } catch (error) {
      console.error('❌ Error consolidating subscriptions:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Validate subscription status before assignment
   */
  async validateSubscriptionAssignment(email: string, newSubscriptionData: Partial<SubscriptionData>): Promise<{
    canAssign: boolean
    conflicts?: SubscriptionConflict[]
    recommendations?: ConflictResolution[]
    error?: string
  }> {
    try {
      console.log(`🔍 Validating subscription assignment for: ${email}`)

      // Check for existing conflicts
      const conflictResult = await this.detectSubscriptionConflicts(email)
      
      if (conflictResult.hasConflicts) {
        const highSeverityConflicts = conflictResult.conflicts.filter(c => c.severity === 'high')
        
        if (highSeverityConflicts.length > 0) {
          console.warn(`⚠️ High severity conflicts prevent subscription assignment for: ${email}`)
          return {
            canAssign: false,
            conflicts: conflictResult.conflicts,
            recommendations: conflictResult.recommendations,
            error: 'High severity subscription conflicts must be resolved first'
          }
        }
      }

      // Check if new subscription would create conflicts
      const userSubscriptions = await this.getUserSubscriptions(email)
      const activeSubscriptions = userSubscriptions.filter(s => s.status === 'active')

      if (activeSubscriptions.length > 0 && newSubscriptionData.status === 'active') {
        console.warn(`⚠️ User ${email} already has ${activeSubscriptions.length} active subscription(s)`)
        
        // Create conflict for the new subscription
        const newConflict: SubscriptionConflict = {
          type: 'duplicate_active',
          severity: 'high',
          description: `User already has ${activeSubscriptions.length} active subscription(s)`,
          affectedSubscriptions: activeSubscriptions,
          detectedAt: new Date()
        }

        const recommendation: ConflictResolution = {
          action: 'consolidate',
          priority: 'high',
          description: 'Consolidate existing subscriptions before assigning new one',
          subscriptionIds: activeSubscriptions.map(s => s.id),
          autoExecutable: true
        }

        return {
          canAssign: false,
          conflicts: [newConflict],
          recommendations: [recommendation],
          error: 'User already has active subscriptions'
        }
      }

      console.log(`✅ Subscription assignment validated for: ${email}`)
      return {
        canAssign: true,
        conflicts: conflictResult.conflicts,
        recommendations: conflictResult.recommendations
      }
    } catch (error) {
      console.error('❌ Error validating subscription assignment:', error)
      return {
        canAssign: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Private helper methods

  private async detectDuplicateActiveSubscriptions(subscriptions: SubscriptionData[]): Promise<{
    conflicts: SubscriptionConflict[]
    recommendations: ConflictResolution[]
  }> {
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
    
    if (activeSubscriptions.length <= 1) {
      return { conflicts: [], recommendations: [] }
    }

    const conflict: SubscriptionConflict = {
      type: 'duplicate_active',
      severity: 'high',
      description: `User has ${activeSubscriptions.length} active subscriptions`,
      affectedSubscriptions: activeSubscriptions,
      detectedAt: new Date()
    }

    const recommendation: ConflictResolution = {
      action: 'consolidate',
      priority: 'high',
      description: 'Keep most recent subscription, cancel others',
      subscriptionIds: activeSubscriptions.map(s => s.id),
      autoExecutable: true
    }

    return {
      conflicts: [conflict],
      recommendations: [recommendation]
    }
  }

  private async detectMultiplePlanTypes(subscriptions: SubscriptionData[]): Promise<{
    conflicts: SubscriptionConflict[]
    recommendations: ConflictResolution[]
  }> {
    const activeSubscriptions = subscriptions.filter(s => s.status === 'active')
    const planTypes = [...new Set(activeSubscriptions.map(s => s.planType))]
    
    if (planTypes.length <= 1) {
      return { conflicts: [], recommendations: [] }
    }

    const conflict: SubscriptionConflict = {
      type: 'multiple_plans',
      severity: 'medium',
      description: `User has active subscriptions for multiple plan types: ${planTypes.join(', ')}`,
      affectedSubscriptions: activeSubscriptions,
      detectedAt: new Date()
    }

    const recommendation: ConflictResolution = {
      action: 'manual_review',
      priority: 'medium',
      description: 'Review which plan type should be active',
      subscriptionIds: activeSubscriptions.map(s => s.id),
      autoExecutable: false
    }

    return {
      conflicts: [conflict],
      recommendations: [recommendation]
    }
  }

  private async detectStatusMismatches(subscriptions: SubscriptionData[]): Promise<{
    conflicts: SubscriptionConflict[]
    recommendations: ConflictResolution[]
  }> {
    const conflicts: SubscriptionConflict[] = []
    const recommendations: ConflictResolution[] = []

    // Check for subscriptions that should be expired but are still active
    const now = new Date()
    const expiredButActive = subscriptions.filter(s => 
      s.status === 'active' && s.expiresAt && s.expiresAt <= now
    )

    if (expiredButActive.length > 0) {
      conflicts.push({
        type: 'status_mismatch',
        severity: 'medium',
        description: `${expiredButActive.length} subscription(s) are active but expired`,
        affectedSubscriptions: expiredButActive,
        detectedAt: new Date()
      })

      recommendations.push({
        action: 'update_status',
        priority: 'medium',
        description: 'Update expired subscriptions to inactive status',
        subscriptionIds: expiredButActive.map(s => s.id),
        autoExecutable: true
      })
    }

    return { conflicts, recommendations }
  }

  private async detectOrphanedSubscriptions(subscriptions: SubscriptionData[]): Promise<{
    conflicts: SubscriptionConflict[]
    recommendations: ConflictResolution[]
  }> {
    const conflicts: SubscriptionConflict[] = []
    const recommendations: ConflictResolution[] = []

    // Check for subscriptions without valid Stripe customer/subscription IDs
    const orphaned = subscriptions.filter(s => 
      !s.stripeSubscriptionId || !s.stripeCustomerId
    )

    if (orphaned.length > 0) {
      conflicts.push({
        type: 'orphaned_subscription',
        severity: 'low',
        description: `${orphaned.length} subscription(s) missing Stripe references`,
        affectedSubscriptions: orphaned,
        detectedAt: new Date()
      })

      recommendations.push({
        action: 'manual_review',
        priority: 'low',
        description: 'Review orphaned subscriptions for cleanup',
        subscriptionIds: orphaned.map(s => s.id),
        autoExecutable: false
      })
    }

    return { conflicts, recommendations }
  }

  private async getUserSubscriptions(email: string): Promise<SubscriptionData[]> {
    try {
      // TODO: Implement actual database query to get user subscriptions
      // This is a placeholder implementation
      console.log(`📋 Getting subscriptions for user: ${email}`)
      
      // In a real implementation, this would query the subscriptions table
      // For now, return empty array
      return []
    } catch (error) {
      console.error('Error getting user subscriptions:', error)
      return []
    }
  }

  private async getSubscriptionsByIds(subscriptionIds: string[]): Promise<SubscriptionData[]> {
    try {
      // TODO: Implement actual database query to get subscriptions by IDs
      console.log(`📋 Getting subscriptions by IDs: ${subscriptionIds.join(', ')}`)
      
      // Placeholder implementation
      return []
    } catch (error) {
      console.error('Error getting subscriptions by IDs:', error)
      return []
    }
  }

  private async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      // TODO: Implement actual subscription cancellation
      // This would update the database and potentially call Stripe API
      console.log(`❌ Cancelling subscription: ${subscriptionId}`)
      
      // Placeholder implementation
    } catch (error) {
      console.error(`Error cancelling subscription ${subscriptionId}:`, error)
      throw error
    }
  }

  private async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<void> {
    try {
      // TODO: Implement actual status update
      console.log(`🔄 Updating subscription ${subscriptionId} status to: ${status}`)
      
      // Placeholder implementation
    } catch (error) {
      console.error(`Error updating subscription ${subscriptionId} status:`, error)
      throw error
    }
  }

  private async logConflictDetection(email: string, conflicts: SubscriptionConflict[]): Promise<void> {
    try {
      const logEntry = {
        eventType: 'subscription_conflicts_detected',
        email,
        conflictCount: conflicts.length,
        conflicts: conflicts.map(c => ({
          type: c.type,
          severity: c.severity,
          description: c.description,
          affectedCount: c.affectedSubscriptions.length
        })),
        timestamp: new Date().toISOString()
      }

      console.log('📝 Logging conflict detection:', logEntry)
      
      // TODO: Implement actual audit logging
    } catch (error) {
      console.error('Error logging conflict detection:', error)
    }
  }

  private async logSubscriptionConsolidation(
    email: string, 
    primarySubscriptionId: string, 
    cancelledSubscriptionIds: string[]
  ): Promise<void> {
    try {
      const logEntry = {
        eventType: 'subscription_consolidation',
        email,
        primarySubscriptionId,
        cancelledSubscriptionIds,
        cancelledCount: cancelledSubscriptionIds.length,
        timestamp: new Date().toISOString()
      }

      console.log('📝 Logging subscription consolidation:', logEntry)
      
      // TODO: Implement actual audit logging
    } catch (error) {
      console.error('Error logging subscription consolidation:', error)
    }
  }
}

// Export singleton instance
export const conflictDetectionService = ConflictDetectionService.getInstance()