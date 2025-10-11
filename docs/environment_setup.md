# Environment Setup Guide

This guide will help you set up all required environment variables for the Phase 1 implementation.

---

## 📋 Required Environment Variables

### 1. **Supabase** (Required - Already Configured)

You already have these in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

✅ **Status**: Already configured and working!

---

### 2. **Upstash Redis** (Optional - Recommended for Production)

Redis provides advanced caching capabilities. **The system works without it**, but performance will be better with Redis.

#### How to Get Upstash Redis:

1. Go to [https://upstash.com/](https://upstash.com/)
2. Sign up (free tier available)
3. Create a new Redis database
4. Choose a region close to your users (e.g., Singapore for Asia)
5. Copy the REST URL and Token

#### Add to `.env.local`:

```bash
UPSTASH_REDIS_REST_URL=https://your-redis-name.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here
```

#### Free Tier Limits:
- 10,000 commands per day
- 256 MB storage
- Perfect for small to medium sites

---

### 3. **Telegram Bot** (Optional - For Telegram Integration)

If you want customers to order via Telegram bot:

#### How to Create a Telegram Bot:

1. Open Telegram and find **@BotFather**
2. Send `/newbot` command
3. Follow instructions:
   - Choose bot name (e.g., "OG Lab Assistant")
   - Choose username (e.g., "OGLabBot")
4. BotFather will give you a token like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`

#### Add to `.env.local`:

```bash
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_SECRET=your-random-secret-here
```

Generate a random secret:
```bash
openssl rand -hex 32
```

#### Setup Webhook:

After deploying to production, run:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/telegram/webhook",
    "secret_token": "your-random-secret-here"
  }'
```

#### Test Your Bot:

1. Open Telegram
2. Search for your bot username
3. Send `/start`
4. Bot should respond with a welcome message!

---

### 4. **OpenAI** (Required - Already Configured)

You already have:

```bash
OPENAI_API_KEY=your-openai-key
```

✅ **Status**: Already configured!

---

### 5. **Site URL** (Required for Production)

For local development:
```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

For production:
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

---

## 📝 Complete `.env.local` Template

```bash
# === SUPABASE (REQUIRED) ===
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# === OPENAI (REQUIRED) ===
OPENAI_API_KEY=sk-your-openai-key

# === SITE URL ===
NEXT_PUBLIC_SITE_URL=http://localhost:3001  # or https://your-domain.com

# === UPSTASH REDIS (OPTIONAL - Recommended) ===
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token

# === TELEGRAM BOT (OPTIONAL) ===
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_WEBHOOK_SECRET=your-random-secret-here
```

---

## 🚀 Deployment Checklist

### Before Deploying:

- [x] Supabase migrations applied (`supabase db push`)
- [x] Environment variables set in production
- [ ] Redis configured (optional)
- [ ] Telegram webhook set (optional)
- [ ] Test the agent in production

### After Deploying:

1. **Test Agent**: Visit `/menu` and chat with the AI
2. **Check Database**: Visit Supabase dashboard, verify data is saving
3. **Check Analytics**: Call `/api/analytics?metric=all`
4. **Test Telegram** (if enabled): Send `/start` to your bot

---

## 🔍 Troubleshooting

### Redis Not Working?

The system will fall back to memory cache. Check logs for:
```
⚠️ Upstash Redis credentials not found. Caching will be disabled.
```

**Solution**: Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### Telegram Bot Not Responding?

1. Check webhook is set:
   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
   ```

2. Check logs in your production environment for errors

3. Verify `TELEGRAM_BOT_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` are correct

### Database Errors?

1. Check Supabase connection:
   ```bash
   curl -X GET https://your-project.supabase.co/rest/v1/
   ```

2. Verify all migrations are applied:
   ```bash
   supabase migration list
   ```

3. Check RLS policies in Supabase dashboard

---

## 📞 Support

If you encounter issues:

1. Check server logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Test API endpoints manually:
   - `GET /api/agent/chat` (should return status)
   - `GET /api/analytics?metric=today` (should return metrics)
   - `GET /api/telegram/webhook` (should return status)

---

## ✅ Next Steps

Once everything is set up:

1. Test the system thoroughly
2. Monitor analytics in Supabase dashboard
3. Consider building an admin dashboard (see `PHASE_1_IMPLEMENTATION_SUMMARY.md`)
4. Start planning Phase 2 enhancements

**Congratulations!** Your OG Lab AI Agent is now enterprise-ready! 🎉

