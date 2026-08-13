import { connection } from 'next/server';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabaseServer';

const SMM_API_KEY = process.env.SMM_API_KEY || '';
const SMM_API_URL = 'https://bestsmmprovider.com/api/v2';
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

    const adminSupabase = await createSupabaseAdminClient();

    // 1. Fetch all services from local database that have a provider_service_id
    const { data: localServices, error: fetchError } = await adminSupabase
      .from('services')
      .select('*')
      .not('provider_service_id', 'is', null)
      .not('provider_service_id', 'eq', '');

    if (fetchError) throw fetchError;

    if (!localServices || localServices.length === 0) {
      return NextResponse.json({ success: true, message: 'No services to sync' }, { status: 200 });
    }

    // 2. Fetch all services from SMM Provider
    const params = new URLSearchParams({
      key: SMM_API_KEY,
      action: 'services'
    });

    const res = await fetch(SMM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString()
    });

    const servicesData = await res.json();

    if (!Array.isArray(servicesData)) {
      return NextResponse.json({ error: 'Failed to fetch services from provider' }, { status: 500 });
    }

    let updatedCount = 0;

    // 3. Process the results and update database
    for (const localService of localServices) {
      const targetService = servicesData.find((s: any) => String(s.service) === String(localService.provider_service_id));
      
      if (!targetService) continue; // Skip if service no longer exists in provider

      const min = parseInt(targetService.min);
      const max = parseInt(targetService.max);
      const rate = parseFloat(targetService.rate);

      if (!isNaN(min) && !isNaN(max) && !isNaN(rate)) {
        // Only update if something changed to save DB writes
        if (localService.min_quantity !== min || 
            localService.max_quantity !== max || 
            localService.provider_cost_per_1000 !== rate) {
            
            await adminSupabase
              .from('services')
              .update({
                min_quantity: min,
                max_quantity: max,
                provider_cost_per_1000: rate
              })
              .eq('id', localService.id);
              
            updatedCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: localServices.length,
      updated: updatedCount
    }, { status: 200 });

  } catch (error: any) {
    console.error('CRON Sync Services Error:', error);
    return NextResponse.json({ error: error.message || 'Cron execution failed' }, { status: 500 });
  }
}
