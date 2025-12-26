import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function getSupabaseUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user by email:', error);
    return null;
  }

  return data;
}

export async function createOrUpdateSupabaseUser(email: string, data: any = {}) {
  const { id, full_name, preferences } = data;
  
  if (!id) {
    throw new Error('User ID (Clerk ID) is required to create or update a profile');
  }

  const { data: profile, error } = await supabaseAdmin
    .from('user_profiles')
    .upsert({
      id,
      email,
      full_name: full_name || null,
      preferences: preferences || {},
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating/updating user profile:', error);
    throw error;
  }

  return profile;
}
