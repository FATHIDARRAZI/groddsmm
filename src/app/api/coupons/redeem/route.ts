import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: 'الرجاء إدخال كود الكوبون' }, { status: 400 });

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });

    const adminSupabase = await createSupabaseAdminClient();

    // 1. Check if coupon exists
    const { data: coupon, error: couponError } = await adminSupabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .single();

    if (couponError || !coupon) {
      return NextResponse.json({ error: 'الكوبون غير صالح أو انتهت صلاحيته' }, { status: 404 });
    }

    // 2. Check if user already redeemed it
    const { data: existingUsage } = await adminSupabase
      .from('coupon_redemptions')
      .select('id')
      .eq('coupon_id', coupon.id)
      .eq('user_id', user.id)
      .single();

    if (existingUsage) {
      return NextResponse.json({ error: 'لقد قمت باستخدام هذا الكوبون مسبقاً' }, { status: 400 });
    }

    // 3. Redeem Coupon (Atomic Transaction Concept)
    // Add Points to User
    const { data: profile } = await adminSupabase.from('profiles').select('points_balance').eq('id', user.id).single();
    const currentBalance = profile?.points_balance || 0;
    
    await adminSupabase.from('profiles').update({ points_balance: currentBalance + coupon.points }).eq('id', user.id);

    // Record Redemption
    await adminSupabase.from('coupon_redemptions').insert({
      coupon_id: coupon.id,
      user_id: user.id
    });

    return NextResponse.json({ 
      success: true, 
      message: `تم تفعيل الكوبون بنجاح وضحت ${coupon.points} نقطة في حسابك!`,
      addedPoints: coupon.points
    });

  } catch (error) {
    console.error('Coupon Redemption Error:', error);
    return NextResponse.json({ error: 'حدث خطأ غير متوقع' }, { status: 500 });
  }
}
