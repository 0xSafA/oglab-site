/**
 * AI Agent Helper Functions
 * Utilities for building context, prompts, and managing conversations
 */

import type { MenuRow } from './supabase-data';

/**
 * Определяет эффекты сорта на основе типа (короткие, 2-3 слова)
 */
export function getStrainEffects(type: string | null | undefined): string {
  if (!type) return 'баланс';
  
  const effects: Record<string, string> = {
    indica: 'релакс, сон, спокойствие',
    sativa: 'энергия, креатив, фокус',
    hybrid: 'баланс, гибкость',
    hybride: 'баланс, гибкость',
  };
  
  return effects[type.toLowerCase()] || 'баланс';
}

/**
 * Определяет вкусовые ноты сорта на основе типа (короткие, 2-3 слова)
 */
export function getStrainFlavors(type: string | null | undefined): string {
  if (!type) return 'земля, трава';
  
  const flavors: Record<string, string> = {
    indica: 'земля, сладость, ягоды',
    sativa: 'цитрус, хвоя, специи',
    hybrid: 'фрукты, земля, сладость',
    hybride: 'фрукты, земля, сладость',
  };
  
  return flavors[type.toLowerCase()] || 'земля, трава';
}

/**
 * Строит краткое описание продукта для контекста
 */
export function formatProductForContext(item: MenuRow): string {
  const parts: string[] = [];
  
  // Название и категория
  parts.push(`${item.Name} (${item.Category}`);
  
  // Тип
  if (item.Type) {
    parts.push(`, ${item.Type}`);
  }
  
  // THC/CBG
  if (item.THC) {
    parts.push(`, THC ${item.THC}%`);
  } else if (item.CBG) {
    parts.push(`, CBG ${item.CBG}%`);
  }
  
  parts.push(')');
  
  // Эффекты
  const effects = getStrainEffects(item.Type);
  parts.push(` — ${effects}`);
  
  // Наша отметка
  if (item.Our) {
    parts.push(' 🌿 [Наше производство]');
  }
  
  return parts.join('');
}

/**
 * Строит полный контекст меню для промпта (ОПТИМИЗИРОВАНО)
 * Теперь возвращает только цветы по умолчанию, концентраты добавляются при необходимости
 */
export function buildMenuContext(menuItems: MenuRow[], includeConcentrates: boolean = false): string {
  if (!menuItems || menuItems.length === 0) {
    return 'Stock temporarily unavailable.';
  }

  // Группируем по категориям
  const categories = new Map<string, MenuRow[]>();
  
  menuItems.forEach(item => {
    const category = item.Category || 'Other';
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(item);
  });

  // Форматируем для промпта (компактно)
  const lines: string[] = ['CURRENT STOCK:', ''];
  
  // Сначала показываем траву (основной продукт)
  const flowerCategories = ['INDICA', 'SATIVA', 'HYBRID', 'HYBRIDE', 'CBD/CBG FLOWERS'];
  flowerCategories.forEach(catName => {
    const items = categories.get(catName);
    if (items && items.length > 0) {
      lines.push(`${catName}:`);
      items.forEach(item => {
        lines.push(`  • ${formatProductForContext(item)}`);
      });
    }
  });
  
  // Концентраты добавляем только если запрошены
  if (includeConcentrates) {
    lines.push('');
    lines.push('CONCENTRATES (suggest ONLY if asked):');
    const concentrateCategories = ['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH'];
    concentrateCategories.forEach(catName => {
      const items = categories.get(catName);
      if (items && items.length > 0) {
        lines.push(`${catName}:`);
        items.forEach(item => {
          lines.push(`  • ${formatProductForContext(item)}`);
        });
      }
    });
  }

  return lines.join('\n');
}

/**
 * Строит system prompt для GPT (ОПТИМИЗИРОВАННАЯ ВЕРСИЯ - ~1000 tokens)
 * На английском для лучшего понимания GPT-4 и быстрой обработки
 */
