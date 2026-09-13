const { fetch, ProxyAgent } = require('undici');

async function test() {
  const userId = '232192182'; // therock
  const proxyUrl = 'http://rpW0KdeSoIywvifr:VkSkxqGz0xJb1om8@geo.iproyal.com:12321';
  const sessionId = '71131349079%3AT2z5K1K8aVpX3U%3A25%3AAYf3m5tW_-Z0tK-7Pms85H-sYJ1Q84lD9sY6y0qYvA';
  
  try {
    const client = new ProxyAgent(proxyUrl);
    const postRes = await fetch(`https://i.instagram.com/api/v1/feed/user/${userId}/?count=12`, {
      dispatcher: client,
      headers: {
        'User-Agent': 'Instagram 219.0.0.12.117 Android',
        'Cookie': `sessionid=${sessionId}`,
        'x-ig-app-id': '936619743392459',
        'Accept': '*/*',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      }
    });
    
    console.log('Status:', postRes.status);
    const data = await postRes.text();
    console.log(data.substring(0, 300));
    
  } catch (err) {
    console.error('Fetch error:', err.message);
  }
}

test();
