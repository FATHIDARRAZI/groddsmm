import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Guard against missing environment variables in production
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Middleware: Missing Supabase Environment Variables');
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Initialize Supabase Client
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: { headers: request.headers },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  // 3. Refresh Session (This updates the cookie in the response)
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // 4. Handle Referral Tracking
  const ref = request.nextUrl.searchParams.get('ref');
  if (ref) {
    response.cookies.set('smm_ref', ref, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }

  // 5. Whitelist Logic
  const isPublicPath = 
    path === '/banned' ||
    path === '/' || 
    path.startsWith('/auth') || 
    path.startsWith('/api/auth') ||
    path.startsWith('/terms') ||
    path.startsWith('/privacy') ||
    path.startsWith('/disclaimer') ||
    path.startsWith('/contact') ||
    path.startsWith('/_next') ||
    path.includes('.') || 
    path.startsWith('/favicon.ico');

  if (isPublicPath) {
    return response;
  }

  // 6. Security Checks (Profile Query with Fail-Safe)
  let profile = null;
  if (user) {
    try {
      const { data: p } = await supabase
        .from('profiles')
        .select('is_admin, is_banned')
        .eq('id', user.id)
        .maybeSingle();
      profile = p;
    } catch (e) {
      console.warn('Middleware: Profile fetch failed, bypassing security check');
    }
  }

  // 7. Guards
  const isAdminPath = path.startsWith('/admin') || path.startsWith('/api/admin');
  const isProtectedPath = path.startsWith('/dashboard') || (path.startsWith('/api/') && !path.startsWith('/api/auth'));

  // Ban Guard
  if (user && profile?.is_banned) {
    if (path !== '/banned') {
      return NextResponse.redirect(new URL('/banned', request.url));
    }
  }

  // Auth Guard
  if ((isAdminPath || isProtectedPath) && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // Admin Guard
  if (isAdminPath && user) {
    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