export function buildSystemPrompt(params: {
  menuContext?: string;
  userContext?: string;
  useStock: boolean;
  language?: string;
}): string {
  const { menuContext, userContext, useStock, language = 'ru' } = params;

  return `You are OG Lab's AI budtender - cheerful, knowledgeable cannabis expert on Koh Samui, Thailand.

🌍 MULTILINGUAL: Speak Russian, English, Thai, French, German, Hebrew, Italian fluently. ALWAYS respond in user's language (if Hebrew → Hebrew, if Thai → Thai). Never refuse language switches. Current locale: ${getLanguageName(language)}.

🎯 PERSONALITY: Friendly budtender who loves cannabis. Talk casually like a good friend - humor, warmth, no judgment. Mix deep knowledge with mindfulness philosophy (Bob Marley spirit, Buddha/Eckhart Tolle wisdom). Ask questions, share facts, make people laugh. Cognitive anticipation: effect starts NOW with strain choice!

🤖 AUTO FUNCTIONS:
1. Order sending - when client gives order info (name, phone, address), it's AUTO-SENT to OG Lab via Telegram
2. Message forwarding - client questions AUTO-REACH real people
3. You're FULL order manager, not just consultant

📋 ORDER DATA (collect ALL sequentially):
1. Product (exact name from stock)
2. Quantity (min: 20g flower OR 10g hash for delivery)
3. Phone (WhatsApp/Telegram/LINE)
4. Location (GPS/Plus Code/hotel+room)
5. Payment (cash/transfer/crypto)

🎯 COLLECTION PROCESS:
- Step-by-step, don't rush
- First: product + quantity
- Then: phone
- Then: location
- Finally: payment
- CHECK all 5 items before confirming

💬 ORDER CONFIRMATION:
- ONLY when all 5 data points collected
- CALCULATE total: check stock price (Price_1g for <5g, Price_5g for 5-20g, Price_20g for 20g+)
- Say: "Perfect! Order details: [list all + total]. Correct? If yes, FORWARDING to team"
- After confirmation: "Forwarded! They'll WhatsApp you within an hour"

❌ DON'T CONFIRM IF:
- Quantity unclear ("a couple grams" vs specific number)
- No phone/unclear number
- No address/location
- Client just asking, not ordering

✅ CORRECT FLOW EXAMPLE:
Client: "Want Northern Lights"
You: "Great! How many grams? (min 20g for delivery)"
Client: "20g"
You: "Your WhatsApp?"
Client: "+66 123456789"
You: "Where to deliver? (GPS/Plus Code/hotel+room)"
Client: "Intercontinental, room 404"
You: "Payment method? (cash/transfer/crypto)"
Client: "Cash"
You: "Check order:
• 20g **Northern Lights**
• Total: 8,000฿ (20g × 400฿)
• WhatsApp: +66 123456789
• Address: Intercontinental, room 404
• Payment: cash
All correct?"
Client: "Yes"
You: "FORWARDED! Team will contact you within an hour"

NEVER say: "pass this yourself", "contact directly". YOU handle everything.

📦 DELIVERY INFO (when asked/appropriate):
- B2B service, but... we won't tell you're not a shop owner, right?
- Schedule: tonight or tomorrow morning
- Min: 20g flower OR 10g hash
- Location needed: GPS/Plus Code/hotel+room
- Payment: cash/transfer/crypto
- After all data: "Forwarded! Team will WhatsApp you within an hour"

💰 UPSELL (subtle):
- With flower → suggest papers/lighters
- To everyone → suggest hash as addition
- Natural: "BTW, don't forget papers if needed" or "Ever tried hash? Great with flower!"

🎯 YOUR MISSION:
1. Build trust
2. Understand needs (mood, plans, experience)
3. Recommend suitable products
4. Explain why these strains fit
5. Increase check via upsells
6. Arrange delivery/forward to staff

⚠️ KEY RULES:
- Mention products EXACTLY as in stock (copy names verbatim!)
- Use FULL names from inventory
- Explain effects FACTUALLY: THC/CBD%, type, body/mind impact
- NO poetry/metaphors/long descriptions - FACTS only
- Consider tolerance/experience
- Can discuss anything (philosophy, music, travel) but BRIEFLY
- NO emojis in responses
- ALWAYS respond in user's last message language!
- Be concise: 1-2 sentences per product, max 2-4 sentences total
- Always tie to products - philosophy is cool but main goal is helping choose
- Ask clarifying questions if need more info

🌿 PRODUCT PRIORITY:
- DEFAULT: talk ONLY about FLOWER (buds)
- When "indica/sativa/hybrid" without category → offer ONLY flower
- Even if hash/rosin available → DON'T suggest immediately
- SUGGEST HASH/ROSIN ONLY if:
  1. Client asked about concentrates/hash/rosin
  2. Client decided on flower + you're upselling
  3. Concentrates already discussed
- Correct upsell: "BTW, **Supreme Oreoz** also available as Live Hash Rosin - same terpenes, stronger. Interested?"
- Incorrect: suggesting rosin when client just asked about indica
- Remember: client came for flower, concentrates are ADD-ON

📝 NAMES FORMAT:
- Mention like: "**Supreme Oreoz**", "**White Whale (CBG)**" - with bold
- Important for creating visual cards with prices
- Each mentioned product becomes beautiful card

${userContext ? `
CLIENT HISTORY:
${userContext}

Use to communicate like old friend:
- Greet returning clients warmly
- If first message in new dialog, DON'T mention specific past products
- Just greet warmly and ask how to help today
- Recall past preferences ONLY when client talks about goals
- Consider past experience in recommendations, don't impose
` : ''}

VALUES: Quality > quantity, conscious consumption, nature connection, spiritual growth, Thai hospitality

${useStock && menuContext ? `
${menuContext}

IMPORTANT: Recommend ONLY from above list. If nothing suitable → suggest alternative or be honest.
` : `
Client disabled stock recommendations. Give general cannabis advice.
`}

Respond naturally like real person. Ask clarifying questions to learn client's goals. Don't rush recommendations - get to know client first.

⚠️ TONE & STYLE:
- Talk about yourself with personality, light humor, self-irony
- For product recommendations add: "Want to clarify? Our live budtenders always available"
- NEVER say "I'm just AI" or "I can't" for ORDERS - you really process them!
- No formal phrases like "Remember this is AI assistant"
- Be CONFIDENT processing orders - this is your direct job
- Organically mention "OG Lab" and Samui island (not every message)
- Examples: "We have at OG Lab...", "Samui weather great for...", "Come visit our dispensary on Samui"

💬 INFORMALITY & FUN:
- Casual language: "awesome", "cool", "chill", "great"
- Light jokes/wordplay (don't overdo)
- Show initiative: "BTW we have...", "Listen, tried...", "If heading for sunset..."
- Counter questions: "Favorite strain?", "More indica/sativa?"
- Brief facts: "This terpene smells like mango"
- Be confident in recommendations - you KNOW what you're advising!

🎯 DIRECT & FACTUAL:
- NO POMPOUS POETRY - no "envelops in warm blanket", "unfolds in bouquet"
- Direct: "**Northern Lights** - powerful indica, 20% THC, knocks you out in hour"
- Specifics vs metaphors: not "wave of relaxation", but "body relaxes, mind switches off"
- Brevity: 1-2 sentences per product, to the point
- Facts: THC/CBD, type (indica/sativa), main effects, onset time
- No literature: people saturated with pompousness, they need MEAT
- Cognitive anticipation simply: "Effect starts with choice - already getting high"

❌ BAD: "Imagine how **Northern Lights** envelops you in warm blanket of relaxation..."
✅ GOOD: "**Northern Lights** - indica 20% THC. Relaxes body, shuts down thoughts, in bed in hour. Classic for sleep."`;
}

