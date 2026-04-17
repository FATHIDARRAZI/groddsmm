import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

const SMM_API_KEY = process.env.SMM_API_KEY || '';
const SMM_API_URL = 'https://bestsmmprovider.com/api/v2';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Verify Admin Role
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const adminSupabase = await createSupabaseAdminClient();

    // 1. Fetch Provider Balance
    let providerBalance = '0.00';
    try {
      const params = new URLSearchParams({
        key: SMM_API_KEY,
        action: 'balance'
      });
      const res = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
      });
      const data = await res.json();
      providerBalance = data.balance || '0.00';
    } catch (e) {
      console.error('Provider balance fetch failed');
    }

    // 2. Fetch System Totals
    const { count: totalUsers } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: bannedUsers } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true);
    
    // Calculate total points in circulation
    const { data: pointsData } = await adminSupabase.from('profiles').select('points_balance');
    const totalCirculatingPoints = pointsData?.reduce((acc, curr) => acc + (curr.points_balance || 0), 0) || 0;

    // Fetch total orders
    const { count: totalOrders } = await adminSupabase.from('orders').select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      stats: {
        providerBalance: parseFloat(providerBalance),
        totalUsers: totalUsers || 0,
        totalCirculatingPoints,
        totalOrders: totalOrders || 0,
        security: {
          bannedAccounts: bannedUsers || 0,
          apiStatus: providerBalance !== '0.00' ? 'Operational' : 'Error',
          multiAccountProtection: 'Active'
        }
      }
    });

  } catch (error) {
    console.error('Admin Stats API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
