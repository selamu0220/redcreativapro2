
// Mock implementation to remove Supabase dependency
// The project is moving to Clerk for auth and Vercel KV for data

export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      single: async () => ({ data: null, error: null }),
      order: () => ({
        limit: () => ({
          data: [],
          error: null
        })
      })
    }),
    update: () => ({
      eq: () => ({
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      })
    }),
    insert: () => ({
      select: () => ({
        single: async () => ({ data: null, error: null })
      })
    }),
    delete: () => ({
      eq: async () => ({ error: null })
    })
  }),
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
} as any;

export function createClientComponentClient() {
  return supabase;
}

export function createClient() {
  return supabase;
}
