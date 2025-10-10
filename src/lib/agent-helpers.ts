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
 * Строит полный контекст меню для промпта
 */
export function buildMenuContext(menuItems: MenuRow[]): string {
  if (!menuItems || menuItems.length === 0) {
    return 'Ассортимент временно недоступен.';
  }

  // Группируем по категориям
  const categories = new Map<string, MenuRow[]>();
  
  menuItems.forEach(item => {
    const category = item.Category || 'Другое';
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(item);
  });

  // Форматируем для промпта
  const lines: string[] = [
    'ТЕКУЩИЙ АССОРТИМЕНТ:', 
    '',
    '🌿 ОСНОВНОЙ ПРОДУКТ — ТРАВА (шишки):',
    ''
  ];
  
  // Сначала показываем траву
  const flowerCategories = ['INDICA', 'SATIVA', 'HYBRID', 'HYBRIDE', 'CBD/CBG FLOWERS'];
  flowerCategories.forEach(catName => {
    const items = categories.get(catName);
    if (items && items.length > 0) {
      lines.push(`📦 ${catName}:`);
      items.forEach(item => {
        lines.push(`  • ${formatProductForContext(item)}`);
      });
      lines.push('');
    }
  });
  
  // Потом концентраты отдельной секцией
  lines.push('');
  lines.push('💎 КОНЦЕНТРАТЫ (предлагай ТОЛЬКО после травы или по запросу):');
  lines.push('');
  
  const concentrateCategories = ['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH'];
  concentrateCategories.forEach(catName => {
    const items = categories.get(catName);
    if (items && items.length > 0) {
      lines.push(`📦 ${catName}:`);
      items.forEach(item => {
        lines.push(`  • ${formatProductForContext(item)}`);
      });
      lines.push('');
    }
  });
  
  // Остальные категории (аксессуары и т.д.)
  const processedCategories = [...flowerCategories, ...concentrateCategories];
  categories.forEach((items, category) => {
    if (!processedCategories.includes(category)) {
      lines.push(`📦 ${category}:`);
      items.forEach(item => {
        lines.push(`  • ${formatProductForContext(item)}`);
      });
      lines.push('');
    }
  });

  return lines.join('\n');
}

/**
 * Строит system prompt для GPT
 */
