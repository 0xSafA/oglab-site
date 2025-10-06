import { NextRequest, NextResponse } from 'next/server';

/**
 * Telegram Notification API
 * Отправляет уведомления от агента в Telegram чат персонала
 */

// Типы уведомлений
export type NotificationType = 'order' | 'wish' | 'feedback' | 'staff_question' | 'general';

interface TelegramNotificationRequest {
  type: NotificationType;
  message: string;
  userId?: string;
  userContext?: {
    totalVisits?: number;
    totalMessages?: number;
    favoriteStrains?: string[];
    preferredEffects?: string[];
    language?: string;
  };
  products?: string[];
  quantity?: string;
  totalAmount?: number;
  breakdown?: string;
  contactInfo?: {
    name?: string;
    phone?: string;
    address?: string;
    paymentMethod?: string;
  };
  metadata?: Record<string, unknown>;
}

interface TelegramResponse {
  ok: boolean;
  result?: {
    message_id: number;
    chat: {
      id: number;
      title?: string;
    };
  };
  description?: string;
}

/**
 * Отправляет сообщение в Telegram через Bot API
 */
async function sendTelegramMessage(
  chatId: string,
  text: string,
  parseMode: 'Markdown' | 'HTML' = 'HTML'
): Promise<TelegramResponse> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!botToken) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: true,
    }),
  });

  return response.json();
}

/**
 * Форматирует сообщение в зависимости от типа уведомления
 */
function formatMessage(data: TelegramNotificationRequest): string {
  const { type, message, userId, userContext, products, quantity, totalAmount, breakdown, contactInfo } = data;
  
  const emoji = {
    order: '🛒',
    wish: '💭',
    feedback: '⭐',
    staff_question: '❓',
    general: '💬',
  };

  const title = {
    order: 'НОВЫЙ ЗАКАЗ',
    wish: 'ПОЖЕЛАНИЕ КЛИЕНТА',
    feedback: 'ОБРАТНАЯ СВЯЗЬ',
    staff_question: 'ВОПРОС ПЕРСОНАЛУ',
    general: 'СООБЩЕНИЕ',
  };

  let formatted = `<b>${emoji[type]} ${title[type]}</b>\n\n`;
  
  // ID клиента
  if (userId) {
    formatted += `👤 <b>Клиент:</b> ${userId.substring(0, 12)}...\n`;
  }
  
  // Контекст клиента
  if (userContext) {
    if (userContext.totalVisits !== undefined) {
      formatted += `📊 <b>Визитов:</b> ${userContext.totalVisits}\n`;
    }
    if (userContext.language) {
      const langEmoji = {
        ru: '🇷🇺',
        en: '🇬🇧',
        th: '🇹🇭',
        de: '🇩🇪',
        fr: '🇫🇷',
        he: '🇮🇱',
        it: '🇮🇹',
      };
      formatted += `🗣️ <b>Язык:</b> ${langEmoji[userContext.language as keyof typeof langEmoji] || ''} ${userContext.language}\n`;
    }
    if (userContext.preferredEffects && userContext.preferredEffects.length > 0) {
      formatted += `💫 <b>Предпочтения:</b> ${userContext.preferredEffects.join(', ')}\n`;
    }
  }
  
  // Для заказов показываем структурированную информацию
  if (type === 'order' && products && products.length > 0) {
    formatted += `\n━━━━━━━━━━━━━━━━━━━\n`;
    formatted += `<b>📋 ДЕТАЛИ ЗАКАЗА:</b>\n\n`;
    
    // Продукты
    formatted += `🌿 <b>Продукт:</b>\n`;
    products.forEach(product => {
      formatted += `   ${escapeHtml(product)}\n`;
    });
    
    // Количество
    if (quantity) {
      formatted += `\n📦 <b>Количество:</b> ${escapeHtml(quantity)}\n`;
    }
    
    // Сумма заказа
    if (totalAmount && breakdown) {
      formatted += `\n💰 <b>СУММА:</b>\n`;
      formatted += `   ${escapeHtml(breakdown)}\n`;
      formatted += `   <b>Итого: ${totalAmount.toLocaleString('en-US')}฿</b>\n`;
    }
    
    // Контактная информация
    if (contactInfo) {
      formatted += `\n👤 <b>КОНТАКТЫ:</b>\n`;
      if (contactInfo.name) {
        formatted += `   Имя: ${escapeHtml(contactInfo.name)}\n`;
      }
      if (contactInfo.phone) {
        formatted += `   📱 Телефон: ${escapeHtml(contactInfo.phone)}\n`;
      }
      if (contactInfo.address) {
        formatted += `   📍 Адрес: ${escapeHtml(contactInfo.address)}\n`;
      }
      if (contactInfo.paymentMethod) {
        formatted += `   💳 Оплата: ${escapeHtml(contactInfo.paymentMethod)}\n`;
      }
    }
    
    formatted += `\n━━━━━━━━━━━━━━━━━━━\n`;
    formatted += `\n📝 <b>Исходное сообщение:</b>\n${escapeHtml(message)}\n`;
    
  } else {
    // Для остальных типов уведомлений
    formatted += `\n📝 <b>Сообщение:</b>\n${escapeHtml(message)}\n`;
    
    // Упомянутые продукты (если есть)
    if (products && products.length > 0) {
      formatted += `\n🌿 <b>Продукты:</b>\n`;
      products.forEach(product => {
        formatted += `  • ${escapeHtml(product)}\n`;
      });
    }
  }
  
  // Предыдущие предпочтения
  if (userContext?.favoriteStrains && userContext.favoriteStrains.length > 0) {
    formatted += `\n📚 <b>Ранее интересовали:</b>\n${userContext.favoriteStrains.slice(0, 3).map(s => escapeHtml(s)).join(', ')}\n`;
  }
  
  formatted += `\n<i>⏰ ${new Date().toLocaleString('ru-RU', { 
    timeZone: 'Asia/Bangkok',
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })}</i>`;
  
  formatted += `\n<i>🤖 Отправлено через OG Lab Agent</i>`;
  
  return formatted;
}

