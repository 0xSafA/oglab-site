# OG Lab Documentation Index

> **Центральный справочник по проекту**  
> Вся техническая документация в одном месте

---

## 📚 Навигация по документации

### 🎯 Быстрый старт

**Новый разработчик?** Начните здесь:
1. [System Architecture](./SYSTEM_ARCHITECTURE.md) - **Полная техническая спецификация**
2. [Environment Setup](./ENVIRONMENT_SETUP.md) - Настройка окружения
3. [Phase 1 Summary](./PHASE_1_IMPLEMENTATION_SUMMARY.md) - Что уже сделано

**Вопросы по архитектуре?**
- **Схема БД** → [SYSTEM_ARCHITECTURE.md#архитектура-базы-данных](./SYSTEM_ARCHITECTURE.md#архитектура-базы-данных)
- **API Endpoints** → [SYSTEM_ARCHITECTURE.md#api-endpoints](./SYSTEM_ARCHITECTURE.md#api-endpoints)
- **Backend Libraries** → [SYSTEM_ARCHITECTURE.md#backend-структура](./SYSTEM_ARCHITECTURE.md#backend-структура)
- **Кэширование** → [SYSTEM_ARCHITECTURE.md#кэширование](./SYSTEM_ARCHITECTURE.md#кэширование)

---

## 📖 Документы (аннотированные)

### 🏗️ Архитектура и дизайн

| Документ | Аннотация | Статус |
|----------|-----------|---------|
| [**SYSTEM_ARCHITECTURE.md**](./SYSTEM_ARCHITECTURE.md) | Главный референс: стек, схема БД, кэширование (Redis), API, интеграции, Decision Matrix для Telegram, SLO/Alerts, ссылки на ранбуки. | ✅ Актуально |
| [ADR-003: Authentication](./ADR-003-authentication-architecture.md) | Решения по аутентификации и RLS-аспектам для auth. | ✅ |
| [ADR-004: Multilingual CMS Blog](./ADR-004-multilingual-cms-blog.md) | Архитектура многоязычного блога и контента. | ✅ |
| [ADR-005: Storage](./ADR-005-storage.md) | Выбор стораджа, паттерны хранения и доступов. | ✅ |
| [ADR-006: AI Budtender](./ADR-006-ai-budtender-assistant.md) | Первая версия агента: цели, ограничения, уроки. | ✅ |
| [ADR-007: Enterprise Upgrade](./ADR-007-ai-agent-enterprise-upgrade.md) | Апгрейд агента до enterprise: миграция на БД, очереди заказов, кэш. | ✅ Complete |

### 🛠️ Руководства по настройке

| Документ | Аннотация |
|----------|-----------|
| [**Environment Setup**](./ENVIRONMENT_SETUP.md) | Полный список env, локальный и прод-настройки. |
| [Supabase Migration Guide](./MIGRATION_GUIDE.md) | Как применить миграции SQL и проверить БД. |
| [NGINX Setup](./nginx-setup.md) | Реверс-прокси, headers, прод-настройки. |
| [Telegram Env & Webhook](./telegram.md#5-переменные-окружения) | Пример env для Telegram (BOT_TOKEN, chat IDs), как получить chat_id. |

### 📊 Интеграции

| Документ | Аннотация |
|----------|-----------|
| [Telegram (канон)](./telegram.md) | Единый гайд: архитектура, вебхук, команды, уведомления, env. |
| [Telegram Notify API](./telegram_notify_api.md) | Контракт внутреннего уведомления персоналу, ретраи, идемпотентность. |
| [OGPX Integration](./OGPX_INTEGRATION_GUIDE.md) | Настройка и обмен с OGPX. |
| [Cloudflare R2](./Cloudflare%20R2.md) | Настройка стораджа R2 и паттерны использования. |

### 🎨 Дизайн и UX

| Документ | Аннотация |
|----------|-----------|
| [Humanized Design Guide](./HUMANIZED_DESIGN_GUIDE.md) | Принципы «человечного» UX и тона общения. |
| [Humanized Layout](./HUMANIZED_LAYOUT.md) | Макеты, семантическая иерархия компонентов. |
| [New Design](./new-design.md) | Изменения интерфейса и визуальные апдейты. |

### ⚡ Производительность

| Документ | Аннотация |
|----------|-----------|
| [Performance Improvements](./PERFORMANCE_IMPROVEMENTS.md) | Общие оптимизации и результаты. |
| [Performance v2](./PERFORMANCE_OPTIMIZATIONS_v2.md) | Вторая волна оптимизаций и метрик. |
| [Session Summary Optimizations](./SESSION_SUMMARY_OPTIMIZATIONS.md) | Ускорение сводок/историй диалогов. |
| [Agent Cache Optimization](./AGENT_CACHE_OPTIMIZATION.md) | Паттерны кэширования агента и ключи. |

### 📝 Отчёты о реализации

| Документ | Аннотация |
|----------|-----------|
| (summary перенесён в архитектурные разделы) | |
| (устаревшие ситуативные заметки удалены) | |
| [Microphone Permission Optimization](./MICROPHONE_PERMISSION_OPTIMIZATION.md) | Разрешения микрофона и UX. |

### 🔐 Операции и безопасность

| Документ | Аннотация |
|----------|-----------|
| [Operations Runbook](./OPERATIONS_RUNBOOK.md) | Чеклисты инцидентов, команды кэша, SLO, откаты. |
| [Security & RLS](./SECURITY_RLS.md) | Роли, RLS-политики на уровне концепции, матрица env, PII. |
| [Agent Spec](./agent-spec.md) | Архитектура агента, промпты, intent, ссылки на код. |

---

## 🔍 Поиск по темам

### База данных (Supabase)

**Схема БД**:
- **Таблицы**: `user_profiles`, `conversations`, `orders`, `agent_events`
- **Функции**: `get_today_metrics()`, `get_top_products()`
- **RLS**: Row Level Security policies

📖 **Документация**: [SYSTEM_ARCHITECTURE.md - База данных](./SYSTEM_ARCHITECTURE.md#архитектура-базы-данных)

**Миграции**:
```bash
supabase/migrations/
├── 001_create_agent_tables.sql
├── 002_create_functions_triggers.sql
├── 003_enable_rls_policies.sql
└── 004_seed_initial_data.sql
```

📖 **Руководство**: [Supabase Migration Guide](./MIGRATION_GUIDE.md)

---

### Backend (Next.js API Routes)

**Библиотеки** (`src/lib/`):
- `supabase-client.ts` - Клиенты Supabase
- `user-profile-db.ts` - Профили пользователей
- `conversations-db.ts` - Разговоры
- `orders-db.ts` - Заказы
- `analytics-db.ts` - Аналитика
- `redis-client.ts` - Кэширование
- `agent-store.ts` - State management
- `migrate-to-supabase.ts` - Миграция данных

📖 **Документация**: [SYSTEM_ARCHITECTURE.md - Backend](./SYSTEM_ARCHITECTURE.md#backend-структура)

**API Endpoints**:
- `POST /api/agent/chat` - Общение с AI
- `GET/POST/PATCH /api/orders` - Управление заказами
- `GET /api/analytics` - Метрики и статистика
- `POST /api/telegram/webhook` - Telegram бот

📖 **API Reference**: [SYSTEM_ARCHITECTURE.md - API](./SYSTEM_ARCHITECTURE.md#api-endpoints)

---

### Кэширование

**Стратегия**: Redis → Memory → Database

**Ключи кэша**:
```typescript
user:profile:{userId}           // TTL: 5 min
conversation:{conversationId}   // TTL: 10 min
menu:items                      // TTL: 30 min
order:status:{orderId}          // TTL: 2 min
```

📖 **Документация**: [Redis (канон)](./redis.md) · [system_architecture.md#кэширование](./system_architecture.md#кэширование)

---

### State Management

**Zustand Store** (`agent-store.ts`):
- User profile
- Conversation state
- Cart
- UI state
- Session tracking

**React Query** (`react-query-provider.tsx`):
- Data fetching
- Cache management
- Optimistic updates

📖 **Документация**: [SYSTEM_ARCHITECTURE.md - State](./SYSTEM_ARCHITECTURE.md#state-management)

---

### Интеграции

**OpenAI API**:
- Model: `gpt-4-turbo-preview`
- Streaming responses (SSE)
- System prompts на английском
- Оптимизированная история (12 сообщений)

**Telegram Bot**:
- Двусторонняя коммуникация
- Многоязычная поддержка
- Оформление заказов
- Webhook integration

**Google Sheets**:
- Синхронизация меню
- Auto-update каждые 30 мин

📖 **Документация**: [SYSTEM_ARCHITECTURE.md - Интеграции](./SYSTEM_ARCHITECTURE.md#интеграции)

---

## 🚀 Deployment

### Pre-deployment Checklist

- [ ] Применены миграции БД → [Migration Guide](./MIGRATION_GUIDE.md)
- [ ] Настроены env переменные → [Environment Setup](./ENVIRONMENT_SETUP.md)
- [ ] Redis настроен (optional)
- [ ] Telegram webhook настроен (optional)
- [ ] Тесты пройдены

### Environment Variables

**Required**:
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SITE_URL=
```

**Optional**:
```bash
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
```
📖 **Telegram env example**: [TELEGRAM_ENV_EXAMPLE.txt](./TELEGRAM_ENV_EXAMPLE.txt)

📖 **Полный список**: [Environment Setup](./ENVIRONMENT_SETUP.md)

---

## 📊 Мониторинг

### Ключевые метрики

**Business**:
- Revenue (today/week/month)
- Conversion rate
- Average order value
- Customer retention

**Technical**:
- API response times
- Cache hit rates
- Error rates
- OpenAI token usage

**User Engagement**:
- DAU/WAU/MAU
- Session duration
- Messages per session
- Satisfaction scores

📖 **API**: `GET /api/analytics?metric=all`

---

## 🔧 Troubleshooting

### Частые проблемы

**Database errors**:
- Проверить credentials в `.env.local`
- Проверить RLS policies в Supabase Dashboard
- Проверить applied migrations: `supabase migration list`

**Redis not working**:
- Система работает без Redis (fallback к memory)
- Проверить UPSTASH_REDIS_REST_URL и TOKEN

**Telegram bot не отвечает**:
- Проверить webhook: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Проверить TELEGRAM_BOT_TOKEN и WEBHOOK_SECRET
- Проверить логи сервера

📖 **Подробнее**: [SYSTEM_ARCHITECTURE.md - Troubleshooting](./SYSTEM_ARCHITECTURE.md#troubleshooting)

---

## 🎯 Roadmap

### Phase 1: ✅ **COMPLETED**
- Database layer
- API endpoints
- Caching
- State management
- Telegram bot
- Analytics

### Phase 2: 🔄 **PLANNING**
- Admin Dashboard UI
- Semantic caching (pgvector)
- Advanced Telegram features
- Payment integration
- Accounting export

📖 **План**: [ADR-007 - Phase 2](./ADR-007-ai-agent-enterprise-upgrade.md)

---

## 🤝 Contributing

При добавлении нового функционала, обновите:
1. ✅ Миграции БД (если меняется схема)
2. ✅ Type definitions в `supabase-client.ts`
3. ✅ RLS policies (если нужно)
4. ✅ [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
5. ✅ Этот README (если добавлены новые документы)

---

## 📞 Support

**Документация устарела?**  
Обновите соответствующий раздел или создайте issue.

**Нужна помощь?**  
1. Проверьте [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
2. Проверьте [Troubleshooting](./SYSTEM_ARCHITECTURE.md#troubleshooting)
3. Проверьте логи сервера
4. Проверьте Supabase Dashboard

---

**Last Updated**: October 2025  
**Current Phase**: Phase 1 Complete ✅  
**Next**: Phase 2 Planning

