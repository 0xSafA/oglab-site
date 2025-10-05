# Примеры использования Telegram интеграции

## Примеры уведомлений

### 1. Простое уведомление о заказе

```typescript
import { sendTelegramNotification } from '@/lib/telegram-helpers'

const result = await sendTelegramNotification({
  type: 'order',
  message: 'Хочу заказать 5 грамм Supreme Oreoz на завтра',
  userId: 'user-abc123',
})

if (result.success) {
  console.log('Уведомление отправлено, ID:', result.messageId)
}
```

### 2. Уведомление с контекстом пользователя

```typescript
await sendTelegramNotification({
  type: 'wish',
  message: 'Посоветуйте что-нибудь для креативности',
  userId: 'user-abc123',
  userContext: {
    totalVisits: 7,
    language: 'ru',
    preferredEffects: ['creativity', 'energy'],
    favoriteStrains: ['Jack Herer', 'Sour Diesel'],
  },
  products: ['Jack Herer', 'Durban Poison'],
})
```

### 3. Обратная связь

```typescript
await sendTelegramNotification({
  type: 'feedback',
  message: 'Отличный сервис! Supreme Oreoz - просто огонь 🔥',
  userId: 'user-abc123',
  metadata: {
    rating: 5,
    platform: 'web',
  },
})
```

### 4. Вопрос персоналу

```typescript
await sendTelegramNotification({
  type: 'staff_question',
  message: 'Когда вы открываетесь в воскресенье?',
  userId: 'user-abc123',
  metadata: {
    urgency: 'high',
    category: 'hours',
  },
})
```

## Примеры API запросов

### cURL

```bash
# Заказ
curl -X POST http://localhost:3001/api/telegram/notify \
  -H "Content-Type: application/json" \
  -d '{
    "type": "order",
    "message": "Хочу заказать 5г Supreme Oreoz",
    "userId": "user-123",
    "products": ["Supreme Oreoz"]
  }'

# Проверка статуса
curl http://localhost:3001/api/telegram/notify
```

### JavaScript / TypeScript

```typescript
// В клиентском компоненте
async function notifyStaff() {
  const response = await fetch('/api/telegram/notify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'order',
      message: userMessage,
      userId: currentUser.id,
      userContext: {
        totalVisits: currentUser.visits,
        language: currentUser.language,
      },
    }),
  })

  const result = await response.json()
  
  if (result.success) {
    console.log('✅ Персонал уведомлён')
  }
}
```

### Python

```python
import requests

response = requests.post(
    'http://localhost:3001/api/telegram/notify',
    json={
        'type': 'order',
        'message': 'Хочу заказать Supreme Oreoz',
        'userId': 'user-123',
        'products': ['Supreme Oreoz']
    }
)

result = response.json()
print(f"Success: {result['success']}")
```

## Интеграция в существующий код

### В API Route Handler

```typescript
// src/app/api/some-action/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  
  // Ваша логика...
  
  // Отправить уведомление в Telegram
  if (body.notifyStaff) {
    await fetch('/api/telegram/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'order',
        message: body.message,
        userId: body.userId,
      }),
    })
  }
  
  return NextResponse.json({ ok: true })
}
```

### В Server Action

```typescript
'use server'

import { sendTelegramNotification } from '@/lib/telegram-helpers'

export async function submitOrder(formData: FormData) {
  const message = formData.get('message') as string
  
  // Обработка заказа...
  
  // Уведомить персонал
  await sendTelegramNotification({
    type: 'order',
    message,
    products: extractProducts(message),
  })
  
  return { success: true }
}
```

### В React компоненте

```typescript
'use client'

import { useState } from 'react'
import { sendTelegramNotification } from '@/lib/telegram-helpers'

export function ContactStaffButton() {
  const [loading, setLoading] = useState(false)
  
  async function handleContact() {
    setLoading(true)
    
    const result = await sendTelegramNotification({
      type: 'staff_question',
      message: 'Клиент хочет связаться с персоналом',
    })
    
    if (result.success) {
      alert('Персонал скоро свяжется с вами!')
    }
    
    setLoading(false)
  }
  
  return (
    <button onClick={handleContact} disabled={loading}>
      {loading ? 'Отправка...' : 'Связаться с персоналом'}
    </button>
  )
}
```

## Продвинутые сценарии

### Отложенная отправка (Queue)

```typescript
// Используйте очередь для избежания rate limits
const notificationQueue: TelegramNotification[] = []

setInterval(async () => {
  if (notificationQueue.length > 0) {
    const notification = notificationQueue.shift()!
    await sendTelegramNotification(notification)
    
    // Задержка между сообщениями (Telegram: max 30 msg/sec)
    await new Promise(resolve => setTimeout(resolve, 100))
  }
}, 100)

// Добавление в очередь
function queueNotification(notification: TelegramNotification) {
  notificationQueue.push(notification)
}
```

### Группировка уведомлений

```typescript
import { groupNotifications } from '@/lib/telegram-helpers'

// Собираем уведомления за 1 минуту
const buffer: TelegramNotification[] = []

function addNotification(notification: TelegramNotification) {
  buffer.push(notification)
}

// Каждую минуту отправляем сгруппированное уведомление
setInterval(async () => {
  if (buffer.length > 0) {
    const grouped = groupNotifications(buffer)
    await sendTelegramNotification(grouped)
    buffer.length = 0 // очистить буфер
  }
}, 60_000) // 1 минута
```

