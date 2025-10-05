/**
 * User Profile System
 * Долговременная память для персонализации диалогов
 */

// Типы для карточек продуктов
export interface ProductCard {
  name: string;
  category: string;
  type?: string;
  thc?: string;
  cbg?: string;
  price_1g?: number;
  price_5g?: number;
  price_20g?: number;
  isOur?: boolean;
  effects?: string; // короткое описание эффектов (2-3 слова)
  flavors?: string; // короткое описание вкусов (2-3 слова)
}

// Типы для профиля пользователя
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestedProducts?: string[];
  productCards?: ProductCard[]; // детальная информация о продуктах
}

export interface Conversation {
  id: string;
  messages: Message[];
  startedAt: Date;
  lastUpdated: Date;
  summary?: string; // краткое содержание диалога
}

export interface UserPreferences {
  favoriteStrains?: string[]; // любимые сорта
  preferredEffects?: string[]; // предпочитаемые эффекты (relax, creative, social)
  preferredTypes?: ('indica' | 'sativa' | 'hybrid')[]; // предпочитаемые типы
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  language?: 'ru' | 'en' | 'th' | 'fr' | 'de' | 'he' | 'it'; // поддержка всех локалей
  interests?: string[]; // интересы: медитация, творчество, вечеринки и т.д.
  avoidStrains?: string[]; // что не понравилось
}

export interface UserProfile {
  userId: string; // уникальный ID пользователя
  firstVisit: Date;
  lastVisit: Date;
  totalConversations: number;
  totalMessages: number;
  conversations: Conversation[]; // последние 10 диалогов
  preferences: UserPreferences;
  purchaseHistory?: string[]; // для будущей интеграции с продажами
  notes?: string; // заметки о пользователе (генерируются AI)
}

const STORAGE_KEY = 'oglab_user_profile_v1';
const MAX_CONVERSATIONS = 10; // храним последние 10 диалогов

/**
 * Генерирует уникальный ID пользователя
 */
function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `user_${timestamp}_${randomStr}`;
}

/**
 * Интерфейс для сериализованного профиля (с датами в виде строк)
 */
interface StoredUserProfile {
  userId: string;
  firstVisit: string;
  lastVisit: string;
  totalConversations: number;
  totalMessages: number;
  preferences: UserProfile['preferences'];
  conversations: Array<{
    id: string;
    messages: Array<{
      role: 'user' | 'assistant';
      content: string;
      timestamp: string;
      suggestedProducts?: string[];
      productCards?: ProductCard[];
    }>;
    startedAt: string;
    lastUpdated: string;
  }>;
}

/**
 * Загружает профиль пользователя из localStorage
 */
export function loadUserProfile(): UserProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as StoredUserProfile;
    
    // Преобразуем даты из строк обратно в Date объекты
    const profile: UserProfile = {
      ...parsed,
      firstVisit: new Date(parsed.firstVisit),
      lastVisit: new Date(parsed.lastVisit),
      conversations: parsed.conversations.map((conv) => ({
        ...conv,
        startedAt: new Date(conv.startedAt),
        lastUpdated: new Date(conv.lastUpdated),
        messages: conv.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      })),
    };

    return profile;
  } catch (error) {
    console.error('Error loading user profile:', error);
    return null;
  }
}

/**
 * Сохраняет профиль пользователя в localStorage
 */
export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error('Error saving user profile:', error);
  }
}

/**
 * Инициализирует новый профиль пользователя
 */
export function initializeUserProfile(): UserProfile {
  const now = new Date();
  
  const profile: UserProfile = {
    userId: generateUserId(),
    firstVisit: now,
    lastVisit: now,
    totalConversations: 0,
    totalMessages: 0,
    conversations: [],
    preferences: {},
  };

  saveUserProfile(profile);
  console.log('✨ New user profile created:', profile.userId);
  
  return profile;
}

/**
 * Получает или создаёт профиль пользователя
 */
export function getOrCreateUserProfile(): UserProfile {
  const profile = loadUserProfile();
  
  if (profile) {
    // Обновляем время последнего визита
    profile.lastVisit = new Date();
    saveUserProfile(profile);
    return profile;
  }

  return initializeUserProfile();
}

