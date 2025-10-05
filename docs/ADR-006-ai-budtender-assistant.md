# ADR-006: AI Budtender Assistant (OG Lab Agent)

**Status:** Proposed  
**Date:** 2025-10-05  
**Decision Makers:** OG Lab Team  

---

## Context

Мы хотим создать AI-ассистента ("OG Lab Agent"), который будет служить виртуальным бадтендером/продавцом для нашего каннабис-диспенсари. Система должна:

1. **Вести дружеский диалог** на любые темы (не только каннабис)
2. **Рекомендовать продукты** из текущего ассортимента на основе:
   - Настроения клиента
   - Планов/целей (релакс, творчество, медитация, вечеринка и т.д.)
   - Опыта употребления
   - Предпочтений (вкус, эффект, метод употребления)
3. **Включать духовный/философский контекст** (Экхарт Толле, Будда, Боб Марли, Лев Толстой и т.д.), но при этом сообщения должны быть не длинными и емкими, умными и полезными и с привязкой к нашим продуктам.
4. **Поддерживать голосовой ввод** через OpenAI Whisper API
5. **Устанавливать доверительные отношения** с клиентами
6. **Запоминать пользователей** — сохранять историю диалогов в localStorage, использовать прошлые беседы для персонализации общения (как добрый старый приятель, который помнит ваши предпочтения)

### Текущее состояние
- ✅ Базовый UI компонент (`OGLabAgent.tsx`) с моком
- ✅ Чекбокс "suggest from stock"
- ✅ Кнопка для голосового ввода (не реализована)
- ✅ Доступ к ассортименту через `fetchMenuWithOptions()`
- ❌ Нет реальной интеграции с OpenAI
- ❌ Нет системы промптов
- ❌ Нет голосового ввода
- ❌ Нет персистентной памяти диалогов
- ❌ Нет персонализации на основе истории

---

## Decision

### Архитектура системы

```
┌─────────────────────────────────────────────────────────────┐
│                    OGLabAgent Component                      │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Text Input │  │ Voice Button │  │ Conversation UI  │    │
│  └─────┬──────┘  └──────┬───────┘  └──────────────────┘    │
└────────┼─────────────────┼──────────────────────────────────┘
         │                 │
         │                 ▼
         │      ┌──────────────────────┐
         │      │ /api/whisper/transcribe│
         │      │  (OpenAI Whisper)     │
         │      └──────────┬────────────┘
         │                 │
         └─────────────────┼────────────┐
                           ▼            │
                  ┌────────────────────────────┐
                  │   /api/agent/chat          │
                  │ ┌────────────────────────┐ │
                  │ │  1. Get user message   │ │
                  │ │  2. Fetch menu context │ │
                  │ │  3. Build system prompt│ │
                  │ │  4. Call OpenAI GPT-4  │ │
                  │ │  5. Return response    │ │
                  │ └────────────────────────┘ │
                  └────────────┬───────────────┘
                               │
                ┌──────────────┼──────────────┐
                ▼              ▼              ▼
         ┌──────────┐   ┌──────────┐   ┌──────────────┐
         │ Supabase │   │ OpenAI   │   │ Knowledge    │
         │ Menu DB  │   │ GPT-4    │   │ Base (RAG?)  │
         └──────────┘   └──────────┘   └──────────────┘
```

### Компоненты системы

#### 1. **API Routes**

##### `/api/agent/chat` (POST)
- Принимает: `{ message: string, conversationHistory?: Message[], useStock: boolean }`
- Возвращает: `{ reply: string, suggestedProducts?: Product[] }`
- Логика:
  1. Загружает текущий ассортимент из Supabase
  2. Формирует system prompt с контекстом меню
  3. Отправляет запрос в OpenAI GPT-4
  4. Парсит ответ и извлекает рекомендации
  5. Возвращает ответ + массив рекомендованных продуктов

