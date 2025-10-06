import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { fetchMenuWithOptions, type MenuRow } from '@/lib/supabase-data';
import { 
  buildMenuContext, 
  buildSystemPrompt, 
  extractProductMentions,
  detectLanguage,
  getStrainEffects,
  getStrainFlavors,
  extractOrderInfo,
  calculateOrderTotal
} from '@/lib/agent-helpers';

// Инициализация OpenAI клиента
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Типы для запроса/ответа
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  useStock?: boolean;
  userContext?: string; // сжатый контекст пользователя
  isReturningUser?: boolean; // флаг возвращающегося пользователя
  language?: string; // язык пользователя
  userId?: string; // ID пользователя для аналитики
}

interface ProductCard {
  name: string;
  category: string;
  type?: string;
  thc?: string;
  cbg?: string;
  price_1g?: number;
  price_5g?: number;
  price_20g?: number;
  isOur?: boolean;
  effects?: string; // короткое описание эффектов
  flavors?: string; // короткое описание вкусов
}

interface ChatResponse {
  reply: string;
  suggestedProducts: string[];
  productCards?: ProductCard[]; // детальная информация о продуктах
  greeting?: string; // персонализированное приветствие
  notificationSent?: boolean; // флаг отправки уведомления в Telegram
  error?: string;
}

// Кэш меню (обновляется раз в 30 минут)
// Кэшируем и текстовый контекст, и сырые данные для избежания повторных запросов к БД
let menuCache: {
  contextText: string;
  rows: MenuRow[];
  timestamp: number;
} | null = null;

const MENU_CACHE_TTL = 30 * 60 * 1000; // 30 минут

/**
 * Получает данные меню из кэша или БД
 * Возвращает и текстовый контекст, и сырые данные
 */
