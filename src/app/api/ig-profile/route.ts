import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    // Clean username (remove @ and whitespace)
    const cleanUsername = username.replace('@', '').trim();

    const res = await fetch('https://instagram120.p.rapidapi.com/api/instagram/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'instagram120.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPIDAPI_KEY || 'f210407f75mshc2c1b1ef790a7fbp109dbdjsn52ae80fe8f74'
      },
      body: JSON.stringify({ username: cleanUsername })
    });

    const data = await res.json();

    if (data.result) {
      let isPrivate = data.result.is_private === true;
      let errorMessage = 'هذا الحساب خاص (Private). يرجى تحويل الحساب إلى عام (Public) وإعادة المحاولة لاحقاً.';

      // Check with OpenAI if key is configured
      if (process.env.OPENAI_API_KEY) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an Instagram Profile Analyzer. Based on the provided raw JSON data of a profile, determine if it is a private account. If the 'is_private' field is true, or if there is other clear evidence, return JSON: { \"isPrivate\": true, \"message\": \"هذا الحساب خاص (Private). يرجى تحويل الحساب إلى عام (Public) وإعادة المحاولة لاحقاً.\" }. Otherwise, return { \"isPrivate\": false, \"message\": \"\" }."
              },
              { role: "user", content: JSON.stringify(data.result) }
            ],
            response_format: { type: "json_object" }
          });

          const aiResult = JSON.parse(completion.choices[0].message.content || '{}');
          if (typeof aiResult.isPrivate === 'boolean') {
            isPrivate = aiResult.isPrivate;
          }
          if (aiResult.message) {
            errorMessage = aiResult.message;
          }
        } catch (openaiErr) {
          console.error('OpenAI profile check error:', openaiErr);
        }
      }

      // Remove immediate blocking return; pass flags to client to validate upon confirmation
      const rawProfilePic = data.result.profile_pic_url || data.result.profile_pic_url_hd || '';
      const proxiedProfilePic = rawProfilePic 
        ? `/api/proxy-image?url=${encodeURIComponent(rawProfilePic)}` 
        : '';

      return NextResponse.json({
        success: true,
        data: {
          username: data.result.username,
          full_name: data.result.full_name,
          profile_pic: proxiedProfilePic,
          followers: data.result.edge_followed_by?.count || 0,
          following: data.result.edge_follow?.count || 0,
          posts: data.result.edge_owner_to_timeline_media?.count || 0,
          is_private: isPrivate,
          private_error_message: errorMessage
        }
      });
    }

    return NextResponse.json({ success: false, error: 'لم يتم العثور على الحساب. يرجى التأكد من اسم المستخدم.' });
  } catch (error) {
    console.error('IG API Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء جلب بيانات الحساب' }, { status: 500 });
  }
}
