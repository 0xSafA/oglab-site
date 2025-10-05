/**
 * Telegram Helper Functions
 * Вспомогательные функции для работы с Telegram Bot API
 */

export type TelegramNotificationType = 'order' | 'wish' | 'feedback' | 'staff_question' | 'general';

export interface TelegramNotification {
  type: TelegramNotificationType;
  message: string;
  userId?: string;
  userContext?: {
    totalVisits?: number;
    totalMessages?: number;
    favoriteStrains?: string[];
    preferredEffects?: string[];
    language?: string;
  };
  products?: string[];
  metadata?: Record<string, unknown>;
}

/**
 * Отправляет уведомление в Telegram
 * Обертка для вызова API endpoint
 */
export async function sendTelegramNotification(
  notification: TelegramNotification
): Promise<{ success: boolean; messageId?: number; error?: string }> {
  try {
    // Проверяем что Telegram настроен
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.warn('⚠️ TELEGRAM_BOT_TOKEN not configured, skipping notification');
      return { success: false, error: 'Telegram not configured' };
    }

    const response = await fetch('/api/telegram/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ TELEGRAM: Failed to send notification', data);
      return { success: false, error: data.error || 'Unknown error' };
    }

    console.log(`✅ TELEGRAM: Notification sent (${notification.type}), message_id: ${data.messageId}`);
    return { success: true, messageId: data.messageId };

  } catch (error) {
    console.error('❌ TELEGRAM: Error sending notification', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Форматирует пользовательский контекст для отображения
 */
export function formatUserContextForTelegram(userContext?: {
  totalVisits?: number;
  totalMessages?: number;
  favoriteStrains?: string[];
  preferredEffects?: string[];
  language?: string;
}): string {
  if (!userContext) return '';

  const parts: string[] = [];

  if (userContext.totalVisits) {
    parts.push(`Визитов: ${userContext.totalVisits}`);
  }

  if (userContext.language) {
    const langNames: Record<string, string> = {
      ru: 'Русский',
      en: 'English',
      th: 'ไทย',
      de: 'Deutsch',
      fr: 'Français',
      he: 'עברית',
      it: 'Italiano',
    };
    parts.push(`Язык: ${langNames[userContext.language] || userContext.language}`);
  }

  if (userContext.preferredEffects && userContext.preferredEffects.length > 0) {
    parts.push(`Предпочтения: ${userContext.preferredEffects.join(', ')}`);
  }

  if (userContext.favoriteStrains && userContext.favoriteStrains.length > 0) {
    parts.push(`Интересовали: ${userContext.favoriteStrains.slice(0, 3).join(', ')}`);
  }

  return parts.join(' | ');
}

/**
 * Определяет emoji для типа уведомления
 */
export function getNotificationEmoji(type: TelegramNotificationType): string {
  const emojis: Record<TelegramNotificationType, string> = {
    order: '🛒',
    wish: '💭',
    feedback: '⭐',
    staff_question: '❓',
    general: '💬',
  };
  return emojis[type];
}

/**
 * Определяет название типа уведомления на русском
 */
export function getNotificationTitle(type: TelegramNotificationType): string {
  const titles: Record<TelegramNotificationType, string> = {
    order: 'Новый заказ',
    wish: 'Пожелание клиента',
    feedback: 'Обратная связь',
    staff_question: 'Вопрос персоналу',
    general: 'Сообщение',
  };
  return titles[type];
}

/**
 * Валидирует конфигурацию Telegram
 */
export function validateTelegramConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!process.env.TELEGRAM_BOT_TOKEN) {
    errors.push('TELEGRAM_BOT_TOKEN is not set');
  }

  if (!process.env.TELEGRAM_CHAT_ID) {
    errors.push('TELEGRAM_CHAT_ID is not set');
  }

  // Проверяем формат токена (должен быть вида: 123456:ABC-DEF...)
  if (process.env.TELEGRAM_BOT_TOKEN) {
    const tokenFormat = /^\d+:[A-Za-z0-9_-]+$/;
    if (!tokenFormat.test(process.env.TELEGRAM_BOT_TOKEN)) {
      errors.push('TELEGRAM_BOT_TOKEN has invalid format');
    }
  }

  // Проверяем формат chat_id (должен быть числом или отрицательным числом для групп)
  if (process.env.TELEGRAM_CHAT_ID) {
    const chatIdFormat = /^-?\d+$/;
    if (!chatIdFormat.test(process.env.TELEGRAM_CHAT_ID)) {
      errors.push('TELEGRAM_CHAT_ID has invalid format (should be a number)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Экранирует специальные символы для Telegram HTML
 */
export function escapeHtmlForTelegram(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Экранирует специальные символы для Telegram Markdown
 */
export function escapeMarkdownForTelegram(text: string): string {
  // MarkdownV2 требует экранирования этих символов
  const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
  let escaped = text;
  specialChars.forEach(char => {
    escaped = escaped.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
  });
  return escaped;
}

/**
 * Проверяет статус Telegram бота
 */
export async function checkTelegramBotStatus(): Promise<{
  status: 'ok' | 'error';
  bot?: {
    id: number;
    username: string;
    name: string;
  };
  chats?: {
    main: string;
    orders: string;
    feedback: string;
  };
  error?: string;
}> {
  try {
    const response = await fetch('/api/telegram/notify', {
      method: 'GET',
    });

    return response.json();
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Создает краткое резюме для уведомления (обрезает длинные сообщения)
 */
export function createNotificationSummary(message: string, maxLength: number = 200): string {
  if (message.length <= maxLength) {
    return message;
  }
  return message.substring(0, maxLength - 3) + '...';
}

/**
 * Группирует несколько уведомлений в одно (для избежания спама)
 */
export function groupNotifications(
  notifications: TelegramNotification[]
): TelegramNotification {
  if (notifications.length === 0) {
    throw new Error('Cannot group empty notifications array');
  }

  if (notifications.length === 1) {
    return notifications[0];
  }

  const firstType = notifications[0].type;
  const allProducts = notifications
    .flatMap(n => n.products || [])
    .filter((p, i, arr) => arr.indexOf(p) === i); // unique

  const messages = notifications.map(n => n.message).join('\n\n---\n\n');

  return {
    type: firstType,
    message: `📦 Сгруппировано ${notifications.length} сообщений:\n\n${messages}`,
    products: allProducts,
    metadata: {
      grouped: true,
      count: notifications.length,
    },
  };
}
