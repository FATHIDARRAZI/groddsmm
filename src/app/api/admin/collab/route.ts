import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

// Helper to init service role client
async function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const cookieStore = await cookies();
  
  return createServerClient(url, serviceKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options: CookieOptions) {
        try { cookieStore.set({ name, value, ...options }); } catch (error) {}
      },
      remove(name: string, options: CookieOptions) {
        try { cookieStore.delete({ name, ...options }); } catch (error) {}
      },
    },
  });
}

// Check admin auth
async function checkAdminAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const cookieStore = await cookies();
  const authClient = createServerClient(url, anonKey, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value; },
      set(name: string, value: string, options: CookieOptions) {
        try { cookieStore.set({ name, value, ...options }); } catch (error) {}
      },
      remove(name: string, options: CookieOptions) {
        try { cookieStore.delete({ name, ...options }); } catch (error) {}
      },
    },
  });

  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return false;

  const adminClient = await getAdminClient();
  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = await getAdminClient();

    // Fetch collab requests and join with profiles to get full_name / email if needed
    const { data, error } = await adminClient
      .from('collab_requests')
      .select(`
        *,
        profiles (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ requests: data });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = await getAdminClient();
    const { id, status, admin_note } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const { error } = await adminClient
      .from('collab_requests')
      .update({ status, admin_note })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
