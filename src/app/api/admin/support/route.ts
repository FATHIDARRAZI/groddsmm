import { connection } from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function GET(request: Request) {
  await connection();
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const adminSupabase = await createSupabaseAdminClient();

    const url = new URL(request.url);
    const ticketId = url.searchParams.get('ticket_id');

    if (ticketId) {
      const { data: ticket, error } = await adminSupabase.from('tickets').select('*, profiles(full_name, username)').eq('id', ticketId).single();
      if (error) throw error;

      const { data: messages, error: msgError } = await adminSupabase
        .from('ticket_messages')
        .select('*, profiles(full_name, username)')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;
      return NextResponse.json({ success: true, ticket, messages });
    } else {
      const { data: tickets, error } = await adminSupabase
        .from('tickets')
        .select('*, profiles(full_name, username)')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ success: true, tickets });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const adminSupabase = await createSupabaseAdminClient();

    const body = await request.json();
    const { action, ticket_id, message, status } = body;

    if (action === 'reply') {
      const { error: msgError } = await adminSupabase
        .from('ticket_messages')
        .insert({ ticket_id, sender_id: user.id, message, is_admin_reply: true });

      if (msgError) throw msgError;

      await adminSupabase.from('tickets').update({ status: 'answered', updated_at: new Date().toISOString() }).eq('id', ticket_id);

      const { data: ticket } = await adminSupabase.from('tickets').select('user_id').eq('id', ticket_id).single();
      if (ticket) {
        await adminSupabase.from('notifications').insert({
          user_id: ticket.user_id,
          title: 'رد من الدعم الفني',
          message: 'تم الرد على تذكرتك في قسم الدعم الفني.'
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'update_status') {
      await adminSupabase.from('tickets').update({ status, updated_at: new Date().toISOString() }).eq('id', ticket_id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
