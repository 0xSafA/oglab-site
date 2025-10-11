# Operations Runbook

Practical playbook for day-2 operations, incidents, and routine tasks.

## Health Checks

- Agent chat: GET /api/agent/chat → returns status and cache info
- Whisper: GET /api/agent/whisper → returns status and model
- Cache: GET /api/cache → availability and stats

## Common Incidents

### OpenAI errors (quota/rate limits)
- Symptoms: 5xx from chat, logs show OpenAI API errors
- Actions:
  1) Verify OPENAI_API_KEY and quota
  2) Check semantic cache functioning; continue with cached answers
  3) Reduce tokens/history length temporarily

### Redis unavailable
- Symptoms: Cache MISS spikes, logs show fallback
- Actions:
  1) Check Upstash dashboard
  2) System auto-degrades to memory/DB; monitor latency
  3) Warm caches after recovery: POST /api/cache {"action":"warmup"}

### Telegram not responding
- Symptoms: No staff messages
- Actions:
  1) Verify TELEGRAM_BOT_TOKEN and webhook status (`getWebhookInfo`)
  2) Re-send test via scripts/test-telegram.mjs or /api/telegram/notify
  3) Ensure bot is admin in target group

## Cache Operations

- Stats: GET /api/cache
- Warmup critical: POST /api/cache {"action":"warmup"}
- Warmup menu: POST /api/cache {"action":"warmup-menu"}
- Clear prefix: POST /api/cache {"action":"clear-prefix","prefix":"user:profile:"}

## Rollback & Mitigations

- Disable Redis usage (temporarily): set env to invalid URL/token → service falls back to memory/DB
- Bypass Telegram notify: unset TELEGRAM_BOT_TOKEN (only for testing)
- Revert prompt: restore previous version (see Prompt Versioning)

## SLO Targets (summary)

- Chat p95 < 1500ms with cache; error rate < 2% (5-minute window)
- Redis hit-rate > 80%
- Semantic cache hit-rate > 25% on frequent queries

## Prompt Versioning

- Store canonical prompt in `src/lib/agent-helpers.ts`
- Track changes in docs/CHANGELOG or commit messages
- Optionally introduce PROMPT_VERSION env; log version in chat events

## Data Retention

- conversations: 180 days (recommendation)
- agent_events: 365 days or partition by month
- orders: keep indefinitely (business/accounting), or 7 years
- Implement purge jobs or manual SQL when adopting policy


