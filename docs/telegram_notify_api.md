# Telegram Notify API

Purpose: single endpoint used by the AI agent to notify staff via Telegram when certain intents are detected.

## Endpoint

- Method: POST
- Path: /api/telegram/notify
- Auth: internal-only (server-to-server). Keep behind server code; do not expose in client.

## Request

```json
{
  "type": "order" | "wish" | "staff_question" | "feedback",
  "message": "string",                 // original user message
  "userId": "string",                 // internal user_id if available
  "userContext": {                      // optional structured context
    "language": "ru|en|th|fr|de|he|it",
    "returning": true
  },
  "products": ["string"],              // optional
  "quantity": "string",               // e.g. "20g"
  "totalAmount": 8000,                 // optional, in THB
  "breakdown": "20г × 400฿ = 8,000฿", // optional
  "contactInfo": {
    "name": "string",
    "phone": "+66123456789",
    "address": "Intercontinental, room 404",
    "paymentMethod": "cash|transfer|crypto"
  },
  "metadata": {                         // optional
    "language": "ru",
    "timestamp": "2025-10-11T10:00:00.000Z"
  }
}
```

## Response

```json
{
  "ok": true,
  "messageId": 12345
}
```

## Decision Matrix (source of truth)

See docs/SYSTEM_ARCHITECTURE.md → Telegram Decision Matrix.

Key rules implemented in code: `detectUserIntent()` in `src/app/api/agent/chat/route.ts`.

## Retries & Timeouts

- HTTP timeout to Telegram API: 5s
- Retry policy (best-effort): up to 2 retries with exponential backoff (500ms, 1500ms)
- On permanent failure: log error, no user-facing block; agent flow continues

## Idempotency

- For `type="order"`, include a deterministic idempotency key derived from: userId + canonical order payload (product+qty+phone+address+payment)
- Server should de-duplicate same key within 10 minutes

## Rate Limiting

- Internal usage only; implement middleware rate limits if exposed beyond server

## Security

- Keep TELEGRAM_BOT_TOKEN and chat IDs in environment variables
- Do not echo secrets in logs
- Validate `type` and normalize payload to avoid markdown injection in Telegram


