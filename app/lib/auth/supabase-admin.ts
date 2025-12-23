
// Mock implementation to remove Supabase dependency
// The project is moving to Clerk for auth and Vercel KV for data

export const supabaseAdmin = {
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null }),
        select: () => ({
          single: async () => ({ data: null, error: null })
        })
      }),
      single: async () => ({ data: null, error: null })
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
    })
  })
} as any;

export async function getSupabaseUserByEmail(email: string) {
  console.log('Mock getSupabaseUserByEmail called for:', email);
  return null;
}

export async function createOrUpdateSupabaseUser(email: string, data: any = {}) {
  console.log('Mock createOrUpdateSupabaseUser called for:', email);
  return { email, ...data, id: 'mock-id' };
}
