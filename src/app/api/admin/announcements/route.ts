import { connection } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: Request) {
  await connection();
  try {
    const cookieStore = await cookies();
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          },
        },
      }
    );

    const { data: userAuth } = await adminSupabase.auth.getUser();
    if (!userAuth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userAuth.user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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
    const cookieStore = await cookies();
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
          },
        },
      }
    );

    const { data: userAuth } = await adminSupabase.auth.getUser();
    if (!userAuth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userAuth.user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

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