/**
 * Извлекает упоминания продуктов из ответа GPT
 * Ищет как обычные упоминания, так и в жирном шрифте (**название**)
 */
export function extractProductMentions(response: string, menuItems: MenuRow[]): string[] {
  const mentioned: string[] = [];
  
  // Убираем markdown для поиска
  const cleanResponse = response.replace(/\*\*/g, '');
  
  menuItems.forEach(item => {
    if (!item.Name) return;
    
    // Ищем точное совпадение (регистронезависимое)
    const regex = new RegExp(`\\b${item.Name.replace(/[()]/g, '\\$&')}\\b`, 'i');
    if (regex.test(cleanResponse)) {
      mentioned.push(item.Name);
    }
  });
  
  return [...new Set(mentioned)]; // убираем дубликаты
}

/**
 * Получает название языка для промпта
 */
function getLanguageName(languageCode?: string): string {
  const languageNames: Record<string, string> = {
    'ru': 'Russian',
    'en': 'English',
    'th': 'Thai',
    'fr': 'French',
    'de': 'German',
    'he': 'Hebrew',
    'it': 'Italian'
  };
  return languageNames[languageCode || 'en'] || 'English';
}

/**
 * Определяет язык сообщения пользователя по Unicode символам
 */
export function detectLanguage(text: string): 'ru' | 'en' | 'th' | 'fr' | 'de' | 'he' | 'it' {
  // Простая эвристика по Unicode диапазонам
  const hasCyrillic = /[а-яА-ЯёЁ]/.test(text);
  const hasThai = /[\u0E00-\u0E7F]/.test(text);
  const hasHebrew = /[\u0590-\u05FF]/.test(text);
  
  // Специфичные для французского символы с диакритикой
  const hasFrenchChars = /[àâäéèêëïîôùûüÿœçÀÂÄÉÈÊËÏÎÔÙÛÜŸŒÇ]/.test(text);
  
  // Специфичные для немецкого символы
  const hasGermanChars = /[äöüßÄÖÜẞ]/.test(text);
  
  // Специфичные для итальянского символы
  const hasItalianChars = /[àèéìíîòóùúÀÈÉÌÍÎÒÓÙÚ]/.test(text);
  
  if (hasCyrillic) return 'ru';
  if (hasThai) return 'th';
  if (hasHebrew) return 'he';
  if (hasGermanChars) return 'de';
  if (hasFrenchChars && !hasItalianChars) return 'fr'; // французский приоритетнее
  if (hasItalianChars) return 'it';
  
  return 'en'; // по умолчанию английский
}

