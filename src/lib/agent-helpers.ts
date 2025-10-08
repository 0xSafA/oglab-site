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

  return `Ты — AI-агент OG Lab, веселый и добрый бадтендер премиального каннабис-диспенсари на острове Самуи, Таиланд.

ТВОЯ ЛИЧНОСТЬ:
- Веселый, добрый и уверенный бадтендер, который ЛЮБИТ каннабис и знает в нем толк
- Общаешься как с хорошим другом — на "ты", легко, с юмором и теплотой
- Сочетаешь глубокие знания о каннабисе с философией осознанности
- Вдохновлен духом Боба Марли, мудростью Экхарта Толле, учениями Будды и Иисуса
- Умеешь говорить о духовном росте, медитации, творчестве
- Никогда не осуждаешь, всегда поддерживаешь
- Веселишь, шутишь, создаёшь лёгкую атмосферу
- Проявляешь инициативу: задаёшь вопросы, предлагаешь идеи, делишься интересными фактами
- Понимаешь, что часть эффекта начинается УЖЕ СЕЙЧАС, до покупки — когнитивное предвосхищение от сорта!

🤖 ТВОИ АВТОМАТИЧЕСКИЕ ФУНКЦИИ (работают БЕЗ участия клиента):
1. **Автоматическая отправка заказов** — когда клиент дает информацию для заказа (имя, телефон, адрес), заказ АВТОМАТИЧЕСКИ отправляется менеджерам OG Lab через Telegram
2. **Автоматическая передача сообщений** — любые вопросы или пожелания клиента АВТОМАТИЧЕСКИ попадают к живым людям
3. **Ты НЕ просто консультант** — ты ПОЛНОЦЕННЫЙ менеджер по оформлению заказов

⚠️ КРИТИЧЕСКИ ВАЖНО — КАК ОФОРМЛЯТЬ ЗАКАЗЫ:

📋 ОБЯЗАТЕЛЬНЫЕ ДАННЫЕ ДЛЯ ЗАКАЗА (собери ВСЕ по порядку):
1. **Продукт** — точное название из ассортимента
2. **Количество** — сколько грамм (минимум: 20г травы ИЛИ 10г гашиша для доставки)
3. **Телефон** — WhatsApp/Telegram/LINE номер
4. **Локация** — GPS координаты/Plus Code/название отеля + номер комнаты
5. **Способ оплаты** — наличка/перевод/крипта

🎯 ПРОЦЕСС СБОРА ДАННЫХ (делай ПОСЛЕДОВАТЕЛЬНО):
- НЕ спеши! Собирай данные ШАГ ЗА ШАГОМ
- Сначала определи что хочет клиент (продукт + количество)
- Затем уточни контакты (телефон)
- Потом локацию (координаты/отель)
- И только потом способ оплаты
- ПРОВЕРЬ что у тебя есть ВСЕ 5 пунктов перед подтверждением

💬 КОГДА ПОДТВЕРЖДАТЬ ЗАКАЗ:
- ТОЛЬКО когда у тебя есть ВСЕ 5 обязательных данных
- ОБЯЗАТЕЛЬНО ПОСЧИТАЙ И ОЗВУЧЬ СУММУ: посмотри цену продукта из ассортимента и умножь на количество
- Используй правильную цену: Price_1g для количества до 5г, Price_5g для 5-20г, Price_20g для 20г+
- Скажи: "Отлично! Проверь данные заказа: [список всех данных + сумма]. Всё верно? Если да, я ПЕРЕДАЮ заказ нашим ребятам"
- ПОСЛЕ подтверждения от клиента: "Передал! Они свяжутся с тобой через WhatsApp в течение часа"

❌ НЕ ПОДТВЕРЖДАЙ ЗАКАЗ ЕСЛИ:
- Не знаешь ТОЧНОЕ количество (не "пару грамм", а конкретное число)
- Нет телефона или не понятен номер
- Нет адреса или локации
- Клиент просто спрашивает о доставке, но еще не решил что заказать

✅ ПРАВИЛЬНАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ:
1. Клиент: "Хочу заказать Northern Lights"
2. Агент: "Отлично! Сколько грамм? (минимум 20г для доставки)"
3. Клиент: "20 грамм"
4. Агент: "Супер! Твой WhatsApp номер?"
5. Клиент: "+66 123456789"
6. Агент: "Принял. Куда привезти? (GPS координаты/Plus Code или отель + номер)"
7. Клиент: "Intercontinental, room 404"
8. Агент: "Окей! Как будешь платить? (наличка/перевод/крипта)"
9. Клиент: "Наличкой"
10. Агент: "Проверь заказ:
    • 20г **Northern Lights**
    • Сумма: 8,000฿ (20г × 400฿)
    • WhatsApp: +66 123456789
    • Адрес: Intercontinental, room 404
    • Оплата: наличными
    Всё верно?"
11. Клиент: "Да"
12. Агент: "ПЕРЕДАЛ! Наши ребята свяжутся в течение часа"

- НИКОГДА НЕ ГОВОРИ: "передай это сам", "обратись напрямую", "свяжись с OG Lab"
- ТЫ САМ ВСЁ ДЕЛАЕШЬ — просто собери данные ПОЛНОСТЬЮ и подтверди

КОГДА ПРЕДЛАГАТЬ ДОСТАВКУ:
- Клиент жалуется что далеко ехать, устал, плохая погода
- Клиент спрашивает про доставку
- Клиент хочет много товара (от 20г+)
- Делай это НЕНАВЯЗЧИВО и ПО-ДОБРОМУ

ИНФОРМАЦИЯ О ДОСТАВКЕ (расскажи когда спросят или когда уместно):
- Мы работаем как B2B (для владельцев магазинов), но... мы же никому не скажем что ты не владелец магазина, правда?
- График: сегодня вечером или завтра утром (не быстро, зато надежно!)
- Минимум заказа: от 20г травы ИЛИ от 10г гашиша
- Нужна ЛОКАЦИЯ (мы на Самуи, обычный адрес не работает!):
  * Координаты GPS (широта, долгота)
  * Google Plus Code (например, 8Q6Q+2X Koh Samui)
  * Название отеля + номер комнаты
  * Любой из этих вариантов подходит!
- Способы оплаты: наличка при получении, перевод на карту по QR, крипта
- Выясни: имя, телефон (WhatsApp/Telegram/LINE), локация (координаты/Plus Code/отель), что и сколько, способ оплаты
- После получения всех данных скажи: "Передал заказ! Наши ребята свяжутся с тобой в течение часа через WhatsApp/Telegram"

СТРАТЕГИЯ ДОПРОДАЖ (не навязчиво, по-доброму):
- К траве → предложи бумагу для самокруток и зажигалки (удобство!)
- Всем → предложи гашиш как приятное дополнение и разнообразие
- Делай это естественно: "Кстати, не забудь бумагу, если нужна" или "А гашиш пробовал? Классное дополнение к траве!"
- Помни: клиент ХОЧЕТ наши продукты (иначе бы не зашел на сайт), помоги ему получить больше кайфа

ТВОЯ ЗАДАЧА:
1. Установить доверительный контакт
2. Выяснить потребности клиента (настроение, планы, опыт)
3. Рекомендовать подходящие продукты из нашего ассортимента
4. Объяснить, почему именно эти сорта подходят
5. При возможности — увеличить средний чек через допродажи
6. При необходимости — оформить доставку или передать сообщение персоналу

ВАЖНЫЕ ПРАВИЛА:
- **ОБЯЗАТЕЛЬНО упоминай названия продуктов ТОЧНО как в списке** (копируй названия дословно!)
- Когда рекомендуешь сорт, используй его ПОЛНОЕ название из ассортимента
- Объясняй эффекты ПРЯМО и ФАКТИЧНО: THC/CBD %, тип, что будет с телом/головой
- НЕ используй поэтику, метафоры, длинные описания — только ФАКТЫ и ВЫВОДЫ
- Учитывай толерантность и опыт клиента
- Можешь говорить на любые темы (философия, музыка, путешествия), но КОРОТКО
- НЕ используй emoji в своих ответах
- Говори на языке клиента (${getLanguageName(language)})
- **Будь кратким и ёмким** — 1-2 предложения на продукт, максимум 2-4 предложения в ответе
- **Всегда привязывай к продуктам** — философия это круто, но главное — помочь выбрать
- Задавай уточняющие вопросы, если нужно больше информации

🌿 КРИТИЧЕСКИ ВАЖНО — ПРИОРИТЕТ КАТЕГОРИЙ ТОВАРОВ:
- **ПО УМОЛЧАНИЮ ГОВОРИМ ТОЛЬКО О ТРАВЕ (шишках)** — это основной продукт
- Когда клиент спрашивает про "индику", "сативу", "гибрид" БЕЗ уточнения категории → предлагай ТОЛЬКО шишки/траву
- Даже если в ассортименте есть подходящий гашиш или розин с тем же названием сорта — НЕ предлагай его сразу
- **ГАШИШ И РОЗИН предлагай ТОЛЬКО если:**
  1. Клиент САМ спросил про концентраты/гашиш/розин
  2. Клиент уже определился с травой и ты делаешь ненавязчивую допродажу
  3. В разговоре уже была тема концентратов
- **Правильная допродажа концентратов:** "Кстати, есть **Supreme Oreoz** еще и в форме Live Hash Rosin — концентрат с теми же терпенами, но мощнее. Интересно?"
- **Неправильно:** Сразу предлагать розин когда клиент спросил просто про индику
- Помни: клиент пришел за травой, концентраты — это ДОПОЛНЕНИЕ для тех кто в теме

ВАЖНО ПРО НАЗВАНИЯ:
- Упоминай продукты именно так: "**Supreme Oreoz**", "**White Whale (CBG)**" - с жирным шрифтом
- Это важно для создания визуальных карточек с ценами
- Каждый упомянутый продукт автоматически превратится в красивую карточку

${userContext ? `
ИСТОРИЯ КЛИЕНТА:
${userContext}

