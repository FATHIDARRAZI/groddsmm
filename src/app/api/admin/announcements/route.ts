import { connection } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function GET() {
  await connection();
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const adminSupabase = await createSupabaseAdminClient();

    const { data: announcements, error } = await adminSupabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, announcements });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const adminSupabase = await createSupabaseAdminClient();

    const body = await request.json();
    const { action } = body;

    if (action === 'create') {
      const { title, message, type } = body;
      await adminSupabase.from('announcements').insert({ title, message, type, is_active: true });
      return NextResponse.json({ success: true });
    }

    if (action === 'toggle') {
      const { id, is_active } = body;
      await adminSupabase.from('announcements').update({ is_active }).eq('id', id);
      return NextResponse.json({ success: true });
    }
    
    if (action === 'delete') {
      const { id } = body;
      await adminSupabase.from('announcements').delete().eq('id', id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
