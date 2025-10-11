-- ============================================
-- AI Agent Enterprise - Database Schema
-- Migration 001: Core Tables
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USER PROFILES TABLE
-- Persistent user data across devices
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT UNIQUE NOT NULL, -- same as localStorage ID for migration
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
  -- Structure:
  -- {
  --   "favoriteStrains": ["Northern Lights", "White Widow"],
  --   "preferredEffects": ["relax", "creative"],
  --   "preferredTypes": ["indica", "hybrid"],
  --   "experienceLevel": "intermediate",
  --   "language": "ru",
  --   "interests": ["meditation", "creativity"],
  --   "avoidStrains": []
  -- }
  
  -- Marketing & Loyalty
  loyalty_points INT DEFAULT 0,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES user_profiles(id),
  
  -- Notes
  notes TEXT,
  tags TEXT[], -- ['vip', 'high_value', 'frequent_buyer']
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for user_profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_telegram_user_id ON user_profiles(telegram_user_id) WHERE telegram_user_id IS NOT NULL;
CREATE INDEX idx_user_profiles_last_visit ON user_profiles(last_visit DESC);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active) WHERE is_active = true;
CREATE INDEX idx_user_profiles_referral_code ON user_profiles(referral_code) WHERE referral_code IS NOT NULL;

-- ============================================
-- CONVERSATIONS TABLE
-- Chat history with AI Agent
-- ============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  
  -- Metadata
  channel TEXT NOT NULL, -- 'web', 'telegram', 'api'
  language TEXT DEFAULT 'en',
  
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Content (JSONB for flexibility)
  messages JSONB DEFAULT '[]'::JSONB,
  -- Structure:
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
  order_id UUID, -- will reference orders table
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for conversations
CREATE INDEX idx_conversations_user_profile ON conversations(user_profile_id);
CREATE INDEX idx_conversations_started_at ON conversations(started_at DESC);
CREATE INDEX idx_conversations_channel ON conversations(channel);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_resulted_in_order ON conversations(resulted_in_order) WHERE resulted_in_order = true;

-- ============================================
-- ORDERS TABLE
-- Order queue and status tracking
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL, -- ORD-20250110-001
  
  -- Relations
  user_profile_id UUID REFERENCES user_profiles(id),
  conversation_id UUID REFERENCES conversations(id),
  assigned_to UUID, -- staff member (auth.users)
  
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending',
  -- Possible values: 'pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'
  
  status_history JSONB DEFAULT '[]'::JSONB,
  -- [
  --   {"status": "pending", "timestamp": "...", "by": null},
  --   {"status": "confirmed", "timestamp": "...", "by": "staff_uuid", "note": "Order accepted"}
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
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'paid', 'failed'
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  estimated_delivery TIMESTAMPTZ,
  actual_delivery TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  
  -- Channel
  order_source TEXT DEFAULT 'web', -- 'web', 'telegram', 'api'
  
  -- Internal notes
  staff_notes TEXT,
  cancellation_reason TEXT,
  
  -- Rating (after completion)
  rating INT, -- 1-5
  review TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for orders
CREATE INDEX idx_orders_user_profile ON orders(user_profile_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_assigned_to ON orders(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_order_source ON orders(order_source);

-- ============================================
-- AGENT EVENTS TABLE
-- Analytics and event tracking
-- ============================================
CREATE TABLE agent_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_profile_id UUID REFERENCES user_profiles(id),
  conversation_id UUID REFERENCES conversations(id),
  order_id UUID REFERENCES orders(id),
  
  -- Event details
  event_type TEXT NOT NULL,
  -- Examples:
  -- 'message_sent', 'product_mentioned', 'order_created', 
  -- 'voice_used', 'language_switched', 'feedback_given',
  -- 'order_confirmed', 'order_completed', 'cache_hit'
  
  event_data JSONB,
  -- Flexible structure depending on event_type
  
  -- Context
  channel TEXT, -- 'web', 'telegram', 'api'
  session_id TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::JSONB,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for agent_events
CREATE INDEX idx_agent_events_type ON agent_events(event_type);
CREATE INDEX idx_agent_events_created_at ON agent_events(created_at DESC);
CREATE INDEX idx_agent_events_user_profile ON agent_events(user_profile_id) WHERE user_profile_id IS NOT NULL;
CREATE INDEX idx_agent_events_conversation ON agent_events(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX idx_agent_events_channel ON agent_events(channel);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE user_profiles IS 'Persistent user profiles across devices';
COMMENT ON TABLE conversations IS 'AI Agent conversation history';
COMMENT ON TABLE orders IS 'Order queue with status tracking';
COMMENT ON TABLE agent_events IS 'Analytics and event tracking';

COMMENT ON COLUMN user_profiles.user_id IS 'Unique user ID (same as localStorage for migration)';
COMMENT ON COLUMN user_profiles.telegram_user_id IS 'Telegram user ID for bot integration';
COMMENT ON COLUMN user_profiles.preferences IS 'User preferences in JSONB format';
COMMENT ON COLUMN user_profiles.loyalty_points IS 'Loyalty program points';

COMMENT ON COLUMN conversations.messages IS 'Full conversation history in JSONB';
COMMENT ON COLUMN conversations.channel IS 'Source channel: web, telegram, api';
COMMENT ON COLUMN conversations.resulted_in_order IS 'Whether conversation resulted in order';

COMMENT ON COLUMN orders.status IS 'Order status: pending, confirmed, preparing, delivering, completed, cancelled';
COMMENT ON COLUMN orders.status_history IS 'Full status change history';
COMMENT ON COLUMN orders.items IS 'Ordered products in JSONB';
COMMENT ON COLUMN orders.contact_info IS 'Contact and delivery information';

COMMENT ON COLUMN agent_events.event_type IS 'Type of event for analytics';
COMMENT ON COLUMN agent_events.event_data IS 'Event-specific data in JSONB';


