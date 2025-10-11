-- ============================================
-- AI Agent Enterprise - Initial Data
-- Migration 004: Seed Data (Optional)
-- ============================================

-- This file contains optional seed data for testing
-- Comment out or modify as needed

-- ============================================
-- SEED: Example User Profile (for testing)
-- ============================================

-- Uncomment to create test user
/*
INSERT INTO user_profiles (
  user_id,
  preferences,
  total_conversations,
  total_messages,
  loyalty_points,
  tags,
  notes
) VALUES (
  'user_test_001',
  '{
    "language": "ru",
    "experienceLevel": "intermediate",
    "preferredEffects": ["relax", "creative"],
    "favoriteStrains": ["Northern Lights", "White Widow"]
  }'::JSONB,
  5,
  42,
  150,
  ARRAY['test_user', 'frequent_buyer'],
  'Test user profile for development'
) ON CONFLICT (user_id) DO NOTHING;
*/

-- ============================================
-- SEED: Example Conversation (for testing)
-- ============================================

/*
INSERT INTO conversations (
  user_profile_id,
  channel,
  language,
  messages,
  message_count,
  summary
) 
SELECT
  id,
  'web',
  'ru',
  '[
    {
      "role": "user",
      "content": "Привет! Посоветуй что-нибудь для расслабления",
      "timestamp": "2025-01-10T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Привет! Для расслабления отлично подойдет **Northern Lights** — мощная индика 20% THC. Расслабит тело, отключит мысли, через час в кровать. Классика для сна.",
      "timestamp": "2025-01-10T10:00:02Z",
      "suggestedProducts": ["Northern Lights"]
    }
  ]'::JSONB,
  2,
  'User asked for relaxation recommendation, suggested Northern Lights'
FROM user_profiles
WHERE user_id = 'user_test_001'
LIMIT 1;
*/

-- ============================================
-- SEED: Example Order (for testing)
-- ============================================

/*
INSERT INTO orders (
  user_profile_id,
  status,
  items,
  subtotal,
  total_amount,
  contact_info,
  delivery_address,
  payment_method,
  order_source
)
SELECT
  id,
  'pending',
  '[
    {
      "name": "Northern Lights",
      "category": "INDICA",
      "quantity": 20,
      "unit": "g",
      "pricePerUnit": 400,
      "total": 8000
    }
  ]'::JSONB,
  8000,
  8000,
  '{
    "name": "John Smith",
    "phone": "+66123456789",
    "address": "Intercontinental, room 404"
  }'::JSONB,
  'Intercontinental Hotel, Room 404, Koh Samui',
  'cash',
  'web'
FROM user_profiles
WHERE user_id = 'user_test_001'
LIMIT 1;
*/

-- ============================================
-- SEED: Example Events (for testing)
-- ============================================

/*
INSERT INTO agent_events (
  user_profile_id,
  event_type,
  event_data,
  channel
)
SELECT
  id,
  'message_sent',
  '{
    "message": "Привет! Посоветуй что-нибудь для расслабления",
    "language": "ru"
  }'::JSONB,
  'web'
FROM user_profiles
WHERE user_id = 'user_test_001'
LIMIT 1;

INSERT INTO agent_events (
  user_profile_id,
  event_type,
  event_data,
  channel
)
SELECT
  id,
  'product_mentioned',
  '{
    "product": "Northern Lights",
    "context": "relaxation"
  }'::JSONB,
  'web'
FROM user_profiles
WHERE user_id = 'user_test_001'
LIMIT 1;
*/

-- ============================================
-- UTILITY: Reset sequences (if needed)
-- ============================================

-- Reset order number sequence to 1
-- Uncomment if needed for testing
-- ALTER SEQUENCE order_number_seq RESTART WITH 1;

-- ============================================
-- UTILITY: Cleanup test data
-- ============================================

-- Uncomment to remove all test data
/*
DELETE FROM agent_events WHERE user_profile_id IN (
  SELECT id FROM user_profiles WHERE user_id LIKE 'user_test_%'
);

DELETE FROM orders WHERE user_profile_id IN (
  SELECT id FROM user_profiles WHERE user_id LIKE 'user_test_%'
);

DELETE FROM conversations WHERE user_profile_id IN (
  SELECT id FROM user_profiles WHERE user_id LIKE 'user_test_%'
);

DELETE FROM user_profiles WHERE user_id LIKE 'user_test_%';
*/

-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify setup
-- ============================================

-- Check tables exist
/*
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_profiles', 'conversations', 'orders', 'agent_events')
ORDER BY tablename;
*/

-- Check indexes
/*
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'conversations', 'orders', 'agent_events')
ORDER BY tablename, indexname;
*/

-- Check triggers
/*
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('user_profiles', 'conversations', 'orders', 'agent_events')
ORDER BY event_object_table, trigger_name;
*/

-- Check RLS policies
/*
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'conversations', 'orders', 'agent_events')
ORDER BY tablename, policyname;
*/

-- Test today's metrics function
/*
SELECT * FROM get_today_metrics();
*/

-- Test top products function
/*
SELECT * FROM get_top_products(7, 5);
*/


