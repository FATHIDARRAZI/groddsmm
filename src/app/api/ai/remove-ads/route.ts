import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const systemPrompt = `أنت المساعد الذكي لوكالة Grodd Media. مهمتك هي إقناع المستخدم ومساعدته في فهم مميزات خدمة "إزالة الإعلانات" (Remove Ads) المتاحة في المنصة والإجابة على استفساراته بلغة عربية احترافية، ودودة ومقنعة.

مميزات خدمة إزالة الإعلانات:
1. تجربة خالية تماماً من الإعلانات (100% Ad-Free): تصفح سريع وسلس بدون أي بنرات إعلانية أو نوافذ منبثقة مزعجة.
2. إلغاء فترة الانتظار (No Cooldown): بدلاً من الانتظار دقيقتين بين كل طلب مجاني والآخر، يتم إلغاء هذا الانتظار تماماً لطلب متكرر وفوري.
3. تخطي شاشة الرعاية (No Sponsor Screens): لن يحتاج المستخدم للانتظار 30 ثانية لمشاهدة إعلانات الرعاة قبل إطلاق حملته، حيث يتم تفعيل الطلب فوراً.
4. دعم فني ذكي وVIP: أولوية قصوى لحل أي مشكلة وتجهيز الطلبات بسرعة مضاعفة.

السعر والتفعيل:
- السعر هو 50 درهم مغربي فقط (50 MAD) كدفعة لمرة واحدة لتفعيل دائم.
- طريقة التفعيل والدفع: تواصل معنا عبر حسابنا الرسمي والوحيد على الإنستغرام @grodd_media (https://www.instagram.com/grodd_media/)- بمجرد الدفع وإرسال لقطة شاشة للتحويل واسم المستخدم أو معرفه (UID)، يقوم المسؤول بتفعيل الخدمة لحسابه فوراً وبشكل دائم.

شروط مهمة:
- تحدث فقط باللغة العربية بأسلوب راقٍ ومهذب ومقنع.
- حافظ على ردودك موجزة ومباشرة وتجنب الإطالة غير الضرورية.
- وجّه المستخدم دائماً وبشكل واضح إلى رابط الإنستغرام @grodd_media للشراء والتفعيل.
- لا تقدم أي وعود خارج نطاق مميزات الخدمة المذكورة أعلاه.

تنسيق الاستجابة (RESPONSE FORMAT - JSON):
يجب أن ترجع الاستجابة ككائن JSON صالح يحتوي على مفتاح "reply" فقط، كالتالي:
{
  "reply": "نص إجابتك هنا باللغة العربية"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      response_format: { type: "json_object" }
    });

    // We request response_format JSON, so we expect a JSON string like {"reply": "..."}
    const content = completion.choices[0].message.content || '{}';
    return NextResponse.json(JSON.parse(content));
  } catch (error: any) {
    console.error('AI Remove Ads Error:', error);
    // Fallback response format if JSON parsing or OpenAI fails
    return NextResponse.json({ 
      reply: 'عذراً، واجهت مشكلة في الاتصال بالمساعد الذكي حالياً. يمكنك تفعيل ميزة إزالة الإعلانات مباشرة بمراسلتنا على الإنستغرام @grodd_media!' 
    });
  }
}
