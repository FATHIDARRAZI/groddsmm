import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const adminSupabase = await createSupabaseAdminClient();
    
    // Try to fetch settings. If 'system_settings' table doesn't exist, this will throw/error.
    let { data: settings, error } = await adminSupabase
      .from('system_settings')
      .select('*');

    if (error) {
      // If table doesn't exist, we'll return a helpful hint
      if (error.code === '42P01') {
        return NextResponse.json({ 
          error: 'Table system_settings missing', 
          sql_hint: `CREATE TABLE system_settings (key TEXT PRIMARY KEY, value JSONB); INSERT INTO system_settings (key, value) VALUES ('order_cooldown_minutes', '2');` 
        }, { status: 404 });
      }
      throw error;
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Settings API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { key, value } = body;

    const adminSupabase = await createSupabaseAdminClient();
    const { error } = await adminSupabase
      .from('system_settings')
      .upsert({ key, value }, { onConflict: 'key' });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings API POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
