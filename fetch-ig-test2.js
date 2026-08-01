const { ProxyAgent, fetch: undiciFetch } = require('undici');

const client = new ProxyAgent('http://rpW0KdeSoIywvifr:VkSkxqGz0xJb1om8@geo.iproyal.com:12321');

async function testFetch() {
  const shortcode = 'DB11Wbjo6J2'; // Just an example, let's try a random CR7 post
  // Actually I don't know a valid recent shortcode off hand. Let's just fetch the profile first, get a shortcode, then fetch it.
  const profileUrl = `https://i.instagram.com/api/v1/users/web_profile_info/?username=cristiano`;
  
  try {
    const profileRes = await undiciFetch(profileUrl, {
      dispatcher: client,
      headers: {
        'x-ig-app-id': '936619743392459',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      }
    });
    const profileData = await profileRes.json();
    const edges = profileData.data?.user?.edge_owner_to_timeline_media?.edges || [];
    if (edges.length > 0) {
      const code = edges[0].node.shortcode;
      console.log('Found post shortcode:', code);
      const postUrl = `https://www.instagram.com/graphql/query/?query_hash=b3055c01b4b222b8a47dc12b090e4e64&variables={"shortcode":"${code}"}`;
      const postRes = await undiciFetch(postUrl, {
        dispatcher: client,
        headers: {
          'x-ig-app-id': '936619743392459',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        }
      });
      console.log('Post Status:', postRes.status);
      const postText = await postRes.text();
      console.log('Post response:', postText.substring(0, 200));
    }
  } catch(e) {
    console.error('Fetch error:', e);
  }
}
testFetch();
