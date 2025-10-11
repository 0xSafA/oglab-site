# Telegram — Каноническое руководство

Единый гайд по интеграции Telegram: архитектура, вебхук, команды, уведомления персоналу, переменные окружения.

## 1) Архитектура

```
Telegram API → Webhook → /api/telegram/webhook
                             ↓
                    Create/Get User Profile
                             ↓
                    Create/Get Conversation
                             ↓
                         OpenAI API
                             ↓
                    Save to Database
                             ↓
                    Send Reply to Telegram
```

## 2) Webhook

- Endpoint: `/api/telegram/webhook` (или webhook-v2)
- Обрабатывает текстовые сообщения, callback_query, команды
- Создаёт/получает профиль и разговор, проксирует в `/api/agent/chat`

## 3) Уведомления персоналу

- Вызов: `/api/telegram/notify` — асинхронный, не блокирует стрим
- Decision Matrix (когда уведомлять): см. `docs/system_architecture.md` → Telegram Decision Matrix

### 3.1 Контракт Notify API (встроенный)

Endpoint: `POST /api/telegram/notify`

Request:
```json
{
  "type": "order" | "wish" | "staff_question" | "feedback",
  "message": "string",
  "userId": "string",
  "userContext": { "language": "ru|en|th|fr|de|he|it", "returning": true },
  "products": ["string"],
  "quantity": "string",
  "totalAmount": 8000,
  "breakdown": "20г × 400฿ = 8,000฿",
  "contactInfo": { "name": "string", "phone": "+66...", "address": "...", "paymentMethod": "cash|transfer|crypto" },
  "metadata": { "language": "ru", "timestamp": "2025-10-11T10:00:00.000Z" }
}
```

Response:
```json
{ "ok": true, "messageId": 12345 }
```

Retries/Timeouts: timeout 5s; до 2 ретраев (500ms, 1500ms); на перманентной ошибке — логируем, поток пользователя не блокируем.

Idempotency: для `type="order"` использовать идемпотентный ключ (userId + канонический payload заказа), дедупликация в течение ~10 минут.

Security: хранить токены/IDs в env, не логировать секреты; валидировать `type`, экранировать Markdown.

## 4) Команды

- `/start` — приветствие на языке пользователя
- Админ-команды (через staff чат): список, статусы заказов, метрики

## 5) Переменные окружения

Пример (.env.local):
```bash
# Токен бота
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# ID основного чата (группа: начинается с -100)
TELEGRAM_CHAT_ID=-1001234567890

# Опционально: раздельные чаты
TELEGRAM_ORDERS_CHAT_ID=-1009876543210
TELEGRAM_FEEDBACK_CHAT_ID=-1005555555555
TELEGRAM_PERSONAL_CHAT_ID=123456789
```

Как получить chat_id:
1) Добавьте бота в группу и отправьте сообщение
2) Откройте `https://api.telegram.org/bot<TOKEN>/getUpdates`
3) Найдите `"chat":{"id":-100...}`

## 6) Безопасность

- Валидация secret_token вебхука
- Хранение токенов в env
- Санитизация Markdown (escape спецсимволов)

## 7) Troubleshooting

- Webhook не работает: проверить `getWebhookInfo`, токен, права бота в группе
- Уведомления не доходят: убедиться, что бот — админ, и chat_id корректный
