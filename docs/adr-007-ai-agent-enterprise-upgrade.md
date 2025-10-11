# ADR-007: AI Agent Enterprise Upgrade - Phase 1

**Status:** ✅ **Phase 1 COMPLETED**  
**Date:** 2025-01-10  
**Completed:** 2025-10-11  
**Decision Makers:** Development Team  
**Technical Story:** Upgrade AI Agent to full-featured enterprise system with database persistence, Telegram bot, order management, and advanced caching

---

## 🎉 Implementation Status

### Phase 1: **COMPLETED** ✅

**Implementation Date:** October 11, 2025  
**Duration:** 1 day (accelerated delivery)

**Deliverables:**
- ✅ Database schema (4 tables, functions, RLS policies, migrations)
- ✅ Backend infrastructure (9 new libraries)
- ✅ API endpoints (chat, orders, analytics, telegram)
- ✅ Caching layer (Redis + Memory)
- ✅ State management (Zustand + React Query)
- ✅ Telegram bot integration (full two-way communication)
- ✅ Migration utility (localStorage → Supabase)
- ✅ Comprehensive documentation

**Documentation:**
- 📘 [System Architecture Reference](./SYSTEM_ARCHITECTURE.md) - **Full technical specification**
- 📗 [Phase 1 Implementation Summary](./PHASE_1_IMPLEMENTATION_SUMMARY.md)
- 📙 [Environment Setup Guide](./ENVIRONMENT_SETUP.md)
- 📕 [Supabase Migration Guide](./MIGRATION_GUIDE.md)

