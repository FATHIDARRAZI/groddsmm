const { ProxyAgent, fetch: undiciFetch } = require('undici');

const client = new ProxyAgent('http://rpW0KdeSoIywvifr:VkSkxqGz0xJb1om8@geo.iproyal.com:12321');

async function testFetch() {
  const username = 'cristiano';
  const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
  
  try {
    console.log('Fetching', url);
    const response = await undiciFetch(url, {
      dispatcher: client,
      headers: {
        'x-ig-app-id': '936619743392459',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin'
      }
    });
    
    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response body length:', text.length);
    console.log('Sample:', text.substring(0, 200));
  } catch(e) {
    console.error('Fetch error:', e);
  }
}
testFetch();
