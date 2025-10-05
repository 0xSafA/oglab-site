# Интеграция Telegram для OG Lab Agent

## Обзор

Эта интеграция позволяет AI-агенту OG Lab отправлять сообщения в Telegram:
- **Заказы** - информация о заказах клиентов
- **Пожелания** - специальные запросы и предпочтения
- **Обратная связь** - комментарии и предложения
- **Вопросы персоналу** - прямые запросы к команде

## Архитектура

```
Пользователь → OG Lab Agent → GPT-4 (определяет намерение)
                    ↓
           API /api/telegram/notify
                    ↓
            Telegram Bot API
                    ↓
         Telegram Chat (персонал)
```

## Настройка

### 1. Создание Telegram бота

1. Найдите [@BotFather](https://t.me/botfather) в Telegram
2. Отправьте команду `/newbot`
3. Следуйте инструкциям и получите **Bot Token**
4. Сохраните токен - он понадобится в `.env.local`

### 2. Получение Chat ID

**Для личных сообщений:**
1. Найдите вашего бота в Telegram
2. Отправьте ему любое сообщение
3. Перейдите: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
4. Найдите `"chat":{"id":123456789}` - это ваш Chat ID

**Для групповых чатов:**
1. Добавьте бота в группу
2. Сделайте бота администратором (нужно для отправки сообщений)
3. Отправьте сообщение в группу
4. Перейдите: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
5. Найдите `"chat":{"id":-1001234567890}` - это Group Chat ID (отрицательное число)

### 3. Переменные окружения

Добавьте в `.env.local`:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
TELEGRAM_PERSONAL_CHAT_ID=123456789

# Опционально: для разных типов уведомлений
TELEGRAM_ORDERS_CHAT_ID=-1001234567890
TELEGRAM_FEEDBACK_CHAT_ID=-1009876543210
```

### 4. Установка зависимостей

Telegram Bot API работает через стандартный `fetch`, дополнительные пакеты не нужны.

## Использование

### Автоматическое определение

Агент автоматически определяет, когда пользователь хочет:
- Сделать заказ
- Оставить пожелание
- Связаться с персоналом
- Задать вопрос, требующий человеческого ответа

### Примеры фраз пользователей

**Заказы:**
- "Хочу заказать 5 грамм Supreme Oreoz"
- "Можно доставку на завтра?"
- "Забронируйте мне White Whale"

**Пожелания:**
- "Хотел бы попробовать что-то для креативности"
- "Нужен совет бадтендера лично"
- "У вас есть что-то новенькое?"

**Обратная связь:**
- "Отличный сервис, спасибо!"
- "Есть предложение по улучшению"
- "Хочу оставить отзыв"

**Вопросы персоналу:**
- "Когда вы открываетесь?"
- "Можно прийти сегодня вечером?"
- "Как до вас добраться?"

## Типы сообщений

### 1. ORDER (Заказ)
```typescript
{
  type: 'order',
  customer_message: 'Хочу заказать 5г Supreme Oreoz',
  products: ['Supreme Oreoz'],
  user_context: { /* профиль клиента */ }
}
```

### 2. WISH (Пожелание)
```typescript
{
  type: 'wish',
  customer_message: 'Хотел бы попробовать что-то для креативности',
  preferences: ['креативность', 'sativa'],
  user_context: { /* профиль клиента */ }
}
```

### 3. FEEDBACK (Обратная связь)
```typescript
{
  type: 'feedback',
  customer_message: 'Отличный сервис!',
  sentiment: 'positive'
}
```

### 4. STAFF_QUESTION (Вопрос персоналу)
```typescript
{
  type: 'staff_question',
  customer_message: 'Когда вы открываетесь?',
  category: 'hours'
}
```

## Форматирование сообщений

Telegram поддерживает Markdown и HTML форматирование:

```typescript
// Markdown
const message = `
*🛒 НОВЫЙ ЗАКАЗ*

👤 *Клиент:* ID ${userId}
📝 *Сообщение:* ${text}
🌿 *Продукты:* ${products.join(', ')}

_Отправлено через OG Lab Agent_
`

// HTML
const message = `
<b>🛒 НОВЫЙ ЗАКАЗ</b>

👤 <b>Клиент:</b> ID ${userId}
📝 <b>Сообщение:</b> ${text}
🌿 <b>Продукты:</b> ${products.join(', ')}

<i>Отправлено через OG Lab Agent</i>
`
```

## Безопасность

### Rate Limiting
- Максимум 30 сообщений в секунду на бота
- Рекомендуется добавить Rate Limiter на API endpoint

### Валидация
- Проверка авторизации (Bearer token или подпись)
- Санитизация входных данных
- Логирование всех отправленных сообщений

### Приватность
- Не отправляйте чувствительные данные клиентов
- Используйте анонимные ID вместо имен
- Шифруйте токены в переменных окружения

## Мониторинг

### Логирование
Все сообщения в Telegram логируются в консоль с метками:
```
📤 TELEGRAM: Order notification sent to chat -1001234567890
📤 TELEGRAM: Wish notification sent to chat -1001234567890
❌ TELEGRAM ERROR: Failed to send message - 401 Unauthorized
```

### Метрики
Отслеживайте в Supabase:
- Количество отправленных уведомлений
- Типы уведомлений
- Время отклика Telegram API
- Ошибки отправки

## Troubleshooting

### Бот не отправляет сообщения

1. **Проверьте токен:**
```bash
curl https://api.telegram.org/bot<BOT_TOKEN>/getMe
```

2. **Проверьте Chat ID:**
```bash
curl https://api.telegram.org/bot<BOT_TOKEN>/getUpdates
```

3. **Проверьте права бота:**
- Бот должен быть администратором в группе
- У бота должно быть право "Post Messages"

### 403 Forbidden

- Бот заблокирован пользователем
- Бот не добавлен в группу
- Бот не является администратором группы

### 429 Too Many Requests

- Превышен rate limit (30 сообщений/сек)
- Добавьте задержку между сообщениями
- Используйте queue для отправки

## Расширенные возможности

### 1. Inline Buttons (кнопки в сообщениях)

```typescript
const keyboard = {
  inline_keyboard: [
    [
      { text: '✅ Принять', callback_data: 'accept_order' },
      { text: '❌ Отклонить', callback_data: 'reject_order' }
    ],
    [
      { text: '📞 Позвонить клиенту', url: 'tel:+66123456789' }
    ]
  ]
}
```

### 2. Webhook для входящих сообщений

```typescript
// Персонал может отвечать через бота
export async function POST(request: NextRequest) {
  const update = await request.json()
  
  if (update.message) {
    const staffReply = update.message.text
    const replyToMessageId = update.message.reply_to_message?.message_id
    
    // Связываем ответ с исходным запросом клиента
    // и отправляем клиенту в веб-интерфейс
  }
}
```

### 3. Rich Media

```typescript
// Отправка изображений продуктов
await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: chatId,
    photo: 'https://oglab.com/products/supreme-oreoz.jpg',
    caption: '🌿 Supreme Oreoz\n\nТОП продукт этого месяца!'
  })
})
```

### 4. Геолокация

```typescript
// Если клиент спрашивает "Как до вас добраться?"
await fetch(`https://api.telegram.org/bot${token}/sendLocation`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    chat_id: chatId,
    latitude: 9.5322,
    longitude: 100.0637,
    title: 'OG Lab Dispensary',
    address: 'Koh Samui, Thailand'
  })
})
```

## Интеграция с Analytics

```typescript
// Логируем в Supabase для аналитики
await supabase.from('telegram_notifications').insert({
  type: 'order',
  chat_id: process.env.TELEGRAM_CHAT_ID,
  message_id: response.result.message_id,
  customer_message: text,
  sent_at: new Date().toISOString(),
  status: 'sent'
})
```

## Best Practices

1. **Группируйте уведомления** - не спамьте персонал каждым сообщением
2. **Используйте темы** - в больших группах создайте отдельные темы для разных типов
3. **Добавьте контекст** - ID клиента, время, предыдущие заказы
4. **Форматируйте читабельно** - используйте emoji и структурированный текст
5. **Тестируйте в dev-чате** - создайте отдельный тестовый чат для разработки

## Примеры использования

### Базовое уведомление
```typescript
await fetch('/api/telegram/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'order',
    message: 'Хочу заказать 5г Supreme Oreoz',
    userId: 'user-123'
  })
})
```

### С контекстом клиента
```typescript
await fetch('/api/telegram/notify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'wish',
    message: 'Нужно что-то для креативности',
    userId: 'user-123',
    userContext: {
      totalVisits: 5,
      favoriteStrains: ['Sativa', 'Hybrid'],
      preferredEffects: ['energy', 'focus']
    }
  })
})
```

## Поддержка

Для вопросов и багов создавайте issues в GitHub или пишите в Telegram: @oglab_support

---

**Версия:** 1.0.0  
**Обновлено:** Октябрь 2025  
**Автор:** OG Lab Dev Team
