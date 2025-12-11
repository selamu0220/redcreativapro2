export type SubscriptionStatus = {
  isActive: boolean
  planId: string
  source?: string
  expiresAt?: string | null
  lastUpdated?: string
}

export type AccessResult = {
  allowed: boolean
  hasAccess?: boolean
  upgradeRequired?: boolean
  reason?: string
  planId?: string
}

async function fetchStatus(userId?: string): Promise<SubscriptionStatus> {
  try {
    const url = '/api/subscription/status'
    const res = await fetch(url, { method: 'GET' })
    const json = await res.json()
    if (json?.data) return json.data as SubscriptionStatus
  } catch (e) {}
  return {
    isActive: false,
    planId: 'free',
    source: 'fallback',
    expiresAt: null,
    lastUpdated: new Date().toISOString(),
  }
}

export const subscriptionStatusService = {
  async getSubscriptionStatus(userId?: string): Promise<SubscriptionStatus> {
    return fetchStatus(userId)
  },
  async getSubscriptionStatusWithRetry(userId?: string): Promise<SubscriptionStatus> {
    return fetchStatus(userId)
  },
  subscribeToStatusChanges(_userId: string, _cb: (s: SubscriptionStatus) => void) {
    return { unsubscribe: () => {} }
  },
  async refreshSubscriptionCache(_userId?: string): Promise<void> {},
  async validateSubscriptionAccess(_userId: string, _feature: string): Promise<AccessResult> {
    const status = await fetchStatus(_userId)
    return { allowed: status.isActive, hasAccess: status.isActive, planId: status.planId }
  },
}
