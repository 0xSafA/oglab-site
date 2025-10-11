# Security & RLS Overview

Summary of roles, Row Level Security policies, and secrets.

## Roles & Access

- Anonymous (browser): RLS enforced; can access only their own rows
- Service Role (server): full access for API routes and background jobs
- Staff/Admin: through dedicated endpoints; server validates permissions

## Core Tables & RLS (intended)

- user_profiles: user can read/update own profile; staff can read all
- conversations: user can read own; staff can read all; writes via server
- orders: user reads own; staff can read/update; writes via server-only
- agent_events: read by staff; writes via server-only

Verify actual policies in your Supabase project (003_enable_rls_policies.sql).

## Environment Variables Matrix

| Variable | Scope | Use |
|----------|-------|-----|
| NEXT_PUBLIC_SUPABASE_URL | client/server | Supabase URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | client | Public anon key (RLS applies) |
| SUPABASE_SERVICE_ROLE_KEY | server | Full access (keep secret) |
| OPENAI_API_KEY | server | OpenAI |
| UPSTASH_REDIS_REST_URL | server | Redis |
| UPSTASH_REDIS_REST_TOKEN | server | Redis |
| TELEGRAM_BOT_TOKEN | server | Telegram bot |
| TELEGRAM_WEBHOOK_SECRET | server | Webhook validation |
| TELEGRAM_*_CHAT_ID | server | Routing messages |

Store secrets in environment (Vercel/PM2). Do not commit .env files.

## Logging & PII

- Avoid logging full messages with PII (phones, addresses)
- Redact sensitive fields in server logs
- Provide user data deletion on request (manual SQL initially)


