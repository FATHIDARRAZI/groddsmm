import { NextResponse } from 'next/server';
import { ProxyAgent, fetch as undiciFetch } from 'undici';

const proxyUrl = 'http://rpW0KdeSoIywvifr:VkSkxqGz0xJb1om8@geo.iproyal.com:12321';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ success: false, error: 'Username is required' }, { status: 400 });
    }

    // Clean username (remove @ and whitespace)
    const cleanUsername = username.replace('@', '').trim();
    
    // We are using IPRoyal Proxy as requested by the user
    const client = new ProxyAgent(proxyUrl);
    
    const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
    
    const res = await undiciFetch(url, {
      dispatcher: client,
      headers: {
        'x-ig-app-id': '936619743392459',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      }
    });

    if (res.status !== 200) {
      console.error('IG Fetch failed with status:', res.status);
      return NextResponse.json({ success: false, error: 'لم يتم العثور على الحساب أو الحساب خاص.' });
    }

    const data = await res.json() as any;

    if (data?.data?.user) {
      const user = data.data.user;
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
  } catch (error) {
    console.error('IG API Error:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء جلب بيانات الحساب' }, { status: 500 });
  }
}
