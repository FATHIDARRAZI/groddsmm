import { NextResponse } from 'next/server';
import { ProxyAgent, fetch as undiciFetch } from 'undici';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

const proxyUrl = process.env.IG_PROXY_URL || '';

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    // Allowed for both anonymous (public page) and authenticated users

    const { username } = await request.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    // Clean username (remove @ and whitespace)
    const cleanUsername = username.replace('@', '').trim();
    if (!/^[a-zA-Z0-9._]+$/.test(cleanUsername)) {
      return NextResponse.json({ success: false, error: 'Invalid username format' }, { status: 400 });
    }

    if (!proxyUrl) {
      return NextResponse.json({ success: false, error: 'Missing IG_PROXY_URL in Vercel. Please add it in your Vercel Dashboard.' }, { status: 500 });
    }
    
    // We are using IPRoyal Proxy as requested by the user
    const client = new ProxyAgent(proxyUrl);
    
    const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
    
    // Fire 5 requests in parallel to guarantee one clean proxy IP hits and returns quickly
    const fetchPromises = Array.from({ length: 5 }).map(async (_, i) => {
      const client = new ProxyAgent(proxyUrl); // Creates a new agent, potentially triggering IP rotation
      const res = await undiciFetch(url, {
        dispatcher: client,
        headers: {
          'x-ig-app-id': '936619743392459',
          'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.${Math.floor(Math.random()*100)} Safari/537.36`,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        }
      });
      if (res.status === 200) {
        return await res.json();
      }
      throw new Error(`Status ${res.status}`);
    });

    let data;
    try {
      data = await Promise.any(fetchPromises);
    } catch (aggregateError: any) {
      console.error('All IG Profile fetches failed:', aggregateError.errors);
      const errMsgs = aggregateError.errors ? aggregateError.errors.map((e: any) => e.message).join(', ') : aggregateError.message;
      return NextResponse.json({ success: false, error: `خطأ في الاتصال: ${errMsgs}` });
    }

    const typedData = data as any;
    if (typedData?.data?.user) {
      const user = typedData.data.user;
      const isPrivate = user.is_private === true;
      const errorMessage = 'هذا الحساب خاص (Private). يرجى تحويل الحساب إلى عام (Public) وإعادة المحاولة لاحقاً.';

      const rawProfilePic = user.profile_pic_url_hd || user.profile_pic_url || '';
      const proxiedProfilePic = rawProfilePic 
        ? `/api/proxy-image?url=${encodeURIComponent(rawProfilePic)}` 
        : '';
        
      // Extract recent posts
      const edges = user.edge_owner_to_timeline_media?.edges || [];
      const recentPosts = edges.map((edge: any) => {
        const node = edge.node;
        const postImg = node.display_url || node.thumbnail_src || '';
        return {
          id: node.id,
          shortcode: node.shortcode,
          url: `https://instagram.com/p/${node.shortcode}/`,
          thumbnail: postImg ? `/api/proxy-image?url=${encodeURIComponent(postImg)}` : '',
          likes: node.edge_media_preview_like?.count || 0,
          comments: node.edge_media_to_comment?.count || 0,
          isVideo: node.is_video,
          views: node.video_view_count || 0
        };
      });

      return NextResponse.json({
        success: true,
        data: {
          username: user.username,
          full_name: user.full_name,
          profile_pic: proxiedProfilePic,
          followers: user.edge_followed_by?.count || 0,
          following: user.edge_follow?.count || 0,
          posts: user.edge_owner_to_timeline_media?.count || 0,
          is_private: isPrivate,
          private_error_message: errorMessage,
          recent_posts: recentPosts
        }
      });
    }

    return NextResponse.json({ success: false, error: 'لم يتم العثور على الحساب. يرجى التأكد من اسم المستخدم.' });
  } catch (error: any) {
    console.error('IG API Error:', error);
    return NextResponse.json({ success: false, error: `حدث خطأ أثناء جلب بيانات الحساب: ${error.message}` }, { status: 500 });
  }
}
