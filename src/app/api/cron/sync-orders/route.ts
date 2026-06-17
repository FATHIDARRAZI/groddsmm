import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseServer';

const SMM_API_KEY = process.env.SMM_API_KEY || '';
const SMM_API_URL = 'https://bestsmmprovider.com/api/v2';
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    
    // Allow manual triggers with ?secret= query param or Vercel Cron auth header
    const url = new URL(req.url);
    const secretParam = url.searchParams.get('secret');

    if (
      (!CRON_SECRET || authHeader !== `Bearer ${CRON_SECRET}`) &&
      secretParam !== CRON_SECRET
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminSupabase = await createSupabaseAdminClient();

    // 1. Fetch up to 100 active orders
    const { data: activeOrders, error: fetchError } = await adminSupabase
      .from('orders')
      .select('*')
      .in('status', ['Pending', 'Processing', 'In progress'])
      .limit(100);

    if (fetchError) throw fetchError;

    if (!activeOrders || activeOrders.length === 0) {
      return NextResponse.json({ success: true, message: 'No active orders to sync' }, { status: 200 });
    }

    // 2. Map provider order IDs
    const providerOrderIds = activeOrders.map((o: any) => o.provider_order_id).join(',');

    const params = new URLSearchParams({
      key: SMM_API_KEY,
      action: 'status',
      orders: providerOrderIds,
    });

    const smmRes = await fetch(SMM_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const smmData = await smmRes.json();
    let updatedCount = 0;
    let refundedCount = 0;

    // 3. Process the results and update database / issue refunds
    for (const order of activeOrders) {
      const liveData = smmData[order.provider_order_id];
      if (!liveData || liveData.error) continue; // Skip if invalid or missing

      const newStatus = liveData.status;

      // Only process if status changed
      if (newStatus && newStatus !== order.status) {
        
        // Handle Refunds if applicable
        if (newStatus === 'Canceled') {
          // Full refund
          const { error: rpcError } = await adminSupabase.rpc('increment_points', {
            user_id: order.user_id,
            amount: order.points_cost
          });
          if (rpcError) {
             const { data: profileObj } = await adminSupabase.from('profiles').select('points_balance').eq('id', order.user_id).single();
             if (profileObj) {
                await adminSupabase.from('profiles').update({ points_balance: profileObj.points_balance + order.points_cost }).eq('id', order.user_id);
             }
          }
          refundedCount++;
        } else if (newStatus === 'Partial') {
          // Partial refund based on remains
          const remains = parseFloat(liveData.remains || '0');
          const originalQuantity = order.quantity;
          if (remains > 0 && originalQuantity > 0) {
            const refundRatio = remains / originalQuantity;
            const refundAmount = Math.floor(refundRatio * order.points_cost);
            
            if (refundAmount > 0) {
               const { error: rpcError } = await adminSupabase.rpc('increment_points', {
                 user_id: order.user_id,
                 amount: refundAmount
               });
               if (rpcError) {
                  const { data: profileObj } = await adminSupabase.from('profiles').select('points_balance').eq('id', order.user_id).single();
                  if (profileObj) {
                     await adminSupabase.from('profiles').update({ points_balance: profileObj.points_balance + refundAmount }).eq('id', order.user_id);
                  }
               }
               refundedCount++;
            }
          }
        }

        // Update Order Status in Database
        await adminSupabase
          .from('orders')
          .update({ status: newStatus })
          .eq('id', order.id);
          
        updatedCount++;
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: activeOrders.length,
      updated: updatedCount,
      refunded: refundedCount
    }, { status: 200 });

  } catch (error: any) {
    console.error('CRON Sync Error:', error);
    return NextResponse.json({ error: error.message || 'Cron execution failed' }, { status: 500 });
  }
}