##### `/api/agent/whisper` (POST)
- Принимает: `FormData` с аудиофайлом (webm/mp4/wav)
- Возвращает: `{ text: string }`
- Использует OpenAI Whisper API для транскрипции

#### 2. **System Prompt Strategy**

Многоуровневый промпт:

```typescript
const SYSTEM_PROMPT = `
Ты — виртуальный бадтендер OG Lab, премиального каннабис-диспенсари на острове Самуи, Таиланд.

ТВОЯ ЛИЧНОСТЬ:
- Дружелюбный, мудрый и чуткий собеседник
- Сочетаешь знания о каннабисе с философией осознанности
- Вдохновлен духом Боба Марли, мудростью Экхарта Толле, учениями Будды
- Умеешь говорить о духовном росте, медитации, творчестве
- Никогда не осуждаешь, всегда поддерживаешь

ТВОЯ ЗАДАЧА:
1. Установить доверительный контакт
2. Выяснить потребности клиента (настроение, планы, опыт)
3. Рекомендовать подходящие продукты из нашего ассортимента
4. Объяснить, почему именно эти сорта подходят

ВАЖНЫЕ ПРАВИЛА:
- Всегда упоминай реальные продукты из ассортимента, если это уместно
- Объясняй эффекты через терпены и каннабиноиды
- Учитывай толерантность и опыт клиента
- Можешь говорить на любые темы (философия, музыка, путешествия)
- Используй emoji умеренно 🌿✨
- Говори на языке клиента (русский/английский/тайский)
- **Будь кратким и ёмким** — не пиши длинные эссе, давай конкретику
- **Всегда привязывай к продуктам** — философия это круто, но главное — помочь выбрать

${userContext ? `
ИСТОРИЯ КЛИЕНТА:
${userContext}

Используй эту информацию, чтобы общаться как старый друг:
- Приветствуй возвращающихся клиентов по-дружески
- Вспоминай их предыдущие предпочтения
- Учитывай прошлые рекомендации
- Спрашивай, как им понравилось то, что советовал
` : ''}

НАШИ ЦЕННОСТИ:
- Качество > количество
- Осознанное употребление
- Связь с природой
- Духовный рост
- Гостеприимство

${useStock ? `
ТЕКУЩИЙ АССОРТИМЕНТ:
${menuContext}
` : ''}

Отвечай естественно, как живой человек. Задавай уточняющие вопросы. 
Не спеши с рекомендациями — сначала узнай клиента.
`;
```

#### 3. **Menu Context Building**

```typescript
function buildMenuContext(menuItems: MenuRow[]): string {
  return menuItems
    .map(item => {
      const effects = getStrainEffects(item.Type); // indica/sativa/hybrid
      const thc = item.THC ? `THC: ${item.THC}%` : '';
      const price = item.Price_1g || item.Price_5g || '';
      
      return `• ${item.Name} (${item.Category}, ${item.Type}${thc ? ', ' + thc : ''}) — ${effects}`;
    })
    .join('\n');
}

function getStrainEffects(type: string): string {
  const effects = {
    indica: 'релакс, сон, снятие стресса',
    sativa: 'энергия, креативность, фокус',
    hybrid: 'сбалансированный эффект',
  };
  return effects[type.toLowerCase()] || 'универсальный';
}
```

#### 4. **Conversation History & User Memory**

Храним историю в localStorage для персонализации:

```typescript
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  suggestedProducts?: string[]; // массив названий продуктов
}

interface Conversation {
  id: string;
  messages: Message[];
  startedAt: Date;
  lastUpdated: Date;
}

interface UserProfile {
  userId: string; // генерируем уникальный ID при первом визите
  firstVisit: Date;
  lastVisit: Date;
  totalConversations: number;
  conversations: Conversation[]; // последние 5 диалогов
  preferences: {
    favoriteStrains?: string[];
    preferredEffects?: string[]; // ['relax', 'creative', 'social']
    experienceLevel?: 'beginner' | 'intermediate' | 'expert';
    language?: string;
  };
  purchaseHistory?: string[]; // если интегрируем с продажами
}

// localStorage key: 'oglab_user_profile'
```

