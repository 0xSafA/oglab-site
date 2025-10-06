# Agent Order Total Calculation

**Date:** October 6, 2025  
**Status:** ✅ Completed

## Problem

AI Agent was not calculating and showing the total amount when processing orders. It was just collecting order information without providing the final price to the customer or sending it to the Telegram notification.

## Solution

### 1. Added Order Total Calculation Function

Created `calculateOrderTotal()` in `src/lib/agent-helpers.ts`:
- Automatically selects the correct price tier based on quantity
- For hash products: uses `Price_1g` (1-4g) or `Price_5g` (5g+)
- For flower products: uses `Price_5g` (5-19g) or `Price_20g` (20g+)
- Returns formatted breakdown (e.g., "10g × 1,530฿ = 15,300฿")
- Handles all product categories correctly

### 2. Updated AI Agent Prompt

Added explicit instructions in `src/lib/agent-helpers.ts`:
```
⚠️ КРИТИЧЕСКИ ВАЖНО — КАК ОФОРМЛЯТЬ ЗАКАЗЫ:
- ОБЯЗАТЕЛЬНО ПОСЧИТАЙ И ОЗВУЧЬ СУММУ: посмотри цену продукта из ассортимента и умножь на количество
- Используй правильную цену: Price_1g для количества до 5г, Price_5g для 5-20г, Price_20g для 20г+
- ТЫ ДОЛЖЕН СКАЗАТЬ: "Отлично! Я ПЕРЕДАЛ твой заказ нашим ребятам (сумма: XXXX฿)..."
```

### 3. Updated Telegram Notifications

Modified `src/app/api/telegram/notify/route.ts`:
- Added `quantity`, `totalAmount`, and `breakdown` fields to notification request
- Enhanced message formatting to display:
  - Product list
  - Quantity ordered
  - Price breakdown (e.g., "10g × 1,530฿")
  - Total amount with currency symbol

### 4. Integrated into Order Detection

Updated `src/app/api/agent/chat/route.ts`:
- Automatically calculates total when order is detected
- Extracts quantity number from order info
- Passes total amount and breakdown to Telegram notification
- Logs calculation details for debugging

## Price Tiers Logic

### Hash Products
- Categories: FRESH FROZEN HASH, LIVE HASH ROSIN, DRY SIFT HASH, ICE BUBBLE HASH
- 1-4g: `Price_1g` per gram
- 5g+: `Price_5g` per gram

### Flower Products
- Categories: TOP SHELF, MID SHELF, PREMIUM, SMALLS, CBG
- 5-19g: `Price_5g` per gram
- 20g+: `Price_20g` per gram

## Example Agent Response

**Before:**
```
Клиент: Давай 10г Tropical Cherry Gas. Вася Пупкин, 0950912208, Intercontinental 404
Агент: Помни, я всего лишь AI, передай информацию напрямую в OG Lab
```

**After:**
```
Клиент: Давай 10г Tropical Cherry Gas. Вася Пупкин, 0950912208, Intercontinental 404
Агент: Отлично, Вася! Я ПЕРЕДАЛ твой заказ нашим ребятам:
• 10г Tropical Cherry Gas
• Сумма: 15,300฿ (10г × 1,530฿)
• WhatsApp: 0950912208
• Адрес: Intercontinental, room 404
• Оплата: наличными

Они свяжутся с тобой в течение часа для подтверждения доставки. Готовься к тропическому кайфу! 🌴
```

## Telegram Notification Example

```
🛒 НОВЫЙ ЗАКАЗ

👤 Клиент: abc123def456...
📊 Визитов: 5
🗣️ Язык: 🇷🇺 ru

━━━━━━━━━━━━━━━━━━━
📋 ДЕТАЛИ ЗАКАЗА:

🌿 Продукт:
   Tropical Cherry Gas

📦 Количество: 10г

💰 СУММА:
   10г × 1,530฿ = 15,300฿
   Итого: 15,300฿

👤 КОНТАКТЫ:
   Имя: Вася Пупкин
   📱 Телефон: 0950912208
   📍 Адрес: Intercontinental, room 404
   💳 Оплата: наличными

━━━━━━━━━━━━━━━━━━━

📝 Исходное сообщение:
Давай 10г Tropical Cherry Gas. Вася Пупкин, 0950912208, Intercontinental 404

⏰ 06.10, 14:30
🤖 Отправлено через OG Lab Agent
```

## Files Changed

### Core Logic
- `src/lib/agent-helpers.ts` - Added `calculateOrderTotal()` function and updated prompt
- `src/app/api/agent/chat/route.ts` - Integrated calculation into order detection
- `src/app/api/telegram/notify/route.ts` - Added total amount to notifications

### Types
- Extended `OrderInfo` interface with:
  - `quantityNumber` field for numeric quantity
  - `contactInfo` object with name, phone, address, paymentMethod
- Added `OrderTotal` interface for calculation results
- Extended `TelegramNotificationRequest` with order total fields and contactInfo
- Extended `UserIntent` interface with total amount fields and contactInfo

### Contact Info Extraction
The system now automatically extracts contact information from user messages:
- **Name**: Detects patterns like "Имя Мое - Вася", "My name is John", "меня зовут Иван"
- **Phone**: Extracts 8-15 digit phone numbers with or without formatting
- **Address**: Detects hotel names, room numbers, coordinates, plus codes
- **Payment Method**: Recognizes "наличными", "cash", "карта", "крипта" etc.

All extracted contact info is automatically included in Telegram notifications.

## How to Apply

### Restart Application

```bash
pm2 restart oglab-site
```

## Testing

Test the following scenarios:

### Hash Order (5g+)
1. User asks about hash
2. Agent recommends a product
3. User orders 10g with contact info
4. Verify agent shows: "10г × 1,800฿ = 18,000฿" (using Price_1g)

### Hash Order (5g+)
1. User orders 5g of hash
2. Verify calculation uses `Price_5g` tier
3. Check Telegram notification shows correct total

### Flower Order (5-19g)
1. User orders 10g of flower
2. Verify calculation uses `Price_5g` tier
3. Check agent response includes breakdown

### Flower Order (20g+)
1. User orders 20g of flower
2. Verify calculation uses `Price_20g` tier
3. Check Telegram notification shows correct discounted price

## Benefits

### For Customers
- Clear breakdown of costs before confirming order
- Transparent pricing at correct tier (5g+, 20g+)
- Confidence that order details are correct

### For Staff
- Structured order information in Telegram
- All contact details extracted automatically (name, phone, address, payment)
- Easy to verify total amount
- Quick to process without asking for clarifications
- Original message preserved for context

### For System
- Automatic contact info extraction with regex patterns
- Supports multiple languages (Russian, English, Thai)
- Flexible address formats (hotel, GPS, plus code)
- Robust error handling for missing data

## Notes

- Total calculation happens automatically when order intent is detected
- Contact info is extracted automatically from conversation
- Agent now has explicit instructions to always show the total to customer
- Telegram notifications are formatted for easy reading with clear sections
- Handles edge cases (missing prices, unknown products, incomplete contact info) gracefully
- Currency symbol (฿) is always included for clarity
- Original user message is preserved in Telegram notification for context
