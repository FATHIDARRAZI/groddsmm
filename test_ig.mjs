import { ProxyAgent, fetch as undiciFetch } from 'undici';

const proxyUrl = 'http://rpW0KdeSoIywvifr:VkSkxqGz0xJb1om8@geo.iproyal.com:12321';
const sessionId = '48595278422%3ASJnei0jdyuga4r%3A19%3AAYhXqZCYt_6ZZlg-ZW5rhGuQjndQtsFtzQMnAOP3kQ';

async function run() {
  const cleanUsername = 'instagram';
  const url = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${cleanUsername}`;
  
  try {
      const client = new ProxyAgent(proxyUrl);
      console.log('Fetching:', url);
      const res = await undiciFetch(url, {
        dispatcher: client,
        headers: {
          'x-ig-app-id': '936619743392459',
          'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.12 Safari/537.36`,
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin'
        }
      });
      
      console.log('Status:', res.status);
      const text = await res.text();
      console.log('Response body:', text.substring(0, 500));
  } catch (err) {
      console.error('Error:', err);
  }
}

run();
