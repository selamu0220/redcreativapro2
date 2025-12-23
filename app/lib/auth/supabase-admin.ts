
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Create a Supabase client with the service role key for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function getSupabaseUserByEmail(email: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error in getSupabaseUserByEmail:', error);
    return null;
  }
}

export async function createOrUpdateSupabaseUser(email: string, data: any = {}) {
  try {
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      const { data: updatedUser, error } = await supabaseAdmin
        .from('users')
        .update({
          ...data,
          last_active_at: new Date().toISOString()
        })
        .eq('email', email)
        .select()
        .single();

      if (error) throw error;
      return updatedUser;
    } else {
      const { data: newUser, error } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          ...data,
          created_at: new Date().toISOString(),
          last_active_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return newUser;
    }
  } catch (error) {
    console.error('Error in createOrUpdateSupabaseUser:', error);
    return { email, ...data }; // Return partial data if fails
  }
}
