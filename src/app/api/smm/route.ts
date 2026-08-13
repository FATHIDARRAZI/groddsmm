import { NextResponse } from 'next/server';
import { getCooldownEnd, setCooldown } from '@/lib/cooldown';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import { sendSpeedUpRequest } from '@/lib/speedUpService';

const SMM_API_KEY = process.env.SMM_API_KEY || '';
const SMM_API_URL = 'https://bestsmmprovider.com/api/v2';
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();
const userLocks = new Map<string, boolean>();

export async function POST(req: Request) {
  try {
    // Basic IP rate limiting (simplified for MVP)
    const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const ip = rawIp.split(',')[0].trim();

    const body = await req.json();
    const { link, serviceType, category, recaptchaToken, quantity: requestedQuantity } = body;

    if (!link || !serviceType || !recaptchaToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine target quantity
    const finalQuantity = typeof requestedQuantity === 'number' && requestedQuantity >= 10 ? requestedQuantity : 100;

    // 1. Session & Auth Check
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Gateway Branching (Anonymous Free vs Authenticated Paid)
    if (!user) {
      // ANONYMOUS: Enforce 2-Minute Cooldown logic
      const cooldownEnd = await getCooldownEnd(ip);
      if (cooldownEnd) {
        return NextResponse.json(
          { error: 'User is on cooldown', cooldownEnd },
          { status: 429 }
        );
      }

      const now = Date.now();
      const rt = rateLimitMap.get(ip);
      if (rt && now - rt.timestamp < RATE_LIMIT_WINDOW) {
        if (rt.count >= MAX_REQUESTS) {
          return NextResponse.json({ error: 'Rate limit exceeded. Try again later.' }, { status: 429 });
        }
        rt.count++;
      } else {
        rateLimitMap.set(ip, { count: 1, timestamp: now });
      }
    }
    
    if (user) {
      if (userLocks.get(user.id)) {
        return NextResponse.json({ error: 'الرجاء الانتظار، جاري معالجة طلبك السابق' }, { status: 429 });
      }
      userLocks.set(user.id, true);
    }

    try {
      // Verify Turnstile
      const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || '';
      const formData = new URLSearchParams();
      formData.append('secret', turnstileSecret);
      formData.append('response', recaptchaToken);

      const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      });

      const verifyData = await verifyRes.json();
      if (!verifyData.success) {
        return NextResponse.json({ error: 'التحقق البشري غير صالح' }, { status: 403 });
      }

      // Fetch dynamic service configuration
      const { data: serviceConfig, error: configError } = await supabase
        .from('services')
        .select('provider_service_id, min_quantity, max_quantity, is_active, provider_cost_per_1000, markup_multiplier')
        .eq('category', category)
        .eq('service_type', serviceType)
        .single();

      if (configError || !serviceConfig) {
        console.error("Service config fetch error:", configError);
        return NextResponse.json({ error: 'الخدمة غير متوفرة حالياً' }, { status: 400 });
      }

      if (!serviceConfig.is_active) {
        return NextResponse.json({ error: 'هذه الخدمة معطلة حالياً. الرجاء المحاولة لاحقاً.' }, { status: 400 });
      }

      if (finalQuantity < serviceConfig.min_quantity) {
        return NextResponse.json({ error: `الحد الأدنى للطلب هو ${serviceConfig.min_quantity}` }, { status: 400 });
      }

      if (finalQuantity > serviceConfig.max_quantity) {
        return NextResponse.json({ error: `الحد الأقصى للطلب هو ${serviceConfig.max_quantity}` }, { status: 400 });
      }

      // Dynamic Pricing Calculation
      // Default fallback values if not set in DB
      const providerCostPer1000 = serviceConfig.provider_cost_per_1000 || 0.10; 
      const markupMultiplier = serviceConfig.markup_multiplier || 3.0;
      const EXCHANGE_RATE = 1000; // 1 Dollar = 1000 Coins

      // Formula: (Quantity / 1000) * Provider Cost * Exchange Rate * Markup
      const rawCost = (finalQuantity / 1000) * providerCostPer1000 * EXCHANGE_RATE * markupMultiplier;
      const pointsToDeduct = Math.ceil(rawCost); // Round up to nearest coin

      if (user) {
        // AUTHENTICATED: Enforce Points Balance logic
        const { data: profile } = await supabase
          .from('profiles')
          .select('points_balance')
          .eq('id', user.id)
          .single();

        if (!profile || profile.points_balance < pointsToDeduct) {
          return NextResponse.json({ error: 'رصيد النقاط غير كافي' }, { status: 402 });
        }
      }

      const serviceId = serviceConfig.provider_service_id;
      const smmLink = link.includes('http') ? link : `https://${link}`;

      // PRE-ORDER: Deduct Points First to prevent free orders if SMM API hangs or fails
      if (user) {
        const { error: rpcError } = await supabase.rpc('decrement_points', {
          user_id: user.id,
          amount: pointsToDeduct
        });

        if (rpcError) {
           // Fallback to manual update if RPC is missing
           const { data: profileObj } = await supabase.from('profiles').select('points_balance').eq('id', user.id).single();
           if (profileObj && profileObj.points_balance >= pointsToDeduct) {
              await supabase.from('profiles').update({ points_balance: profileObj.points_balance - pointsToDeduct }).eq('id', user.id);
           } else {
              return NextResponse.json({ error: 'خطأ في خصم النقاط' }, { status: 500 });
           }
        }
      }

      const params = new URLSearchParams({
        key: SMM_API_KEY,
        action: 'add',
        service: serviceId,
        link: smmLink,
        quantity: finalQuantity.toString()
      });

      const smmRes = await fetch(SMM_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString()
      });

      const smmData = await smmRes.json();

      if (smmData.error) {
        console.error('SMM Panel Error:', smmData.error);
        // REFUND POINTS
        if (user) {
           const { error: refundRpcError } = await supabase.rpc('increment_points', { user_id: user.id, amount: pointsToDeduct });
           if (refundRpcError) {
              const { data: profileObj } = await supabase.from('profiles').select('points_balance').eq('id', user.id).single();
              if (profileObj) {
                 await supabase.from('profiles').update({ points_balance: profileObj.points_balance + pointsToDeduct }).eq('id', user.id);
              }
           }
        }
        return NextResponse.json({ error: 'تعذر إرسال الطلب في الوقت الحالي' }, { status: 500 });
      }

      if (smmData.order) {
        const providerOrderId = smmData.order;

        if (user) {
          // Insert mapped history log
          await supabase.from('orders').insert({
            user_id: user.id,
            provider_order_id: providerOrderId.toString(),
            service_type: serviceType,
            link: smmLink,
            quantity: finalQuantity,
            points_cost: pointsToDeduct,
            status: 'Pending'
          });

          sendSpeedUpRequest(providerOrderId.toString(), serviceType, smmLink).catch(console.error);
          return NextResponse.json({ success: true, message: 'تم إرسال الطلب بنجاح وتم خصم النقاط' }, { status: 200 });

        } else {
          // Anonymous Flow: Enforce subsequent cooldown block
          let cooldownMinutes = 2;
          try {
            const { data: setting } = await supabase.from('system_settings').select('value').eq('key', 'order_cooldown_minutes').single();
            if (setting && typeof setting.value === 'number') {
              cooldownMinutes = setting.value;
            }
          } catch (e) {
            console.error('Failed to fetch cooldown setting');
          }

          await setCooldown(ip, cooldownMinutes);
          sendSpeedUpRequest(providerOrderId.toString(), serviceType, smmLink).catch(console.error);

          return NextResponse.json({ success: true, message: 'Request submitted successfully' }, { status: 200 });
        }
      }

      return NextResponse.json({ error: 'Unexpected response from provider' }, { status: 500 });

    } finally {
      if (user) userLocks.delete(user.id);
    }

    return NextResponse.json({ error: 'Unexpected response from provider' }, { status: 500 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
