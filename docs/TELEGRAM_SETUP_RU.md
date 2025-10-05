# 🤖 Telegram Интеграция для OG Lab Agent

## Что это даёт?

AI-агент OG Lab теперь может автоматически отправлять уведомления персоналу в Telegram когда:
- 🛒 Клиент хочет сделать **заказ**
- 💭 Клиент просит **совет или рекомендацию**
- ⭐ Клиент оставляет **обратную связь**
- ❓ Клиент задаёт **вопрос персоналу**

Это помогает не пропустить важные запросы клиентов и быстрее на них реагировать!

---

## 🚀 Быстрый старт (5 минут)

### 1️⃣ Создайте Telegram бота

1. Откройте Telegram и найдите **@BotFather**
2. Отправьте: `/newbot`
3. Придумайте название: `OG Lab Staff Bot`
4. Придумайте username: `oglab_staff_bot`
5. **Скопируйте токен** (выглядит как `1234567890:ABCdef...`)

### 2️⃣ Создайте группу и добавьте бота

1. Создайте группу: `OG Lab - Уведомления`
2. Добавьте вашего бота в группу
3. **Важно:** Сделайте бота **администратором** с правом "Post Messages"
4. Отправьте любое сообщение в группу

### 3️⃣ Получите Chat ID

Откройте в браузере (замените `<ВАШ_ТОКЕН>` на токен из шага 1):
```
https://api.telegram.org/bot<ВАШ_ТОКЕН>/getUpdates
```

Найдите в ответе:
```json
"chat": {
  "id": -1001234567890,  // ← это ваш Chat ID
  "title": "OG Lab - Уведомления"
}
```

> **Важно:** Для групп Chat ID начинается с `-100`

### 4️⃣ Настройте переменные окружения

Создайте или отредактируйте файл `.env.local` в корне проекта:

```bash
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=-1001234567890
```

### 5️⃣ Протестируйте

```bash
# Тестовый скрипт проверит всё и отправит тестовое сообщение
npm run test:telegram
```

Если всё ОК, вы увидите:
```
🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО!
```

### 6️⃣ Запустите сервер

```bash
npm run dev
```

Откройте сайт и протестируйте агента:
- "Хочу заказать 5 грамм Supreme Oreoz"
- "Когда вы открываетесь?"
- "Спасибо за отличный сервис!"

**Уведомления появятся в Telegram! 🎉**

---

## 📋 Структура проекта

```
oglab-site/
├── docs/
│   ├── TELEGRAM_INTEGRATION_GUIDE.md    # Полная документация
│   └── TELEGRAM_QUICK_START_RU.md       # Быстрый старт
├── scripts/
│   └── test-telegram.mjs                # Скрипт тестирования
├── src/
│   ├── app/api/telegram/
│   │   └── notify/route.ts              # API endpoint для уведомлений
│   ├── app/api/agent/
│   │   └── chat/route.ts                # Обновлён: определение намерений
│   └── lib/
│       └── telegram-helpers.ts          # Утилиты для Telegram
├── supabase/
│   └── telegram-notifications-migration.sql  # Миграция БД (опционально)
└── .env.local                           # Ваши секретные ключи
```

---

## 🎯 Как это работает

### Архитектура

```
Пользователь вводит сообщение
        ↓
OG Lab Agent (GPT-4) анализирует текст
        ↓
Определяется намерение (order/wish/feedback/question)
        ↓
Если нужно → отправка в Telegram
        ↓
Персонал получает уведомление
```

### Пример уведомления в Telegram

```
🛒 НОВЫЙ ЗАКАЗ

👤 Клиент: 4f3e2d1c0b9a...
📊 Визитов: 5
🗣️ Язык: 🇷🇺 ru
💫 Предпочтения: relaxation, creativity

📝 Сообщение:
Хочу заказать 5 грамм Supreme Oreoz

🌿 Продукты:
  • Supreme Oreoz

📚 Ранее интересовали:
White Whale, Gelato

⏰ 05.10 14:30
🤖 Отправлено через OG Lab Agent
```

---

## 🔧 Настройка (продвинутая)

### Разные чаты для разных типов

Создайте несколько групп для разделения уведомлений:

```bash
# .env.local

# Главный чат (fallback)
TELEGRAM_CHAT_ID=-1001234567890

# Заказы (срочные)
TELEGRAM_ORDERS_CHAT_ID=-1009876543210

# Обратная связь (не срочные)
TELEGRAM_FEEDBACK_CHAT_ID=-1005555555555

# Личный чат владельца
TELEGRAM_PERSONAL_CHAT_ID=123456789
```

### База данных для аналитики

Если хотите отслеживать метрики уведомлений:

```bash
# Подключитесь к Supabase
psql <ваша_строка_подключения>

# Выполните миграцию
\i supabase/telegram-notifications-migration.sql
```

Это создаст:
- Таблицу `telegram_notifications`
- Представление `telegram_notifications_stats`
- Функцию `cleanup_old_telegram_notifications()`

---

## 📊 Типы уведомлений