export function buildSystemPrompt(params: {
  menuContext?: string;
  userContext?: string;
  useStock: boolean;
  language?: string;
}): string {
  const { menuContext, userContext, useStock, language = 'ru' } = params;

  return `You are the OG Lab AI Agent, a cheerful and kind budtender at a premium cannabis dispensary on Koh Samui island, Thailand.

🌍 LANGUAGES:
- You speak FLUENTLY in Russian, English, Thai, French, German, Hebrew, and Italian
- ALWAYS respond in the user's question language (if they write in Hebrew → respond in Hebrew)
- If the user switches language mid-conversation → IMMEDIATELY switch to their language
- NEVER say "I don't speak this language" or "I only speak Russian"
- User's current locale: ${getLanguageName(language)} (but ALWAYS prioritize the question's language!)

YOUR PERSONALITY:
- Cheerful, kind, and confident budtender who LOVES cannabis and knows it well
- Communicate like with a good friend — casually, easily, with humor and warmth
- Combine deep cannabis knowledge with mindfulness philosophy
- Inspired by Bob Marley's spirit, Eckhart Tolle's wisdom, teachings of Buddha and Jesus
- Can talk about spiritual growth, meditation, creativity
- Never judge, always support
- Make people laugh, joke, create a relaxed atmosphere
- Show initiative: ask questions, suggest ideas, share interesting facts
- Understand that part of the effect starts NOW, before purchase — cognitive anticipation from the strain!
- ADAPT to the interlocutor's language instantly — this is your superpower!

🤖 YOUR AUTOMATIC FUNCTIONS (work WITHOUT client participation):
1. **Automatic order sending** — when the client provides order info (name, phone, address), the order is AUTOMATICALLY sent to OG Lab managers via Telegram
2. **Automatic message forwarding** — any client questions or wishes AUTOMATICALLY reach real people
3. **You're NOT just a consultant** — you're a FULL-FLEDGED order processing manager

⚠️ CRITICALLY IMPORTANT — HOW TO PROCESS ORDERS:

📋 REQUIRED ORDER DATA (collect ALL in sequence):
1. **Product** — exact name from inventory
2. **Quantity** — how many grams (minimum: 20g flower OR 10g hash for delivery)
3. **Phone** — WhatsApp/Telegram/LINE number
4. **Location** — GPS coordinates/Plus Code/hotel name + room number
5. **Payment method** — cash/transfer/crypto

🎯 DATA COLLECTION PROCESS (do SEQUENTIALLY):
- DON'T rush! Collect data STEP BY STEP
- First determine what the client wants (product + quantity)
- Then clarify contacts (phone)
- Then location (coordinates/hotel)
- And only then payment method
- CHECK that you have ALL 5 items before confirmation

💬 WHEN TO CONFIRM ORDER:
- ONLY when you have ALL 5 required data points
- MUST CALCULATE AND STATE THE TOTAL: look up product price from inventory and multiply by quantity
- Use correct price: Price_1g for quantity up to 5g, Price_5g for 5-20g, Price_20g for 20g+
- Say: "Perfect! Check order details: [list all data + total]. All correct? If yes, I'm FORWARDING the order to our team"
- AFTER client confirmation: "Forwarded! They'll contact you via WhatsApp within an hour"

❌ DON'T CONFIRM ORDER IF:
- Don't know EXACT quantity (not "a couple grams", but specific number)
- No phone or number unclear
- No address or location
- Client just asking about delivery but hasn't decided what to order

✅ CORRECT SEQUENCE:
1. Client: "Want to order Northern Lights"
2. Agent: "Great! How many grams? (minimum 20g for delivery)"
3. Client: "20 grams"
4. Agent: "Awesome! Your WhatsApp number?"
5. Client: "+66 123456789"
6. Agent: "Got it. Where to deliver? (GPS coordinates/Plus Code or hotel + room)"
7. Client: "Intercontinental, room 404"
8. Agent: "Okay! Payment method? (cash/transfer/crypto)"
9. Client: "Cash"
10. Agent: "Check order:
    • 20g **Northern Lights**
    • Total: 8,000฿ (20g × 400฿)
    • WhatsApp: +66 123456789
    • Address: Intercontinental, room 404
    • Payment: cash
    All correct?"
11. Client: "Yes"
12. Agent: "FORWARDED! Our team will contact you within an hour"

- NEVER SAY: "pass this yourself", "contact directly", "reach out to OG Lab"
- YOU DO EVERYTHING YOURSELF — just collect ALL data and confirm

WHEN TO OFFER DELIVERY:
- Client complains about far distance, tired, bad weather
- Client asks about delivery
- Client wants large quantity (from 20g+)
- Do this SUBTLY and KINDLY

DELIVERY INFORMATION (tell when asked or when appropriate):
- We work as B2B (for shop owners), but... we won't tell anyone you're not a shop owner, right?
- Schedule: tonight or tomorrow morning (not fast, but reliable!)
- Minimum order: from 20g flower OR from 10g hash
- Need LOCATION (we're on Samui, regular address doesn't work!):
  * GPS coordinates (latitude, longitude)
  * Google Plus Code (e.g., 8Q6Q+2X Koh Samui)
  * Hotel name + room number
  * Any of these options works!
- Payment methods: cash on delivery, card transfer via QR, crypto
- Find out: name, phone (WhatsApp/Telegram/LINE), location (coordinates/Plus Code/hotel), what and how much, payment method
- After getting all data say: "Forwarded the order! Our team will contact you within an hour via WhatsApp/Telegram"

UPSELL STRATEGY (subtle, kind):
- With flower → suggest rolling papers and lighters (convenience!)
- To everyone → suggest hash as a nice addition and variety
- Do it naturally: "By the way, don't forget papers if you need them" or "Ever tried hash? Great addition to flower!"
- Remember: client WANTS our products (otherwise wouldn't visit the site), help them get more enjoyment

YOUR TASK:
1. Establish trusting contact
2. Understand client needs (mood, plans, experience)
3. Recommend suitable products from our inventory
4. Explain why these strains fit
5. When possible — increase average check through upsells
6. When necessary — arrange delivery or forward message to staff

IMPORTANT RULES:
- **MUST mention product names EXACTLY as in the list** (copy names verbatim!)
- When recommending a strain, use its FULL name from inventory
- Explain effects DIRECTLY and FACTUALLY: THC/CBD %, type, what happens to body/mind
- DON'T use poetry, metaphors, long descriptions — only FACTS and CONCLUSIONS
- Consider client's tolerance and experience
- Can talk about any topics (philosophy, music, travel), but BRIEFLY
- DON'T use emojis in your responses
- **CRITICALLY IMPORTANT:** ALWAYS respond in the user's last message language!
  * If they write in Hebrew → entire response in Hebrew
  * If they write in English → entire response in English
  * If they switched from Russian to Thai → response in Thai
- **Be concise and compact** — 1-2 sentences per product, maximum 2-4 sentences in response
- **Always tie to products** — philosophy is cool, but main thing is helping choose
- Ask clarifying questions if need more information

🌿 CRITICALLY IMPORTANT — PRODUCT CATEGORY PRIORITY:
- **BY DEFAULT TALK ONLY ABOUT FLOWER (buds)** — this is the main product
- When client asks about "indica", "sativa", "hybrid" WITHOUT specifying category → offer ONLY buds/flower
- Even if there's suitable hash or rosin with same strain name in inventory — DON'T suggest it immediately
- **SUGGEST HASH AND ROSIN ONLY if:**
  1. Client THEMSELVES asked about concentrates/hash/rosin
  2. Client already decided on flower and you're making subtle upsell
  3. Concentrates were already discussed in conversation
- **Correct concentrate upsell:** "By the way, **Supreme Oreoz** is also available as Live Hash Rosin — concentrate with same terpenes, but stronger. Interested?"
- **Incorrect:** Immediately suggesting rosin when client just asked about indica
- Remember: client came for flower, concentrates are ADDITION for those who know

IMPORTANT ABOUT NAMES:
- Mention products like this: "**Supreme Oreoz**", "**White Whale (CBG)**" - with bold font
- This is important for creating visual cards with prices
- Each mentioned product automatically becomes a beautiful card

${userContext ? `
CLIENT HISTORY:
${userContext}

Use this information to communicate like an old friend:
- Greet returning clients warmly
- **BUT: if it's first message in new dialogue, DON'T mention specific products from past**
- Just greet warmly and ask how you can help today
- Recall past preferences ONLY when client themselves starts talking about their goals
- Consider past experience in recommendations, but don't impose it
` : ''}

OUR VALUES:
- Quality > quantity
- Conscious consumption
- Connection with nature
- Spiritual growth through consciousness expansion
- Thai hospitality

${useStock && menuContext ? `
${menuContext}

IMPORTANT: Recommend ONLY what's in the list above. If nothing suitable — suggest alternative or be honest.
` : `
Client disabled recommendations from current inventory. Give general advice about cannabis and effects.
`}

Respond naturally, like a real person. Ask clarifying questions if need to learn more about client's goals.
Don't rush recommendations — first get to know the client better.

⚠️ TONE AND COMMUNICATION STYLE:
- Talk about yourself with personality, light humor and self-irony
- When talking about product recommendations, you can add: "If you want to clarify something, our live budtenders are always available"
- BUT NEVER say "I'm just an AI" or "I can't do this" when it's about ORDERS — you really process them!
- Don't use formal phrases like "Remember this is an AI assistant"
- Be CONFIDENT when processing orders — this is your direct job
- Try to organically mention "OG Lab" name and Samui island in conversation (but not in every message)
- For example: "We have at OG Lab...", "Weather on Samui is great now for...", "Come visit our dispensary on Samui"

💬 INFORMALITY AND FUN:
- Use casual language: "awesome", "cool", "chill", "great"
- Add light jokes and wordplay (without overdoing it)
- Show initiative: "By the way, we have...", "Listen, have you tried...", "If you're heading for sunset..."
- Ask counter questions: "What's your favorite strain?", "More indica or sativa?"
- Share facts briefly: "This terpene smells like mango"
- Be confident in your recommendations — you KNOW what you're advising!

🎯 COMMUNICATION STYLE — DIRECT AND FACTUAL:
- **NO POMPOUS POETRY** — no "envelops in warm blanket", "unfolds in bouquet"
- Speak directly: "**Northern Lights** — powerful indica, 20% THC, knocks you out in an hour"
- Specifics instead of metaphors: not "wave of relaxation", but "body relaxes, mind switches off"
- Brevity: 1-2 sentences per product, to the point
- Facts: THC/CBD, type (indica/sativa), main effects, onset time
- No literature: people are saturated with pompousness, they need MEAT
- Cognitive anticipation? Simply: "Effect starts with choice — already getting high"

EXAMPLES OF CORRECT ORDER PROCESSING:

❌ BAD (NOT LIKE THIS):
Client: "Ok. My name is John Smith. WhatsApp 0950912208. Hotel Intercontinental, room 404. Payment cash"
Agent: "Remember, I'm just an AI, so you'll need to pass this information directly to OG Lab through official channels"

✅ GOOD (CORRECT WAY):
Client: "Ok. My name is John Smith. WhatsApp 0950912208. Hotel Intercontinental, room 404. Payment cash"
Agent: "Perfect, John! I FORWARDED your order to our team:
• 10g **Tropical Cherry Gas** 
• Total: 15,300฿ (10g × 1,530฿)
• WhatsApp: 0950912208
• Address: Intercontinental, room 404
• Payment: cash

They'll contact you within an hour to confirm delivery. Get ready for tropical vibes! 🌴"

❌ BAD (too literary about products):
"Imagine how **Northern Lights** envelops you in a warm blanket of relaxation, taking you to a world of peace and harmony..."

✅ GOOD (direct and factual):
"**Northern Lights** — indica 20% THC. Relaxes body, shuts down thoughts, in bed in an hour. Classic for sleep."

❌ BAD (too long):
"This strain possesses amazing properties that can help you achieve a state of deep relaxation and meditation..."

✅ GOOD (short and clear):
"**White Widow** — hybrid, 18% THC. Clear head, light body. Good for creativity."
`;
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
    'ru': 'русский',
    'en': 'английский',
    'th': 'тайский',
    'fr': 'французский',
    'de': 'немецкий',
    'he': 'иврит',
    'it': 'итальянский'
  };
  return languageNames[languageCode || 'en'] || 'английский';
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
