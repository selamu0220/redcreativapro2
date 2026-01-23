'use client'

import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
          <div className="max-w-2xl w-full bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-8 shadow-2xl">
            <h1 className="text-3xl font-bold text-red-600 mb-4">CRITICAL ERROR DEBUG MODE</h1>
            <p className="text-lg font-mono bg-white dark:bg-black p-4 rounded border border-red-200 mb-4 text-left overflow-auto">
              {this.state.error?.message || 'NO ERROR MESSAGE'}
            </p>
            <div className="text-left bg-black text-green-400 p-4 rounded overflow-auto h-96 font-mono text-xs">
              <h3 className="text-white font-bold border-b border-gray-700 pb-2 mb-2">STACK TRACE:</h3>
              {this.state.error?.stack || 'NO STACK TRACE'}
            </div>
            <div className="mt-6 flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-red-600 text-white font-bold rounded hover:bg-red-700 transition"
              >
                RELOAD PAGE
              </button>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-6 py-3 bg-gray-600 text-white font-bold rounded hover:bg-gray-700 transition"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}