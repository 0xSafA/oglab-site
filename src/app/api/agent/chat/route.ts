import { NextRequest } from 'next/server';
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
  calculateOrderTotal,
  shouldIncludeConcentrates
} from '@/lib/agent-helpers';
import { 
  getOrCreateUserProfileServer, 
  buildUserContextFromProfile,
  updateUserProfile
} from '@/lib/user-profile-db';
import type { UserProfile } from '@/lib/supabase-client';
import { 
  createConversationServer, 
  addMessageToConversationServer,
  type ConversationMessage 
} from '@/lib/conversations-db';
import { trackEventServer } from '@/lib/analytics-db';
import { 
  getCached, 
  setCached, 
  CacheKeys, 
  CacheTTL,
  isRedisAvailable 
} from '@/lib/redis-client';
import { findSimilarCachedQuery, addToSemanticCache } from '@/lib/semantic-cache';

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
  userId?: string; // ID пользователя для Supabase
  conversationId?: string; // ID текущего разговора
  stream?: boolean; // флаг для streaming (default: true)
  telegramUserId?: number; // ID пользователя Telegram (если есть)
}

// Localized label for order totals
function getTotalLabelByLanguage(language: 'ru' | 'en' | 'th' | 'fr' | 'de' | 'he' | 'it'): string {
  switch (language) {
    case 'ru':
      return 'Итого';
    case 'th':
      return 'ยอดรวม';
    case 'fr':
      return 'Total';
    case 'de':
      return 'Gesamt';
    case 'he':
      return 'סה״כ';
    case 'it':
      return 'Totale';
    case 'en':
    default:
      return 'Total';
  }
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

// Кэш меню (обновляется раз в 30 минут)
let menuCache: {
  contextText: string;
  contextTextWithConcentrates: string;
  rows: MenuRow[];
  timestamp: number;
} | null = null;

const MENU_CACHE_TTL = 30 * 60 * 1000; // 30 минут

/**
 * Получает данные меню из Redis/Memory кэша или БД (ОПТИМИЗИРОВАНО)
 */
async function getMenuData(): Promise<{ 
  contextText: string; 
  contextTextWithConcentrates: string;
  rows: MenuRow[];
}> {
  const now = Date.now();
  
  // 1. Проверяем Redis (если доступен)
  if (isRedisAvailable()) {
    const redisMenu = await getCached<typeof menuCache>(CacheKeys.menuItems());
    if (redisMenu) {
      console.log('⚡ Redis menu cache hit');
      menuCache = redisMenu; // Обновляем и memory cache
      return {
        contextText: redisMenu.contextText,
        contextTextWithConcentrates: redisMenu.contextTextWithConcentrates,
        rows: redisMenu.rows,
      };
    }
  }
  
  // 2. Проверяем memory cache
  if (menuCache && (now - menuCache.timestamp) < MENU_CACHE_TTL) {
    console.log('📦 Memory cache hit (age:', Math.floor((now - menuCache.timestamp) / 1000), 'sec)');
    return {
      contextText: menuCache.contextText,
      contextTextWithConcentrates: menuCache.contextTextWithConcentrates,
      rows: menuCache.rows,
    };
  }
  
  // 3. Загружаем свежее меню из БД
  console.log('🔄 Fetching fresh menu from DB');
  try {
    const { rows } = await fetchMenuWithOptions();
    const contextText = buildMenuContext(rows, false);
    const contextTextWithConcentrates = buildMenuContext(rows, true);
    
    menuCache = {
      contextText,
      contextTextWithConcentrates,
      rows,
      timestamp: now,
    };
    
    // Сохраняем в Redis
    if (isRedisAvailable()) {
      await setCached(CacheKeys.menuItems(), menuCache, CacheTTL.menuItems);
      console.log('✅ Menu cached to Redis:', rows.length, 'items');
    }
    
    console.log('✅ Menu cached to memory:', rows.length, 'items');
    return { contextText, contextTextWithConcentrates, rows };
  } catch (error) {
    console.error('❌ Error fetching menu:', error);
    return {
      contextText: 'Stock temporarily unavailable.',
      contextTextWithConcentrates: 'Stock temporarily unavailable.',
      rows: [],
    };
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body: ChatRequest = await request.json();
    const { 
      message, 
      conversationHistory = [], 
      useStock = true, 
      userContext,
      // isReturningUser = false, // unused, kept for potential future logic
      language: userLanguage,
      stream = true,
      userId,
      conversationId,
      telegramUserId,
    } = body;

    // Валидация
    if (!message || message.trim().length === 0) {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Определяем язык
    const language = userLanguage || detectLanguage(message);
    
    // ✅ SUPABASE: Получаем или создаём профиль пользователя
    let userProfile: UserProfile | undefined;
    let currentConversationId = conversationId;
    
    try {
      userProfile = await getOrCreateUserProfileServer(userId, telegramUserId);
      
      // Обновляем статистику профиля
      await updateUserProfile(userProfile.id, {
        total_messages: userProfile.total_messages + 1,
      });
      
      // Создаём или получаем текущий разговор
      if (!currentConversationId) {
        const newConversation = await createConversationServer(
          userProfile.id,
          telegramUserId ? 'telegram' : 'web',
          language
        );
        currentConversationId = newConversation.id;
        
        // Обновляем счётчик разговоров
        await updateUserProfile(userProfile.id, {
          total_conversations: userProfile.total_conversations + 1,
        });
        
        console.log('✅ New conversation:', currentConversationId);
      }
      
      // Сохраняем сообщение пользователя
      const userMessage: ConversationMessage = {
        role: 'user',
        content: message,
        timestamp: Date.now(),
        detectedLanguage: language,
      };
      
      await addMessageToConversationServer(currentConversationId, userMessage);
      
      // Трекаем событие (не блокируем ответ)
      void trackEventServer({
        userProfileId: userProfile.id,
        conversationId: currentConversationId,
        eventType: 'chat_message',
        eventData: {
          message: message.substring(0, 100), // Первые 100 символов
          language,
          messageLength: message.length,
        },
        channel: telegramUserId ? 'telegram' : 'web',
      });
      
      console.log(`🗣️ User: ${userProfile.user_id}, Lang: ${language}, Stream: ${stream}`);
      
    } catch (error) {
      console.error('⚠️ Error with user profile/conversation:', error);
      // Продолжаем работу даже если Supabase недоступен
    }

    // Получаем данные меню из кэша (если нужно)
    let menuData: Awaited<ReturnType<typeof getMenuData>> | null = null;
    if (useStock) {
      menuData = await getMenuData();
    }

    // Умная фильтрация: нужны ли концентраты?
    const includeConcentrates = shouldIncludeConcentrates(message, conversationHistory);
    const menuContext = includeConcentrates 
      ? menuData?.contextTextWithConcentrates 
      : menuData?.contextText;

    console.log(`📦 Menu context: ${includeConcentrates ? 'with' : 'without'} concentrates`);

    // Строим user context из профиля (если есть)
    let enhancedUserContext = userContext;
    if (userProfile && !userContext) {
      enhancedUserContext = buildUserContextFromProfile(userProfile);
    }

    // Строим system prompt (ОПТИМИЗИРОВАННЫЙ)
    const systemPrompt = buildSystemPrompt({
      menuContext,
      userContext: enhancedUserContext,
      useStock,
      language,
    });

    // Подготавливаем сообщения (только последние 12 для скорости)
    const recentHistory = conversationHistory.slice(-12);
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...recentHistory,
      { role: 'user', content: message },
    ];

    const tokensEstimate = JSON.stringify(messages).length / 4;
    console.log(`💬 OpenAI request: ${messages.length} msgs, ~${Math.round(tokensEstimate)} tokens`);

    // 0) Semantic cache lookup (fast path) — only for non-streaming responses
    if (!stream) {
      const semantic = await findSimilarCachedQuery(message, language);
      if (semantic && semantic.found && semantic.similarity && semantic.similarity >= 0.95 && semantic.response) {
        // Save minimal assistant message for history
        if (currentConversationId) {
          try {
            const assistantMessage: ConversationMessage = {
              role: 'assistant',
              content: semantic.response,
              timestamp: Date.now(),
            };
            await addMessageToConversationServer(currentConversationId, assistantMessage);
          } catch {}
        }
        return Response.json({
          reply: semantic.response,
          productCards: [],
          cached: true,
          conversationId: currentConversationId,
          userId: userProfile?.user_id,
        });
      }
    }

    // STREAMING RESPONSE (мгновенный ответ пользователю)
    if (stream) {
      const streamResponse = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        temperature: 0.8,
        max_tokens: 400, // Уменьшено с 500 для скорости
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
        stream: true, // STREAMING!
      });

      // Создаем ReadableStream для SSE
      const encoder = new TextEncoder();
      let fullReply = '';
      
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of streamResponse) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullReply += content;
                // Отправляем chunk в формате SSE
                const data = JSON.stringify({ content, done: false });
                controller.enqueue(encoder.encode(`data: ${data}\n\n`));
              }
            }
            
            // После завершения стрима обрабатываем дополнительные данные
            const processingStart = Date.now();
            
            // Извлекаем продукты и готовим карточки
            let suggestedProducts: string[] = [];
            let productCards: ProductCard[] = [];
            
            if (useStock && menuData && menuData.rows.length > 0) {
              try {
                suggestedProducts = extractProductMentions(fullReply, menuData.rows);
                
                const mapped = suggestedProducts
                  .map(productName => {
                    const product = menuData.rows.find(r => r.Name === productName);
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
                productCards = mapped;
              } catch (error) {
                console.error('Error extracting products:', error);
              }
            }
            
            // Определяем намерение для Telegram уведомлений
            const userIntent = detectUserIntent(message, fullReply, conversationHistory, menuData?.rows || [], language);

            // Если это оформленный заказ и у нас есть расчёт суммы — добавим его явно в ответ
            if (userIntent.type === 'order' && userIntent.breakdown) {
              const totalLabel = getTotalLabelByLanguage(language);
              if (!fullReply.includes(userIntent.breakdown)) {
                fullReply += `\n\n${totalLabel}: ${userIntent.breakdown}`;
              }
            }
            let notificationSent = false;

            // Отправляем уведомление в Telegram если нужно (асинхронно, не блокируем stream)
            if (userIntent.shouldNotify && process.env.TELEGRAM_BOT_TOKEN) {
              // Fire and forget - не ждем ответа
              fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/telegram/notify`, {
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
              }).then(res => {
                if (res.ok) {
                  console.log(`📤 Telegram notified (${userIntent.type})`);
                }
              }).catch(err => {
                console.error('⚠️ Telegram error:', err);
              });
              
              notificationSent = true;
            }
            
            const processingTime = Date.now() - processingStart;
            const totalTime = Date.now() - startTime;
            
            // ✅ Сохраняем ответ ассистента в Supabase
            if (currentConversationId && fullReply) {
              try {
                const assistantMessage: ConversationMessage = {
                  role: 'assistant',
                  content: fullReply,
                  timestamp: Date.now(),
                  productCards: suggestedProducts,
                };
                
                await addMessageToConversationServer(currentConversationId, assistantMessage);
              } catch (error) {
                console.error('⚠️ Error saving assistant message:', error);
              }
            }
            
            // Финальное сообщение с метаданными
            const finalData = JSON.stringify({
              done: true,
              suggestedProducts,
              productCards,
              notificationSent,
              conversationId: currentConversationId,
              userId: userProfile?.user_id,
              timing: {
                total: totalTime,
                processing: processingTime,
              }
            });
            
            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
            controller.close();
            
            console.log(`✅ Stream completed: ${totalTime}ms (processing: ${processingTime}ms)`);

            // Save to semantic cache (best-effort)
            try {
              await addToSemanticCache({
                query: message,
                response: fullReply,
                responseType: 'general',
                language,
              });
            } catch {}
            
          } catch (error) {
            console.error('❌ Stream error:', error);
            const errorData = JSON.stringify({ 
              error: 'Stream interrupted',
              done: true 
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        },
      });

      return new Response(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // NON-STREAMING RESPONSE (fallback для совместимости)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.8,
      max_tokens: 400,
      presence_penalty: 0.3,
      frequency_penalty: 0.3,
    });

    let reply = completion.choices[0]?.message?.content || 'Sorry, could not generate response. Try rephrasing?';

    // Определяем намерение для Telegram
    const userIntent = detectUserIntent(message, reply, conversationHistory, menuData?.rows || [], language);

    // Если это оформленный заказ и у нас есть расчёт суммы — добавим его явно в ответ
    if (userIntent.type === 'order' && userIntent.breakdown) {
      const totalLabel = getTotalLabelByLanguage(language);
      if (!reply.includes(userIntent.breakdown)) {
        reply = `${reply}\n\n${totalLabel}: ${userIntent.breakdown}`;
      }
    }
    let notificationSent = false;

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
          console.log(`📤 Telegram notified (${userIntent.type})`);
        }
      } catch (error) {
        console.error('⚠️ Telegram error:', error);
      }
    }

    // Извлекаем упомянутые продукты
    let suggestedProducts: string[] = [];
    let productCards: ProductCard[] = [];
    if (useStock && menuData && menuData.rows.length > 0) {
      try {
        suggestedProducts = extractProductMentions(reply, menuData.rows);
        const mapped2 = suggestedProducts
          .map(productName => {
            const product = menuData.rows.find(r => r.Name === productName);
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
        productCards = mapped2;
      } catch (error) {
        console.error('Error extracting products:', error);
      }
    }

    const totalTime = Date.now() - startTime;
    console.log(`✅ Response: ${totalTime}ms, ${suggestedProducts.length} products, tokens: ${completion.usage?.total_tokens}`);

    // Persist to semantic cache (best-effort)
    try {
      await addToSemanticCache({
        query: message,
        response: reply,
        responseType: 'general',
        language,
      });
    } catch {}

    // ✅ Сохраняем ответ ассистента в Supabase
    if (currentConversationId && reply) {
      try {
        const assistantMessage: ConversationMessage = {
          role: 'assistant',
          content: reply,
          timestamp: Date.now(),
          productCards: suggestedProducts,
        };
        
        await addMessageToConversationServer(currentConversationId, assistantMessage);
      } catch (error) {
        console.error('⚠️ Error saving assistant message:', error);
      }
    }

    return Response.json({
      reply,
      suggestedProducts,
      productCards,
      notificationSent,
      conversationId: currentConversationId,
      userId: userProfile?.user_id,
      timing: {
        total: totalTime,
      }
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Error after ${totalTime}ms:`, error);

    if (error instanceof OpenAI.APIError) {
      return Response.json(
        { 
          error: 'AI service error', 
          reply: 'Sorry, technical difficulties 🔧 Try in a minute or contact live budtender.',
          suggestedProducts: [],
        },
        { status: 500 }
      );
    }

    return Response.json(
      { 
        error: 'Internal server error',
        reply: 'Something went wrong 😔 Our devs are on it. Try later!',
        suggestedProducts: [],
      },
      { status: 500 }
    );
  }
}

