'use client'

import { useEffect } from 'react'
import { setupChunkErrorHandler } from '../lib/chunk-manager'

export default function ChunkErrorHandler() {
  useEffect(() => {
    setupChunkErrorHandler()
  }, [])

  return null
}