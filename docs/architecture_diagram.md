# OG Lab AI Agent - Architecture Diagram

> **Визуальная схема системы**

---

## 🏗️ Общая архитектура

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐          ┌─────────────┐         ┌──────────────┐     │
│  │   Browser   │          │  Telegram   │         │    Mobile    │     │
│  │    (Web)    │          │     Bot     │         │     App      │     │
│  └──────┬──────┘          └──────┬──────┘         └──────┬───────┘     │
│         │                        │                        │              │
│         │                        │                        │              │
│  ┌──────▼────────────────────────▼────────────────────────▼───────┐    │
│  │              React Components + Zustand Store                   │    │
│  │  ┌────────────┐  ┌─────────────┐  ┌────────────────────────┐  │    │
│  │  │ OGLabAgent │  │ OrderForm   │  │  AdminDashboard        │  │    │
│  │  │ Component  │  │             │  │  (Phase 2)             │  │    │
│  │  └────────────┘  └─────────────┘  └────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                           │
└───────────────────────────────────┬───────────────────────────────────────┘
                                    │
                                    │ HTTPS
                                    │
┌───────────────────────────────────▼───────────────────────────────────────┐
│                          NEXT.JS APP LAYER                                 │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                      API Routes (Edge)                            │    │
│  │                                                                    │    │
│  │  ┌─────────────────┐  ┌──────────────┐  ┌───────────────────┐  │    │
│  │  │ /api/agent/chat │  │ /api/orders  │  │ /api/analytics    │  │    │
│  │  │                 │  │              │  │                   │  │    │
│  │  │ • User profiling│  │ • Create     │  │ • Today metrics   │  │    │
│  │  │ • Conversation  │  │ • Update     │  │ • Top products    │  │    │
│  │  │ • OpenAI call   │  │ • Status     │  │ • Engagement      │  │    │
│  │  │ • SSE streaming │  │              │  │ • AI performance  │  │    │
│  │  └────────┬────────┘  └──────┬───────┘  └────────┬──────────┘  │    │
│  │           │                   │                    │              │    │
│  │  ┌────────▼───────────────────▼────────────────────▼──────────┐ │    │
│  │  │          /api/telegram/webhook                              │ │    │
│  │  │                                                              │ │    │
│  │  │  • Receive Telegram updates                                 │ │    │
│  │  │  • Two-way communication                                    │ │    │
│  │  │  • Order via Telegram                                       │ │    │
│  │  └──────────────────────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │                      Backend Libraries                            │    │
│  │                                                                    │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │    │
│  │  │ user-profile-db  │  │ conversations-db │  │  orders-db    │ │    │
│  │  │                  │  │                  │  │               │ │    │
│  │  │ • CRUD profiles  │  │ • CRUD convos    │  │ • CRUD orders │ │    │
│  │  │ • Link Telegram  │  │ • Messages       │  │ • Status mgmt │ │    │
│  │  │ • Build context  │  │ • Active convos  │  │ • Staff notes │ │    │
│  │  └──────────────────┘  └──────────────────┘  └───────────────┘ │    │
│  │                                                                    │    │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │    │
│  │  │  analytics-db    │  │  redis-client    │  │  agent-store  │ │    │
│  │  │                  │  │                  │  │               │ │    │
│  │  │ • Track events   │  │ • Cache get/set  │  │ • Zustand     │ │    │
│  │  │ • Metrics        │  │ • TTL mgmt       │  │ • Persist     │ │    │
│  │  │ • Funnel         │  │ • Session cache  │  │ • Cart        │ │    │
│  │  └──────────────────┘  └──────────────────┘  └───────────────┘ │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
┌───────────────────────┐  ┌────────────────┐  ┌──────────────┐
│   CACHING LAYER       │  │   AI LAYER     │  │  EXTERNAL    │
│                       │  │                │  │  SERVICES    │
│  ┌─────────────────┐ │  │  ┌──────────┐  │  │              │
│  │  Upstash Redis  │ │  │  │ OpenAI   │  │  │ ┌──────────┐ │
│  │                 │ │  │  │  GPT-4   │  │  │ │ Telegram │ │
│  │ • Menu (30min)  │ │  │  │  Turbo   │  │  │ │   Bot    │ │
│  │ • Profiles(5min)│ │  │  │          │  │  │ │   API    │ │
│  │ • Convos (10min)│ │  │  │ Streaming│  │  │ └──────────┘ │
│  └─────────────────┘ │  │  └──────────┘  │  │              │
│                       │  │                │  │ ┌──────────┐ │
│  ┌─────────────────┐ │  │  ┌──────────┐  │  │ │  Google  │ │
│  │  Memory Cache   │ │  │  │ Whisper  │  │  │ │  Sheets  │ │
│  │                 │ │  │  │   API    │  │  │ │  (Menu)  │ │
│  │ • Fallback      │ │  │  │          │  │  │ └──────────┘ │
│  │ • Menu backup   │ │  │  │Voice→Text│  │  │              │
│  └─────────────────┘ │  │  └──────────┘  │  │ ┌──────────┐ │
│                       │  │                │  │ │  Google  │ │
└───────────────────────┘  └────────────────┘  │ │   Maps   │ │
                                               │ └──────────┘ │
                                               └──────────────┘
                    │
                    │
                    ▼