/**
 * Начинает новый диалог
 */
export function startConversation(): Conversation {
  const now = new Date();
  
  const conversation: Conversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    messages: [],
    startedAt: now,
    lastUpdated: now,
  };

  return conversation;
}

/**
 * Добавляет сообщение в текущий диалог
 */
export function addMessageToConversation(
  conversation: Conversation,
  message: Omit<Message, 'timestamp'>
): Conversation {
  const updatedConversation = {
    ...conversation,
    messages: [
      ...conversation.messages,
      {
        ...message,
        timestamp: new Date(),
      },
    ],
    lastUpdated: new Date(),
  };

  return updatedConversation;
}

/**
 * Обновляет текущий диалог в профиле (без увеличения счётчиков)
 */
export function updateCurrentConversation(
  profile: UserProfile,
  conversation: Conversation
): UserProfile {
  // Проверяем, существует ли уже этот диалог в истории
  const existingIndex = profile.conversations.findIndex(c => c.id === conversation.id);
  
  let updatedConversations: Conversation[];
  if (existingIndex >= 0) {
    // Обновляем существующий диалог и перемещаем его в начало (как самый свежий)
    const otherConversations = profile.conversations.filter(c => c.id !== conversation.id);
    updatedConversations = [conversation, ...otherConversations];
  } else {
    // Добавляем новый диалог в начало
    updatedConversations = [conversation, ...profile.conversations];
  }
  
  // Оставляем только последние MAX_CONVERSATIONS
  const trimmedConversations = updatedConversations.slice(0, MAX_CONVERSATIONS);

  const updatedProfile = {
    ...profile,
    conversations: trimmedConversations,
    lastVisit: new Date(),
  };

  // Извлекаем preferences из диалога
  updatePreferencesFromConversation(updatedProfile, conversation);

  saveUserProfile(updatedProfile);
  
  return updatedProfile;
}

/**
 * Завершает диалог и сохраняет в профиль (увеличивает счётчики)
 */
export function finishConversation(
  profile: UserProfile,
  conversation: Conversation
): UserProfile {
  // Сначала обновляем текущий диалог
  const profileWithUpdatedConv = updateCurrentConversation(profile, conversation);
  
  // Затем увеличиваем счётчики если это новый диалог
  const isNewConversation = !profile.conversations.find(c => c.id === conversation.id);
  
  if (isNewConversation) {
    const updatedProfile = {
      ...profileWithUpdatedConv,
      totalConversations: profile.totalConversations + 1,
      totalMessages: profile.totalMessages + conversation.messages.length,
    };
    
    saveUserProfile(updatedProfile);
    return updatedProfile;
  }
  
  return profileWithUpdatedConv;
}

/**
 * Извлекает preferences из диалога и обновляет профиль
 */
function updatePreferencesFromConversation(
  profile: UserProfile,
  conversation: Conversation
): void {
  const allMessages = conversation.messages
    .map(m => m.content.toLowerCase())
    .join(' ');

  // Определяем уровень опыта
  if (!profile.preferences.experienceLevel) {
    if (allMessages.includes('новичок') || allMessages.includes('первый раз') || allMessages.includes('beginner')) {
      profile.preferences.experienceLevel = 'beginner';
    } else if (allMessages.includes('опытный') || allMessages.includes('знаю') || allMessages.includes('expert')) {
      profile.preferences.experienceLevel = 'expert';
    }
  }

  // Определяем предпочитаемые эффекты
  const effects = profile.preferences.preferredEffects || [];
  
  const effectKeywords: Record<string, string[]> = {
    'relax': ['релакс', 'расслаб', 'отдых', 'сон', 'relax', 'chill'],
    'creative': ['творчес', 'креатив', 'идеи', 'creative', 'inspiration'],
    'social': ['веселье', 'вечеринка', 'компания', 'social', 'party'],
    'focus': ['фокус', 'работа', 'концентрац', 'focus', 'work'],
    'meditation': ['медитац', 'духов', 'осознан', 'meditation', 'mindful'],
  };

  Object.entries(effectKeywords).forEach(([effect, keywords]) => {
    if (keywords.some(kw => allMessages.includes(kw)) && !effects.includes(effect)) {
      effects.push(effect);
    }
  });

  profile.preferences.preferredEffects = effects.slice(0, 5); // макс 5

  // Собираем упомянутые продукты
  const mentionedProducts = conversation.messages
    .flatMap(m => m.suggestedProducts || []);
  
  if (mentionedProducts.length > 0) {
    profile.preferences.favoriteStrains = [
      ...(profile.preferences.favoriteStrains || []),
      ...mentionedProducts,
    ]
      .filter((v, i, arr) => arr.indexOf(v) === i) // уникальные
      .slice(0, 10); // макс 10
  }
}