// GET endpoint для проверки статуса
export async function GET() {
  const cacheAge = menuCache ? Math.floor((Date.now() - menuCache.timestamp) / 1000) : null;
  const cacheExpired = menuCache ? (Date.now() - menuCache.timestamp) >= MENU_CACHE_TTL : true;
  
  return Response.json({
    status: 'ok',
    service: 'OG Lab Agent (Optimized)',
    model: 'gpt-4-turbo-preview',
    features: ['streaming', 'smart-menu-filtering', 'optimized-prompt'],
    cache: {
      exists: !!menuCache,
      age_seconds: cacheAge,
      ttl_seconds: MENU_CACHE_TTL / 1000,
      expired: cacheExpired,
      items_count: menuCache?.rows.length || 0,
    },
  });
}

// HEAD endpoint для prefetch кэша
export async function HEAD() {
  try {
    const menuData = await getMenuData();
    
    return new Response(null, {
      status: 200,
      headers: {
        'X-Cache-Status': menuCache ? 'hit' : 'miss',
        'X-Items-Count': String(menuData.rows.length),
        'X-Cache-Age': String(menuCache ? Math.floor((Date.now() - menuCache.timestamp) / 1000) : 0),
      },
    });
  } catch (error) {
    console.error('Error prefetching menu:', error);
    return new Response(null, { status: 500 });
  }
}

