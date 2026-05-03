import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { action, payload, messages } = await req.json();

    // ACTION: LINK VALIDATION
    if (action === 'validate_link') {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an SMM Link Validator. Analyze the URL and return JSON: { platform: string, type: 'post'|'reel'|'profile'|'video'|'unknown', isPrivatePossible: boolean, message: string (Arabic) }."
          },
          { role: "user", content: `Analyze: ${payload.link}` }
        ],
        response_format: { type: "json_object" }
      });
      return NextResponse.json(JSON.parse(completion.choices[0].message.content || '{}'));
    }

    // ACTION: CONVERSATIONAL AGENT
    if (action === 'agent') {
      const { userPoints, currentOrderData } = payload;
      
      const systemPrompt = `You are an SMM order assistant. Your ONLY goal is to convert user messages into valid SMM orders.
      
      USER CONTEXT:
      - Current Points Balance: ${userPoints}
      - Current Order Info Gathered: ${JSON.stringify(currentOrderData)}
      
      Rules:
      - Be direct, short, and transactional. Speak in Arabic.
      - Do NOT chat casually.
      - Always guide the user step by step to complete an order.
      - If user input is unclear → ask for specific missing data.
      - Never assume data.

      Order Requirements:
      - Platform (Instagram, TikTok, YouTube, etc.)
      - Service (likes, followers, views, comments)
      - Link (must be valid URL)
      - Quantity (numeric, ensure it costs less than or equal to their ${userPoints} points)

      Flow:
      1. Detect user intent (what service they want).
      2. Ask ONLY for missing fields.
      3. Validate inputs:
         - Reject invalid links.
         - Reject unrealistic quantities.
      4. Once all data is collected:
         - Summarize order:
           Platform:
           Service:
           Link:
           Quantity:
      5. Ask for confirmation ("Confirm order? Yes/No" or Arabic equivalent)

      After confirmation:
      - Set "isReadyToOrder" to true so the system can process it.

      Error handling:
      - If user sends random message → redirect:
        "Send your post link or choose a service."
      - If the user asks for status or "where is my order", set "isTrackingRequested" to true and extract the order ID if present.

      Tone:
      - Confident
      - Slightly aggressive
      - No emojis except 🚀
      
      RESPONSE FORMAT (JSON):
      {
        "reply": "Your message to the user in Arabic",
        "updatedOrderData": { "type": "likes"|"views", "link": "...", "quantity": number },
        "isReadyToOrder": boolean,
        "isTrackingRequested": boolean,
        "extractedOrderId": "string or null"
      }`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        response_format: { type: "json_object" }
      });

      return NextResponse.json(JSON.parse(completion.choices[0].message.content || '{}'));
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'AI processing failed' }, { status: 500 });
  }
}
