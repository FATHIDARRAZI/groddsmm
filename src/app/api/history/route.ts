import { connection } from 'next/server';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const SMM_API_KEY = process.env.SMM_API_KEY || '';
const SMM_API_URL = 'https://bestsmmprovider.com/api/v2';

export async function GET(req: Request) {
  await connection();
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول (Unauthorized)' }, { status: 401 });
    }

    // Fetch the user's historical orders securely from the database
    const { data: orders, error: dbError } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) throw dbError;

    if (!orders || orders.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // Map the Provider Order IDs into a comma separated list for Bulk Polling
    const providerOrderIds = orders.map(o => o.provider_order_id).join(',');

    const params = new URLSearchParams({
      key: SMM_API_KEY,
      action: 'status',
      orders: providerOrderIds, // Bulk polling
    });

    const smmRes = await fetch(SMM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const smmData = await smmRes.json();

    // Map Provider Live Responses back mathematically to the Database orders
    const enrichedOrders = orders.map(order => {
      // smmData usually returns a Map of Order IDs -> Status Object for bulk queries
      const liveData = smmData[order.provider_order_id];
      
      return {
        ...order,
        live_status: liveData?.status || order.status,
        start_count: liveData?.start_count || 0,
        remains: liveData?.remains || 0,
        provider_charge: liveData?.charge || 0,
      };
    });

    return NextResponse.json({ data: enrichedOrders }, { status: 200 });

  } catch (error) {
    console.error('History API Error:', error);
    return NextResponse.json({ error: 'تعذر جلب سجل الطلبات الآن' }, { status: 500 });
  }
}
