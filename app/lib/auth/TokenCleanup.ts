'use client'

/**
 * Token cleanup utility to handle corrupted or invalid tokens
 */
export class TokenCleanup {
  private static readonly SUPABASE_STORAGE_KEYS = [
    'sb-auth-token',
    'sb-kvhhppipogfvcwtphiak-auth-token',
    'supabase.auth.token',
    'sb-localhost-auth-token'
  ]

  /**
   * Clear all Supabase authentication tokens from storage
   */
  static clearAllTokens(): void {
    if (typeof window === 'undefined') return

    console.log('🧹 Clearing all authentication tokens...')

    // Clear localStorage
    this.SUPABASE_STORAGE_KEYS.forEach(key => {
      try {
        localStorage.removeItem(key)
        console.log(`✅ Cleared localStorage key: ${key}`)
      } catch (error) {
        console.warn(`⚠️ Failed to clear localStorage key ${key}:`, error)
      }
    })

    // Clear sessionStorage
    this.SUPABASE_STORAGE_KEYS.forEach(key => {
      try {
        sessionStorage.removeItem(key)
        console.log(`✅ Cleared sessionStorage key: ${key}`)
      } catch (error) {
        console.warn(`⚠️ Failed to clear sessionStorage key ${key}:`, error)
      }
    })

    // Clear any dynamic Supabase keys
    try {
      const localStorageKeys = Object.keys(localStorage)
      localStorageKeys.forEach(key => {
        if (key.includes('supabase') && key.includes('auth')) {
          localStorage.removeItem(key)
          console.log(`✅ Cleared dynamic localStorage key: ${key}`)
        }
      })

      const sessionStorageKeys = Object.keys(sessionStorage)
      sessionStorageKeys.forEach(key => {
        if (key.includes('supabase') && key.includes('auth')) {
          sessionStorage.removeItem(key)
          console.log(`✅ Cleared dynamic sessionStorage key: ${key}`)
        }
      })
    } catch (error) {
      console.warn('⚠️ Failed to clear dynamic storage keys:', error)
    }

    // Clear authentication cookies
    this.clearAuthCookies()

    console.log('✅ Token cleanup completed')
  }

  /**
   * Clear authentication-related cookies
   */
  static clearAuthCookies(): void {
    if (typeof window === 'undefined') return

    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token'
    ]

    cookiesToClear.forEach(cookieName => {
      try {
        // Clear cookie by setting it to expire in the past
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
        document.cookie = `${cookieName}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`
        console.log(`✅ Cleared cookie: ${cookieName}`)
      } catch (error) {
        console.warn(`⚠️ Failed to clear cookie ${cookieName}:`, error)
      }
    })
  }

  /**
   * Check if there are any corrupted tokens in storage
   */
  static hasCorruptedTokens(): boolean {
    if (typeof window === 'undefined') return false

    try {
      // Check for malformed tokens in localStorage
      for (const key of this.SUPABASE_STORAGE_KEYS) {
        const value = localStorage.getItem(key)
        if (value && this.isTokenCorrupted(value)) {
          console.warn(`🔍 Corrupted token detected in localStorage key: ${key}`)
          return true
        }
      }

      // Check for malformed tokens in sessionStorage
      for (const key of this.SUPABASE_STORAGE_KEYS) {
        const value = sessionStorage.getItem(key)
        if (value && this.isTokenCorrupted(value)) {
          console.warn(`🔍 Corrupted token detected in sessionStorage key: ${key}`)
          return true
        }
      }

      return false
    } catch (error) {
      console.warn('⚠️ Error checking for corrupted tokens:', error)
      return true // Assume corrupted if we can't check
    }
  }

  /**
   * Check if a token value appears to be corrupted
   */
  private static isTokenCorrupted(tokenValue: string): boolean {
    try {
      // Try to parse as JSON (Supabase stores tokens as JSON)
      const parsed = JSON.parse(tokenValue)
      
      // Check for required fields in a valid Supabase auth token
      if (typeof parsed === 'object' && parsed !== null) {
        // Valid token should have access_token and refresh_token
        if (parsed.access_token && parsed.refresh_token) {
          // Check if tokens are properly formatted JWTs
          const accessTokenParts = parsed.access_token.split('.')
          const refreshTokenParts = parsed.refresh_token.split('.')
          
          // JWT should have 3 parts (header.payload.signature)
          if (accessTokenParts.length !== 3 || refreshTokenParts.length !== 3) {
            return true
          }

          // Check if token is expired
          try {
            const payload = JSON.parse(atob(accessTokenParts[1]))
            const now = Math.floor(Date.now() / 1000)
            if (payload.exp && payload.exp < now) {
              console.warn('🔍 Expired token detected')
              return true
            }
          } catch {
            return true
          }

          return false
        }
      }

      return true
    } catch {
      // If we can't parse it, it's probably corrupted
      return true
    }
  }

  /**
   * Perform a complete authentication reset
   */
  static performAuthReset(): void {
    console.log('🔄 Performing complete authentication reset...')
    
    this.clearAllTokens()
    
    // Force reload to ensure clean state
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }

  /**
   * Get diagnostic information about current token state
   */
  static getDiagnostics(): {
    hasTokens: boolean
    hasCorruptedTokens: boolean
    tokenKeys: string[]
    recommendations: string[]
  } {
    const diagnostics = {
      hasTokens: false,
      hasCorruptedTokens: false,
      tokenKeys: [] as string[],
      recommendations: [] as string[]
    }

    if (typeof window === 'undefined') {
      diagnostics.recommendations.push('Running in server environment - no token diagnostics available')
      return diagnostics
    }

    try {
      // Check localStorage
      this.SUPABASE_STORAGE_KEYS.forEach(key => {
        const value = localStorage.getItem(key)
        if (value) {
          diagnostics.hasTokens = true
          diagnostics.tokenKeys.push(`localStorage:${key}`)
          
          if (this.isTokenCorrupted(value)) {
            diagnostics.hasCorruptedTokens = true
          }
        }
      })

      // Check sessionStorage
      this.SUPABASE_STORAGE_KEYS.forEach(key => {
        const value = sessionStorage.getItem(key)
        if (value) {
          diagnostics.hasTokens = true
          diagnostics.tokenKeys.push(`sessionStorage:${key}`)
          
          if (this.isTokenCorrupted(value)) {
            diagnostics.hasCorruptedTokens = true
          }
        }
      })

      // Generate recommendations
      if (diagnostics.hasCorruptedTokens) {
        diagnostics.recommendations.push('Clear corrupted tokens using TokenCleanup.clearAllTokens()')
        diagnostics.recommendations.push('Perform fresh login after token cleanup')
      }

      if (!diagnostics.hasTokens) {
        diagnostics.recommendations.push('No authentication tokens found - user needs to log in')
      }

      if (diagnostics.hasTokens && !diagnostics.hasCorruptedTokens) {
        diagnostics.recommendations.push('Tokens appear valid - check network connectivity and Supabase configuration')
      }

    } catch (error) {
      diagnostics.recommendations.push(`Error during diagnostics: ${error}`)
    }

    return diagnostics
  }
}