┌────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│                   Supabase PostgreSQL                       │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │user_profiles │  │conversations │  │    orders    │    │
│  │              │  │              │  │              │    │
│  │ • user_id    │  │ • messages[] │  │ • items[]    │    │
│  │ • telegram_id│  │ • summary    │  │ • status     │    │
│  │ • preferences│  │ • satisfaction│  │ • payment    │    │
│  │ • stats      │  │ • order_id   │  │ • delivery   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────┐  ┌─────────────────────────────────┐   │
│  │agent_events  │  │      Database Functions         │   │
│  │              │  │                                  │   │
│  │ • event_type │  │ • get_today_metrics()           │   │
│  │ • event_data │  │ • get_top_products()            │   │
│  │ • timestamp  │  │ • update_updated_at_column()    │   │
│  └──────────────┘  └─────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              Row Level Security (RLS)                │  │
│  │                                                       │  │
│  │  • Users see only their data                        │  │
│  │  • Admins have elevated access                      │  │
│  │  • Real-time subscriptions secured                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow - User Message

```
┌──────────┐
│  User    │ "Посоветуй что-то для расслабления"
│ (Browser)│
└────┬─────┘
     │
     ▼
┌────────────────┐
│ OGLabAgent     │ 1. Get user profile from Zustand
│ Component      │ 2. Add message to local state
└────┬───────────┘
     │
     │ POST /api/agent/chat
     │ { message, userId, conversationId }
     ▼
┌─────────────────────────────────────────────────────┐
│ /api/agent/chat                                     │
│                                                     │
│ 1. Get/Create user_profiles (Supabase)             │
│ 2. Get/Create conversations (Supabase)             │
│ 3. Save user message → conversations.messages[]    │
│ 4. Update profile stats (total_messages++)         │
│ 5. Track event → agent_events                      │
├─────────────────────────────────────────────────────┤
│ 6. Get menu from cache:                            │
│    ├─ Check Redis                                  │
│    ├─ Check Memory                                 │
│    └─ Fallback to DB → Google Sheets sync         │
├─────────────────────────────────────────────────────┤
│ 7. Build context:                                  │
│    ├─ User history from profile                   │
│    ├─ Conversation history (last 12 msgs)         │
│    └─ Menu context (filtered)                     │
├─────────────────────────────────────────────────────┤
│ 8. Call OpenAI (streaming):                        │
│    └─ SSE: token by token                         │
├─────────────────────────────────────────────────────┤
│ 9. Extract product mentions                        │
│ 10. Save assistant message → conversations         │
│ 11. Send Telegram notification (if order intent)   │
└─────────────────────┬───────────────────────────────┘
                      │
                      │ SSE Stream
                      ▼
┌─────────────────────────────────────────────────────┐
│ Client receives:                                    │
│                                                     │
│ data: {"content": "Для", "done": false}            │
│ data: {"content": " расслабления", "done": false}  │
│ ...                                                 │
│ data: {                                             │
│   "done": true,                                     │
│   "suggestedProducts": ["Purple Haze", "OG Kush"], │
│   "productCards": [...],                            │
│   "conversationId": "uuid",                         │
│   "userId": "user_123"                              │
│ }                                                   │
└─────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────┐
│ OGLabAgent updates: │
│ • Messages array    │
│ • Product cards     │
│ • Zustand store     │
│ • localStorage      │
└─────────────────────┘
```

---

## 🛒 Data Flow - Order Creation

