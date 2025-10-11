-- ============================================
-- AI Agent Enterprise - Row Level Security
-- Migration 003: RLS Policies
-- ============================================

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USER PROFILES POLICIES
-- ============================================

-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  USING (
    user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    OR id::text = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (
    user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
    OR id::text = current_setting('request.jwt.claims', true)::json->>'sub'
  );

-- Service role (API) can do anything with user_profiles
CREATE POLICY "Service role can manage all user profiles"
  ON user_profiles
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Authenticated users can create profiles
CREATE POLICY "Authenticated users can create profiles"
  ON user_profiles
  FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    OR current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Staff can view all profiles
CREATE POLICY "Staff can view all profiles"
  ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
        AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
          OR auth.users.raw_user_meta_data->>'role' = 'staff')
    )
  );

-- ============================================
-- CONVERSATIONS POLICIES
-- ============================================

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON conversations
  FOR SELECT
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
        OR id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Users can create conversations
CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  WITH CHECK (
    user_profile_id IN (
      SELECT id FROM user_profiles
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
        OR id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON conversations
  FOR UPDATE
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
        OR id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Service role can manage all conversations
CREATE POLICY "Service role can manage conversations"
  ON conversations
  FOR ALL
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Staff can view all conversations
CREATE POLICY "Staff can view all conversations"
  ON conversations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
        AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
          OR auth.users.raw_user_meta_data->>'role' = 'staff')
    )
  );

-- ============================================
-- ORDERS POLICIES
-- ============================================

-- Users can view their own orders
CREATE POLICY "Users can view own orders"
  ON orders
  FOR SELECT
  USING (
    user_profile_id IN (
      SELECT id FROM user_profiles
      WHERE user_id = current_setting('request.jwt.claims', true)::json->>'user_id'
        OR id::text = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Service role can create orders (from AI Agent)
CREATE POLICY "Service role can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Service role can update orders
CREATE POLICY "Service role can update orders"
  ON orders
  FOR UPDATE
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Staff can view all orders
CREATE POLICY "Staff can view all orders"
  ON orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
        AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
          OR auth.users.raw_user_meta_data->>'role' = 'staff')
    )
  );

-- Staff can update orders (assign, change status)
CREATE POLICY "Staff can update orders"
  ON orders
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
        AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
          OR auth.users.raw_user_meta_data->>'role' = 'staff')
    )
  );

-- Staff can create orders manually
CREATE POLICY "Staff can create orders"
  ON orders
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
        AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
          OR auth.users.raw_user_meta_data->>'role' = 'staff')
    )
  );

-- ============================================
-- AGENT EVENTS POLICIES
-- ============================================

-- Service role can create events
CREATE POLICY "Service role can create events"
  ON agent_events
  FOR INSERT
  WITH CHECK (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Service role can read events (for analytics)
CREATE POLICY "Service role can read events"
  ON agent_events
  FOR SELECT
  USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Staff can view analytics
CREATE POLICY "Staff can view events"
  ON agent_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id::text = current_setting('request.jwt.claims', true)::json->>'sub'
        AND (auth.users.raw_user_meta_data->>'role' = 'admin' 
          OR auth.users.raw_user_meta_data->>'role' = 'staff')
    )
  );

-- ============================================
-- REALTIME PUBLICATION
-- Enable realtime for order updates
-- ============================================

-- Drop existing publication if exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create publication for realtime
CREATE PUBLICATION supabase_realtime FOR TABLE orders;

-- ============================================
-- GRANT PERMISSIONS
-- Grant necessary permissions for anon and authenticated roles
-- ============================================

-- Grant SELECT on all tables to anon (read-only access through API)
GRANT SELECT ON user_profiles TO anon;
GRANT SELECT ON conversations TO anon;
GRANT SELECT ON orders TO anon;
GRANT SELECT ON agent_events TO anon;

-- Grant full access to authenticated users (limited by RLS)
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON conversations TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON agent_events TO authenticated;

-- Grant usage on sequences
GRANT USAGE ON SEQUENCE order_number_seq TO anon, authenticated, service_role;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON POLICY "Users can view own profile" ON user_profiles IS 'Users can only view their own profile data';
COMMENT ON POLICY "Service role can manage all user profiles" ON user_profiles IS 'API can manage all profiles';
COMMENT ON POLICY "Staff can view all profiles" ON user_profiles IS 'Admin and staff can view all user profiles';

COMMENT ON POLICY "Users can view own conversations" ON conversations IS 'Users can only view their own conversations';
COMMENT ON POLICY "Service role can manage conversations" ON conversations IS 'API can manage all conversations';
COMMENT ON POLICY "Staff can view all conversations" ON conversations IS 'Admin and staff can view all conversations';

COMMENT ON POLICY "Users can view own orders" ON orders IS 'Users can only view their own orders';
COMMENT ON POLICY "Staff can view all orders" ON orders IS 'Admin and staff can view all orders';
COMMENT ON POLICY "Staff can update orders" ON orders IS 'Admin and staff can update order status';

COMMENT ON POLICY "Service role can create events" ON agent_events IS 'API can create analytics events';
COMMENT ON POLICY "Staff can view events" ON agent_events IS 'Admin and staff can view analytics';