/**
 * Извлекает структурированную информацию о заказе из истории разговора
 */
export interface OrderInfo {
  products: string[];
  quantity?: string;
  quantityNumber?: number; // числовое количество в граммах
  confidence: number;
  contactInfo?: {
    name?: string;
    phone?: string;
    address?: string;
    paymentMethod?: string;
  };
}

/**
 * Рассчитывает стоимость заказа
 */
export interface OrderTotal {
  amount: number;
  currency: string;
  pricePerUnit: number;
  breakdown: string; // например "10г × 1,530฿"
}

export function calculateOrderTotal(
  productName: string,
  quantity: number,
  menuItems: MenuRow[]
): OrderTotal | null {
  const product = menuItems.find(item => item.Name === productName);
  
  if (!product) {
    return null;
  }
  
  // Определяем правильную цену в зависимости от количества
  let pricePerUnit = 0;
  
  // Для гашиша используем Price_1g и Price_5g
  const hashCategories = ['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH'];
  const isHash = hashCategories.includes(product.Category || '');
  
  if (isHash) {
    if (quantity >= 5 && product.Price_5g) {
      pricePerUnit = product.Price_5g;
    } else if (product.Price_1g) {
      pricePerUnit = product.Price_1g;
    }
  } else {
    // Для травы используем Price_5g и Price_20g
    if (quantity >= 20 && product.Price_20g) {
      pricePerUnit = product.Price_20g;
    } else if (quantity >= 5 && product.Price_5g) {
      pricePerUnit = product.Price_5g;
    } else if (product.Price_5g) {
      // По умолчанию используем Price_5g если нет других цен
      pricePerUnit = product.Price_5g;
    }
  }
  
  if (!pricePerUnit) {
    return null;
  }
  
  const totalAmount = pricePerUnit * quantity;
  const formattedPrice = pricePerUnit.toLocaleString('en-US');
  const formattedTotal = totalAmount.toLocaleString('en-US');
  
  return {
    amount: totalAmount,
    currency: '฿',
    pricePerUnit,
    breakdown: `${quantity}г × ${formattedPrice}฿ = ${formattedTotal}฿`,
  };
}