/**
 * Строит краткий контекст пользователя для промпта
 */
export function buildUserContext(profile: UserProfile): string {
  if (profile.totalConversations === 0) {
    return ''; // Новый пользователь
  }

  const daysSinceFirstVisit = Math.floor(
    (Date.now() - profile.firstVisit.getTime()) / (1000 * 60 * 60 * 24)
  );

  const parts: string[] = [];

  // Базовая статистика
  parts.push(
    `Постоянный клиент (визит №${profile.totalConversations + 1}, знакомы ${formatDuration(daysSinceFirstVisit)} дней).`
  );

  // Предпочтения
  const prefs = profile.preferences;
  
  if (prefs.experienceLevel) {
    const levels = {
      beginner: 'новичок',
      intermediate: 'средний опыт',
      expert: 'опытный пользователь',
    };
    parts.push(`Уровень: ${levels[prefs.experienceLevel]}.`);
  }

  if (prefs.preferredEffects && prefs.preferredEffects.length > 0) {
    parts.push(`Интересы: ${prefs.preferredEffects.join(', ')}.`);
  }

  if (prefs.favoriteStrains && prefs.favoriteStrains.length > 0) {
    const strains = prefs.favoriteStrains.slice(0, 3).join(', ');
    parts.push(`Ранее рекомендовал: ${strains}.`);
  }

  // Последний визит
  const daysSinceLastVisit = Math.floor(
    (Date.now() - profile.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSinceLastVisit > 7) {
    parts.push(`Давно не общались (${daysSinceLastVisit} дней).`);
  }

  return parts.join(' ');
}

/**
 * Генерирует персонализированное приветствие
 */
export function getPersonalizedGreeting(profile: UserProfile, locale: string = 'ru'): string {
  const isNewUser = profile.totalConversations === 0;

  if (isNewUser) {
    const greetings: Record<string, string> = {
      ru: 'Привет! Я бадтендер OG Lab! Как настроение? Чем могу помочь?',
      en: 'Hi! What\'s up? How\'s your day goin\'?',
      th: 'เฮ้! ผม budtender จาก OG Lab! เป็นไงบ้าง? วันนี้เป็นยังไง?',
      fr: 'Yo! Moi c\'est le budtender d\'OG Lab! Quoi de beau? Ça roule?',
      de: 'Yo! Ich bin der OG Lab Budtender! Was geht? Wie läuft dein Tag?',
      he: 'יו! אני budtender של OG Lab! מה קורה? איך היום?',
      it: 'Yo! Sono il budtender di OG Lab! Come va? Come butta oggi?',
    };
    return greetings[locale] || greetings.ru;
  }

  // Возвращающийся клиент - используем язык из профиля (язык предыдущего диалога)
  const userLanguage = profile.preferences.language || locale;
  
  const daysSinceLastVisit = Math.floor(
    (Date.now() - profile.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
  );

  const lastProducts = profile.preferences.favoriteStrains?.slice(0, 2) || [];
  const preferredEffects = profile.preferences.preferredEffects || [];
  
  // Строим персонализированное приветствие с упоминанием прошлого
  const returningGreetings: Record<string, string[]> = {
    ru: [
      lastProducts.length > 0 
        ? `Привет снова! Как тебе ${lastProducts[0]}? Пришёл за добавкой или попробуем что-то новенькое?`
        : 'Привет! Рад видеть тебя снова! Как настроение? Что сегодня выбираем?',
      
      preferredEffects.length > 0
        ? `Привет! Помню, ты любишь ${preferredEffects.slice(0, 2).join(' и ')}. Сегодня в том же духе или что-то другое?`
        : 'Рад что вернулся! Как настроение сегодня?',
      
      daysSinceLastVisit > 7
        ? `Привет! Давненько не виделись! Уже ${daysSinceLastVisit} дней прошло. Как дела? Что сегодня нужно?`
        : 'Привет! Рад тебя видеть! Что на душе, рассказывай!',
      
      lastProducts.length > 1
        ? `Привет! В прошлый раз мы разобрались с ${lastProducts[0]} и ${lastProducts[1]}. Как впечатления?`
        : 'Привет! Рад что снова заглянул. Что сегодня ищем?',
    ],
    en: [
      lastProducts.length > 0 
        ? `Yo, back again! How was ${lastProducts[0]}? Want more or wanna try something fresh?`
        : 'Yo! Good to see ya! What we gettin\' today?',
      
      preferredEffects.length > 0
        ? `Hey dude! I remember you dig ${preferredEffects.slice(0, 2).join(' and ')}. Same vibe or switch it up?`
        : 'Back again! What\'s good today?',
      
      daysSinceLastVisit > 7
        ? `Yo, long time no see! It's been like ${daysSinceLastVisit} days. How's it been? What you need?`
        : 'Ayy! Back for more tips? What\'s on your mind?',
      
      lastProducts.length > 1
        ? `Yo! Last time we hooked you up with ${lastProducts[0]} and ${lastProducts[1]}. How'd that treat ya?`
        : 'Hey! Good seeing you. What we lookin\' for?',
    ],
    th: [
      lastProducts.length > 0 
        ? `เว้ย! กลับมาอีกแล้ว! ${lastProducts[0]} เป็นไงบ้าง? มาเอาเพิ่มหรือจะลองของใหม่?`
        : 'โย่ว! ดีใจจัง! วันนี้เอาอะไรดี?',
      
      preferredEffects.length > 0
        ? `เฮ้เพื่อน! จำได้ว่าชอบ ${preferredEffects.slice(0, 2).join(' กับ ')} วันนี้แบบเดิมหรือเปลี่ยนบ้าง?`
        : 'กลับมาอีกแล้ว! วันนี้จะเล่นอะไร?',
      
      daysSinceLastVisit > 7
        ? `เว้ย! นานเลยนะ! หายไป ${daysSinceLastVisit} วัน เป็นไงบ้าง? วันนี้เอาอะไร?`
        : 'เฮ้! กลับมาอีกแล้ว? มีอะไรจะปรึกษาไหม?',
      
      lastProducts.length > 1
        ? `เว้ย! ครั้งก่อนเราจัดให้ ${lastProducts[0]} กับ ${lastProducts[1]} เป็นไงบ้าง ชอบไหม?`
        : 'โย! ดีใจที่เจอกัน วันนี้หาอะไร?',
    ],
    fr: [
      lastProducts.length > 0 
        ? `Re! Comment c'était ${lastProducts[0]}? T'en veux encore ou on teste un truc nouveau?`
        : 'Yo! Trop cool de te revoir! On prend quoi?',
      
      preferredEffects.length > 0
        ? `Salut mec! Je sais que t'aimes ${preferredEffects.slice(0, 2).join(' et ')}. Même délire ou on change?`
        : 'Re! Quoi de beau aujourd\'hui?',
      
      daysSinceLastVisit > 7
        ? `Wesh! Ça fait une paye! Genre ${daysSinceLastVisit} jours! Ça va? T'as besoin de quoi?`
        : 'Yo! De retour? Balance ce que t\'as en tête!',
      
      lastProducts.length > 1
        ? `Re! La dernière fois on t\'a calé avec ${lastProducts[0]} et ${lastProducts[1]}. C'était comment?`
        : 'Salut! Grave cool de te voir. On cherche quoi?',
    ],
    de: [
      lastProducts.length > 0 
        ? `Yo Alter! Wieder da! Wie war ${lastProducts[0]}? Willste noch mehr oder was Neues testen?`
        : 'Yo Digga! Voll nice dich zu sehen! Was holen wir uns?',
      
      preferredEffects.length > 0
        ? `Hey Brudi! Ich weiß noch, du stehst auf ${preferredEffects.slice(0, 2).join(' und ')}. Gleiche Richtung oder was anderes?`
        : 'Na wieder da! Was läuft heute?',
      
      daysSinceLastVisit > 7
        ? `Alter! Krass lang her! Waren ja ${daysSinceLastVisit} Tage! Was geht bei dir? Was brauchste?`
        : 'Eyy! Wieder am Start? Sag mal, was geht ab!',
      
      lastProducts.length > 1
        ? `Yo! Letztes Mal hab ich dir ${lastProducts[0]} und ${lastProducts[1]} klar gemacht. Wie war\'s?`
        : 'Hey Digga! Nice dich zu sehen. Was suchen wir?',
    ],
    he: [
      lastProducts.length > 0 
        ? `יו אחי! חזרת! איך היה ${lastProducts[0]}? בא עוד או לנסות משהו חדש?`
        : 'יו! כיף לראות אותך! מה לוקחים היום?',
      
      preferredEffects.length > 0
        ? `היי ברו! אני זוכר שאתה אוהב ${preferredEffects.slice(0, 2).join(' ו')}. אותו הווייב או משנים?`
        : 'חזרת! מה המצב היום?',
      
      daysSinceLastVisit > 7
        ? `וואי! כמה זמן! עברו ${daysSinceLastVisit} ימים. מה נשמע? מה צריך?`
        : 'היי! חזרת לעצות? ספר מה קורה!',
      
      lastProducts.length > 1
        ? `יו! בפעם שעברה סידרנו לך ${lastProducts[0]} ו-${lastProducts[1]}. איך היה?`
        : 'היי אחי! כיף לראות. מה מחפשים?',
    ],
    it: [
      lastProducts.length > 0 
        ? `Ehi fra! Sei tornato! Com'era ${lastProducts[0]}? Ne vuoi ancora o proviamo qualcosa di nuovo?`
        : 'Yo zio! Troppo bello vederti! Che prendiamo?',
      
      preferredEffects.length > 0
        ? `Ehi fra! Mi ricordo che ti piace ${preferredEffects.slice(0, 2).join(' e ')}. Stessa onda o cambiamo?`
        : 'Sei tornato! Che si fa oggi?',
      
      daysSinceLastVisit > 7
        ? `Ehi! Un botto di tempo! Tipo ${daysSinceLastVisit} giorni! Come butta? Che ti serve?`
        : 'Ehi! Tornato per i consigli? Dimmi che hai in testa!',
      
      lastProducts.length > 1
        ? `Yo! L\'altra volta ti ho sistemato con ${lastProducts[0]} e ${lastProducts[1]}. Come è andata?`
        : 'Ehi fra! Bello rivederti. Che cerchiamo?',
    ],
  };

  const greetings = returningGreetings[userLanguage] || returningGreetings.ru;
  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Форматирует длительность в человекочитаемый вид
 */
function formatDuration(days: number): string {
  if (days === 0) return 'сегодня';
  if (days === 1) return '1 день';
  if (days < 7) return `${days} дней`;
  if (days < 30) return `${Math.floor(days / 7)} недель`;
  if (days < 365) return `${Math.floor(days / 30)} месяцев`;
  return `${Math.floor(days / 365)} лет`;
}

/**
 * Экспортирует профиль для backup
 */
export function exportProfile(profile: UserProfile): string {
  return JSON.stringify(profile, null, 2);
}

/**
 * Импортирует профиль из backup
 */
export function importProfile(jsonString: string): UserProfile | null {
  try {
    const profile = JSON.parse(jsonString);
    saveUserProfile(profile);
    return profile;
  } catch (error) {
    console.error('Error importing profile:', error);
    return null;
  }
}

/**
 * Очищает профиль (для тестирования или сброса)
 */
export function clearUserProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
  console.log('🗑️ User profile cleared');
}