**Quick Links:**
- Database schema → [SYSTEM_ARCHITECTURE.md#архитектура-базы-данных](./SYSTEM_ARCHITECTURE.md#архитектура-базы-данных)
- API reference → [SYSTEM_ARCHITECTURE.md#api-endpoints](./SYSTEM_ARCHITECTURE.md#api-endpoints)
- Caching strategy → [SYSTEM_ARCHITECTURE.md#кэширование](./SYSTEM_ARCHITECTURE.md#кэширование)

---

## Context and Problem Statement

Current AI Agent works well but has limitations:
- **No persistence** - user profiles stored in localStorage (lost on device change)
- **One-way Telegram** - only notifications to staff, no client interaction
- **Manual order processing** - no queue system or status tracking
- **No analytics** - can't measure performance or improve
- **Limited caching** - only basic in-memory cache for menu (30 min TTL)
- **No state management** - React context only
- **Slow responses** - wait for full GPT response

**Goal:** Transform AI Agent into full-fledged team member integrated into company infrastructure.

---

## Decision Drivers

* 🎯 **User Experience** - faster responses, persistent profiles, multi-channel access
* 💰 **Business Value** - automation, analytics, higher conversion
* 🔧 **Scalability** - handle 100+ simultaneous users
* 📊 **Data-Driven** - measure everything, optimize continuously
* 🤖 **Integration** - seamless connection to all systems

---

## Phase 1: Foundation (4-6 weeks)

### 🗄️ 1. Database Layer with Supabase

**Why Supabase:**
- Already used in project (blog, auth)
- Real-time subscriptions out of the box
- Row Level Security (RLS)
- PostgreSQL = powerful queries + JSONB
- Edge Functions for serverless compute

#### 1.1 Database Schema

```sql
-- User Profiles (persistent across devices)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL, -- same as localStorage ID
  session_id TEXT, -- for anonymous tracking
  telegram_user_id BIGINT UNIQUE, -- link Telegram users
  telegram_username TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ DEFAULT NOW(),
  
  -- Statistics
  total_conversations INT DEFAULT 0,
  total_messages INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  
  -- Preferences (JSONB for flexibility)
  preferences JSONB DEFAULT '{}'::JSONB,
  -- {
  --   "favoriteStrains": ["Northern Lights", "White Widow"],
  --   "preferredEffects": ["relax", "creative"],
  --   "preferredTypes": ["indica", "hybrid"],
  --   "experienceLevel": "intermediate",
  --   "language": "ru",
  --   "interests": ["meditation", "creativity"],
  --   "avoidStrains": []
  -- }
  
  -- Marketing
  loyalty_points INT DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES user_profiles(id),
  
  -- Notes
  notes TEXT,
  tags TEXT[], -- ['vip', 'high_value', 'frequent_buyer']
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_telegram_user_id ON user_profiles(telegram_user_id);
CREATE INDEX idx_user_profiles_last_visit ON user_profiles(last_visit DESC);

-- Conversations (chat history)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Metadata
  channel TEXT NOT NULL, -- 'web', 'telegram', 'api'
  language TEXT DEFAULT 'en',
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Content
  messages JSONB DEFAULT '[]'::JSONB,
  -- [
  --   {
  --     "role": "user",
  --     "content": "Привет!",
  --     "timestamp": "2025-01-10T10:00:00Z",
  --     "suggestedProducts": []
  --   },
  --   {
  --     "role": "assistant",
  --     "content": "Привет! Чем могу помочь?",
  --     "timestamp": "2025-01-10T10:00:02Z",
  --     "suggestedProducts": ["Northern Lights"],
  --     "productCards": [...]
  --   }
  -- ]
  
  -- AI-generated summary
  summary TEXT,
  
  -- Analytics
  message_count INT DEFAULT 0,
  user_satisfaction INT, -- 1-5 rating
  feedback TEXT,
  
  -- Outcome
  resulted_in_order BOOLEAN DEFAULT false,
  order_id UUID REFERENCES orders(id)
);

CREATE INDEX idx_conversations_user_profile ON conversations(user_profile_id);
CREATE INDEX idx_conversations_started_at ON conversations(started_at DESC);
CREATE INDEX idx_conversations_channel ON conversations(channel);

-- Orders (order queue and status tracking)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL, -- human-readable: ORD-20250110-001
  
  -- Relations
  user_profile_id UUID REFERENCES user_profiles(id),
  conversation_id UUID REFERENCES conversations(id),
  assigned_to UUID REFERENCES auth.users(id), -- staff member
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending',
  -- 'pending' -> 'confirmed' -> 'preparing' -> 'delivering' -> 'completed'
  --           -> 'cancelled'
  status_history JSONB DEFAULT '[]'::JSONB,
  -- [
  --   {"status": "pending", "timestamp": "...", "by": null},
  --   {"status": "confirmed", "timestamp": "...", "by": "staff_uuid"}
  -- ]
  
  -- Products
  items JSONB NOT NULL,
  -- [
  --   {
  --     "name": "Northern Lights",
  --     "category": "INDICA",
  --     "quantity": 20,
  --     "unit": "g",
  --     "pricePerUnit": 400,
  --     "total": 8000
  --   }
  -- ]
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'THB',
  
  -- Contact & Delivery
  contact_info JSONB NOT NULL,
  -- {
  --   "name": "John Smith",
  --   "phone": "+66123456789",
  --   "address": "Intercontinental, room 404",
  --   "coordinates": {"lat": 9.5356, "lng": 100.0629},
  --   "plusCode": "8Q6Q+2X Koh Samui"
  -- }
  
  delivery_address TEXT,
  delivery_notes TEXT,
  payment_method TEXT NOT NULL, -- 'cash', 'transfer', 'crypto'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Channel
  order_source TEXT DEFAULT 'web', -- 'web', 'telegram', 'api'
  
  -- Internal notes
  staff_notes TEXT,
  cancellation_reason TEXT
);

CREATE INDEX idx_orders_user_profile ON orders(user_profile_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_assigned_to ON orders(assigned_to);
CREATE INDEX idx_orders_order_number ON orders(order_number);

-- Generate order number automatically
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(NEXTVAL('order_number_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE order_number_seq START 1;

CREATE TRIGGER set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION generate_order_number();

-- Agent Events (analytics)
CREATE TABLE agent_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_profile_id UUID REFERENCES user_profiles(id),
  conversation_id UUID REFERENCES conversations(id),
  
  -- Event details
  event_type TEXT NOT NULL,
  -- 'message_sent', 'product_mentioned', 'order_created', 
  -- 'voice_used', 'language_switched', 'feedback_given'
  
  event_data JSONB,
  metadata JSONB,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_agent_events_type ON agent_events(event_type);
CREATE INDEX idx_agent_events_created_at ON agent_events(created_at DESC);
CREATE INDEX idx_agent_events_user_profile ON agent_events(user_profile_id);
```

#### 1.2 Migration Strategy

**Step 1:** Create tables in Supabase
```bash
npm run db:migrate
```

**Step 2:** Migrate existing localStorage data
```typescript
// One-time migration script
async function migrateLocalStorageToSupabase() {
  const localProfile = loadUserProfile(); // from localStorage
  
  if (localProfile) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: localProfile.userId,
        first_visit: localProfile.firstVisit,
        last_visit: localProfile.lastVisit,
        total_conversations: localProfile.totalConversations,
        total_messages: localProfile.totalMessages,
        preferences: localProfile.preferences,
      })
      .select()
      .single();
    
    if (!error) {
      console.log('✅ Profile migrated to Supabase');
      // Keep localStorage as backup for 30 days
    }
  }
}
```

**Step 3:** Update all profile operations to use Supabase
```typescript
// lib/user-profile-db.ts
export async function getOrCreateUserProfile(userId?: string) {
  // Try to get from Supabase
  // If not exists, create
  // Sync with localStorage as fallback
}
```

#### 1.3 Implementation Tasks

- [ ] Create Supabase tables (1 day)
- [ ] Setup RLS policies (1 day)
- [ ] Create lib/user-profile-db.ts (2 days)
- [ ] Migration script for localStorage → Supabase (1 day)
- [ ] Update OGLabAgent to use Supabase (2 days)
- [ ] Testing & validation (2 days)

**Total: ~1.5 weeks**

---

### 💬 2. Full-Featured Telegram Bot

**Current:** One-way notifications  
**Goal:** Two-way conversations with same personality

#### 2.1 Architecture

```
User in Telegram
       ↓
  Telegram Bot (Webhook)
       ↓
  /api/telegram/webhook
       ↓
  Parse message + context
       ↓
  /api/agent/chat (same as web)
       ↓
  GPT-4 Response
       ↓
  Format for Telegram (Markdown)
       ↓
  Send via Bot API
       ↓
  User receives reply
```

#### 2.2 Bot Commands

```typescript
// Bot commands
/start - Initialize profile & greeting
/menu - Show product categories (inline keyboard)
/order <product> <quantity> - Quick order
/status - Check active orders
/track <order_number> - Track specific order
/help - Help & FAQ
/lang <code> - Switch language
/profile - View your stats
/cancel - Cancel current order
```

#### 2.3 Features

**Inline Keyboards:**
```typescript
// Category selection
const menuKeyboard = {
  inline_keyboard: [
    [
      { text: '🌿 Indica', callback_data: 'cat_indica' },
      { text: '🔥 Sativa', callback_data: 'cat_sativa' },
    ],
    [
      { text: '🌀 Hybrid', callback_data: 'cat_hybrid' },
      { text: '💎 Hash', callback_data: 'cat_hash' },
    ],
    [
      { text: '💬 Talk to Agent', callback_data: 'chat_agent' },
    ]
  ]
};
```

**Order Confirmation:**
```typescript
// When order ready
"✅ Order Confirmed!

📦 **Order #ORD-20250110-001**

🌿 20g Northern Lights
💰 Total: 8,000฿

📍 Delivery: Intercontinental, room 404
💳 Payment: Cash

⏰ Estimated: Today 18:00-20:00

Our team will contact you shortly!"

// With buttons
[Accept] [Change] [Cancel]
```

**Status Updates:**
```typescript
// Real-time updates
"📦 Your order #ORD-20250110-001

✅ Confirmed (10:30)
✅ Preparing (10:45)
🚚 Out for delivery (11:00)

📍 ETA: 20 minutes
👤 Driver: Somchai"
```

#### 2.4 Implementation

```typescript
// src/app/api/telegram/webhook/route.ts
export async function POST(req: Request) {
  const update = await req.json();
  
  // Handle different update types
  if (update.message) {
    await handleMessage(update.message);
  } else if (update.callback_query) {
    await handleCallback(update.callback_query);
  }
  
  return new Response('OK', { status: 200 });
}

async function handleMessage(message: TelegramMessage) {
  const userId = message.from.id;
  const text = message.text;
  
  // Get or create user profile
  const profile = await getOrCreateUserProfile(undefined, userId);
  
  // Process with AI Agent (same as web)
  const response = await fetch('/api/agent/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: text,
      conversationHistory: [...],
      language: profile.preferences.language,
      userId: profile.user_id,
    }),
  });
  
  const data = await response.json();
  
  // Send reply via Telegram
  await sendTelegramMessage(userId, data.reply, {
    parse_mode: 'Markdown',
  });
  
  // Show product cards if any
  if (data.productCards.length > 0) {
    await sendProductCards(userId, data.productCards);
  }
}
```

#### 2.5 Implementation Tasks

- [ ] Setup Telegram webhook (1 day)
- [ ] Create /api/telegram/webhook (2 days)
- [ ] Implement message handling (2 days)
- [ ] Add inline keyboards (1 day)
- [ ] Product cards formatting (1 day)
- [ ] Order status updates (1 day)
- [ ] Link Telegram ↔ user_profile (1 day)
- [ ] Testing with real bot (2 days)

**Total: ~2 weeks**

---

### 🎯 3. Order Queue & Status Management

**Goal:** Structured order processing with status tracking

#### 3.1 Order Workflow

```
1. PENDING (created by AI)
   ↓
2. CONFIRMED (staff accepts)
   ↓
3. PREPARING (packing products)
   ↓
4. DELIVERING (courier assigned)
   ↓
5. COMPLETED (delivered)

   OR → CANCELLED (at any stage)
```

#### 3.2 Staff Interface (Telegram)

**New Order Notification:**
```
🛒 NEW ORDER #ORD-20250110-001

👤 John Smith (Visit #3)
📱 +66123456789
🗣️ 🇬🇧 English

━━━━━━━━━━━━━━━━━━━
📦 ORDER DETAILS:

🌿 20g Northern Lights (Indica)
💰 8,000฿ (20g × 400฿)

📍 Intercontinental, room 404
💳 Payment: Cash

━━━━━━━━━━━━━━━━━━━
⏰ 10:30 AM

[✅ Accept] [❌ Reject] [💬 Message Client]
```

**Actions:**
```typescript
// Callback buttons for staff
callback_data: 'order_accept_<order_id>'
callback_data: 'order_reject_<order_id>'
callback_data: 'order_message_<order_id>'
```

#### 3.3 API Endpoints

```typescript
// Order management API
POST   /api/orders              - Create order
GET    /api/orders/:id          - Get order details
PATCH  /api/orders/:id/status   - Update status
GET    /api/orders              - List orders (with filters)
DELETE /api/orders/:id          - Cancel order

// Filters
?status=pending
?assigned_to=staff_uuid
?created_after=2025-01-10
?user_profile_id=uuid
```

#### 3.4 Real-Time Updates

```typescript
// Use Supabase Realtime
supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'orders' },
    (payload) => {
      const order = payload.new;
      
      // Notify client via Telegram/Web
      if (order.status === 'confirmed') {
        notifyClient(order.user_profile_id, 
          `✅ Your order #${order.order_number} confirmed!`);
      }
    }
  )
  .subscribe();