/**
 * Определяет намерение пользователя для Telegram уведомлений
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
  menuItems: MenuRow[],
  language: 'ru' | 'en' | 'th' | 'fr' | 'de' | 'he' | 'it' = 'en'
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
    'สั่ง', 'ซื้อ', 'จอง', 'ส่ง'
  ];
  
  const deliveryHints = [
    'далеко', 'устал', 'не могу приехать', 'плохая погода', 'дождь',
    'можно привезти', 'есть доставка', 'доставляете',
    'far', 'tired', 'can\'t come', 'weather', 'rain', 'do you deliver',
    'ไกล', 'เหนื่อย', 'ส่งได้ไหม'
  ];
  
  const wishKeywords = [
    'посовет', 'рекоменд', 'хотел бы', 'нужен совет', 'что посовет',
    'подскаж', 'помог', 'что выбрать', 'что лучше',
    'suggest', 'recommend', 'advice', 'what should', 'help me choose',
    'แนะนำ', 'อยาก', 'ช่วย'
  ];
  
  const feedbackKeywords = [
    'спасибо', 'отлично', 'классно', 'супер', 'отзыв', 'благодар',
    'круто', 'кайф', 'понрав', 'хорош',
    'thank', 'great', 'awesome', 'feedback', 'review', 'love', 'perfect',
    'ขอบคุณ', 'ดี', 'เยี่ยม'
  ];
  
  const staffQuestionKeywords = [
    'когда открыт', 'где находит', 'как добраться', 'можно прийти',
    'адрес', 'часы работы', 'контакт', 'телефон', 'связаться',
    'передайте', 'скажите', 'передай', 'сообщи',
    'when open', 'where located', 'how to get', 'address', 'hours',
    'tell them', 'let them know', 'pass message',
    'เปิด', 'ที่อยู่', 'เบอร์', 'ติดต่อ'
  ];

  const hasOrderIntent = orderKeywords.some(kw => lowerMessage.includes(kw));
  const hasDeliveryHint = deliveryHints.some(kw => lowerMessage.includes(kw));
  
  const hasPhoneNumber = /\d{8,15}/.test(userMessage);
  const hasContactInfo = hasPhoneNumber || 
                         lowerMessage.includes('имя') || 
                         lowerMessage.includes('name') ||
                         lowerMessage.includes('hotel') ||
                         lowerMessage.includes('отель');
  
  const lastFiveMessages = conversationHistory.slice(-5);
  const hasRecentProductMention = lastFiveMessages.some(msg => {
    return menuItems.some(item => 
      item.Name && msg.content.toLowerCase().includes(item.Name.toLowerCase())
    );
  });
  
  const isLikelyOrder = (hasOrderIntent || hasDeliveryHint || hasContactInfo) && 
                        (hasRecentProductMention || hasOrderIntent);
  
  if (isLikelyOrder) {
    const orderInfo = extractOrderInfo(conversationHistory, menuItems);
    
    let totalAmount: number | undefined;
    let breakdown: string | undefined;
    
    if (orderInfo.products.length > 0 && orderInfo.quantityNumber) {
      const orderTotal = calculateOrderTotal(
        orderInfo.products[0],
        orderInfo.quantityNumber,
        menuItems,
        language
      );
      
      if (orderTotal) {
        totalAmount = orderTotal.amount;
        breakdown = orderTotal.breakdown;
      }
    }
    
    const hasProduct = orderInfo.products.length > 0;
    const hasQuantity = !!(orderInfo.quantityNumber && orderInfo.quantityNumber > 0);
    const hasPhone = !!(orderInfo.contactInfo?.phone && orderInfo.contactInfo.phone.length >= 8);
    const hasAddress = !!(orderInfo.contactInfo?.address && orderInfo.contactInfo.address.length > 3);
    
    const hashCategories = ['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH'];
    const firstProduct = menuItems.find(item => item.Name === orderInfo.products[0]);
    const isHash = !!(firstProduct && hashCategories.includes(firstProduct.Category || ''));
    const minQuantity = isHash ? 10 : 20;
    const meetsMinimum = orderInfo.quantityNumber ? orderInfo.quantityNumber >= minQuantity : false;
    
    const allDataCollected: boolean = hasProduct && hasQuantity && hasPhone && hasAddress && meetsMinimum;
    
    console.log('🛍️ Order validation:', {
      products: orderInfo.products,
      quantityNumber: orderInfo.quantityNumber,
      totalAmount,
      validation: { hasProduct, hasQuantity, hasPhone, hasAddress, meetsMinimum, allDataCollected }
    });
    
    return {
      shouldNotify: allDataCollected,
      type: 'order',
      products: orderInfo.products.length > 0 ? orderInfo.products : undefined,
      quantity: orderInfo.quantity,
      totalAmount,
      breakdown,
      contactInfo: orderInfo.contactInfo,
      confidence: allDataCollected ? 0.95 : 0.5,
    };
  }

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

  if (staffQuestionKeywords.some(kw => lowerMessage.includes(kw))) {
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

  if (feedbackKeywords.some(kw => lowerMessage.includes(kw))) {
    return {
      shouldNotify: true,
      type: 'feedback',
      confidence: 0.70,
    };
  }

  return {
    shouldNotify: false,
    type: 'general',
    confidence: 0,
  };
}
