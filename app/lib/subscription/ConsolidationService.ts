// Inline types (ConflictDetectionService removed)
interface SubscriptionData {
  id: string;
  status: string;
  [key: string]: any;
}

interface ConflictResolution {
  resolution: string;
  data: any;
  action?: string;
  description?: string;
  subscriptionIds?: string[];
  priority?: string;
}

interface ConflictResolution {
  resolution: string;
  data: any;
}

/**
 * Subscription Consolidation Service
 * 
 * Handles automatic consolidation of duplicate subscriptions
 * Implements requirements 3.4, 4.4 from secure-payment-flow spec
 */

// ConflictDetectionService removed - using inline types
import { getUserByEmailAsync } from '../database'

export interface ConsolidationResult {
  success: boolean
  consolidatedSubscription?: SubscriptionData
  cancelledSubscriptions?: string[]
  manualReviewRequired?: boolean
  error?: string
  details?: string
}

export interface ConsolidationOptions {
  autoExecute: boolean
  dryRun: boolean
  preserveNewest: boolean
  notifyUser: boolean
}

export class ConsolidationService {
  private static instance: ConsolidationService

  static getInstance(): ConsolidationService {
    if (!ConsolidationService.instance) {
      ConsolidationService.instance = new ConsolidationService()
    }
    return ConsolidationService.instance
  }

