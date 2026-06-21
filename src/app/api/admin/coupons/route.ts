import { connection } from 'next/server';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function GET() {
  await connection();
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const adminSupabase = await createSupabaseAdminClient();
    
    // Fetch coupons and join with redemption count
    const { data: coupons, error } = await adminSupabase
      .from('coupons')
      .select(`
        *,
        coupon_redemptions(count)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform to include usage count
    const result = coupons.map((c: any) => ({
      ...c,
      usage_count: c.coupon_redemptions?.[0]?.count || 0
    }));

    return NextResponse.json({ success: true, coupons: result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { code, points } = await req.json();
    const adminSupabase = await createSupabaseAdminClient();

    const { error } = await adminSupabase
      .from('coupons')
      .insert({ code: code.toUpperCase(), points });

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'كود الكوبون موجود بالفعل' }, { status: 400 });
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const adminSupabase = await createSupabaseAdminClient();
    await adminSupabase.from('coupons').delete().eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
