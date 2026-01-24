import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function getSupabaseUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching user by email:', error);
    return null;
  }

  return data;
}

export async function createOrUpdateSupabaseUser(id: string, email: string, data: any = {}) {
  const { full_name, avatar_url, billing_address, payment_method } = data;
  
  if (!id) {
    throw new Error('User ID is required to create or update a profile');
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .upsert({
      id,
      email,
      full_name: full_name || null,
      avatar_url: avatar_url || null,
      billing_address: billing_address || null,
      payment_method: payment_method || null,
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
