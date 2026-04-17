import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const adminSupabase = await createSupabaseAdminClient();
    const { data: users, error } = await adminSupabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const { action, targetUserId, amount, isBanned } = body;
    const adminSupabase = await createSupabaseAdminClient();

    if (action === 'adjust_balance') {
      const { data: targetProfile } = await adminSupabase.from('profiles').select('points_balance').eq('id', targetUserId).single();
      if (!targetProfile) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      
      const newBalance = (targetProfile.points_balance || 0) + amount;
      await adminSupabase.from('profiles').update({ points_balance: newBalance }).eq('id', targetUserId);
      
      return NextResponse.json({ success: true, newBalance });
    }

    if (action === 'set_ban_status') {
      // Security: Check if target user is an admin before banning
      const { data: targetProfile } = await adminSupabase.from('profiles').select('is_admin').eq('id', targetUserId).single();
      if (targetProfile?.is_admin) {
        return NextResponse.json({ error: 'لا يمكن حظر حساب المسؤول (Cannot ban an administrator)' }, { status: 403 });
      }

      await adminSupabase.from('profiles').update({ is_banned: isBanned }).eq('id', targetUserId);
      return NextResponse.json({ success: true });
    }

    if (action === 'create_user') {
      const { email, password, fullName } = body;
      if (!email || !password || !fullName) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

      // 1. Create Auth User
      const { data: authUser, error: authError } = await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName }
      });

      if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

      // 2. Create Profile (Upsert handles cases where a DB trigger already created the row)
      const { error: profileError } = await adminSupabase.from('profiles').upsert({
        id: authUser.user.id,
        full_name: fullName,
        points_balance: 0,
        is_admin: false,
        is_banned: false
      });

      if (profileError) {
        // Cleanup Auth user if profile fails
        await adminSupabase.auth.admin.deleteUser(authUser.user.id);
        return NextResponse.json({ error: profileError.message }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'delete_user') {
      // Security: Check if target user is an admin before deleting
      const { data: targetProfile } = await adminSupabase.from('profiles').select('is_admin').eq('id', targetUserId).single();
      if (targetProfile?.is_admin) {
        return NextResponse.json({ error: 'لا يمكن حذف حساب المسؤول (Cannot delete an administrator)' }, { status: 403 });
      }

      // 1. Delete Auth User
      const { error: authError } = await adminSupabase.auth.admin.deleteUser(targetUserId);
      if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

      // 2. Delete Profile (even if cascade exists, a manual delete ensures synchronization)
      await adminSupabase.from('profiles').delete().eq('id', targetUserId);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
