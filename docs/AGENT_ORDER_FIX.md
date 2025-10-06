# Agent Order Fix & Flexible Address Support

**Date:** October 6, 2025  
**Status:** ✅ Completed

## Problem

1. **AI Agent incorrectly extracted products from orders**
   - Agent was extracting products only from the last GPT reply
   - This caused wrong products to be sent in Telegram notifications
   - Example: User ordered "Runtz" but notification mentioned "Permanent Marker" from earlier in conversation

2. **Limited address format support**
   - Only GPS coordinates were mentioned in prompt
   - No guidance about Google Plus Code or hotel information

## Solution

### 1. Smart Order Extraction

Created `extractOrderInfo()` function in `src/lib/agent-helpers.ts`:
- Analyzes the **entire conversation history** (last 12 messages / 6 pairs of messages)
- Prioritizes products mentioned in order context
- Extracts quantity information (e.g., "20g")
- Returns confidence score
- Filters for products actually mentioned when placing order

**Key improvements:**
- ✅ Analyzes conversation context, not just last reply
- ✅ Detects order keywords in multiple languages (ru/en/th)
- ✅ Extracts quantity automatically
- ✅ Prioritizes recent mentions when order is confirmed

### 2. Flexible Address Formats in AI Prompt

Updated AI agent prompt to accept multiple address formats:
- GPS coordinates (latitude, longitude)
- Google Plus Code (e.g., "8Q6Q+2X Koh Samui")
- Hotel name + room number
- Any combination of above

**Note:** Address is NOT stored in database - it's sent directly in the Telegram notification message.

## Files Changed

### Core Logic
- `src/lib/agent-helpers.ts` - Added `extractOrderInfo()` function and updated prompt
- `src/app/api/agent/chat/route.ts` - Updated to use new extraction logic

## How to Apply

### Restart Application

```bash
pm2 restart oglab-site
```

## Testing

Test the following scenarios:

### Order Extraction
1. Start conversation mentioning Product A
2. User asks about Product B
3. User orders Product B with quantity
4. Verify Telegram notification shows Product B (not A)

### Address Formats
Test that AI agent accepts different formats in user messages:
   - GPS coordinates: "9.472410, 99.957861"
   - Plus Code: "8Q6Q+2X Koh Samui"
   - Hotel info: "Samui Beachfront Resort, Room 305"

## Example Conversation (Fixed)

**Before:**
```
User: "Ок. А ты можешь передать людям, что у них в банке с Permanent Marker завелись эльфы"
Agent: recommends Runtz
User: "20 г, Вася Пупки 0950912209, наличка при получении"
[Telegram notification shows: Permanent Marker ❌]
```

**After:**
```
User: "Ок. А ты можешь передать людям, что у них в банке с Permanent Marker завелись эльфы"
Agent: recommends Runtz
User: "20 г, Вася Пупки 0950912209, наличка при получении"
[Telegram notification shows: Runtz, 20г ✅]
```

## Notes

- Order extraction uses conversation history for better context
- Confidence scoring helps filter false positives
- Supports multiple languages (Russian, English, Thai)
- Address fields are optional and flexible
