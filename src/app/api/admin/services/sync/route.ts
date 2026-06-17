import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const SMM_API_KEY = process.env.SMM_API_KEY || '';
const SMM_API_URL = 'https://bestsmmprovider.com/api/v2';

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id, provider_service_id } = await req.json();

    if (!id || !provider_service_id) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. Fetch all services from SMM Provider
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

    // 2. Find the specific service
    const targetService = servicesData.find((s: any) => String(s.service) === String(provider_service_id));

    if (!targetService) {
      return NextResponse.json({ error: 'Service ID not found in provider API' }, { status: 404 });
    }

    // 3. Update the local database with min/max
    const min = parseInt(targetService.min);
    const max = parseInt(targetService.max);

    if (isNaN(min) || isNaN(max)) {
      return NextResponse.json({ error: 'Invalid min/max returned from provider' }, { status: 500 });
    }

    const { error } = await supabase
      .from('services')
      .update({
        provider_service_id,
        min_quantity: min,
        max_quantity: max
      })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      min,
      max,
      name: targetService.name
    });

  } catch (error) {
    console.error('Error syncing service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