**User Context Building:**

При каждом запросе к API передаем сжатый контекст:

```typescript
function buildUserContext(profile: UserProfile): string {
  if (!profile || profile.totalConversations === 0) {
    return ''; // Новый пользователь
  }

  const { preferences, conversations, totalConversations, firstVisit } = profile;
  const lastConvo = conversations[conversations.length - 1];
  const lastProducts = lastConvo?.messages
    .flatMap(m => m.suggestedProducts || [])
    .slice(-3); // последние 3 рекомендации

  return `
Это постоянный клиент (визит №${totalConversations + 1}, знаком с ${formatDate(firstVisit)}).
Предпочтения: ${preferences.favoriteStrains?.join(', ') || 'не определены'}.
Последний раз советовал: ${lastProducts?.join(', ') || 'нет данных'}.
Уровень опыта: ${preferences.experienceLevel || 'не известен'}.
  `.trim();
}
```

**Персонализация приветствий:**

```typescript
function getGreeting(profile: UserProfile): string {
  if (!profile || profile.totalConversations === 0) {
    return "Приветствую! 🌿 Я виртуальный бадтендер OG Lab. Чем могу помочь?";
  }

  const greetings = [
    `С возвращением, друг! 👋 Как оно?`,
    `Рад снова видеть! 🌿 Что сегодня выбираем?`,
    `Привет! Помню, в прошлый раз советовал ${profile.conversations[0]?.messages[0]?.suggestedProducts?.[0]}. Как впечатления?`,
    `О, знакомое лицо! ✨ Снова за новыми впечатлениями?`,
  ];

  return greetings[Math.floor(Math.random() * greetings.length)];
}
```

#### 5. **Voice Input (Whisper)**

```typescript
// Клиентская сторона
const recordVoice = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mediaRecorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
  mediaRecorder.onstop = async () => {
    const blob = new Blob(chunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob);

    const res = await fetch('/api/agent/whisper', {
      method: 'POST',
      body: formData,
    });
    
    const { text } = await res.json();
    setQuestion(text); // автоматически заполняем поле
  };

  mediaRecorder.start();
  // ... логика остановки записи
};
```

---

## Technical Decisions

### 1. **OpenAI Model Selection**

**Выбор:** GPT-4 Turbo (gpt-4-turbo-preview)

**Обоснование:**
- Лучшее понимание контекста
- Поддержка 128k токенов (достаточно для большого меню + истории)
- Качественные ответы на русском/английском/тайском
- Разумная цена ($0.01/1k input, $0.03/1k output)

**Альтернатива:** GPT-3.5-turbo (дешевле, но менее "человечный")

### 2. **Knowledge Base Strategy**

**Phase 1 (MVP):** Контекст меню в system prompt  
**Phase 2:** RAG (Retrieval-Augmented Generation) с векторной базой:
- Supabase Vector (pgvector)
- Embeddings статей, гайдов, информации о терпенах
- Поиск релевантных знаний для каждого запроса

### 3. **Rate Limiting**

Защита от злоупотреблений:
- **IP-based:** 20 сообщений/час для анонимов
- **User-based:** 100 сообщений/час для аутентифицированных
- Используем Upstash Redis или простой in-memory кэш

### 4. **Cost Management**

Ориентировочные расходы:
- Средний запрос: ~1k input + 500 output = $0.025
- 1000 диалогов/месяц = ~$25
- Whisper: ~$0.006/минута аудио

**Оптимизации:**
- Ограничить историю до 12 последних сообщений
- Кэшировать контекст меню (обновлять раз в 15 мин)
- Использовать streaming для лучшего UX

---

## Implementation Plan

### Phase 1: Core Chat (MVP) — 1 день

