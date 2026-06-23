import { connection } from 'next/server';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await connection();
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: ticket, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    const { data: messages, error: msgError } = await supabase
      .from('ticket_messages')
      .select('*, profiles(full_name, email)')
      .eq('ticket_id', id)
      .order('created_at', { ascending: true });

    if (msgError) throw msgError;

    return NextResponse.json({ success: true, ticket, messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: ticket } = await supabase.from('tickets').select('*').eq('id', id).eq('user_id', user.id).single();
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await request.json();
    const { message } = body;

    const { error: msgError } = await supabase
      .from('ticket_messages')
      .insert({ ticket_id: id, sender_id: user.id, message, is_admin_reply: false });

    if (msgError) throw msgError;

    await supabase.from('tickets').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
