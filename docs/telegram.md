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
- Контракт запроса: см. `docs/telegram_notify_api.md`

## 4) Команды

- `/start` — приветствие на языке пользователя
- Админ-команды (через staff чат): список, статусы заказов, метрики

## 5) Переменные окружения

См. `docs/telegram_env_example.txt` — BOT_TOKEN и chat IDs.

## 6) Безопасность

- Валидация secret_token вебхука
- Хранение токенов в env
- Санитизация Markdown (escape спецсимволов)

## 7) Troubleshooting

- Webhook не работает: проверить `getWebhookInfo`, токен, права бота в группе
- Уведомления не доходят: убедиться, что бот — админ, и chat_id корректный