| Тип | Emoji | Когда срабатывает | Примеры фраз |
|-----|-------|-------------------|--------------|
| **ORDER** | 🛒 | Клиент хочет заказать | "Хочу заказать...", "Забронируйте...", "Доставка..." |
| **WISH** | 💭 | Клиент просит совет | "Посоветуйте...", "Что порекомендуете...", "Хотел бы..." |
| **FEEDBACK** | ⭐ | Клиент благодарит | "Спасибо!", "Отлично!", "Хочу оставить отзыв" |
| **STAFF_QUESTION** | ❓ | Вопрос требует человека | "Когда открыты?", "Где находитесь?", "Как добраться?" |

---

## 🐛 Troubleshooting

### Бот не отправляет сообщения

**Проверка 1:** Правильный ли токен?
```bash
curl https://api.telegram.org/bot<ВАШ_ТОКЕН>/getMe
```

**Проверка 2:** Бот администратор группы?
- Настройки группы → Администраторы
- Ваш бот должен быть в списке
- Право "Post Messages" должно быть включено

**Проверка 3:** Перезапустили ли сервер?
```bash
# После изменения .env.local нужно перезапустить
npm run dev
```

### 403 Forbidden

Бот не имеет прав:
1. Удалите бота из группы
2. Добавьте заново
3. Сделайте администратором

### Уведомления не срабатывают

Проверьте логи в консоли:
```bash
📤 TELEGRAM: Notification sent (order)
```

Если не видите → намерение не определено. Попробуйте более явные фразы:
- ✅ "Хочу заказать Supreme Oreoz"
- ❌ "Мне бы чего-нибудь"

---

## 🚢 Production Deployment

### Vercel

Добавьте в Settings → Environment Variables:
```
TELEGRAM_BOT_TOKEN=ваш_токен
TELEGRAM_CHAT_ID=ваш_chat_id
```

### Docker

```dockerfile
ENV TELEGRAM_BOT_TOKEN=ваш_токен
ENV TELEGRAM_CHAT_ID=ваш_chat_id
```

### PM2

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'oglab-site',
    env: {
      TELEGRAM_BOT_TOKEN: 'ваш_токен',
      TELEGRAM_CHAT_ID: 'ваш_chat_id',
    }
  }]
}
```

---

## 🔐 Безопасность

⚠️ **Важные правила:**

1. **Никогда не коммитьте `.env.local`** в Git
2. Используйте `.gitignore` для защиты:
   ```gitignore
   .env*.local
   .env.production
   ```
3. Используйте разные токены для dev/prod
4. Храните токены в секретах (GitHub Secrets, Vercel)
5. Регулярно проверяйте логи на подозрительную активность

---

## 🎓 Дополнительные материалы

### Документация

- 📖 **Полная документация:** [`docs/TELEGRAM_INTEGRATION_GUIDE.md`](docs/TELEGRAM_INTEGRATION_GUIDE.md)
- 🚀 **Быстрый старт:** [`docs/TELEGRAM_QUICK_START_RU.md`](docs/TELEGRAM_QUICK_START_RU.md)
- 🧪 **Тестовый скрипт:** `npm run test:telegram`

### API Endpoints

- `GET /api/telegram/notify` - Проверка статуса бота
- `POST /api/telegram/notify` - Отправка уведомления

Пример запроса:
```bash
curl -X POST http://localhost:3001/api/telegram/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "order",
    "message": "Тестовый заказ",
    "userId": "test-123"
  }'
```

### Telegram Bot API

- [Официальная документация](https://core.telegram.org/bots/api)
- [Примеры ботов](https://core.telegram.org/bots/samples)
- [BotFather команды](https://core.telegram.org/bots#6-botfather)

---

## 🎁 Расширенные возможности (coming soon)

### Inline кнопки

Добавляйте интерактивные кнопки в уведомления:
```
[✅ Принять заказ] [❌ Отклонить] [💬 Связаться]
```

### Двусторонняя связь

Персонал сможет отвечать через Telegram:
```
Персонал: "Заказ принят, готовим!"
   ↓
Клиент видит ответ на сайте
```

### Rich Media

Отправка:
- 📸 Фотографий продуктов
- 📍 Геолокации диспенсари
- 📊 Графиков продаж
- 🎥 Видео промо

---

## ✅ Чеклист настройки

- [ ] Создан бот через @BotFather
- [ ] Получен Bot Token
- [ ] Создана группа в Telegram
- [ ] Бот добавлен в группу
- [ ] Бот сделан администратором
- [ ] Получен Chat ID
- [ ] Добавлены переменные в `.env.local`
- [ ] Запущен тест: `npm run test:telegram`
- [ ] Тест пройден успешно
- [ ] Перезапущен dev сервер
- [ ] Протестированы уведомления через агента
- [ ] Всё работает! 🎉

---

## 📞 Поддержка

- 🐛 **Баги:** GitHub Issues
- 💬 **Вопросы:** Telegram @oglab_support
- 📧 **Email:** support@oglab.com

---

## 📝 Лицензия

MIT License - используйте свободно для своих проектов.

---

**Версия:** 1.0.0  
**Дата:** Октябрь 2025  
**Автор:** OG Lab Dev Team  

**Время настройки:** ~5 минут  
**Сложность:** 🟢 Легко

---

<div align="center">

**Сделано с 💚 в OG Lab**

[Документация](docs/TELEGRAM_INTEGRATION_GUIDE.md) • [Быстрый старт](docs/TELEGRAM_QUICK_START_RU.md) • [GitHub](https://github.com/oglab)

</div>
