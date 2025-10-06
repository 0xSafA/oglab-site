# Agent New Dialog Fix

**Date:** October 6, 2025  
**Status:** ✅ Completed

## Problem

При создании нового диалога (кнопка "+"):
- Старый диалог не удалялся из профиля
- При перезагрузке страницы пользователь попадал обратно в старый диалог
- Старые сообщения продолжали появляться

## Solution

### Новая функция `discardCurrentConversation()`

Создана функция в `src/lib/user-profile.ts`:
- Извлекает полезные данные (preferences) из диалога перед удалением
- Удаляет диалог из массива `conversations`
- Сохраняет обновлённый профиль
- Агент помнит предпочтения, но не сами сообщения

### Обновлена функция `clearHistory()`

В компоненте `src/components/OGLabAgent.tsx`:
- Теперь использует `discardCurrentConversation()`
- Полностью удаляет старый диалог из профиля
- Создаёт новый чистый диалог
- При перезагрузке страницы пользователь увидит новый диалог

## How it Works

### До изменений:
```
User clicks "+" button
→ Create new conversation in memory
→ Old conversation stays in profile.conversations
→ On page reload: loads old conversation ❌
```

### После изменений:
```
User clicks "+" button
→ Extract preferences from old conversation
→ Delete old conversation from profile.conversations
→ Create new conversation
→ On page reload: loads new conversation ✅
```

## What is Preserved

Агент сохраняет в памяти:
- ✅ Предпочитаемые эффекты (relax, creative, social, etc.)
- ✅ Упомянутые сорта
- ✅ Уровень опыта (beginner/expert)
- ✅ Интересы пользователя
- ❌ Старые сообщения (удаляются)

## Files Changed

- `src/lib/user-profile.ts` - Added `discardCurrentConversation()` function
- `src/components/OGLabAgent.tsx` - Updated `clearHistory()` to use new function

## Testing

1. Start conversation with AI agent
2. Send several messages
3. Click "+" button (New Dialog)
4. Verify: history is cleared, new empty dialog started
5. Reload page
6. Verify: still in new dialog, old messages don't appear

## Benefits

- ✅ Clean slate with each new dialog
- ✅ No confusion with old messages
- ✅ Agent still remembers user preferences
- ✅ Faster UX (no old message history to load)
