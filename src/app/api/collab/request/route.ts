import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function POST(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    // We can use the service role key if we want, but normal user auth is fine since they are authenticated
    const cookieStore = await cookies();
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }); } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.delete({ name, ...options }); } catch (error) {}
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await request.json();
    if (!username) {
      return NextResponse.json({ error: 'Instagram username is required' }, { status: 400 });
    }

    // Insert the request
    const { data, error } = await supabase
      .from('collab_requests')
      .insert({
        user_id: user.id,
        username: username,
        status: 'pending'
      });

    if (error) {
      if (error.code === '23505') {
         return NextResponse.json({ error: 'You have already submitted a request' }, { status: 400 });
      }
      console.error('Error inserting collab request:', error);
      return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
