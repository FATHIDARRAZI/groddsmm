import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const adminSupabase = await createSupabaseAdminClient();

    // Fetch all coupons
    const { data: coupons, error } = await adminSupabase
      .from('coupons')
      .select('id, code, points, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Fetch user's redemptions
    const { data: redemptions, error: redError } = await adminSupabase
      .from('coupon_redemptions')
      .select('coupon_id')
      .eq('user_id', user.id);

    if (redError) throw redError;

    const redeemedIds = new Set(redemptions?.map(r => r.coupon_id) || []);

    const publicCoupons = coupons.map(c => ({
      id: c.id,
      code: c.code,
      points: c.points,
      is_redeemed: redeemedIds.has(c.id)
    }));

    return NextResponse.json({ success: true, coupons: publicCoupons });
  } catch (error) {
    console.error('Fetch Coupons Error:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}
