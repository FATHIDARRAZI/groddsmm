import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

import { createSupabaseAdminClient } from '@/lib/supabaseServer';

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

  const adminClient = await createSupabaseAdminClient();
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

    const adminClient = await createSupabaseAdminClient();

    // Fetch collab requests
    const { data: collabRequests, error } = await adminClient
      .from('collab_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch associated profiles
    const userIds = collabRequests.map((req: any) => req.user_id);
    const { data: profiles } = await adminClient
      .from('profiles')
      .select('id, full_name, email')
      .in('id', userIds);

    // Merge the data
    const requestsWithProfiles = collabRequests.map((req: any) => {
      const profile = profiles?.find((p: any) => p.id === req.user_id);
      return {
        ...req,
        profiles: profile || null
      };
    });

    return NextResponse.json({ requests: requestsWithProfiles });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminClient = await createSupabaseAdminClient();
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
