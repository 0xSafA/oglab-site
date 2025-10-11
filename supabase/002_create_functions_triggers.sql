-- ============================================
-- AI Agent Enterprise - Functions & Triggers
-- Migration 002: Helper Functions and Triggers
-- ============================================

-- ============================================
-- FUNCTION: Generate Order Number
-- Generates human-readable order numbers like ORD-20250110-001
-- ============================================

-- Create sequence for order numbers (resets daily)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  today TEXT;
  seq_num INT;
  order_num TEXT;
BEGIN
  today := TO_CHAR(NOW(), 'YYYYMMDD');
  
  -- Get next sequence number
  seq_num := NEXTVAL('order_number_seq');
  
  -- Format: ORD-20250110-001
  order_num := 'ORD-' || today || '-' || LPAD(seq_num::TEXT, 3, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-generate order number on insert
-- ============================================

CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- ============================================
-- FUNCTION: Update conversation message count
-- ============================================

CREATE OR REPLACE FUNCTION update_conversation_message_count()
RETURNS TRIGGER AS $$
BEGIN
  NEW.message_count := JSONB_ARRAY_LENGTH(NEW.messages);
  NEW.last_message_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversation_message_count
  BEFORE UPDATE OF messages ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_message_count();

-- ============================================
-- FUNCTION: Update user profile statistics
-- Called when conversation ends or order completed
-- ============================================

CREATE OR REPLACE FUNCTION update_user_stats_on_conversation_end()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    UPDATE user_profiles
    SET 
      total_conversations = total_conversations + 1,
      total_messages = total_messages + NEW.message_count,
      last_visit = NOW()
    WHERE id = NEW.user_profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats_on_conversation_end
  AFTER UPDATE OF ended_at ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_conversation_end();

-- ============================================
-- FUNCTION: Update user stats on order completion
-- ============================================

CREATE OR REPLACE FUNCTION update_user_stats_on_order_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE user_profiles
    SET 
      total_orders = total_orders + 1,
      total_spent = total_spent + NEW.total_amount,
      loyalty_points = loyalty_points + FLOOR(NEW.total_amount / 100)::INT -- 1 point per 100฿
    WHERE id = NEW.user_profile_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_stats_on_order_complete
  AFTER UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_order_complete();

-- ============================================
-- FUNCTION: Update order status history
-- Automatically tracks all status changes
-- ============================================

CREATE OR REPLACE FUNCTION track_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  status_entry JSONB;
BEGIN
  IF NEW.status != OLD.status THEN
    status_entry := JSONB_BUILD_OBJECT(
      'status', NEW.status,
      'timestamp', NOW(),
      'previous_status', OLD.status
    );
    
    NEW.status_history := COALESCE(NEW.status_history, '[]'::JSONB) || status_entry;
    
    -- Update timestamp fields based on status
    CASE NEW.status
      WHEN 'confirmed' THEN
        NEW.confirmed_at := NOW();
      WHEN 'completed' THEN
        NEW.completed_at := NOW();
      WHEN 'cancelled' THEN
        NEW.cancelled_at := NOW();
      ELSE
        NULL;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_order_status_change
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW
  EXECUTE FUNCTION track_order_status_change();

-- ============================================
-- FUNCTION: Link conversation to order
-- ============================================

CREATE OR REPLACE FUNCTION link_conversation_to_order()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE conversations
    SET 
      resulted_in_order = true,
      order_id = NEW.id
    WHERE id = NEW.conversation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_link_conversation_to_order
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION link_conversation_to_order();

-- ============================================
-- FUNCTION: Update last_visit on profile access
-- ============================================

CREATE OR REPLACE FUNCTION update_last_visit()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_visit := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_last_visit
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_visit();

-- ============================================
-- FUNCTION: Generate referral code
-- ============================================

CREATE OR REPLACE FUNCTION generate_referral_code(user_id_param TEXT)
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character code from user_id + random
    code := UPPER(SUBSTRING(MD5(user_id_param || RANDOM()::TEXT) FROM 1 FOR 8));
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM user_profiles WHERE referral_code = code
    ) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-generate referral code
-- ============================================

CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code(NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_referral_code
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- ============================================
-- HELPER FUNCTIONS FOR ANALYTICS
-- ============================================

-- Function: Get today's metrics
CREATE OR REPLACE FUNCTION get_today_metrics()
RETURNS TABLE(
  total_orders BIGINT,
  total_revenue NUMERIC,
  total_conversations BIGINT,
  conversion_rate NUMERIC,
  avg_order_value NUMERIC,
  new_users BIGINT,
  returning_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH today_orders AS (
    SELECT 
      COUNT(*) as order_count,
      SUM(total_amount) as revenue,
      AVG(total_amount) as avg_value
    FROM orders
    WHERE DATE(created_at) = CURRENT_DATE
      AND status != 'cancelled'
  ),
  today_convs AS (
    SELECT COUNT(*) as conv_count
    FROM conversations
    WHERE DATE(started_at) = CURRENT_DATE
  ),
  today_users AS (
    SELECT 
      COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as new_user_count,
      COUNT(*) FILTER (WHERE DATE(last_visit) = CURRENT_DATE AND DATE(created_at) != CURRENT_DATE) as return_user_count
    FROM user_profiles
  )
  SELECT
    COALESCE(o.order_count, 0)::BIGINT,
    COALESCE(o.revenue, 0),
    COALESCE(c.conv_count, 0)::BIGINT,
    CASE WHEN c.conv_count > 0 
      THEN ROUND((o.order_count::NUMERIC / c.conv_count::NUMERIC) * 100, 2)
      ELSE 0
    END,
    COALESCE(o.avg_value, 0),
    COALESCE(u.new_user_count, 0)::BIGINT,
    COALESCE(u.return_user_count, 0)::BIGINT
  FROM today_orders o
  CROSS JOIN today_convs c
  CROSS JOIN today_users u;
END;
$$ LANGUAGE plpgsql;

-- Function: Get top products
CREATE OR REPLACE FUNCTION get_top_products(days_back INT DEFAULT 7, limit_count INT DEFAULT 10)
RETURNS TABLE(
  product_name TEXT,
  order_count BIGINT,
  total_quantity NUMERIC,
  total_revenue NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    item->>'name' as product_name,
    COUNT(DISTINCT o.id)::BIGINT as order_count,
    SUM((item->>'quantity')::NUMERIC) as total_quantity,
    SUM((item->>'total')::NUMERIC) as total_revenue
  FROM orders o
  CROSS JOIN LATERAL JSONB_ARRAY_ELEMENTS(o.items) as item
  WHERE o.created_at >= NOW() - (days_back || ' days')::INTERVAL
    AND o.status != 'cancelled'
  GROUP BY item->>'name'
  ORDER BY total_revenue DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION generate_order_number() IS 'Generates unique order numbers like ORD-20250110-001';
COMMENT ON FUNCTION update_conversation_message_count() IS 'Automatically updates message count when messages change';
COMMENT ON FUNCTION update_user_stats_on_conversation_end() IS 'Updates user statistics when conversation ends';
COMMENT ON FUNCTION update_user_stats_on_order_complete() IS 'Updates user statistics and loyalty points on order completion';
COMMENT ON FUNCTION track_order_status_change() IS 'Tracks all status changes in status_history';
COMMENT ON FUNCTION get_today_metrics() IS 'Returns key metrics for today';
COMMENT ON FUNCTION get_top_products(INT, INT) IS 'Returns top products by revenue';


