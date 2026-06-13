import { NextResponse } from 'next/server';
import { getCooldownEnd, setCooldown } from '@/lib/cooldown';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const SMM_API_KEY = process.env.SMM_API_KEY || '';
const SMM_API_URL = 'https://bestsmmprovider.com/api/v2';
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

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

    // Securely calculate expected points to deduct
    const pointsToDeduct = serviceType === 'followers'
      ? finalQuantity * 2
      : serviceType === 'views'
        ? Math.ceil(finalQuantity / 50)
        : finalQuantity;

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
    } else {
      // AUTHENTICATED: Enforce Points Balance logic
      const { data: profile } = await supabase
        .from('profiles')
        .select('points_balance')
        .eq('id', user.id)
        .single();

      if (!profile || profile.points_balance < pointsToDeduct) {
        return NextResponse.json({ error: 'رصيد النقاط غير كافي' }, { status: 402 }); // Insufficient payment
      }
    }


    // Verify Cloudflare Turnstile Token (reCAPTCHA kept as fallback in comments)
    /* 
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY || '';
    const formData = new URLSearchParams();
    formData.append('secret', recaptchaSecret);
    formData.append('response', recaptchaToken);

    const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body: formData,
    });
    */

    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY || '';
    const formData = new URLSearchParams();
    formData.append('secret', turnstileSecret);
    formData.append('response', recaptchaToken); // The variable is still called recaptchaToken for backward compatibility

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.json({ error: 'التحقق البشري غير صالح' }, { status: 403 });
    }

    let serviceId = '';

    if (category === 'instagram' && serviceType === 'followers') {
      serviceId = '758';
    } else if (category === 'instagram' && serviceType === 'likes') {
      serviceId = '917';
    } else if (category === 'instagram' && serviceType === 'views') {
      serviceId = '2020';
    } else if (category === 'tiktok' && serviceType === 'likes') {
      serviceId = '2651';
    } else if (category === 'tiktok' && serviceType === 'followers') {
      serviceId = '3764';
    } else if (category === 'tiktok' && serviceType === 'views') {
      serviceId = '3944';
    } else if (category === 'facebook' && serviceType === 'followers') {
      serviceId = '2112';
    } else {
      return NextResponse.json({ error: 'This specific service is not available for this platform.' }, { status: 400 });
    }




    const smmLink = link.includes('http') ? link : `https://${link}`;

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
      return NextResponse.json({ error: 'تعذر إرسال الطلب في الوقت الحالي' }, { status: 500 });
    }

    if (smmData.order) {
      const providerOrderId = smmData.order;

      // POST-ORDER PROCESSING LOGIC
      if (user) {

        
        // Decrement wallet balance safely
        await supabase.rpc('decrement_points', {
          user_id: user.id,
          amount: pointsToDeduct
        });

        // The RPC might not exist yet, so we'll fallback to a raw update if needed
        // Since we are Server-side with Anon Key, row level security allows 'update' using eq('id').
        // Wait, safest fallback without RPC:
        const { data: profileObj } = await supabase.from('profiles').select('points_balance').eq('id', user.id).single();
        if (profileObj) {
           await supabase.from('profiles').update({ points_balance: profileObj.points_balance - pointsToDeduct }).eq('id', user.id);
        }

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

        return NextResponse.json({ success: true, message: 'تم إرسال الطلب بنجاح وتم خصم النقاط' }, { status: 200 });

      } else {
        // Anonymous Flow: Enforce subsequent cooldown block
        // Fetch dynamic cooldown value from settings
        let cooldownMinutes = 2; // Default fallback
        try {
          const { data: setting } = await supabase.from('system_settings').select('value').eq('key', 'order_cooldown_minutes').single();
          if (setting && typeof setting.value === 'number') {
            cooldownMinutes = setting.value;
          }
        } catch (e) {
          console.error('Failed to fetch cooldown setting');
        }

        await setCooldown(ip, cooldownMinutes);
        return NextResponse.json({ success: true, message: 'Request submitted successfully' }, { status: 200 });
      }
    }

    return NextResponse.json({ error: 'Unexpected response from provider' }, { status: 500 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
