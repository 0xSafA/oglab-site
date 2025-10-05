-- Миграция для хранения истории Telegram уведомлений
-- Опционально: используйте если хотите отслеживать аналитику уведомлений

-- Таблица для логирования Telegram уведомлений
CREATE TABLE IF NOT EXISTS telegram_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Тип уведомления
  type TEXT NOT NULL CHECK (type IN ('order', 'wish', 'feedback', 'staff_question', 'general')),
  
  -- Telegram метаданные
  chat_id TEXT NOT NULL,
  message_id BIGINT,
  
  -- Данные пользователя
  user_id TEXT,
  customer_message TEXT NOT NULL,
  
  -- Контекст пользователя (JSON)
  user_context JSONB DEFAULT '{}',
  
  -- Упомянутые продукты
  products TEXT[],
  
  -- Дополнительные метаданные
  metadata JSONB DEFAULT '{}',
  
  -- Статус отправки
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  
  -- Временные метки
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_type ON telegram_notifications(type);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_user_id ON telegram_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_sent_at ON telegram_notifications(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_notifications_status ON telegram_notifications(status);

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION update_telegram_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER telegram_notifications_updated_at
BEFORE UPDATE ON telegram_notifications
FOR EACH ROW
EXECUTE FUNCTION update_telegram_notifications_updated_at();

-- RLS (Row Level Security) политики
ALTER TABLE telegram_notifications ENABLE ROW LEVEL SECURITY;

-- Админы могут видеть все уведомления
CREATE POLICY "Admins can view all telegram notifications"
ON telegram_notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Админы могут вставлять уведомления
CREATE POLICY "Admins can insert telegram notifications"
ON telegram_notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Сервисная роль может делать всё (для API endpoints)
CREATE POLICY "Service role full access"
ON telegram_notifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Представление для аналитики
CREATE OR REPLACE VIEW telegram_notifications_stats AS
SELECT 
  type,
  COUNT(*) as total_notifications,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', sent_at) as date
FROM telegram_notifications
WHERE sent_at >= NOW() - INTERVAL '30 days'
GROUP BY type, DATE_TRUNC('day', sent_at)
ORDER BY date DESC, type;

-- Комментарии для документации
COMMENT ON TABLE telegram_notifications IS 'История Telegram уведомлений от OG Lab Agent';
COMMENT ON COLUMN telegram_notifications.type IS 'Тип уведомления: order, wish, feedback, staff_question, general';
COMMENT ON COLUMN telegram_notifications.chat_id IS 'Telegram Chat ID куда отправлено сообщение';
COMMENT ON COLUMN telegram_notifications.message_id IS 'ID сообщения в Telegram (для отслеживания)';
COMMENT ON COLUMN telegram_notifications.user_context IS 'JSON с контекстом пользователя (визиты, предпочтения)';
COMMENT ON COLUMN telegram_notifications.products IS 'Массив названий упомянутых продуктов';
COMMENT ON COLUMN telegram_notifications.metadata IS 'Дополнительные данные (язык, timestamp, etc)';

-- Функция для очистки старых записей (опционально, запускайте периодически)
CREATE OR REPLACE FUNCTION cleanup_old_telegram_notifications(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM telegram_notifications
  WHERE sent_at < NOW() - (days_to_keep || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_telegram_notifications IS 'Удаляет уведомления старше N дней. По умолчанию 90 дней.';

-- Пример использования cleanup функции:
-- SELECT cleanup_old_telegram_notifications(90); -- удалить записи старше 90 дней