```

#### 3.5 Implementation Tasks

- [ ] Create orders API endpoints (2 days)
- [ ] Staff notification with buttons (1 day)
- [ ] Order status update logic (1 day)
- [ ] Real-time subscriptions (1 day)
- [ ] Client notifications (1 day)
- [ ] Order dashboard (basic) (2 days)
- [ ] Testing workflow (1 day)

**Total: ~1.5 weeks**

---

### 📊 4. Analytics & Dashboard

**Goal:** Measure everything, optimize continuously

#### 4.1 Metrics to Track

**Business Metrics:**
- Total orders (today, week, month)
- Conversion rate (conversations → orders)
- Average order value
- Revenue (today, week, month)
- Top products by orders
- Top products by revenue

**Agent Performance:**
- Total conversations
- Average messages per conversation
- Average response time
- User satisfaction score (if collected)
- Language distribution
- Channel distribution (web/telegram)

**User Metrics:**
- New users (today, week, month)
- Returning users rate
- Average sessions per user
- Churn rate

#### 4.2 Dashboard Views

**Admin Dashboard** (`/admin/analytics`)

```typescript
// Key metrics cards
<MetricsGrid>
  <MetricCard 
    title="Today's Orders"
    value={32}
    change="+12%"
    trend="up"
  />
  <MetricCard 
    title="Revenue"
    value="256,000฿"
    change="+8%"
    trend="up"
  />
  <MetricCard 
    title="Avg Order Value"
    value="8,000฿"
    change="+5%"
    trend="up"
  />
  <MetricCard 
    title="Conversion Rate"
    value="18.5%"
    change="+2.3%"
    trend="up"
  />
