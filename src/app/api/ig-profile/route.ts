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

    const scrapeToken = process.env.SCRAPE_DO_TOKEN || '';
    if (!scrapeToken) {
      return NextResponse.json({ success: false, error: 'api_limit_reached' });
    }

    const targetUrl = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
    const url = `http://api.scrape.do?token=${scrapeToken}&url=${encodeURIComponent(targetUrl)}`;
    
    let data: any;
    let fetchError = '';
    
    try {
      const headers: Record<string, string> = {
        'x-ig-app-id': '936619743392459',
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.${Math.floor(Math.random()*100)} Safari/537.36`,
      };

      const res = await undiciFetch(url, { headers });

      if (res.status === 200) {
        data = await res.json();
      } else {
        fetchError = `Status ${res.status}`;
      }
    } catch (err: any) {
      fetchError = err.message;
    }

    if (!data || !data.data || !data.data.user) {
      console.error('IG Profile scrape.do failed:', fetchError);
      return NextResponse.json({ success: false, error: 'api_limit_reached' });
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
