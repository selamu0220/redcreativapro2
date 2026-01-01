'use client'

import React, { memo, useMemo } from 'react'
import { SimpleMainNavigation } from './SimpleMainNavigation'

// Memoizar la navegación para evitar re-renders
export const OptimizedNavigation = memo(function OptimizedNavigation() {
  return <SimpleMainNavigation />
})
