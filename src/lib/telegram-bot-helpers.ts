/**
 * Telegram Bot Helper Functions
 * Utilities for enhanced bot interactions
 */

import { getSupabaseServer } from './supabase-client';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Staff Telegram IDs (add your staff members)
const STAFF_TELEGRAM_IDS = process.env.STAFF_TELEGRAM_IDS?.split(',').map(id => parseInt(id)) || [];

/**
 * Check if user is staff member
 */
export function isStaffMember(telegramUserId: number): boolean {
  return STAFF_TELEGRAM_IDS.includes(telegramUserId);
}

/**
 * Send message with optional inline keyboard
 */
export async function sendTelegramMessage(params: {
  chatId: number;
  text: string;
  parseMode?: 'Markdown' | 'HTML';
  replyMarkup?: Record<string, unknown>;
}): Promise<boolean> {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.text,
        parse_mode: params.parseMode || 'Markdown',
        reply_markup: params.replyMarkup,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    return false;
  }
}

/**
 * Send typing indicator
 */
export async function sendTypingAction(chatId: number): Promise<void> {
  await fetch(`${TELEGRAM_API_URL}/sendChatAction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      action: 'typing',
    }),
  });
}

/**
 * Create inline keyboard for product selection
 */
export function createProductKeyboard(products: string[]): Record<string, unknown> {
  const buttons = products.slice(0, 5).map(product => ([
    {
      text: product,
      callback_data: `product:${product}`,
    }
  ]));
  
  return {
    inline_keyboard: buttons,
  };
}

/**
 * Create order management keyboard for staff
 */
export function createOrderManagementKeyboard(orderId: string): Record<string, unknown> {
  return {
    inline_keyboard: [
      [
        { text: '✅ Confirm', callback_data: `order:confirm:${orderId}` },
        { text: '🚀 Start Delivery', callback_data: `order:deliver:${orderId}` },
      ],
      [
        { text: '✓ Complete', callback_data: `order:complete:${orderId}` },
        { text: '❌ Cancel', callback_data: `order:cancel:${orderId}` },
      ],
      [
        { text: '📋 View Details', callback_data: `order:details:${orderId}` },
      ],
    ],
  };
}

/**
 * Get staff commands help text
 */
export function getStaffCommandsHelp(): string {
  return `🔧 *Staff Commands*

*Order Management:*
/orders - View pending orders
/order <number> - View order details
/confirm <number> - Confirm order
/deliver <number> - Mark as delivering
/complete <number> - Mark as completed
/cancel <number> - Cancel order

*Analytics:*
/stats - Today's statistics
/top - Top products
/users - User engagement

*System:*
/cache - Cache statistics
/warmup - Warm up cache
/clear_cache - Clear cache

*Agent:*
Ask me anything! I can answer questions about:
- Current orders and their status
- Sales statistics
- Product performance
- User analytics
- Order history

Just chat with me naturally!`;
}

/**
 * Get customer commands help text
 */
export function getCustomerCommandsHelp(): string {
  return `👋 *How I can help you:*

🌿 Ask about strains and effects
💰 Check prices and availability
📦 Place an order
🚚 Track your order
❓ Get recommendations

Just chat with me naturally!
I speak: 🇷🇺 🇬🇧 🇹🇭 🇫🇷 🇩🇪 🇮🇱 🇮🇹`;
}

/**
 * Format order for Telegram display
 */
export async function formatOrderForTelegram(orderId: string): Promise<string> {
  const supabase = getSupabaseServer();
  
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (!order) return 'Order not found';
  
  const contactInfo = order.contact_info as Record<string, unknown>;
  const items = order.items as Array<Record<string, unknown>>;
  
  let message = `📦 *Order ${order.order_number}*\n\n`;
  message += `*Status:* ${getStatusEmoji(order.status)} ${order.status}\n`;
  message += `*Customer:* ${contactInfo.name}\n`;
  message += `*Phone:* ${contactInfo.phone}\n`;
  message += `*Address:* ${order.delivery_address}\n\n`;
  
  message += `*Items:*\n`;
  items.forEach((item, index) => {
    message += `${index + 1}. ${String(item.product_name)} - ${String(item.quantity)}g @ ฿${String(item.price_per_unit)}\n`;
    message += `   Total: ฿${String(item.total_price)}\n`;
  });
  
  message += `\n*Total: ฿${order.total_amount}*\n`;
  message += `*Payment: ${order.payment_method}*\n`;
  
  if (order.delivery_notes) {
    message += `\n📝 Note: ${order.delivery_notes}`;
  }
  
  return message;
}

/**
 * Get pending orders summary for staff
 */
export async function getPendingOrdersSummary(): Promise<string> {
  const supabase = getSupabaseServer();
  
  const { data: orders } = await supabase
    .from('orders')
    .select('order_number, status, total_amount, created_at')
    .in('status', ['pending', 'confirmed', 'preparing'])
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (!orders || orders.length === 0) {
    return '✅ No pending orders';
  }
  
  let message = `📋 *Pending Orders (${orders.length})*\n\n`;
  
  orders.forEach((order, index) => {
    const time = new Date(order.created_at).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
    message += `${index + 1}. ${order.order_number} - ${getStatusEmoji(order.status)} ${order.status}\n`;
    message += `   ฿${order.total_amount} · ${time}\n\n`;
  });
  
  return message;
}

/**
 * Get today's stats for staff
 */
export async function getTodayStats(): Promise<string> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/analytics?metric=today`
  );
  
  const today = await response.json();
  
  return `📊 *Today's Statistics*

🛍️ Orders: ${today.total_orders}
💰 Revenue: ฿${today.total_revenue}
💬 Conversations: ${today.total_conversations}
📈 Conversion: ${today.conversion_rate}%
💵 Avg Order: ฿${today.avg_order_value}

👥 Users:
  New: ${today.new_users}
  Returning: ${today.returning_users}`;
}