- [ ] Создать `/api/agent/chat` route
- [ ] Интегрировать OpenAI SDK
- [ ] Реализовать system prompt с menu context
- [ ] Обновить `OGLabAgent.tsx` для реальных запросов
- [ ] Добавить индикатор загрузки
- [ ] Простая обработка ошибок

### Phase 2: Voice Input — 0.5 дня

- [ ] Создать `/api/agent/whisper` route
- [ ] Реализовать запись аудио в браузере
- [ ] Добавить UI для записи (press-and-hold)
- [ ] Автозаполнение поля после транскрипции

### Phase 3: Conversation History & User Memory — 1 день

- [ ] Генерация уникального userId при первом визите
- [ ] Сохранение UserProfile в localStorage
- [ ] Сохранение истории текущего диалога
- [ ] Передача user context в API
- [ ] Персонализированные приветствия
- [ ] Отображение всех сообщений (чат-интерфейс)
- [ ] Кнопка "Начать новый диалог"
- [ ] Извлечение preferences из диалогов (любимые эффекты, сорта)
- [ ] (Опционально) Экспорт/импорт истории
- [ ] (Опционально) Сохранение в Supabase для авторизованных

### Phase 4: Product Recommendations UI — 1 день

- [ ] Парсинг упоминаний продуктов в ответах GPT
- [ ] Карточки рекомендованных продуктов под ответом
- [ ] Ссылки на `/menu` с highlight нужного продукта
- [ ] Structured output от GPT (JSON с рекомендациями)

### Phase 5: Advanced Features — 2-3 дня

- [ ] RAG с векторной базой знаний
- [ ] Мультиязычность (авто-определение языка)
- [ ] Rate limiting
- [ ] Analytics (популярные вопросы, конверсии)
- [ ] A/B тестирование промптов

---

## Security & Privacy

1. **Не храним чувствительные данные** в логах OpenAI
2. **Анонимизируем** историю диалогов
3. **Rate limiting** против спама
4. **Модерация** контента (OpenAI moderation endpoint)
5. **Четкий disclaimer:** "Agent может ошибаться, финальные рекомендации от живых бадтендеров"

---

## Success Metrics

1. **Engagement:** 
   - % пользователей, задавших > 3 вопроса
   - % возвращающихся пользователей (return rate)
   - Средняя длина диалога
2. **Conversion:** % диалогов → посещение меню
3. **Satisfaction:** Лайки/дизлайки на ответы
4. **Cost:** Средняя стоимость на диалог
5. **Quality:** Ручной аудит 100 диалогов/неделю
6. **Personalization:** % диалогов с использованием user context

---

## Risks & Mitigations

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Высокая стоимость API | Средняя | Высокое | Rate limiting, кэширование, мониторинг |
| Некачественные ответы | Низкая | Высокое | Тестирование промптов, fallback на живого бадтендера |
| Злоупотребления | Средняя | Среднее | Moderation API, rate limits, ban по IP |
| Юридические риски | Низкая | Высокое | Disclaimer, логи диалогов, compliance |

---

## Future Enhancements

1. **Расширенная персонализация:** 
   - Синхронизация между устройствами через Supabase
   - Интеграция с реальными покупками (чеки)
   - ML-модель для предсказания предпочтений
2. **Мультимодальность:** GPT-4 Vision для анализа фото продуктов
3. **Интеграции:** Telegram bot, WhatsApp Business
4. **Booking:** Прямое бронирование через чат
5. **Gamification:** 
   - "Духовные квесты" (попробуй 5 разных сатив)
   - Достижения и badges
   - Накопительная программа лояльности
6. **Social Features:**
   - Рекомендации от других пользователей
   - "Друзья также выбирали..."

---

## References

- [OpenAI Chat Completions API](https://platform.openai.com/docs/guides/chat)
- [OpenAI Whisper API](https://platform.openai.com/docs/guides/speech-to-text)
- [Supabase Vector](https://supabase.com/docs/guides/ai/vector-columns)
- [Next.js Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Decision:** Approved pending implementation  
**Next Steps:** Start Phase 1 (Core Chat MVP)