async function getMenuData(): Promise<{ contextText: string; rows: MenuRow[] }> {
  const now = Date.now();
  
  // Проверяем кэш
  if (menuCache && (now - menuCache.timestamp) < MENU_CACHE_TTL) {
    console.log('📦 Using cached menu (age:', Math.floor((now - menuCache.timestamp) / 1000), 'sec)');
    return {
      contextText: menuCache.contextText,
      rows: menuCache.rows,
    };
  }
  
  // Загружаем свежее меню
  console.log('🔄 Fetching fresh menu from database');
  try {
    const { rows } = await fetchMenuWithOptions();
    const contextText = buildMenuContext(rows);
    
    // Сохраняем в кэш (и контекст, и rows)
    menuCache = {
      contextText,
      rows,
      timestamp: now,
    };
    
    console.log('✅ Menu cached:', rows.length, 'items');
    return { contextText, rows };
  } catch (error) {
    console.error('❌ Error fetching menu:', error);
    return {
      contextText: 'Ассортимент временно недоступен.',
      rows: [],
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { 
      message, 
      conversationHistory = [], 
      useStock = true, 
      userContext,
      isReturningUser = false,
      language: userLanguage,
    } = body;

    // Валидация
    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Определяем язык (используем переданный или детектим)
    const language = userLanguage || detectLanguage(message);
    console.log(`🗣️ Language: ${language}, Returning user: ${isReturningUser}`);

    // Получаем данные меню из кэша (если нужно)
    let menuData: { contextText: string; rows: MenuRow[] } | null = null;
    if (useStock) {
      menuData = await getMenuData();
    }

    // Строим system prompt
    const systemPrompt = buildSystemPrompt({
      menuContext: menuData?.contextText,
      userContext,
      useStock,
      language,
    });

    // Подготавливаем сообщения для OpenAI
    // Берем только последние 12 сообщений истории (6 пар вопрос-ответ)
    const recentHistory = conversationHistory.slice(-12);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: message },
    ];

    console.log(`💬 Sending request to OpenAI (${messages.length} messages)`);
    console.log(`📊 Token estimate: ~${JSON.stringify(messages).length / 4} tokens`);

    // Запрос к OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // или 'gpt-4' для стабильности
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.8, // немного креативности
      max_tokens: 500, // ограничиваем для краткости
      presence_penalty: 0.3, // избегаем повторений
      frequency_penalty: 0.3,
    });

    const reply = completion.choices[0]?.message?.content || 'Извини, не смог сформулировать ответ. Попробуй переформулировать вопрос?';

    // Определяем намерение пользователя для Telegram уведомлений
    const userIntent = detectUserIntent(message, reply, conversationHistory, menuData?.rows || []);
    let notificationSent = false;

    // Отправляем уведомление в Telegram если нужно
    if (userIntent.shouldNotify && process.env.TELEGRAM_BOT_TOKEN) {
      try {
        const notificationResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/telegram/notify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: userIntent.type,
            message: message,
            userId: body.userId || 'anonymous',
            userContext: body.userContext ? JSON.parse(body.userContext) : undefined,
            products: userIntent.products,
            quantity: userIntent.quantity,
            totalAmount: userIntent.totalAmount,
            breakdown: userIntent.breakdown,
            contactInfo: userIntent.contactInfo,
            metadata: {
              language,
              timestamp: new Date().toISOString(),
            },
          }),
        });

        if (notificationResponse.ok) {
          notificationSent = true;
          console.log(`📤 TELEGRAM: Notification sent (${userIntent.type})`);
        } else {
          console.error('⚠️ TELEGRAM: Failed to send notification');
        }
      } catch (error) {
        console.error('⚠️ TELEGRAM: Error sending notification:', error);
      }
    }

    // Извлекаем упомянутые продукты из кэшированных данных (ИЗБЕГАЕМ повторного запроса к БД!)
    let suggestedProducts: string[] = [];
    let productCards: ProductCard[] = [];
    if (useStock && menuData && menuData.rows.length > 0) {
      try {
        // Используем rows из кэша вместо нового запроса к БД
        const rows = menuData.rows;
        suggestedProducts = extractProductMentions(reply, rows);
        
        // Собираем детальную информацию о продуктах с эффектами и вкусами
        productCards = suggestedProducts
          .map(productName => {
            const product = rows.find(r => r.Name === productName);
            if (!product) return null;
            
            const card: ProductCard = {
              name: product.Name || productName,
              category: product.Category || '',
              type: product.Type ?? undefined,
              thc: product.THC ? String(product.THC) : undefined,
              cbg: product.CBG ? String(product.CBG) : undefined,
              price_1g: product.Price_1g ?? undefined,
              price_5g: product.Price_5g ?? undefined,
              price_20g: product.Price_20g ?? undefined,
              isOur: product.Our ?? undefined,
              effects: getStrainEffects(product.Type),
              flavors: getStrainFlavors(product.Type),
            };
            
            return card;
          })
          .filter((card): card is ProductCard => card !== null);
      } catch (error) {
        console.error('Error extracting products:', error);
      }
    }

    // Логирование для аналитики
    console.log('✅ Chat response generated:', {
      userMessage: message.substring(0, 50),
      replyLength: reply.length,
      suggestedProducts: suggestedProducts.length,
      tokensUsed: completion.usage?.total_tokens,
      model: completion.model,
      hasUserContext: !!userContext,
      isReturningUser,
    });

    // Возвращаем ответ
    const response: ChatResponse = {
      reply,
      suggestedProducts,
      productCards,
      notificationSent,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Error in /api/agent/chat:', error);

    // Обработка ошибок OpenAI
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { 
          error: 'AI service error', 
          reply: 'Извини, у меня технические трудности 🔧 Попробуй через минутку или обратись к живому бадтендеру.',
          suggestedProducts: [],
        },
        { status: 500 }
      );
    }

    // Общая ошибка
    return NextResponse.json(
      { 
        error: 'Internal server error',
        reply: 'Что-то пошло не так 😔 Наши разработчики уже разбираются. Попробуй позже!',
        suggestedProducts: [],
      },
      { status: 500 }
    );
  }
}

