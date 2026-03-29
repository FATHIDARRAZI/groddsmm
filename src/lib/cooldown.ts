import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; 

// We use the Service Role Key to bypass Row Level Security on the server side
const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');

export async function getCooldownEnd(username: string): Promise<number | null> {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase credentials missing. Cooldown logic disabled.');
    return null;
  }
  
  const { data, error } = await supabase
    .from('cooldowns')
    .select('cooldown_end')
    .eq('username', username.toLowerCase())
    .single();

  if (error || !data) return null;
  
  if (Date.now() >= data.cooldown_end) {
    // Cooldown has expired
    return null;
  }
  
  return data.cooldown_end;
}

export async function setCooldown(username: string, minutes: number): Promise<void> {
  if (!supabaseUrl || !supabaseKey) return;
  
  const endTime = Date.now() + minutes * 60 * 1000;
  
  await supabase
    .from('cooldowns')
    .upsert(
      { username: username.toLowerCase(), cooldown_end: endTime },
      { onConflict: 'username' }
    );
}