/**
 * Helper: Get status emoji
 */
function getStatusEmoji(status: string): string {
  const emojis: Record<string, string> = {
    pending: '🟡',
    confirmed: '🔵',
    preparing: '🟣',
    delivering: '🚀',
    completed: '✅',
    cancelled: '❌',
  };
  return emojis[status] || '⚪';
}

/**
 * Process staff command
 */
export async function processStaffCommand(
  command: string,
  args: string[],
): Promise<string> {
  const supabase = getSupabaseServer();
  
  switch (command) {
    case '/orders':
      return await getPendingOrdersSummary();
    
    case '/stats':
      return await getTodayStats();
    
    case '/order':
      if (!args[0]) return 'Usage: /order <order_number>';
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', args[0])
        .single();
      if (!order) return '❌ Order not found';
      return await formatOrderForTelegram(order.id);
    
    case '/confirm':
      if (!args[0]) return 'Usage: /confirm <order_number>';
      return await updateOrderStatus(args[0], 'confirmed');
    
    case '/deliver':
      if (!args[0]) return 'Usage: /deliver <order_number>';
      return await updateOrderStatus(args[0], 'delivering');
    
    case '/complete':
      if (!args[0]) return 'Usage: /complete <order_number>';
      return await updateOrderStatus(args[0], 'completed');
    
    case '/cancel':
      if (!args[0]) return 'Usage: /cancel <order_number>';
      return await updateOrderStatus(args[0], 'cancelled', 'Cancelled by staff');
    
    case '/help':
      return getStaffCommandsHelp();
    
    default:
      return `Unknown command. Type /help for available commands.`;
  }
}

/**
 * Update order status helper
 */
async function updateOrderStatus(
  orderNumber: string,
  newStatus: string,
  note?: string
): Promise<string> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/api/orders`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          status: newStatus,
          note,
        }),
      }
    );
    
    if (!response.ok) {
      return `❌ Failed to update order: ${orderNumber}`;
    }
    
    await response.json();
    return `✅ Order ${orderNumber} updated to *${newStatus}*`;
  } catch (error) {
    console.error('Error updating order:', error);
    return `❌ Error updating order`;
  }
}

