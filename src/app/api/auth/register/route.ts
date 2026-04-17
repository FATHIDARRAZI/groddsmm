import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();

    // 1. Check for Anti-Abuse Fingerprint Strategy (Auto-Ban if second account)
    const isAutoBanned = !!cookieStore.get('smm_device_registered');
    const banReason = isAutoBanned ? 'إنشاء حسابات متعددة (Multiple Accounts Detected)' : null;

    const { email, password, fullName } = await req.json();
    const referrerId = cookieStore.get('smm_ref')?.value;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'يرجى تعبئة جميع الحقول' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    // 2. Register securely with Auth Database
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 3. Create Profile with Referral Linkage (Admin Bypass)
    const adminSupabase = await createSupabaseAdminClient();
    
    let resolvedReferrerId = referrerId;
    if (referrerId && referrerId.length === 8) {
      // Logic to resolve short code to full UUID
      const { data: refProf } = await adminSupabase
        .from('profiles')
        .select('id')
        .filter('id', 'ilike', `${referrerId}%`)
        .limit(1)
        .single();
      
      if (refProf) {
        resolvedReferrerId = refProf.id;
      }
    }

    await adminSupabase
      .from('profiles')
      .upsert({
        id: data.user?.id,
        full_name: fullName,
        referred_by: resolvedReferrerId || null,
        is_banned: isAutoBanned
      });

    // 4. Cleanup & Stamp Persistent Fingerprint Cookie strictly for 10 Years
    cookieStore.set('smm_device_registered', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 * 10 // 10 years
    });

    // Remove the referral cookie now that tracking is complete
    if (referrerId) {
      cookieStore.delete('smm_ref');
    }

    return NextResponse.json({ success: true, data }, { status: 200 });

  } catch (err: any) {
    console.error('Registration API Error:', err);
    return NextResponse.json({ error: 'تعذر إنشاء الحساب في الوقت الحالي' }, { status: 500 });
  }
}