// GET endpoint для проверки статуса и информации о кэше
export async function GET() {
  const cacheAge = menuCache ? Math.floor((Date.now() - menuCache.timestamp) / 1000) : null;
  const cacheExpired = menuCache ? (Date.now() - menuCache.timestamp) >= MENU_CACHE_TTL : true;
  
  return NextResponse.json({
    status: 'ok',
    service: 'OG Lab Agent',
    model: 'gpt-4-turbo-preview',
    cache: {
      exists: !!menuCache,
      age_seconds: cacheAge,
      ttl_seconds: MENU_CACHE_TTL / 1000,
      expired: cacheExpired,
      items_count: menuCache?.rows.length || 0,
    },
  });
}

// HEAD endpoint для prefetch кэша (прогрев)
// Вызывается когда пользователь начинает вводить сообщение
export async function HEAD() {
  try {
    // Просто получаем данные меню - если кэш пустой, он будет заполнен
    const menuData = await getMenuData();
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'X-Cache-Status': menuCache ? 'hit' : 'miss',
        'X-Items-Count': String(menuData.rows.length),
        'X-Cache-Age': String(menuCache ? Math.floor((Date.now() - menuCache.timestamp) / 1000) : 0),
      },
    });
  } catch (error) {
    console.error('Error prefetching menu:', error);
    return new NextResponse(null, { status: 500 });
  }
}

/**
 * Определяет намерение пользователя для отправки уведомления в Telegram
 */
interface UserIntent {
  shouldNotify: boolean;
  type: 'order' | 'wish' | 'feedback' | 'staff_question' | 'general';
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
  confidence: number;
}

