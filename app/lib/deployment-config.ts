/**
 * Deployment configuration to handle missing environment variables gracefully
 */

// Check if we're in a deployment environment
export const isDeployment = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) return false
  
  // Check for placeholder values
  const placeholders = [
    'your_supabase_url',
    'your_supabase_anon_key',
    'placeholder',
    'example',
    'demo'
  ]
  
  return !placeholders.some(placeholder => 
    url.toLowerCase().includes(placeholder) || 
    key.toLowerCase().includes(placeholder)
  )
}

// Deployment-safe configuration
export const deploymentConfig = {
  supabase: {
    enabled: isSupabaseConfigured(),
    fallbackMode: !isSupabaseConfigured()
  },
  features: {
    // Enable features based on available configuration
    authentication: isSupabaseConfigured(),
    database: isSupabaseConfigured(),
    realtime: isSupabaseConfigured(),
    // Always enable these features
    localAuth: true,
    staticContent: true,
    clientSideRouting: true
  }
}

// Log deployment configuration
if (isDeployment) {
  console.log('🚀 Deployment Configuration:', {
    supabaseEnabled: deploymentConfig.supabase.enabled,
    fallbackMode: deploymentConfig.supabase.fallbackMode,
    features: deploymentConfig.features
  })
}