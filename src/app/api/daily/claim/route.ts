import { NextResponse } from 'next/server';
import { createSupabaseServerClient, createSupabaseAdminClient } from '@/lib/supabaseServer';

// ==========================================
// 🛠️ EDIT REWARDS HERE
// ==========================================
const DAILY_REWARDS = {
  BASE_COINS: 10,
  BOOSTED_COINS: 30,
  MYSTERY_CHEST_COINS: 100, // Rewarded on 5th consecutive boosted day
};
// ==========================================

export async function POST(req: Request) {
  try {
    const { type } = await req.json(); // 'base' or 'boosted'

    if (type !== 'base' && type !== 'boosted') {
      return NextResponse.json({ error: 'Invalid claim type.' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    // Initialize Admin Client to bypass RLS
    const adminSupabase = await createSupabaseAdminClient();

    // Fetch user profile
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('points_balance, last_daily_claim, daily_streak')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
       return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    const now = new Date();
    let currentStreak = profile.daily_streak || 0;
    
    // Date Logic
    if (profile.last_daily_claim) {
      const lastClaim = new Date(profile.last_daily_claim);
      const isSameDay = 
        lastClaim.getUTCFullYear() === now.getUTCFullYear() &&
        lastClaim.getUTCMonth() === now.getUTCMonth() &&
        lastClaim.getUTCDate() === now.getUTCDate();
      
      if (isSameDay) {
        return NextResponse.json({ error: 'You have already claimed your daily reward today.' }, { status: 400 });
      }

      // Check if they missed a day (Reset streak)
      const yesterday = new Date(now);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      
      const isYesterday = 
        lastClaim.getUTCFullYear() === yesterday.getUTCFullYear() &&
        lastClaim.getUTCMonth() === yesterday.getUTCMonth() &&
        lastClaim.getUTCDate() === yesterday.getUTCDate();

      if (!isYesterday) {
        currentStreak = 0; // Streak broken
      }
    }

    let rewardAmount = 0;
    let chestOpened = false;

    if (type === 'base') {
      rewardAmount = DAILY_REWARDS.BASE_COINS;
      currentStreak = 0; // Base claim doesn't build the boosted streak (or you can change this if you want it to!)
    } else if (type === 'boosted') {
      rewardAmount = DAILY_REWARDS.BOOSTED_COINS;
      currentStreak += 1;
      
      if (currentStreak >= 5) {
        rewardAmount += DAILY_REWARDS.MYSTERY_CHEST_COINS;
        chestOpened = true;
        currentStreak = 0; // Reset after chest
      }
    }

    // Add points
    const newBalance = profile.points_balance + rewardAmount;

    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ 
        points_balance: newBalance,
        last_daily_claim: now.toISOString(),
        daily_streak: currentStreak
      })
      .eq('id', user.id);

    if (updateError) {
       return NextResponse.json({ error: 'Database update failed. Make sure you ran the SQL command to add last_daily_claim and daily_streak columns.' }, { status: 500 });
    }

    return NextResponse.json({ 
       success: true, 
       pointsAdded: rewardAmount, 
       newBalance,
       newStreak: currentStreak,
       chestOpened
    }, { status: 200 });

  } catch (err: any) {
    console.error('Daily API Error:', err);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}
