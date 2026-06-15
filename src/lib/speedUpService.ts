import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function sendSpeedUpRequest(orderId: string, serviceType: string, link: string) {
  try {
    const idInstance = process.env.GREEN_API_ID_INSTANCE;
    const apiTokenInstance = process.env.GREEN_API_TOKEN_INSTANCE;
    const apiUrl = process.env.GREEN_API_URL || 'https://api.green-api.com';
    const providerNumber = process.env.PROVIDER_WHATSAPP_NUMBER;

    if (!idInstance || !apiTokenInstance || !providerNumber) {
      console.warn('Green API credentials or provider number missing. Speed-up request skipped.');
      return false;
    }

    // 1. Generate polite message with OpenAI
    const prompt = `Write a very short, polite, and professional message in English to a social media panel provider. 
The message should ask them to kindly speed up a specific order because the client is waiting.
Order Details:
- Order ID: ${orderId}
- Service Type: ${serviceType}
- Target Link: ${link}

Keep it under 3 sentences. Don't use placeholders. Use a friendly tone.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7,
    });

    const generatedMessage = response.choices[0].message?.content?.trim();

    if (!generatedMessage) {
      throw new Error('Failed to generate speed-up message from OpenAI.');
    }

    // 2. Send via Green API
    // The chatId must end with @c.us for regular numbers (e.g. 212600000000@c.us)
    const chatId = `${providerNumber.replace(/\D/g, '')}@c.us`;

    const greenApiEndpoint = `${apiUrl}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;
    
    const res = await fetch(greenApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: chatId,
        message: generatedMessage,
      }),
    });

    const data = await res.json();
    
    if (data && data.idMessage) {
      console.log(`[SpeedUpService] Successfully sent speed-up request for Order #${orderId}`);
      return true;
    } else {
      console.error('[SpeedUpService] Green API Error:', data);
      return false;
    }
  } catch (error) {
    console.error('[SpeedUpService] Internal Error:', error);
    return false;
  }
}