</MetricsGrid>

// Charts
<OrdersChart data={ordersOverTime} />
<RevenueChart data={revenueOverTime} />
<TopProducts data={topProducts} />
<LanguageDistribution data={languages} />
```

#### 4.3 Data Aggregation

```typescript
// API endpoint for analytics
GET /api/analytics/metrics?period=today|week|month

// Response
{
  "period": "today",
  "orders": {
    "total": 32,
    "completed": 28,
    "cancelled": 2,
    "pending": 2
  },
  "revenue": {
    "total": 256000,
    "avg_order": 8000
  },
  "conversations": {
    "total": 156,
    "converted": 32,
    "conversion_rate": 0.205
  },
  "users": {
    "new": 12,
    "returning": 20
  },
  "channels": {
    "web": 20,
    "telegram": 12
  }
}
```

#### 4.4 Implementation Tasks

- [ ] Create analytics queries (2 days)
- [ ] API endpoint /api/analytics (1 day)
- [ ] Admin dashboard UI (3 days)
- [ ] Charts with recharts (2 days)
- [ ] Real-time metrics (1 day)
- [ ] Export reports (CSV/PDF) (1 day)

**Total: ~2 weeks**

---

### ⚡ 5. Advanced Caching Strategy

**Goal:** 10x faster responses, reduce DB load

#### 5.1 Caching Layers

```
Request
  ↓