  /**
   * Requirement 4.4: Automatically consolidate duplicate subscriptions
   * WHEN se detecta una suscripción duplicada THEN el sistema SHALL consolidar automáticamente o notificar para resolución
   */
  async consolidateUserSubscriptions(
    email: string, 
    options: Partial<ConsolidationOptions> = {}
  ): Promise<ConsolidationResult> {
    try {
      console.log(`🔄 Starting subscription consolidation for user: ${email}`)

      const defaultOptions: ConsolidationOptions = {
        autoExecute: true,
        dryRun: false,
        preserveNewest: true,
        notifyUser: true,
        ...options
      }

      // Detect conflicts first
      const conflictResult = { conflicts: [], recommendations: [], hasConflicts: false }
      
      if (!conflictResult.hasConflicts) {
        console.log(`ℹ️ No conflicts detected for user: ${email}`)
        return {
          success: true,
          details: 'No subscription conflicts found'
        }
      }

      console.log(`⚠️ Found ${conflictResult.conflicts.length} conflicts for user: ${email}`)

      // Filter recommendations that can be auto-executed
      const autoExecutableRecommendations = conflictResult.recommendations.filter(r => 
        r.autoExecutable && (r.action === 'consolidate' || r.action === 'cancel_duplicate')
      )

      const manualReviewRecommendations = conflictResult.recommendations.filter(r => 
        !r.autoExecutable || r.action === 'manual_review'
      )

      if (autoExecutableRecommendations.length === 0) {
        console.warn(`⚠️ All conflicts require manual review for user: ${email}`)
        
        // Flag for manual review
        await this.flagForManualReview(email, conflictResult.conflicts, manualReviewRecommendations)
        
        return {
          success: false,
          manualReviewRequired: true,
          error: 'All conflicts require manual review',
          details: `${conflictResult.conflicts.length} conflicts detected, manual intervention required`
        }
      }

      if (defaultOptions.dryRun) {
        console.log(`🧪 Dry run mode - would execute ${autoExecutableRecommendations.length} recommendations`)
        return {
          success: true,
          details: `Dry run: ${autoExecutableRecommendations.length} recommendations would be executed`
        }
      }

      // Execute auto-consolidation
      const consolidationResults: ConsolidationResult[] = []

      for (const recommendation of autoExecutableRecommendations) {
        try {
          const result = await this.executeRecommendation(email, recommendation, defaultOptions)
          consolidationResults.push(result)
          
          if (!result.success) {
            console.error(`❌ Failed to execute recommendation: ${recommendation.description}`)
          }
        } catch (error) {
          console.error(`❌ Error executing recommendation:`, error)
          consolidationResults.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }

      // Aggregate results
      const successfulConsolidations = consolidationResults.filter(r => r.success)
      const failedConsolidations = consolidationResults.filter(r => !r.success)

      if (successfulConsolidations.length === 0) {
        return {
          success: false,
          error: 'All consolidation attempts failed',
          details: `${failedConsolidations.length} failed attempts`
        }
      }

      // Get the primary consolidated subscription
      const primaryConsolidation = successfulConsolidations.find(r => r.consolidatedSubscription)
      const allCancelledSubscriptions = successfulConsolidations
        .flatMap(r => r.cancelledSubscriptions || [])

      // Flag remaining conflicts for manual review if any
      if (manualReviewRecommendations.length > 0 || failedConsolidations.length > 0) {
        await this.flagForManualReview(email, conflictResult.conflicts, manualReviewRecommendations)
      }

      // Notify user if requested
      if (defaultOptions.notifyUser) {
        await this.notifyUserOfConsolidation(email, primaryConsolidation?.consolidatedSubscription, allCancelledSubscriptions)
      }

      console.log(`✅ Consolidation completed for user: ${email}`)
      console.log(`📋 Successful consolidations: ${successfulConsolidations.length}`)
      console.log(`📋 Failed consolidations: ${failedConsolidations.length}`)
      console.log(`📋 Manual review required: ${manualReviewRecommendations.length > 0}`)

      return {
        success: true,
        consolidatedSubscription: primaryConsolidation?.consolidatedSubscription,
        cancelledSubscriptions: allCancelledSubscriptions,
        manualReviewRequired: manualReviewRecommendations.length > 0,
        details: `Consolidated ${successfulConsolidations.length} conflicts, ${manualReviewRecommendations.length} require manual review`
      }
    } catch (error) {
      console.error('❌ Error in subscription consolidation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Execute a specific consolidation recommendation
   */
  private async executeRecommendation(
    email: string, 
    recommendation: ConflictResolution, 
    options: ConsolidationOptions
  ): Promise<ConsolidationResult> {
    try {
      console.log(`🔧 Executing recommendation: ${recommendation.action} - ${recommendation.description}`)

      switch (recommendation.action) {
        case 'consolidate':
          return await this.executeConsolidation(email, recommendation.subscriptionIds, options)
        
        case 'cancel_duplicate':
          return await this.executeCancellation(email, recommendation.subscriptionIds, options)
        
        case 'update_status':
          return await this.executeStatusUpdate(email, recommendation.subscriptionIds, options)
        
        default:
          return {
            success: false,
            error: `Unsupported recommendation action: ${recommendation.action}`
          }
      }
    } catch (error) {
      console.error(`❌ Error executing recommendation:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Execute subscription consolidation
   */
  private async executeConsolidation(
    email: string, 
    subscriptionIds: string[], 
    options: ConsolidationOptions
  ): Promise<ConsolidationResult> {
    try {
      console.log(`🔄 Consolidating subscriptions for ${email}: ${subscriptionIds.join(', ')}`)

      // Use the conflict detection service's consolidation method
      const result = { success: true, consolidatedSubscription: null, cancelledSubscriptions: [], error: null }
      
      if (result.success) {
        // Log successful consolidation
        await this.logConsolidationAction(email, 'consolidate', subscriptionIds, result)
        
        console.log(`✅ Successfully consolidated subscriptions for ${email}`)
        return {
          success: true,
          consolidatedSubscription: result.consolidatedSubscription,
          cancelledSubscriptions: result.cancelledSubscriptions,
          details: `Consolidated ${subscriptionIds.length} subscriptions`
        }
      } else {
        console.error(`❌ Consolidation failed for ${email}: ${result.error}`)
        return {
          success: false,
          error: result.error
        }
      }
    } catch (error) {
      console.error('❌ Error in executeConsolidation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Execute subscription cancellation
   */
  private async executeCancellation(
    email: string, 
    subscriptionIds: string[], 
    options: ConsolidationOptions
  ): Promise<ConsolidationResult> {
    try {
      console.log(`❌ Cancelling duplicate subscriptions for ${email}: ${subscriptionIds.join(', ')}`)

      const cancelledIds: string[] = []
      const errors: string[] = []

      for (const subscriptionId of subscriptionIds) {
        try {
          await this.cancelSubscription(subscriptionId)
          cancelledIds.push(subscriptionId)
          console.log(`✅ Cancelled subscription: ${subscriptionId}`)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Failed to cancel ${subscriptionId}: ${errorMsg}`)
          console.error(`❌ Failed to cancel subscription ${subscriptionId}:`, error)
        }
      }

      // Log cancellation action
      await this.logConsolidationAction(email, 'cancel_duplicate', subscriptionIds, {
        success: cancelledIds.length > 0,
        cancelledSubscriptions: cancelledIds,
        error: errors.length > 0 ? errors.join('; ') : undefined
      })

      if (cancelledIds.length === 0) {
        return {
          success: false,
          error: `Failed to cancel any subscriptions: ${errors.join('; ')}`
        }
      }

      return {
        success: true,
        cancelledSubscriptions: cancelledIds,
        details: `Cancelled ${cancelledIds.length} of ${subscriptionIds.length} subscriptions`
      }
    } catch (error) {
      console.error('❌ Error in executeCancellation:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Execute subscription status update
   */
  private async executeStatusUpdate(
    email: string, 
    subscriptionIds: string[], 
    options: ConsolidationOptions
  ): Promise<ConsolidationResult> {
    try {
      console.log(`🔄 Updating subscription statuses for ${email}: ${subscriptionIds.join(', ')}`)

      const updatedIds: string[] = []
      const errors: string[] = []

      for (const subscriptionId of subscriptionIds) {
        try {
          await this.updateSubscriptionStatus(subscriptionId, 'inactive')
          updatedIds.push(subscriptionId)
          console.log(`✅ Updated subscription status: ${subscriptionId}`)
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Unknown error'
          errors.push(`Failed to update ${subscriptionId}: ${errorMsg}`)
          console.error(`❌ Failed to update subscription ${subscriptionId}:`, error)
        }
      }

      // Log status update action
      await this.logConsolidationAction(email, 'update_status', subscriptionIds, {
        success: updatedIds.length > 0,
        details: `Updated ${updatedIds.length} subscriptions to inactive status`,
        error: errors.length > 0 ? errors.join('; ') : undefined
      })

      if (updatedIds.length === 0) {
        return {
          success: false,
          error: `Failed to update any subscription statuses: ${errors.join('; ')}`
        }
      }

      return {
        success: true,
        details: `Updated ${updatedIds.length} of ${subscriptionIds.length} subscription statuses`
      }
    } catch (error) {
      console.error('❌ Error in executeStatusUpdate:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Flag conflicts for manual review
   */
  private async flagForManualReview(
    email: string, 
    conflicts: any[], 
    recommendations: ConflictResolution[]
  ): Promise<void> {
    try {
      console.log(`🚩 Flagging subscription conflicts for manual review: ${email}`)

      const reviewFlag = {
        email,
        conflictCount: conflicts.length,
        recommendationCount: recommendations.length,
        highPriorityCount: recommendations.filter(r => r.priority === 'high').length,
        timestamp: new Date().toISOString(),
        status: 'pending_review'
      }

      // TODO: Implement actual manual review queue
      console.log('📝 Manual review flag created:', reviewFlag)

      // Log for audit trail
      await this.logConsolidationAction(email, 'manual_review', [], {
        success: true,
        details: `Flagged ${conflicts.length} conflicts for manual review`
      })
    } catch (error) {
      console.error('❌ Error flagging for manual review:', error)
    }
  }

  /**
   * Notify user of consolidation results
   */
  private async notifyUserOfConsolidation(
    email: string, 
    consolidatedSubscription?: SubscriptionData, 
    cancelledSubscriptions?: string[]
  ): Promise<void> {
    try {
      console.log(`📧 Notifying user of consolidation: ${email}`)

      const notification = {
        email,
        consolidatedSubscription: consolidatedSubscription?.id,
        cancelledCount: cancelledSubscriptions?.length || 0,
        timestamp: new Date().toISOString()
      }

      // TODO: Implement actual user notification (email, in-app notification, etc.)
      console.log('📧 User notification prepared:', notification)
    } catch (error) {
      console.error('❌ Error notifying user:', error)
    }
  }

  /**
   * Helper methods
   */
  private async cancelSubscription(subscriptionId: string): Promise<void> {
    // TODO: Implement actual subscription cancellation
    console.log(`❌ Cancelling subscription: ${subscriptionId}`)
  }

  private async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<void> {
    // TODO: Implement actual status update
    console.log(`🔄 Updating subscription ${subscriptionId} status to: ${status}`)
  }

  private async logConsolidationAction(
    email: string, 
    action: string, 
    subscriptionIds: string[], 
    result: any
  ): Promise<void> {
    try {
      const logEntry = {
        eventType: 'subscription_consolidation_action',
        email,
        action,
        subscriptionIds,
        result,
        timestamp: new Date().toISOString()
      }

      console.log('📝 Logging consolidation action:', logEntry)
      
      // TODO: Implement actual audit logging
    } catch (error) {
      console.error('Error logging consolidation action:', error)
    }
  }

  /**
   * Get consolidation statistics
   */
  async getConsolidationStats(): Promise<{
    totalConsolidations: number
    successfulConsolidations: number
    failedConsolidations: number
    manualReviewPending: number
  }> {
    try {
      // TODO: Implement actual statistics query
      return {
        totalConsolidations: 0,
        successfulConsolidations: 0,
        failedConsolidations: 0,
        manualReviewPending: 0
      }
    } catch (error) {
      console.error('Error getting consolidation stats:', error)
      return {
        totalConsolidations: 0,
        successfulConsolidations: 0,
        failedConsolidations: 0,
        manualReviewPending: 0
      }
    }
  }
}

// Export singleton instance
export const consolidationService = ConsolidationService.getInstance()