/**
 * Экранирует HTML специальные символы для Telegram
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Определяет целевой чат в зависимости от типа уведомления
 */
function getTargetChatId(type: NotificationType): string | null {
  // Можно настроить разные чаты для разных типов уведомлений
  const chatIds = {
    order: process.env.TELEGRAM_ORDERS_CHAT_ID || process.env.TELEGRAM_CHAT_ID,
    wish: process.env.TELEGRAM_CHAT_ID,
    feedback: process.env.TELEGRAM_FEEDBACK_CHAT_ID || process.env.TELEGRAM_CHAT_ID,
    staff_question: process.env.TELEGRAM_CHAT_ID,
    general: process.env.TELEGRAM_CHAT_ID,
  };

  return chatIds[type] || process.env.TELEGRAM_CHAT_ID || null;
}

/**
 * POST /api/telegram/notify
 * Отправляет уведомление в Telegram
 */
export async function POST(request: NextRequest) {
  try {
    const body: TelegramNotificationRequest = await request.json();
    
    // Валидация
    if (!body.type || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: type, message' },
        { status: 400 }
      );
    }

    // Проверка конфигурации
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.error('❌ TELEGRAM_BOT_TOKEN not configured');
      return NextResponse.json(
        { error: 'Telegram bot not configured' },
        { status: 500 }
      );
    }

    const chatId = getTargetChatId(body.type);
    if (!chatId) {
      console.error('❌ TELEGRAM_CHAT_ID not configured');
      return NextResponse.json(
        { error: 'Telegram chat not configured' },
        { status: 500 }
      );
    }

    // Форматируем сообщение
    const formattedMessage = formatMessage(body);
    
    // Отправляем в Telegram
    const telegramResponse = await sendTelegramMessage(chatId, formattedMessage, 'HTML');
    
    if (!telegramResponse.ok) {
      console.error('❌ TELEGRAM ERROR:', telegramResponse.description);
      return NextResponse.json(
        { 
          error: 'Failed to send Telegram notification',
          details: telegramResponse.description 
        },
        { status: 500 }
      );
    }

    console.log(`📤 TELEGRAM: ${body.type} notification sent to chat ${chatId}`);
    console.log(`   Message ID: ${telegramResponse.result?.message_id}`);
    
    // Опционально: сохраняем в базу данных для аналитики
    // await supabase.from('telegram_notifications').insert({ ... })

    return NextResponse.json({
      success: true,
      messageId: telegramResponse.result?.message_id,
      chatId: telegramResponse.result?.chat.id,
    });

  } catch (error) {
    console.error('❌ Error in /api/telegram/notify:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/telegram/notify
 * Проверяет статус Telegram бота
 */
export async function GET() {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      return NextResponse.json({
        status: 'error',
        message: 'TELEGRAM_BOT_TOKEN not configured',
      });
    }

    // Проверяем статус бота
    const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({
        status: 'error',
        message: 'Invalid bot token',
        details: data.description,
      });
    }

    const chatId = process.env.TELEGRAM_CHAT_ID;
    const ordersChat = process.env.TELEGRAM_ORDERS_CHAT_ID;
    const feedbackChat = process.env.TELEGRAM_FEEDBACK_CHAT_ID;

    return NextResponse.json({
      status: 'ok',
      bot: {
        id: data.result.id,
        username: data.result.username,
        name: data.result.first_name,
      },
      chats: {
        main: chatId ? `${chatId.substring(0, 5)}...` : 'not configured',
        orders: ordersChat ? `${ordersChat.substring(0, 5)}...` : 'using main',
        feedback: feedbackChat ? `${feedbackChat.substring(0, 5)}...` : 'using main',
      },
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