function detectUserIntent(
  userMessage: string, 
  agentReply: string, 
  conversationHistory: ChatMessage[],
  menuItems: MenuRow[]
): UserIntent {
  const lowerMessage = userMessage.toLowerCase();
  const lowerReply = agentReply.toLowerCase();
  
  // Ключевые слова для разных типов намерений
  const orderKeywords = [
    'заказ', 'купить', 'заброн', 'закажу', 'хочу взять', 'доставка', 'привез', 'довез',
    'оформ', 'беру', 'возьму', 'куплю', 'нужно', 'привезите', 'доставьте',
    'давай его', 'давай их', 'имя мое', 'вотсапп', 'ватсап', 'телефон', 'отель', 'hotel',
    'room', 'номер комнаты', 'оплата', 'наличными', 'наличка', 'payment', 'cash',
    'order', 'buy', 'purchase', 'book', 'reserve', 'delivery', 'deliver', 'bring',
    'want to order', 'place order', 'need delivery', 'my name', 'whatsapp',
    'สั่ง', 'ซื้อ', 'จอง', 'ส่ง' // тайский
  ];
  
  const deliveryHints = [
    'далеко', 'устал', 'не могу приехать', 'плохая погода', 'дождь',
    'можно привезти', 'есть доставка', 'доставляете',
    'far', 'tired', 'can\'t come', 'weather', 'rain', 'do you deliver',
    'ไกล', 'เหนื่อย', 'ส่งได้ไหม' // тайский
  ];
  
  const wishKeywords = [
    'посовет', 'рекоменд', 'хотел бы', 'нужен совет', 'что посовет',
    'подскаж', 'помог', 'что выбрать', 'что лучше',
    'suggest', 'recommend', 'advice', 'what should', 'help me choose',
    'แนะนำ', 'อยาก', 'ช่วย' // тайский
  ];
  
  const feedbackKeywords = [
    'спасибо', 'отлично', 'классно', 'супер', 'отзыв', 'благодар',
    'круто', 'кайф', 'понрав', 'хорош',
    'thank', 'great', 'awesome', 'feedback', 'review', 'love', 'perfect',
    'ขอบคุณ', 'ดี', 'เยี่ยม' // тайский
  ];
  
  const staffQuestionKeywords = [
    'когда открыт', 'где находит', 'как добраться', 'можно прийти',
    'адрес', 'часы работы', 'контакт', 'телефон', 'связаться',
    'передайте', 'скажите', 'передай', 'сообщи',
    'when open', 'where located', 'how to get', 'address', 'hours',
    'tell them', 'let them know', 'pass message',
    'เปิด', 'ที่อยู่', 'เบอร์', 'ติดต่อ' // тайский
  ];

  // Проверяем на ORDER (заказ) - приоритет 1
  const hasOrderIntent = orderKeywords.some(kw => lowerMessage.includes(kw));
  const hasDeliveryHint = deliveryHints.some(kw => lowerMessage.includes(kw));
  
  // Проверяем наличие контактной информации в сообщении
  const hasPhoneNumber = /\d{8,15}/.test(userMessage); // телефон (8-15 цифр)
  const hasContactInfo = hasPhoneNumber || 
                         lowerMessage.includes('имя') || 
                         lowerMessage.includes('name') ||
                         lowerMessage.includes('hotel') ||
                         lowerMessage.includes('отель');
  
  // Если есть контактная информация И в истории упоминались продукты - это заказ!
  const lastFiveMessages = conversationHistory.slice(-5);
  const hasRecentProductMention = lastFiveMessages.some(msg => {
    return menuItems.some(item => 
      item.Name && msg.content.toLowerCase().includes(item.Name.toLowerCase())
    );
  });
  
  const isLikelyOrder = (hasOrderIntent || hasDeliveryHint || hasContactInfo) && 
                        (hasRecentProductMention || hasOrderIntent);
  
  if (isLikelyOrder) {
    // Используем умное извлечение информации о заказе из истории разговора
    const orderInfo = extractOrderInfo(conversationHistory, menuItems);
    
    // Рассчитываем сумму заказа если есть продукт и количество
    let totalAmount: number | undefined;
    let breakdown: string | undefined;
    
    if (orderInfo.products.length > 0 && orderInfo.quantityNumber) {
      const orderTotal = calculateOrderTotal(
        orderInfo.products[0], // берем первый продукт
        orderInfo.quantityNumber,
        menuItems
      );
      
      if (orderTotal) {
        totalAmount = orderTotal.amount;
        breakdown = orderTotal.breakdown;
      }
    }
    
    console.log('🛍️ Order detected:', {
      products: orderInfo.products,
      quantity: orderInfo.quantity,
      quantityNumber: orderInfo.quantityNumber,
      totalAmount,
      breakdown,
      contactInfo: orderInfo.contactInfo,
      confidence: orderInfo.confidence,
      hasContactInfo,
      hasOrderIntent,
      hasRecentProductMention
    });
    
    return {
      shouldNotify: true,
      type: 'order',
      products: orderInfo.products.length > 0 ? orderInfo.products : undefined,
      quantity: orderInfo.quantity,
      totalAmount,
      breakdown,
      contactInfo: orderInfo.contactInfo,
      confidence: (hasOrderIntent && hasContactInfo) ? 0.95 : (hasOrderIntent ? 0.90 : 0.75),
    };
  }

  // Проверяем на WISH (пожелание) - приоритет 2
  if (wishKeywords.some(kw => lowerMessage.includes(kw))) {
    const productMatches = agentReply.match(/\*\*(.*?)\*\*/g);
    const products = productMatches ? productMatches.map(m => m.replace(/\*\*/g, '')) : [];
    
    return {
      shouldNotify: true,
      type: 'wish',
      products: products.length > 0 ? products : undefined,
      confidence: 0.75,
    };
  }

  // Проверяем на STAFF_QUESTION (вопрос персоналу) - приоритет 3
  if (staffQuestionKeywords.some(kw => lowerMessage.includes(kw))) {
    // Проверяем, смог ли агент ответить или передал персоналу
    const needsHuman = lowerReply.includes('персонал') || 
                       lowerReply.includes('бадтендер') ||
                       lowerReply.includes('связаться') ||
                       lowerReply.includes('позвонить') ||
                       lowerReply.includes('передам') ||
                       lowerReply.includes('менеджер');
    
    return {
      shouldNotify: needsHuman,
      type: 'staff_question',
      confidence: needsHuman ? 0.90 : 0.40,
    };
  }

  // Проверяем на FEEDBACK (обратная связь) - приоритет 4
  if (feedbackKeywords.some(kw => lowerMessage.includes(kw))) {
    return {
      shouldNotify: true,
      type: 'feedback',
      confidence: 0.70,
    };
  }

  // По умолчанию не отправляем уведомление
  return {
    shouldNotify: false,
    type: 'general',
    confidence: 0,
  };
}