[1. Browser Cache] - Zustand persist
  ↓ (miss)
[2. Redis Cache] - Session & hot data
  ↓ (miss)
[3. In-Memory Cache] - Node.js process
  ↓ (miss)
[4. Supabase] - Source of truth
```

#### 5.2 Redis Setup

**Why Redis:**
- Sub-millisecond latency
- Session storage
- Rate limiting
- Pub/Sub for real-time features

**Installation:**
```bash
# Use Upstash Redis (serverless)
npm install @upstash/redis

# Or local Redis
docker run -d -p 6379:6379 redis:alpine
```

**Usage:**
```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Cache user profile
export async function getCachedProfile(userId: string) {
  const cached = await redis.get(`profile:${userId}`);
  if (cached) return JSON.parse(cached as string);
  
  // Fetch from DB
  const profile = await fetchProfileFromDB(userId);
  
  // Cache for 1 hour
  await redis.setex(
    `profile:${userId}`, 
    3600, 
    JSON.stringify(profile)
  );
  
  return profile;
}
```

#### 5.3 In-Memory Cache

```typescript
// lib/cache.ts
import NodeCache from 'node-cache';

// Menu cache (30 min TTL)
const menuCache = new NodeCache({ stdTTL: 1800 });

// Conversation cache (5 min TTL)
const conversationCache = new NodeCache({ stdTTL: 300 });

export function getCachedMenu() {
  return menuCache.get('menu') || null;
}

export function setCachedMenu(menu: any) {
  menuCache.set('menu', menu);
}
```

#### 5.4 React Query Setup

**Why React Query:**
- Automatic caching
- Background refetching
- Optimistic updates
- Pagination
- Infinite scroll

**Installation:**
```bash
npm install @tanstack/react-query
```

**Setup:**
```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

**Usage in components:**
```typescript
// hooks/useUserProfile.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export function useUserProfile() {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const res = await fetch('/api/user/profile');
      return res.json();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    },
  });
}
```

#### 5.5 Zustand for Global State

**Why Zustand:**
- Simpler than Redux
- TypeScript-first
- No boilerplate
- Persist middleware
- Dev tools

**Installation:**
```bash
npm install zustand
```

**Setup:**
```typescript
// stores/agentStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AgentState {
  // Current conversation
  currentConversation: Conversation | null;
  setCurrentConversation: (conv: Conversation) => void;
  
  // Messages
  messages: Message[];
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Settings
  useStock: boolean;
  setUseStock: (use: boolean) => void;
  
  // Voice
  recordingState: RecordingState;
  setRecordingState: (state: RecordingState) => void;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set) => ({
      currentConversation: null,
      setCurrentConversation: (conv) => set({ currentConversation: conv }),
      
      messages: [],
      addMessage: (msg) => set((state) => ({ 
        messages: [...state.messages, msg] 
      })),
      clearMessages: () => set({ messages: [] }),
      
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      useStock: true,
      setUseStock: (use) => set({ useStock: use }),
      
      recordingState: 'idle',
      setRecordingState: (state) => set({ recordingState: state }),
    }),
    {
      name: 'agent-storage',
      partialize: (state) => ({
        useStock: state.useStock,
        // Don't persist everything
      }),
    }
  )
);
```