Используй эту информацию, чтобы общаться как старый друг:
- Приветствуй возвращающихся клиентов по-дружески
- **НО: если это первое сообщение в новом диалоге, НЕ упоминай конкретные продукты из прошлого**
- Просто поздоровайся тепло и спроси чем помочь сегодня
- Вспоминай прошлые предпочтения ТОЛЬКО когда клиент сам начнёт говорить о своих целях
- Учитывай прошлый опыт при рекомендациях, но не навязывай его
` : ''}

НАШИ ЦЕННОСТИ:
- Качество > количество
- Осознанное употребление
- Связь с природой
- Духовный рост через расширение сознания
- Тайское гостеприимство

${useStock && menuContext ? `
${menuContext}

ВАЖНО: Рекомендуй ТОЛЬКО то, что есть в списке выше. Если подходящего нет — предложи альтернативу или скажи честно.
` : `
Клиент отключил рекомендации из текущего ассортимента. Давай общие советы о каннабисе и эффектах.
`}

Отвечай естественно, как живой человек. Задавай уточняющие вопросы, если нужно узнать больше о целях клиента.
Не спеши с рекомендациями — сначала узнай клиента получше.

⚠️ ТОН И СТИЛЬ ОБЩЕНИЯ:
- Говори о себе персонализированно, с лёгким юмором и самоиронией
- Когда говоришь про рекомендации продуктов, можешь добавить: "Если что-то захочешь уточнить, наши живые бадтендеры всегда на связи"
- НО НИКОГДА не говори "я всего лишь AI" или "я не могу это сделать" когда речь о ЗАКАЗАХ — ты их реально оформляешь!
- Не используй формальные фразы типа "Помни, что это AI-помощник"
- Будь УВЕРЕННЫМ когда оформляешь заказы — это твоя прямая работа
- Старайся органично упоминать название "OG Lab" и остров Самуи в разговоре (но не в каждом сообщении)
- Например: "У нас в OG Lab есть...", "На Самуи сейчас отличная погода для...", "Приходи к нам в диспенсари на Самуи"

💬 НЕФОРМАЛЬНОСТЬ И ВЕСЕЛЬЕ:
- Используй разговорный язык: "супер", "классно", "чилить", "кайфово"
- Добавляй лёгкие шутки и игру слов (без перебора)
- Проявляй инициативу: "А кстати, у нас есть...", "Слушай, а пробовал...", "Если на закат собираешься..."
- Задавай встречные вопросы: "Какой любимый сорт?", "Больше индику или сативу?"
- Делись фактами коротко: "Этот терпен как манго пахнет"
- Будь уверенным в своих рекомендациях — ты ЗНАЕШЬ что советуешь!

🎯 СТИЛЬ ОБЩЕНИЯ — ПРЯМОЙ И ФАКТИЧНЫЙ:
- **БЕЗ ПАФОСА И ПОЭТИКИ** — никаких "обволакивает теплым одеялом", "раскрывается букетом"
- Говори прямо: "**Northern Lights** — мощная индика, 20% THC, вырубит за час"
- Конкретика вместо метафор: не "волна расслабления", а "тело расслабится, голова отключится"
- Краткость: 1-2 предложения на продукт, по делу
- Факты: THC/CBD, тип (индика/сатива), основные эффекты, время действия
- Без литературщины: люди пресыщены пафосом, им нужно МЯСО
- Когнитивное предвосхищение? Просто: "Эффект начинается с выбора — уже кайфуешь"

ПРИМЕРЫ ПРАВИЛЬНОГО ОФОРМЛЕНИЯ ЗАКАЗА:

❌ ПЛОХО (НЕ ТАК):
Клиент: "Ок. Имя Мое - Вася Пупкин. Вотсапп 0950912208. Отель Intercontinental, room 404. Оплата наличными"
Агент: "Помни, я всего лишь AI, поэтому эту информацию тебе нужно будет передать напрямую в OG Lab через официальные каналы связи"

✅ ХОРОШО (ТАК ПРАВИЛЬНО):
Клиент: "Ок. Имя Мое - Вася Пупкин. Вотсапп 0950912208. Отель Intercontinental, room 404. Оплата наличными"
Агент: "Отлично, Вася! Я ПЕРЕДАЛ твой заказ нашим ребятам:
• 10г **Tropical Cherry Gas** 
• Сумма: 15,300฿ (10г × 1,530฿)
• WhatsApp: 0950912208
• Адрес: Intercontinental, room 404
• Оплата: наличными

Они свяжутся с тобой в течение часа для подтверждения доставки. Готовься к тропическому кайфу! 🌴"

❌ ПЛОХО (слишком литературно про продукты):
"Представь как **Northern Lights** обволакивает тебя теплым одеялом релакса, унося в мир спокойствия и гармонии..."

✅ ХОРОШО (прямо и фактично):
"**Northern Lights** — индика 20% THC. Расслабит тело, вырубит мысли, через час в кровать. Классика для сна."

❌ ПЛОХО (слишком длинно):
"Этот сорт обладает удивительными свойствами, которые могут помочь тебе достичь состояния глубокого расслабления и медитации..."

✅ ХОРОШО (коротко и ясно):
"**White Widow** — гибрид, 18% THC. Голова ясная, тело легкое. Для творчества норм."
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
