import { connection } from 'next/server';
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  await connection();
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: tickets, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { subject, message } = body;

    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({ user_id: user.id, subject, status: 'open' })
      .select()
      .single();

    if (ticketError) throw ticketError;

    const { error: msgError } = await supabase
      .from('ticket_messages')
      .insert({ ticket_id: ticket.id, sender_id: user.id, message, is_admin_reply: false });

    if (msgError) throw msgError;

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
