/**
 * Telegram Bot Webhook Handler V2 (Enhanced)
 * Two-way communication with role detection and staff commands
 */

import { NextRequest } from 'next/server';
import OpenAI from 'openai';
import { 
  getOrCreateUserProfileServer,
  updateUserProfile,
  buildUserContextFromProfile
} from '@/lib/user-profile-db';
import {
  createConversationServer,
  addMessageToConversationServer,
  getConversationServer,
  type ConversationMessage
} from '@/lib/conversations-db';
import { trackEventServer } from '@/lib/analytics-db';
import { fetchMenuWithOptions } from '@/lib/supabase-data';
import {
  buildMenuContext,
  buildSystemPrompt,
  detectLanguage,
} from '@/lib/agent-helpers';
import {
  isStaffMember,
  sendTelegramMessage,
  sendTypingAction,
  processStaffCommand,
  getStaffCommandsHelp,
  getCustomerCommandsHelp,
  createProductKeyboard,
  formatOrderForTelegram,
} from '@/lib/telegram-bot-helpers';
import { getSupabaseServer } from '@/lib/supabase-client';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TelegramUpdate {
  update_id: number;
  message?: Record<string, unknown>;
  callback_query?: {
    id: string;
    from: Record<string, unknown>;
    message: Record<string, unknown>;
    data: string;
  };
}

/**
 * POST: Handle incoming Telegram updates
 */
export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const authHeader = request.headers.get('X-Telegram-Bot-Api-Secret-Token');
    const expectedSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    
    if (expectedSecret && authHeader !== expectedSecret) {
      console.error('⚠️ Invalid webhook secret');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const update: TelegramUpdate = await request.json();
    console.log('📥 Telegram update:', update.update_id);
    
    // Handle callback queries (inline button clicks)
    if (update.callback_query) {
      return await handleCallbackQuery(update.callback_query);
    }
    
    // Handle regular messages
    if (update.message) {
      return await handleMessage(update.message);
    }
    
    return Response.json({ ok: true });
    
  } catch (error) {
    console.error('❌ Error handling Telegram webhook:', error);
    return Response.json({ ok: true }); // Always return 200 to Telegram
  }
}

/**
 * Handle callback query (inline button click)
 */
async function handleCallbackQuery(callbackQuery: Record<string, unknown>) {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const telegramUserId = callbackQuery.from.id;
  
  console.log('🔘 Callback query:', data);
  
  // Answer callback query immediately
  await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/answerCallbackQuery`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ callback_query_id: callbackQuery.id }),
    }
  );
  
  // Parse callback data
  const [action, ...params] = data.split(':');
  
  switch (action) {
    case 'product':
      // User selected a product
      const productName = params.join(':');
      await sendTelegramMessage({
        chatId,
        text: `Great choice! Tell me how many grams of *${productName}* you'd like to order?`,
        parseMode: 'Markdown',
      });
      break;
    
    case 'order':
      // Staff managing order
      if (!isStaffMember(telegramUserId)) {
        await sendTelegramMessage({
          chatId,
          text: '❌ Unauthorized',
        });
        return Response.json({ ok: true });
      }
      
      const [orderAction, orderId] = params;
      await handleOrderAction(chatId, orderAction, orderId);
      break;
  }
  
  return Response.json({ ok: true });
}

/**
 * Handle order action by staff
 */
