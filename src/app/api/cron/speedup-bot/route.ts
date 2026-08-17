import { connection } from 'next/server';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseServer';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(req: Request) {
  await connection();
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

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json({ error: 'Telegram configuration missing' }, { status: 500 });
    }

    const adminSupabase = await createSupabaseAdminClient();

    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    // Fetch stuck orders: pending/processing/in progress AND older than 24 hours
    const { data: stuckOrders, error: fetchError } = await adminSupabase
      .from('orders')
      .select('provider_order_id')
      .in('status', ['Pending', 'Processing', 'In progress'])
      .lt('created_at', twentyFourHoursAgo.toISOString());

    if (fetchError) throw fetchError;

    // Filter out any orders that don't have a valid provider ID yet
    const validIds = stuckOrders?.map((o: any) => o.provider_order_id).filter((id: any) => id) || [];

    if (validIds.length === 0) {
      return NextResponse.json({ success: true, message: 'No stuck orders found today.' }, { status: 200 });
    }

    // Format the message
    const formattedIds = validIds.join('\n');
    const message = `please speedup these orders:\n${formattedIds}\n\n@bestsmmprovidersupport`;
    
    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const telegramRes = await fetch(telegramUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    if (!telegramRes.ok) {
      throw new Error(`Telegram API responded with ${telegramRes.status}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sent ${validIds.length} stuck orders to Telegram.` 
    });

  } catch (error) {
    console.error('Speedup Bot Cron Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
