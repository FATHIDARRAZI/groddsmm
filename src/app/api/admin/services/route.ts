import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

// GET /api/admin/services
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    
    // Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('category', { ascending: true })
      .order('service_type', { ascending: true });

    if (error) throw error;

    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/admin/services
// Updates a specific service manually (active state or override provider_service_id)
export async function PUT(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { id, is_active, provider_service_id, min_quantity, max_quantity } = body;

    if (!id) return NextResponse.json({ error: 'Missing service id' }, { status: 400 });

    const updateData: any = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (provider_service_id !== undefined) updateData.provider_service_id = provider_service_id;
    if (min_quantity !== undefined) updateData.min_quantity = min_quantity;
    if (max_quantity !== undefined) updateData.max_quantity = max_quantity;

    const { error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
