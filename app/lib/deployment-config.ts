/**
 * Deployment configuration to handle missing environment variables gracefully
 * NOTA: Supabase está deshabilitado - ahora usamos Clerk para autenticación
 */

// Check if we're in a deployment environment
export const isDeployment = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1'

// Check if Supabase is properly configured
// NOTA: Siempre retorna false ya que Supabase está deshabilitado
export const isSupabaseConfigured = () => {
  return false; // Supabase disabled - using Clerk
  
  /* Legacy Supabase check - disabled
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
  */
}

// Deployment-safe configuration
export const deploymentConfig = {
  supabase: {
    enabled: false, // Supabase disabled - using Clerk
    fallbackMode: true // Always use fallback mode (Clerk)
  },
  features: {
    // Enable features based on Clerk authentication
    authentication: true, // Using Clerk
    database: false, // Supabase disabled
    realtime: false, // Supabase disabled
    // Always enable these features
    localAuth: true,
    staticContent: true,
    clientSideRouting: true
  }
}

// Log deployment configuration (only in development)
if (isDeployment && process.env.NODE_ENV === 'development') {
  console.log('🚀 Deployment Configuration:', {
    authProvider: 'Clerk',
    supabaseEnabled: false,
    features: deploymentConfig.features
  })
}