**Usage:**
```typescript
'use client';

import { useAgentStore } from '@/stores/agentStore';

export default function OGLabAgent() {
  const { messages, addMessage, isLoading } = useAgentStore();
  
  // Component logic...
}
```

#### 5.6 Implementation Tasks

- [ ] Setup Redis (Upstash) (1 day)
- [ ] Implement cache helpers (1 day)
- [ ] Setup React Query (1 day)
- [ ] Setup Zustand stores (1 day)
- [ ] Migrate OGLabAgent to Zustand (2 days)
- [ ] Add query hooks (1 day)
- [ ] Testing & optimization (1 day)

**Total: ~1.5 weeks**

---

### 🌊 6. Streaming Responses

**Goal:** Show AI response as it's generated (like ChatGPT)

#### 6.1 Implementation

**Backend (API Route):**
```typescript
// src/app/api/agent/chat-stream/route.ts
export async function POST(req: Request) {
  const { message, conversationHistory, ...rest } = await req.json();
  
  // Create ReadableStream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [...conversationHistory, { role: 'user', content: message }],
          stream: true, // ← Enable streaming
          temperature: 0.8,
          max_tokens: 500,
        });
        
        let fullResponse = '';
        
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || '';
          
          if (content) {
            fullResponse += content;
            
            // Send chunk to client
            const data = JSON.stringify({ 
              type: 'chunk',
              content,
              fullResponse, // accumulated response
            });
            
            controller.enqueue(
              new TextEncoder().encode(`data: ${data}\n\n`)
            );
          }
        }
        
        // Extract products from full response
        const products = extractProductMentions(fullResponse, menuItems);
        
        // Send final message with product cards
        const finalData = JSON.stringify({
          type: 'complete',
          fullResponse,
          products,
          productCards: getProductCards(products, menuItems),
        });
        
        controller.enqueue(
          new TextEncoder().encode(`data: ${finalData}\n\n`)
        );
        
        controller.close();
        
      } catch (error) {
        controller.error(error);
      }
    },
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

**Frontend (Component):**
```typescript
'use client';

import { useAgentStore } from '@/stores/agentStore';

export default function OGLabAgent() {
  const { messages, addMessage } = useAgentStore();
  const [streamingMessage, setStreamingMessage] = useState('');
  
  async function sendMessage(text: string) {
    // Add user message
    addMessage({ role: 'user', content: text });
    
    // Start streaming
    const response = await fetch('/api/agent/chat-stream', {
      method: 'POST',
      body: JSON.stringify({
        message: text,
        conversationHistory: messages,
      }),
    });
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    let buffer = '';
    
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      
      // Process complete messages
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          
          if (data.type === 'chunk') {
            // Update streaming message
            setStreamingMessage(data.fullResponse);
          } else if (data.type === 'complete') {
            // Add final message with products
            addMessage({
              role: 'assistant',
              content: data.fullResponse,
              productCards: data.productCards,
            });
            setStreamingMessage('');
          }
        }
      }
    }
  }
  
  return (
    <div>
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      
      {streamingMessage && (
        <MessageBubble
          message={{ role: 'assistant', content: streamingMessage }}
          streaming
        />
      )}
    </div>
  );
}
```

#### 6.2 Benefits

- ✅ **Perceived speed** - user sees response immediately
- ✅ **Better UX** - like ChatGPT
- ✅ **Lower bounce rate** - users don't leave during wait

#### 6.3 Implementation Tasks

- [ ] Create /api/agent/chat-stream (2 days)
- [ ] Update OGLabAgent for streaming (2 days)
- [ ] Add streaming indicator (1 day)
- [ ] Testing (1 day)

**Total: ~1 week**

---

### 🧠 7. Semantic Caching

**Goal:** Cache similar questions to reduce API calls

#### 7.1 How It Works

```
User asks: "What is indica?"
  ↓
