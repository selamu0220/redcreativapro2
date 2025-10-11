'use client'

import { useEffect } from 'react'
import { initializeChunkErrorHandler } from '../lib/chunk-manager'

export function ChunkErrorHandler() {
  useEffect(() => {
    initializeChunkErrorHandler()
  }, [])

  return null
}

export default ChunkErrorHandler
