#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки Telegram интеграции
 * 
 * Использование:
 *   node scripts/test-telegram.mjs
 * 
 * Убедитесь что в .env.local установлены:
 *   TELEGRAM_BOT_TOKEN
 *   TELEGRAM_CHAT_ID
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Загружаем переменные окружения из .env.local
config({ path: resolve(process.cwd(), '.env.local') });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

console.log('🔍 Проверка конфигурации Telegram...\n');

// Проверка переменных окружения
if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN не установлен в .env.local');
  process.exit(1);
}

if (!CHAT_ID) {
  console.error('❌ TELEGRAM_CHAT_ID не установлен в .env.local');
  process.exit(1);
}

console.log('✅ TELEGRAM_BOT_TOKEN:', BOT_TOKEN.substring(0, 20) + '...');
console.log('✅ TELEGRAM_CHAT_ID:', CHAT_ID);
console.log('');

// Шаг 1: Проверка бота
console.log('📡 Шаг 1: Проверка статуса бота...');
try {
  const botResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
  const botData = await botResponse.json();
  
  if (!botData.ok) {
    console.error('❌ Ошибка при проверке бота:', botData.description);
    process.exit(1);
  }
  
  console.log('✅ Бот активен:');
  console.log('   ID:', botData.result.id);
  console.log('   Username:', '@' + botData.result.username);
  console.log('   Имя:', botData.result.first_name);
  console.log('');
} catch (error) {
  console.error('❌ Ошибка при подключении к Telegram API:', error.message);
  process.exit(1);
}

// Шаг 2: Проверка доступа к чату
console.log('📡 Шаг 2: Проверка доступа к чату...');
try {
  const chatResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: CHAT_ID })
  });
  
  const chatData = await chatResponse.json();
  
  if (!chatData.ok) {
    console.error('❌ Ошибка при проверке чата:', chatData.description);
    console.log('');
    console.log('💡 Возможные причины:');
    console.log('   - Бот не добавлен в группу');
    console.log('   - Неверный Chat ID');
    console.log('   - Бот заблокирован пользователем');
    console.log('');
    console.log('📝 Как исправить:');
    console.log('   1. Убедитесь что бот добавлен в чат/группу');
    console.log('   2. Проверьте что Chat ID правильный (откройте /getUpdates)');
    console.log('   3. Для групп: сделайте бота администратором');
    process.exit(1);
  }
  
  console.log('✅ Доступ к чату подтверждён:');
  console.log('   Тип:', chatData.result.type);
  console.log('   Название:', chatData.result.title || chatData.result.first_name || 'Личный чат');
  if (chatData.result.username) {
    console.log('   Username:', '@' + chatData.result.username);
  }
  console.log('');
} catch (error) {
  console.error('❌ Ошибка при проверке чата:', error.message);
  process.exit(1);
}

// Шаг 3: Отправка тестового сообщения
console.log('📤 Шаг 3: Отправка тестового сообщения...');
try {
  const testMessage = `
<b>🧪 ТЕСТОВОЕ СООБЩЕНИЕ</b>

Это тестовое уведомление от OG Lab Agent.

✅ Telegram интеграция работает корректно!

<i>⏰ ${new Date().toLocaleString('ru-RU', { 
  timeZone: 'Asia/Bangkok',
  dateStyle: 'short',
  timeStyle: 'short'
})}</i>
<i>🤖 Отправлено скриптом test-telegram.mjs</i>
  `.trim();

  const sendResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: testMessage,
      parse_mode: 'HTML',
      disable_web_page_preview: true
    })
  });
  
  const sendData = await sendResponse.json();
  
  if (!sendData.ok) {
    console.error('❌ Ошибка при отправке сообщения:', sendData.description);
    
    if (sendData.description.includes('not enough rights')) {
      console.log('');
      console.log('💡 Бот не имеет прав для отправки сообщений:');
      console.log('   1. Откройте настройки группы');
      console.log('   2. Администраторы → Ваш бот');
      console.log('   3. Включите право "Post Messages"');
    }
    
    process.exit(1);
  }
  
  console.log('✅ Тестовое сообщение отправлено!');
  console.log('   Message ID:', sendData.result.message_id);
  console.log('   Дата:', new Date(sendData.result.date * 1000).toLocaleString('ru-RU'));
  console.log('');
  console.log('📱 Проверьте ваш Telegram чат!');
  console.log('');
} catch (error) {
  console.error('❌ Ошибка при отправке сообщения:', error.message);
  process.exit(1);
}

// Финальная статистика
console.log('═══════════════════════════════════════');
console.log('🎉 ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ УСПЕШНО!');
console.log('═══════════════════════════════════════');
console.log('');
console.log('Следующие шаги:');
console.log('1. Запустите dev сервер: npm run dev');
console.log('2. Откройте сайт и протестируйте агента');
console.log('3. Уведомления будут автоматически отправляться в Telegram');
console.log('');
console.log('Типы уведомлений:');
console.log('  🛒 ORDER - когда пользователь хочет заказать');
console.log('  💭 WISH - когда пользователь просит совет');
console.log('  ⭐ FEEDBACK - когда пользователь оставляет отзыв');
console.log('  ❓ STAFF_QUESTION - когда нужен ответ персонала');
console.log('');
console.log('📖 Полная документация: docs/TELEGRAM_INTEGRATION_GUIDE.md');
console.log('🚀 Быстрый старт: docs/TELEGRAM_QUICK_START_RU.md');
console.log('');