### Условная отправка

```typescript
async function smartNotification(message: string) {
  // Отправляем только важные уведомления в нерабочее время
  const now = new Date()
  const hour = now.getHours()
  const isWorkingHours = hour >= 10 && hour <= 22
  
  const urgency = detectUrgency(message)
  
  if (isWorkingHours || urgency === 'high') {
    await sendTelegramNotification({
      type: urgency === 'high' ? 'order' : 'general',
      message,
      metadata: {
        urgency,
        sentAt: now.toISOString(),
      },
    })
  } else {
    // Сохранить для утренней сводки
    await saveForMorningSummary(message)
  }
}
```

### Retry логика

```typescript
async function reliableSend(
  notification: TelegramNotification,
  maxRetries = 3
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await sendTelegramNotification(notification)
    
    if (result.success) {
      return true
    }
    
    console.warn(`Попытка ${attempt}/${maxRetries} не удалась`)
    
    // Экспоненциальная задержка: 1s, 2s, 4s
    await new Promise(resolve => 
      setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
    )
  }
  
  console.error('Не удалось отправить уведомление после', maxRetries, 'попыток')
  return false
}
```

### Локализация уведомлений

```typescript
function localizeNotification(
  message: string,
  language: string
): TelegramNotification {
  const translations = {
    ru: {
      order: '🛒 НОВЫЙ ЗАКАЗ',
      wish: '💭 ПОЖЕЛАНИЕ',
    },
    en: {
      order: '🛒 NEW ORDER',
      wish: '💭 CUSTOMER WISH',
    },
    th: {
      order: '🛒 คำสั่งซื้อใหม่',
      wish: '💭 ความต้องการของลูกค้า',
    },
  }
  
  return {
    type: 'order',
    message: `${translations[language as keyof typeof translations].order}\n\n${message}`,
    metadata: { language },
  }
}
```

## Тестирование

### Unit тест

```typescript
import { describe, it, expect, vi } from 'vitest'
import { sendTelegramNotification } from '@/lib/telegram-helpers'

describe('Telegram Notifications', () => {
  it('should send order notification', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, messageId: 123 }),
    })
    
    global.fetch = mockFetch
    
    const result = await sendTelegramNotification({
      type: 'order',
      message: 'Test order',
    })
    
    expect(result.success).toBe(true)
    expect(mockFetch).toHaveBeenCalledWith('/api/telegram/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: expect.any(String),
    })
  })
})
```

### E2E тест

```typescript
import { test, expect } from '@playwright/test'

test('should send notification when user orders', async ({ page }) => {
  // Мокируем Telegram API
  await page.route('**/api/telegram/notify', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ success: true, messageId: 123 }),
    })
  })
  
  await page.goto('/')
  
  // Взаимодействие с агентом
  await page.fill('[placeholder="Задайте вопрос..."]', 'Хочу заказать Supreme Oreoz')
  await page.click('button[type="submit"]')
  
  // Проверяем что API был вызван
  await page.waitForRequest('**/api/telegram/notify')
  
  expect(await page.locator('.success-message').isVisible()).toBe(true)
})
```

## Мониторинг и аналитика

### Логирование в Supabase

```typescript
import { createClient } from '@supabase/supabase-js'

async function logNotification(notification: TelegramNotification, messageId: number) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  await supabase.from('telegram_notifications').insert({
    type: notification.type,
    message: notification.message,
    user_id: notification.userId,
    message_id: messageId,
    chat_id: process.env.TELEGRAM_CHAT_ID,
    status: 'sent',
  })
}
```

### Метрики в реальном времени

```typescript
// Простой счетчик в памяти
const metrics = {
  total: 0,
  byType: {} as Record<string, number>,
  errors: 0,
}

export function trackNotification(type: string, success: boolean) {
  metrics.total++
  metrics.byType[type] = (metrics.byType[type] || 0) + 1
  if (!success) metrics.errors++
}

export function getMetrics() {
  return {
    ...metrics,
    successRate: ((metrics.total - metrics.errors) / metrics.total * 100).toFixed(2) + '%',
  }
}

// API endpoint для метрик
export async function GET() {
  return NextResponse.json(getMetrics())
}
```

## Полезные утилиты

### Валидация Telegram токена

```typescript
function isValidTelegramToken(token: string): boolean {
  // Формат: 123456789:ABCdefGHI-jklMNO...
  return /^\d{8,10}:[A-Za-z0-9_-]{35,}$/.test(token)
}
```

### Парсинг Chat ID из URL

```typescript
function extractChatIdFromUrl(url: string): string | null {
  // Поддерживает: t.me/c/1234567890, t.me/username
  const match = url.match(/t\.me\/(?:c\/)?(\d+|[a-zA-Z0-9_]+)/)
  return match ? match[1] : null
}
```

### Форматирование времени для Bangkok

```typescript
function formatBangkokTime(date: Date = new Date()): string {
  return date.toLocaleString('ru-RU', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
```

---

**См. также:**
- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Основная документация](TELEGRAM_INTEGRATION_GUIDE.md)
