'use client'

import React from 'react'

interface SubscriptionGuardProps {
  children: React.ReactNode
}

/**
 * SubscriptionGuard (Legacy)
 * 
 * Previously used to block access for non-paid users.
 * Now repurposed as a simple pass-through since we moved to a Freemium model.
 * Access control is handled by API rate limits (3 uses/day for free users).
 */
export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({ children }) => {
  return <>{children}</>
}

export default SubscriptionGuard