```
┌──────────┐
│  User    │ "Хочу заказать Purple Haze 20г"
│          │ + Контакт + Адрес
└────┬─────┘
     │
     ▼
┌────────────────┐
│ OGLabAgent     │ Detect order intent
│                │ (via OpenAI or pattern)
└────┬───────────┘
     │
     │ POST /api/orders
     │ {
     │   userProfileId,
     │   conversationId,
     │   items: [{ name, quantity, price }],
     │   contactInfo: { name, phone },
     │   deliveryAddress,
     │   paymentMethod
     │ }
     ▼
┌─────────────────────────────────────────────────────┐
│ /api/orders                                         │
│                                                     │
│ 1. Validate request                                │
│    ├─ items not empty                              │
│    ├─ contact info present                         │
│    └─ delivery address present                     │
├─────────────────────────────────────────────────────┤
│ 2. Create order:                                   │
│    ├─ Generate order_number (OG241011-001)        │
│    ├─ Calculate totals (subtotal + delivery - disc)│
│    └─ Set status = 'pending'                       │
├─────────────────────────────────────────────────────┤
│ 3. Save to orders table                            │
│ 4. Update user_profiles:                           │
│    ├─ total_orders++                               │
│    └─ total_spent += amount                        │
├─────────────────────────────────────────────────────┤
│ 5. Link to conversation:                           │
│    └─ conversations.order_id = order.id            │
│    └─ conversations.resulted_in_order = true       │
├─────────────────────────────────────────────────────┤
│ 6. Track event:                                    │
│    └─ agent_events (type: 'order_success')         │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│ Telegram Notification (via /api/telegram/notify)   │
│                                                     │
│ 🎉 Новый заказ #OG241011-001                       │
│                                                     │
│ 👤 Клиент: Иван (user_123)                         │
│ 📦 Товары:                                          │
│    • Purple Haze 20г @ 250฿ = 5000฿                │
│ 💰 Итого: 5000฿                                     │
│ 📍 Адрес: Hotel ABC, Room 123                      │
│ 📞 Телефон: +66123456789                           │
│ 💳 Оплата: Наличные                                 │
└─────────────────────────────────────────────────────┘
     │
     │ Staff responds
     ▼
┌─────────────────────────────────────────────────────┐
│ PATCH /api/orders                                   │
│ { orderId, status: 'confirmed', note: 'Готовим' }  │
│                                                     │
│ → Update order.status                              │
│ → Add to order.status_history[]                    │
│ → Set order.confirmed_at = now()                   │
└─────────────────────────────────────────────────────┘
```

---

## 📱 Telegram Bot Flow

```
┌──────────────┐
│ Telegram User│ Sends message to @OGLabBot
└──────┬───────┘
       │
       │ Webhook POST
       ▼
┌────────────────────────────────────────────────────────┐
│ /api/telegram/webhook                                  │
│                                                        │
│ 1. Verify webhook secret                              │
│ 2. Extract message & user info                        │
│    ├─ telegram_user_id                                │
│    ├─ username                                        │
│    └─ language_code                                   │
├────────────────────────────────────────────────────────┤
│ 3. Get/Create user_profiles:                          │
│    └─ Link by telegram_user_id                        │
├────────────────────────────────────────────────────────┤
│ 4. Get/Create conversation (channel='telegram')       │
├────────────────────────────────────────────────────────┤
│ 5. Save user message                                  │
│ 6. Send "typing..." indicator to Telegram            │
├────────────────────────────────────────────────────────┤
│ 7. Get menu context + user history                    │
│ 8. Call OpenAI (non-streaming for Telegram)          │
│ 9. Save assistant message                             │
├────────────────────────────────────────────────────────┤
│ 10. Send reply to Telegram (Markdown formatting)      │
└────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Telegram User│ Receives response
└──────────────┘

Special Commands:
  /start → Welcome message in user's language
  /orders → Order history (Phase 2)
  /menu → Product catalog (Phase 2)
```

---

## 🔄 Caching Strategy

```
Request: Get Menu Data
         │
         ▼
    ┌─────────┐
    │ Redis?  │──Yes──┐
    └────┬────┘       │
         │No          │
         ▼            │
    ┌─────────┐       │
    │ Memory? │──Yes──┤
    └────┬────┘       │
         │No          │
         ▼            ▼
    ┌──────────┐  Return
    │ Database │  Data
    │ (Google  │     │
    │  Sheets) │     │
    └─────┬────┘     │
          │          │
          └──────────┴──> Update both caches
                          (Redis TTL: 30min)
                          (Memory TTL: 30min)
```

**Cache Hierarchy**:
1. **Redis** (Upstash) - Fastest, shared across instances
2. **Memory** - Fast, per-instance
3. **Database** - Source of truth

