import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabaseMiddleware';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // 1. Update/Refresh session first
  const response = await updateSession(request);
  
  // 2. Extract path
  const path = request.nextUrl.pathname;

  // 3. Define Whitelist
  const isPublicPath = 
    path === '/banned' ||
    path === '/' || 
    path.startsWith('/auth') || 
    path.startsWith('/api/auth/register') ||
    path.startsWith('/terms') ||
    path.startsWith('/privacy') ||
    path.startsWith('/disclaimer') ||
    path.startsWith('/contact') ||
    path.startsWith('/_next') ||
    path.includes('.') || // Static files like .png, .ico
    path.startsWith('/favicon.ico');

  // 3.5 Handle Referral Tracking (Set cookie if ref param exists)
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

  // If it's a public path, just return the response from updateSession
  if (isPublicPath) {
    return response;
  }

  // 4. Verification Check (Direct Session Check for Protected Routes)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // 4.5 Fetch Profile Security Flags
  let profile = null;
  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('is_admin, is_banned')
      .eq('id', user.id)
      .single();
    profile = p;
  }

  // 4.6 Ban Guard
  if (user && profile?.is_banned) {
     const url = request.nextUrl.clone();
     if (url.pathname !== '/banned') {
       url.pathname = '/banned';
       return NextResponse.redirect(url);
     }
  }

  // 5. Redirect Unauthorized Users (Only for specifically protected areas)
  const isProtectedPath = path.startsWith('/dashboard') || (path.startsWith('/api') && !path.startsWith('/api/auth'));
  const isAdminPath = path.startsWith('/admin') || path.startsWith('/api/admin');

  if ((isProtectedPath || isAdminPath) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/login';
    return NextResponse.redirect(url);
  }

  // 6. Strict Admin Verification
  if (isAdminPath && user) {
    if (!profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard'; // Kick non-admins back to dashboard
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