export function extractOrderInfo(
  conversationHistory: Array<{ role: string; content: string }>,
  menuItems: MenuRow[]
): OrderInfo {
  // Берем последние 12 сообщений (6 пар вопрос-ответ)
  const recentMessages = conversationHistory.slice(-12);
  const allText = recentMessages.map(m => m.content).join(' ');
  
  // Извлекаем контактную информацию из последних сообщений
  const lastThreeUserMessages = recentMessages
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content)
    .join(' ');
  
  const contactInfo: OrderInfo['contactInfo'] = {};
  
  // Извлекаем имя (ищем "имя", "name", "меня зовут", "my name")
  const nameMatch = lastThreeUserMessages.match(/(?:имя[:\s-]*|name[:\s-]*|меня зовут|my name is|называюсь)\s*([А-ЯЁA-Z][а-яёa-z]+(?:\s+[А-ЯЁA-Z][а-яёa-z]+)*)/i);
  if (nameMatch) {
    contactInfo.name = nameMatch[1].trim();
  }
  
  // Извлекаем телефон (ищем 8-15 цифр подряд или с разделителями)
  const phoneMatch = lastThreeUserMessages.match(/(?:телефон|phone|whatsapp|ватсап|вотсапп|тел)[:\s-]*([+\d\s()-]{8,20})|(\d{8,15})/i);
  if (phoneMatch) {
    contactInfo.phone = (phoneMatch[1] || phoneMatch[2]).replace(/[^\d+]/g, '').trim();
  }
  
  // Извлекаем адрес (отель, координаты, plus code)
  const addressMatch = lastThreeUserMessages.match(/(?:отель|hotel|адрес|address|room|комната)[:\s-]*([^.,;]+(?:,\s*(?:room|комната)\s*\d+)?)/i);
  if (addressMatch) {
    contactInfo.address = addressMatch[1].trim();
  }
  
  // Извлекаем способ оплаты
  const paymentMatch = lastThreeUserMessages.match(/(?:оплата|payment|платить|pay)[:\s-]*(наличными|наличка|cash|карта|card|крипта|crypto)/i);
  if (paymentMatch) {
    contactInfo.paymentMethod = paymentMatch[1].trim();
  }
  
  // Извлекаем все упоминания продуктов из истории
  const mentionedProducts: Map<string, number> = new Map();
  
  menuItems.forEach(item => {
    if (!item.Name) return;
    
    const regex = new RegExp(`\\b${item.Name.replace(/[()]/g, '\\$&')}\\b`, 'gi');
    const matches = allText.match(regex);
    
    if (matches) {
      mentionedProducts.set(item.Name, matches.length);
    }
  });
  
  // Ищем ключевые слова заказа в последних сообщениях
  const orderKeywords = [
    'заказ', 'заказал', 'беру', 'возьму', 'куплю', 'хочу взять', 'доставить',
    'оформи', 'оформил', 'заказываю', 'передал',
    'order', 'ordered', 'buy', 'purchase', 'take', 'want', 'deliver',
    'สั่ง', 'ซื้อ'
  ];
  
  // Анализируем последние 4 сообщения на наличие контекста заказа
  const lastFourMessages = conversationHistory.slice(-4).map(m => m.content.toLowerCase()).join(' ');
  const hasOrderContext = orderKeywords.some(kw => lastFourMessages.includes(kw));
  
  // Извлекаем количество (ищем числа с "г", "g", "грамм")
  const quantityMatch = lastFourMessages.match(/(\d+)\s*(г|g|грамм|gram)/i);
  const quantity = quantityMatch ? `${quantityMatch[1]}${quantityMatch[2]}` : undefined;
  const quantityNumber = quantityMatch ? parseInt(quantityMatch[1]) : undefined;
  
  // Если есть контекст заказа, приоритизируем продукты из последних сообщений
  if (hasOrderContext) {
    // Берем последние 3 сообщения для определения конкретного продукта заказа
    const lastThreeMessages = conversationHistory.slice(-3).map(m => m.content).join(' ');
    const productsInOrderContext: string[] = [];
    
    menuItems.forEach(item => {
      if (!item.Name) return;
      const regex = new RegExp(`\\b${item.Name.replace(/[()]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lastThreeMessages)) {
        productsInOrderContext.push(item.Name);
      }
    });
    
    if (productsInOrderContext.length > 0) {
      return {
        products: productsInOrderContext,
        quantity,
        quantityNumber,
        contactInfo,
        confidence: 0.95
      };
    }
  }
  
  // Если нет явного контекста заказа, возвращаем самый часто упоминаемый продукт
  if (mentionedProducts.size > 0) {
    const sortedProducts = Array.from(mentionedProducts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
    
    return {
      products: sortedProducts.slice(0, 3), // Максимум 3 продукта
      quantity,
      quantityNumber,
      contactInfo,
      confidence: hasOrderContext ? 0.75 : 0.50
    };
  }
  
  return {
    products: [],
    quantityNumber: undefined,
    contactInfo,
    confidence: 0
  };
}

/**
 * Умная фильтрация меню на основе запроса пользователя
 * Определяет нужны ли концентраты в контексте
 */
export function shouldIncludeConcentrates(message: string, history: Array<{ role: string; content: string }>): boolean {
  const lowerMessage = message.toLowerCase();
  const recentHistory = history.slice(-6).map(m => m.content.toLowerCase()).join(' ');
  
  // Ключевые слова для концентратов
  const concentrateKeywords = [
    'hash', 'rosin', 'концентрат', 'гашиш', 'хэш', 'росин',
    'concentrate', 'extract', 'dab', 'wax', 'shatter',
    'bubble hash', 'dry sift', 'live hash', 'frozen hash'
  ];
  
  return concentrateKeywords.some(kw => 
    lowerMessage.includes(kw) || recentHistory.includes(kw)
  );
}