**TTL Values**:
```typescript
menu:items           → 30 min
user:profile:*       → 5 min
conversation:*       → 10 min
agent:context:*      → 15 min
order:status:*       → 2 min
session:*            → 24 hours
```

---

## 📈 Analytics & Monitoring

```
┌─────────────────────────────────────────────────┐
│           Data Collection Points                 │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐   ┌──────────────┐           │
│  │ Chat Message │   │ Product View │           │
│  │   (every)    │   │   (click)    │           │
│  └──────┬───────┘   └──────┬───────┘           │
│         │                   │                    │
│         └───────┬───────────┘                    │
│                 │                                │
│         ┌───────▼────────┐                      │
│         │  agent_events  │                      │
│         └───────┬────────┘                      │
│                 │                                │
└─────────────────┼────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│            Analytics Functions                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  • get_today_metrics()                          │
│    └─> Orders, Revenue, Conversations, Conversion│
│                                                  │
│  • get_top_products(days_back, limit)           │
│    └─> Product name, Order count, Revenue       │
│                                                  │
│  • getUserEngagementMetrics()                   │
│    └─> DAU, WAU, MAU, Session stats            │
│                                                  │
│  • getAIPerformanceMetrics()                    │
│    └─> Response times, Errors, Satisfaction    │
│                                                  │
└─────────────────┬───────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────┐
│           GET /api/analytics?metric=all         │
│                                                  │
│  Returns comprehensive dashboard data           │
└─────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure

```
oglab-site/
│
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── layout.tsx         (React Query Provider)
│   │   │   └── menu/page.tsx      (OGLabAgent)
│   │   │
│   │   └── api/
│   │       ├── agent/
│   │       │   └── chat/route.ts  (Main AI endpoint)
│   │       │
│   │       ├── orders/
│   │       │   └── route.ts       (Order CRUD)
│   │       │
│   │       ├── analytics/
│   │       │   └── route.ts       (Metrics)
│   │       │
│   │       └── telegram/
│   │           └── webhook/route.ts (Telegram bot)
│   │
│   ├── lib/
│   │   ├── supabase-client.ts     (DB clients)
│   │   ├── user-profile-db.ts     (User CRUD)
│   │   ├── conversations-db.ts    (Conversation CRUD)
│   │   ├── orders-db.ts           (Order CRUD)
│   │   ├── analytics-db.ts        (Analytics)
│   │   ├── redis-client.ts        (Caching)
│   │   ├── agent-store.ts         (Zustand)
│   │   ├── react-query-provider.tsx
│   │   └── migrate-to-supabase.ts (Migration)
│   │
│   └── components/
│       └── OGLabAgent.tsx         (Main component)
│
├── supabase/
│   └── migrations/
│       ├── 001_create_agent_tables.sql
│       ├── 002_create_functions_triggers.sql
│       ├── 003_enable_rls_policies.sql
│       └── 004_seed_initial_data.sql
│
└── docs/
    ├── README.md                   (Index)
    ├── SYSTEM_ARCHITECTURE.md      (Full spec)
    ├── ARCHITECTURE_DIAGRAM.md     (This file)
    ├── ADR-007-...md              (Phase plan)
    ├── PHASE_1_IMPLEMENTATION_SUMMARY.md
    └── ENVIRONMENT_SETUP.md
```

---

## 🔐 Security Layers

```
┌────────────────────────────────────────────┐
│         User Request                       │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  1. HTTPS/TLS Encryption                  │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  2. Rate Limiting (Edge)                  │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  3. API Authentication                     │
│     • Supabase RLS (user_id)              │
│     • Telegram webhook secret             │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  4. Row Level Security (RLS)              │
│     • Users see only their data           │
│     • Admins have elevated permissions    │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  5. Data Validation                       │
│     • Input sanitization                  │
│     • Type checking (TypeScript)          │
│     • Zod schemas (optional)              │
└───────────────┬────────────────────────────┘
                │
                ▼
┌────────────────────────────────────────────┐
│  6. Secure Database Access                │
│     • Service role key (server only)      │
│     • Anon key (client, RLS protected)    │
└────────────────────────────────────────────┘
```

---

## 📚 Related Documentation

- [Full System Architecture](./SYSTEM_ARCHITECTURE.md)
- [Documentation Index](./README.md)
- [Phase 1 Summary](./PHASE_1_IMPLEMENTATION_SUMMARY.md)
- [Environment Setup](./ENVIRONMENT_SETUP.md)

---

**Last Updated**: October 2025  
**Version**: Phase 1 Complete