async function handleOrderAction(
  chatId: number,
  action: string,
  orderId: string
) {
  const statusMap: Record<string, string> = {
    confirm: 'confirmed',
    deliver: 'delivering',
    complete: 'completed',
    cancel: 'cancelled',
  };
  
  if (action === 'details') {
    const details = await formatOrderForTelegram(orderId);
    await sendTelegramMessage({ chatId, text: details, parseMode: 'Markdown' });
    return;
  }
  
  const newStatus = statusMap[action];
  if (!newStatus) return;
  
  // Update order status
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/orders`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId,
        status: newStatus,
        note: `Updated by staff via Telegram`,
      }),
    }
  );
  
  if (response.ok) {
    await sendTelegramMessage({
      chatId,
      text: `✅ Order updated to *${newStatus}*`,
      parseMode: 'Markdown',
    });
  } else {
    await sendTelegramMessage({
      chatId,
      text: `❌ Failed to update order`,
    });
  }
}

/**
 * Handle regular text message
 */
async function handleMessage(message: Record<string, unknown>) {
  const userMessage = message.text;
  if (!userMessage) return Response.json({ ok: true });
  
  const telegramUserId = message.from.id;
  const telegramUsername = message.from.username;
  const chatId = message.chat.id;
  const languageCode = message.from.language_code || 'en';
  
  const isStaff = isStaffMember(telegramUserId);
  
  console.log(`💬 Message from ${telegramUsername} (${telegramUserId})${isStaff ? ' [STAFF]' : ''}: ${userMessage.substring(0, 50)}...`);
  
  // Handle commands
  if (userMessage.startsWith('/')) {
    return await handleCommand(userMessage, chatId, telegramUserId, isStaff);
  }
  
  // Regular conversation - AI powered
  await sendTypingAction(chatId);

  // Quick product keyboard hint for customers
  if (!isStaff && /\b(menu|меню|каталог|прайс)\b/i.test(userMessage)) {
    const { rows: menuRows } = await fetchMenuWithOptions();
    const topNames = menuRows.map(r => r.Name).filter(Boolean).slice(0, 8);
    await sendTelegramMessage({
      chatId,
      text: 'Choose a product to discuss or order:',
      replyMarkup: createProductKeyboard(topNames as string[]),
    });
    return Response.json({ ok: true });
  }
  
  // Get or create user profile
  const userProfile = await getOrCreateUserProfileServer(
    undefined,
    telegramUserId
  );
  
  // Update Telegram username if changed
  if (telegramUsername && userProfile.telegram_username !== telegramUsername) {
    await updateUserProfile(userProfile.id, {
      telegram_username: telegramUsername,
    });
  }
  
  // Get or create conversation
  const { data: existingConversations } = await getSupabaseServer()
    .from('conversations')
    .select('*')
    .eq('user_profile_id', userProfile.id)
    .eq('channel', 'telegram')
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1);
  
  let conversationId: string;
  
  if (existingConversations && existingConversations.length > 0) {
    conversationId = existingConversations[0].id;
  } else {
    const newConversation = await createConversationServer(
      userProfile.id,
      'telegram',
      languageCode
    );
    conversationId = newConversation.id;
    
    await updateUserProfile(userProfile.id, {
      total_conversations: userProfile.total_conversations + 1,
    });
  }
  
  // Save user message
  const userMsg: ConversationMessage = {
    role: 'user',
    content: userMessage,
    timestamp: Date.now(),
    detectedLanguage: detectLanguage(userMessage),
  };
  
  await addMessageToConversationServer(conversationId, userMsg);
  await updateUserProfile(userProfile.id, {
    total_messages: userProfile.total_messages + 1,
  });
  
  // Track event
  await trackEventServer({
    userProfileId: userProfile.id,
    conversationId,
    eventType: 'chat_message',
    eventData: {
      message: userMessage.substring(0, 100),
      language: languageCode,
      platform: 'telegram',
      isStaff,
    },
    channel: 'telegram',
  });
  
  // Build AI response
  let systemPrompt: string;
  let menuContext: string | undefined;
  
  if (isStaff) {
    // Enhanced system prompt for staff with analytics access
    systemPrompt = buildStaffSystemPrompt(userProfile);
    
    // Staff can also ask about products
    const { rows: menuRows } = await fetchMenuWithOptions();
    menuContext = buildMenuContext(menuRows, false);
  } else {
    // Regular customer prompt
    const { rows: menuRows } = await fetchMenuWithOptions();
    menuContext = buildMenuContext(menuRows, false);
    const userContext = buildUserContextFromProfile(userProfile);
    
    systemPrompt = buildSystemPrompt({
      menuContext,
      userContext,
      useStock: true,
      language: userMsg.detectedLanguage,
    });
  }
  
  // Get conversation history
  const conversation = await getConversationServer(conversationId);
  const recentMessages = conversation?.messages.slice(-10) || [];
  
  // Call OpenAI
  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...recentMessages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ];
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages,
    temperature: 0.8,
    max_tokens: 400,
  });
  
  const reply = completion.choices[0]?.message?.content || 
    'Sorry, I had trouble processing that. Could you try again?';
  
  // Save assistant message
  const assistantMsg: ConversationMessage = {
    role: 'assistant',
    content: reply,
    timestamp: Date.now(),
  };
  
  await addMessageToConversationServer(conversationId, assistantMsg);
  
  // Send reply to Telegram
  await sendTelegramMessage({ chatId, text: reply, parseMode: 'Markdown' });
  
  console.log('✅ Telegram message handled successfully');
  
  return Response.json({ ok: true });
}

/**
 * Handle commands
 */
async function handleCommand(
  command: string,
  chatId: number,
  telegramUserId: number,
  isStaff: boolean
) {
  const [cmd, ...args] = command.split(' ');
  
  switch (cmd) {
    case '/start':
      const welcomeMessage = isStaff
        ? `👋 Welcome back, staff member!\n\n${getStaffCommandsHelp()}`
        : getWelcomeMessage('en');
      await sendTelegramMessage({ chatId, text: welcomeMessage, parseMode: 'Markdown' });
      break;
    
    case '/help':
      const helpMessage = isStaff
        ? getStaffCommandsHelp()
        : getCustomerCommandsHelp();
      await sendTelegramMessage({ chatId, text: helpMessage, parseMode: 'Markdown' });
      break;
    
    default:
      // Staff commands
      if (isStaff) {
        const response = await processStaffCommand(cmd, args, chatId);
        await sendTelegramMessage({ chatId, text: response, parseMode: 'Markdown' });
      } else {
        await sendTelegramMessage({
          chatId,
          text: 'Unknown command. Type /help for available commands.',
        });
      }
  }
  
  return Response.json({ ok: true });
}

/**
 * Build system prompt for staff members
 */
function buildStaffSystemPrompt(userProfile: Record<string, unknown>): string {
  return `You are the OG Lab AI Agent, now assisting a STAFF MEMBER.

You have access to real-time business data and can help with:
- Order management (status, details, history)
- Sales analytics and statistics
- Product performance data
- Customer information
- Operational insights

IMPORTANT INSTRUCTIONS:
1. You can answer questions about orders, sales, and analytics
2. You can help manage orders (confirm, deliver, complete, cancel)
3. Provide actionable insights and recommendations
4. Be professional and efficient
5. If asked about an order, provide the order number for quick lookup

AVAILABLE DATA:
- All orders and their status
- Real-time sales statistics
- Product performance metrics
- Customer analytics
- Conversation history

When asked about orders or statistics, provide clear, structured information.
Use emojis to make responses more readable.

Staff member: ${userProfile.user_id}
Language: Adapt to the language of the question`;
}

/**
 * Get welcome message
 */
function getWelcomeMessage(languageCode: string): string {
  const messages: Record<string, string> = {
    ru: `👋 Привет! Я AI-бадтендер OG Lab!

Я помогу тебе:
✅ Выбрать идеальный стрейн
✅ Узнать цены и наличие
✅ Оформить заказ с доставкой
✅ Ответить на вопросы о каннабисе

Просто напиши мне, что тебя интересует! 🌿`,
    
    en: `👋 Hey! I'm the OG Lab AI budtender!

I can help you:
✅ Choose the perfect strain
✅ Check prices and availability
✅ Place an order with delivery
✅ Answer cannabis questions

Just tell me what you're looking for! 🌿`,
    
    th: `👋 สวัสดี! ฉันคือ AI บัดเทนเดอร์ของ OG Lab!

ฉันช่วยคุณได้:
✅ เลือกสายพันธุ์ที่เหมาะสม
✅ ตรวจสอบราคาและสต็อก
✅ สั่งซื้อพร้อมบริการส่ง
✅ ตอบคำถามเกี่ยวกับกัญชา

แค่บอกฉันว่าคุณสนใจอะไร! 🌿`,
  };
  
  return messages[languageCode] || messages.en;
}

/**
 * GET: Webhook verification
 */
export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'OG Lab Telegram Bot V2 (Enhanced)',
    features: [
      'Role detection (staff/customer)',
      'Staff commands',
      'Inline keyboards',
      'Order management',
      'AI-powered responses',
    ],
    timestamp: new Date().toISOString(),
  });
}

