import { useAuthContext } from '../components/AuthProvider'

// Wrapper to maintain some compatibility but use Supabase context
export function useAuth() {
  const { user, session, isLoading, isAuthenticated, signInWithGoogle, signOut } = useAuthContext() as any

  // Mapping to match previous usage if possible, or exposing new standard methods
  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login: signInWithGoogle,
    logout: signOut,
    register: signInWithGoogle // Google auth handles both
  }
}
