import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { fetchMenuWithOptions, type MenuRow } from '@/lib/supabase-data';
import { 
  buildMenuContext, 
  buildSystemPrompt, 
  extractProductMentions,
  detectLanguage,
  getStrainEffects,
  getStrainFlavors
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