Generate embedding vector
  ↓
Search in vector DB for similar queries
  ↓
If found (similarity > 0.95) → return cached response
  ↓
Else → call GPT-4 → cache response with embedding
```

#### 7.2 Implementation

**Setup Supabase pgvector:**
```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Semantic cache table
CREATE TABLE semantic_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  query_embedding vector(1536), -- OpenAI embedding dimension
  response_text TEXT NOT NULL,
  product_cards JSONB,
  hit_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX semantic_cache_embedding_idx 
  ON semantic_cache 
  USING ivfflat (query_embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX semantic_cache_last_used_idx 
  ON semantic_cache(last_used_at DESC);
```

**Cache Logic:**
```typescript
// lib/semantic-cache.ts
import { openai } from './openai';
import { supabase } from './supabase';

export async function getSemanticCache(query: string) {
  // 1. Generate embedding for query
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  
  const queryEmbedding = embeddingResponse.data[0].embedding;
  
  // 2. Search for similar queries (cosine similarity > 0.95)
  const { data, error } = await supabase.rpc('search_semantic_cache', {
    query_embedding: queryEmbedding,
    similarity_threshold: 0.95,
    match_count: 1,
  });
  
  if (data && data.length > 0) {
    const cached = data[0];
    
    // Update hit count and last used
    await supabase
      .from('semantic_cache')
      .update({
        hit_count: cached.hit_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', cached.id);
    
    console.log('🎯 Semantic cache HIT:', query);
    return {
      response: cached.response_text,
      productCards: cached.product_cards,
      cached: true,
    };
  }
  
  return null;
}

export async function setSemanticCache(
  query: string,
  response: string,
  productCards: any[]
) {
  // Generate embedding
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });
  
  const queryEmbedding = embeddingResponse.data[0].embedding;
  
  // Store in cache
  await supabase.from('semantic_cache').insert({
    query_text: query,
    query_embedding: queryEmbedding,
    response_text: response,
    product_cards: productCards,
  });
  
  console.log('💾 Semantic cache SET:', query);
}
```

**RPC Function:**
```sql
-- Function for vector similarity search
CREATE OR REPLACE FUNCTION search_semantic_cache(
  query_embedding vector(1536),
  similarity_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  query_text text,
  response_text text,
  product_cards jsonb,
  hit_count int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sc.id,
    sc.query_text,
    sc.response_text,
    sc.product_cards,
    sc.hit_count,
    1 - (sc.query_embedding <=> query_embedding) as similarity
  FROM semantic_cache sc
  WHERE 1 - (sc.query_embedding <=> query_embedding) > similarity_threshold
  ORDER BY sc.query_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Use in Chat API:**
```typescript
// src/app/api/agent/chat/route.ts
export async function POST(req: Request) {
  const { message } = await req.json();
  
  // 1. Try semantic cache
  const cached = await getSemanticCache(message);
  if (cached) {
    return NextResponse.json({
      reply: cached.response,
      productCards: cached.productCards,
      cached: true,
      tokens_saved: 500, // approximate
    });
  }
  
  // 2. Call GPT-4
  const completion = await openai.chat.completions.create({...});
  const response = completion.choices[0].message.content;
  
  // 3. Cache the response
  await setSemanticCache(message, response, productCards);
  
  return NextResponse.json({
    reply: response,
    productCards,
    cached: false,
  });
}
```

#### 7.3 Benefits

- ✅ **90% faster** for common questions
- ✅ **50-70% cost reduction** on API calls
- ✅ **Consistent answers** for similar questions

#### 7.4 Implementation Tasks

- [ ] Enable pgvector in Supabase (1 day)
- [ ] Create semantic_cache table (1 day)
- [ ] Implement getSemanticCache/setSemanticCache (2 days)
- [ ] Integrate into chat API (1 day)
- [ ] Analytics for cache hit rate (1 day)
- [ ] Testing (1 day)

**Total: ~1 week**

---

### 🔮 8. Prefetching

**Goal:** Predict next user action and prefetch data

#### 8.1 Strategy

```typescript
// Prefetch scenarios

// 1. User asks about product → prefetch related products
if (mentionedProduct) {
  prefetch(`/api/products/${productId}/related`);
}

// 2. User asks about delivery → prefetch order form data
if (intent === 'delivery') {
  prefetch('/api/delivery/options');
  prefetch('/api/payment/methods');
}

// 3. Returning user → prefetch their history
if (isReturningUser) {
  prefetch(`/api/user/${userId}/orders`);
  prefetch(`/api/user/${userId}/favorites`);
}

// 4. High conversion probability → prefetch checkout flow
if (conversionProbability > 0.7) {
  prefetch('/api/checkout/init');
}
```

#### 8.2 Implementation

```typescript
// lib/prefetch.ts
export function prefetchQuery(queryKey: string[], queryFn: Function) {
  const queryClient = useQueryClient();
  
  queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Usage in agent
useEffect(() => {
  if (mentionedProducts.length > 0) {
    // Prefetch product details
    mentionedProducts.forEach((product) => {
      prefetchQuery(
        ['product', product.id],
        () => fetch(`/api/products/${product.id}`).then(r => r.json())
      );
    });
  }
  
  if (userIntent === 'order') {
    // Prefetch order dependencies
    prefetchQuery(
      ['delivery-options'],
      () => fetch('/api/delivery/options').then(r => r.json())
    );
  }
}, [mentionedProducts, userIntent]);
```

#### 8.3 Implementation Tasks

- [ ] Create prefetch utility (1 day)
- [ ] Add prefetch triggers (1 day)
- [ ] Testing (1 day)

**Total: ~3 days**

---

## Technology Stack Summary

| Component | Technology | Reason |
|-----------|-----------|---------|
| Database | Supabase (PostgreSQL) | Real-time, RLS, JSONB, pgvector |
| Caching | Redis (Upstash) | Session storage, rate limiting |
| State Management | Zustand | Simple, TypeScript-first |
| Data Fetching | React Query | Automatic caching, background sync |
| Real-time | Supabase Realtime | WebSocket, automatic updates |
| Vector Search | pgvector | Semantic similarity search |
| Bot Framework | Telegram Bot API | Official, well-documented |
| Embeddings | OpenAI text-embedding-3-small | Fast, cheap ($0.00002/1K tokens) |
| Streaming | SSE (Server-Sent Events) | Simple, built-in browser support |

---

## Implementation Timeline

### Week 1-2: Database Foundation
- Create Supabase tables
- Migration from localStorage
- Update all profile operations
- Testing

### Week 3-4: а

### Week 5-6: Order Management
- API endpoints
- Status workflow
- Real-time updates
- Staff notifications
- Testing

### Week 7: Analytics
- Metrics queries
- Admin dashboard
- Charts
- Reports

### Week 8-9: Caching & Performance
- Redis setup
- React Query integration
- Zustand stores
- Streaming responses
- Semantic cache

### Week 10: Prefetching & Polish
- Prefetch logic
- Performance optimization
- Bug fixes
- Documentation

**Total: ~10 weeks for Phase 1**

---

## Success Metrics

After Phase 1 completion, we should achieve:

| Metric | Current | Target |
|--------|---------|--------|
| Response Time | 2-5 sec | <1 sec (with cache) |
| Conversion Rate | ~10% | >15% |
| Order Processing Time | Manual | <5 min automated |
| User Retention | ~20% | >30% |
| GPT-4 API Costs | $500/month | $250/month (cache) |
| Staff Time Saved | 0 | 2-3 hours/day |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase downtime | High | Fallback to localStorage + retry logic |
| Redis unavailable | Medium | Graceful degradation to DB |
| GPT-4 rate limits | High | Queue system + semantic cache |
| Telegram API limits | Medium | Rate limiting + batch sending |
| Migration data loss | High | Backup localStorage data for 30 days |

---

## Next Steps

1. ✅ Review and approve this ADR
2. ✅ Setup project tracking (GitHub Projects / Linear)
3. ✅ Create Supabase project (if not exists)
4. ✅ Setup Redis (Upstash free tier)
5. ✅ Begin Week 1 tasks

---

## References

- [Supabase Docs](https://supabase.com/docs)
- [React Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://docs.pmnd.rs/zustand)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [OpenAI Streaming](https://platform.openai.com/docs/api-reference/streaming)
- [pgvector](https://github.com/pgvector/pgvector)

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-10  
**Status:** Ready for Implementation 🚀

