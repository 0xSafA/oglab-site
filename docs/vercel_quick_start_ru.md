# Быстрый старт: Перенос на Vercel

## TL;DR

**Время на перенос:** 15-30 минут  
**Сложность:** Легко 🟢  
**Стоимость:** $0 (бесплатный план) или $20/мес (Pro)

## Пошаговая инструкция

### Шаг 1: Подготовка (5 минут)

```bash
# 1. Убедиться что всё работает локально
npm run build
npm run start

# 2. Проверить что все ENV переменные в .env.local
# Нужно будет их перенести в Vercel
```

**Список ENV переменных для переноса:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `UPLOADTHING_SECRET`
- `UPLOADTHING_APP_ID`
- `GOOGLE_API_KEY`

### Шаг 2: Деплой на Vercel (10 минут)

#### Вариант A: Через веб-интерфейс (проще)

1. **Зарегистрироваться:** https://vercel.com/signup
   - Войти через GitHub

2. **Импортировать проект:**
   - Нажать "Add New" → "Project"
   - Выбрать репозиторий `oglab-site`
   - Framework: Next.js (автоматически определится)

3. **Добавить Environment Variables:**
   - В настройках проекта добавить все переменные из списка выше
   - Выбрать все окружения: Production, Preview, Development

4. **Deploy:**
   - Нажать "Deploy"
   - Подождать 2-3 минуты

#### Вариант B: Через CLI (быстрее)

```bash
# Установить Vercel CLI
npm i -g vercel

# Войти
vercel login

# Деплой (первый раз - настройка)
vercel

# Ответить на вопросы:
# ? Set up and deploy? [Y/n] y
# ? Which scope? выбрать свой аккаунт
# ? Link to existing project? [y/N] n
# ? What's your project's name? oglab-site
# ? In which directory is your code located? ./

# После настройки - production deploy
vercel --prod
```

### Шаг 3: Тестирование (5 минут)

Проверить что всё работает на временном URL (например: `oglab-site-xxx.vercel.app`):

```bash
# Чек-лист:
✅ Главная страница открывается
✅ Меню загружается и работает
✅ Новости отображаются
✅ AI Assistant отвечает (без ошибок timeout)
✅ Смена языка работает
✅ Google Maps загружается
✅ Изображения загружаются быстро
✅ Admin панель доступна (/admin)
```

### Шаг 4: Настройка домена (5 минут)

#### Если используете свой домен:

1. **В Vercel Dashboard:**
   - Project Settings → Domains
   - Добавить свой домен: `yourdomain.com`

2. **В DNS провайдере (Cloudflare/GoDaddy/etc):**
   ```
   Тип    Имя    Значение
   A      @      76.76.21.21
   CNAME  www    cname.vercel-dns.com
   ```

3. **Подождать распространения DNS** (5-30 минут)

#### Если используете Vercel домен:
- Ничего не делать, уже работает на `*.vercel.app`

### Шаг 5: Telegram Webhook (если используется)

Если у вас Telegram бот, нужно обновить webhook:

```bash
# Получить новый URL из Vercel
NEW_URL="https://your-site.vercel.app"

# Обновить webhook
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -d "url=${NEW_URL}/api/telegram/webhook"

# Проверить
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

## Сравнение: До vs После

| Метрика | VPS Hostinger | Vercel | Улучшение |
|---------|---------------|--------|-----------|
| Скорость загрузки | 2-3 сек | 0.5-1 сек | **3x быстрее** |
| TTFB | 300-500ms | 50-100ms | **5x быстрее** |
| Global CDN | ❌ | ✅ 100+ точек | **∞** |
| Auto-scaling | ❌ Ручное | ✅ Автоматом | **∞** |
| HTTPS | ⚠️ Настройка | ✅ Из коробки | **100%** |
| Деплой | ⚠️ SSH/PM2 | ✅ git push | **10x проще** |
| Monitoring | ⚠️ Настройка | ✅ Встроенный | **100%** |
| Стоимость | $6-10/мес | $0-20/мес | **-$6 до +$10** |

## Автоматизация (бонус)

После первого деплоя всё работает автоматически:

```bash
# Обновить сайт - просто:
git add .
git commit -m "Update menu"
git push origin main

# Vercel автоматически:
# 1. Заметит push в main
# 2. Соберёт проект
# 3. Задеплоит на production
# 4. Отправит уведомление

# Обычно занимает: 1-2 минуты
```

### Preview Deployments

Для каждого Pull Request Vercel автоматически создаёт preview:

```bash
# 1. Создать новую ветку
git checkout -b feature/new-menu

# 2. Сделать изменения
# ... редактировать файлы ...

# 3. Push
git push origin feature/new-menu

# 4. Создать PR на GitHub

# 5. Vercel автоматически создаст preview URL
# Например: oglab-site-git-feature-new-menu-xxx.vercel.app

# 6. Протестировать изменения
# 7. Если всё ОК - merge PR → автоматически деплой на production
```

## Мониторинг и аналитика

### Vercel Analytics (встроенная)

```tsx
// Уже добавлено в проект (vercel.json)
// Автоматически собирает:
// - Page views
// - Core Web Vitals (LCP, FID, CLS)
// - User geography
// - Device types
```

**Доступ:**
- Vercel Dashboard → Analytics
- Real-time данные
- Бесплатно на Hobby plan

### Speed Insights

**Включить:**
```bash
npm install @vercel/speed-insights

# В layout.tsx уже подключено автоматически
```

**Показывает:**
- Загрузка страниц
- Core Web Vitals
- Сравнение с другими сайтами

## Частые проблемы

### ❌ "Function execution timeout"

**Причина:** API route работает > 10 секунд (Hobby plan)

**Решение:**
```ts
// Опция 1: Оптимизировать код
// Опция 2: Использовать streaming
// Опция 3: Upgrade to Pro ($20/мес, 60 сек лимит)

// Для AI Assistant:
export const maxDuration = 10; // секунды
```

### ❌ "Build failed"

**Причина:** Отсутствуют ENV переменные

**Решение:**
1. Vercel Dashboard → Settings → Environment Variables
2. Добавить все переменные
3. Redeploy

### ❌ "Images not loading"

**Причина:** Не настроен `remotePatterns` в `next.config.ts`

**Решение:** Уже настроено в проекте, но проверить:
```ts
// next.config.ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'i.ytimg.com' },
    { protocol: 'https', hostname: 'utfs.io' },
  ],
}
```

### ❌ "Telegram bot not responding"

**Причина:** Webhook указывает на старый VPS

**Решение:** Обновить webhook (см. Шаг 5)

## Откат назад (если что-то пошло не так)

### Вариант 1: Откат в Vercel

```bash
# В Vercel Dashboard:
# Deployments → найти предыдущий рабочий → Promote to Production
```

### Вариант 2: Вернуться на VPS

```bash
# В DNS провайдере:
# Вернуть старые A/CNAME записи на VPS IP
# Подождать 5-30 минут распространения DNS
```

**Рекомендация:** Держать VPS активным первые 48 часов после переноса

## Оптимизация затрат

### Остаться на Free tier ($0/мес)

**Лимиты:**
- ✅ 100GB bandwidth/месяц
- ✅ 6000 минут execution/месяц
- ✅ 1000 Edge requests/день

**Как уложиться:**
```ts
// 1. ISR для кэширования
export const revalidate = 900; // 15 минут

// 2. Static страницы где возможно
export const dynamic = 'force-static';

// 3. Edge runtime для простых API
export const runtime = 'edge';
```

### Когда нужен Pro ($20/мес)

- ❌ Трафик > 100GB/месяц
- ❌ AI Assistant тормозит (нужно > 10 сек)
- ✅ Нужна приоритетная поддержка
- ✅ Больше concurrent builds

## Рекомендуемый план действий

### План A: Постепенный переход (безопасно) ✅

1. **День 1:** Деплой на Vercel, тест на preview URL
2. **День 2-3:** Тестирование всех функций
3. **День 4:** Переключить DNS, мониторить
4. **День 7:** Отключить VPS если всё ОК

### План B: Быстрый переход (рискованно) ⚡

1. **Утро:** Деплой на Vercel
2. **День:** Базовый тест
3. **Вечер:** Переключить DNS
4. **Ночь:** Мониторить ошибки

### План C: Dual-run (дорого) 💰

1. **Месяц 1:** Оба работают параллельно
2. **Переключение:** Постепенно через балансировщик
3. **Месяц 2:** Только Vercel

**Рекомендация: План A** ✅

## Итого

| Что | Время | Сложность |
|-----|-------|-----------|
| Регистрация Vercel | 2 мин | 🟢 |
| Деплой проекта | 3 мин | 🟢 |
| ENV variables | 5 мин | 🟢 |
| Тестирование | 10 мин | 🟢 |
| Настройка домена | 5 мин | 🟡 |
| Обновление Telegram | 2 мин | 🟢 |
| **ИТОГО** | **~30 мин** | **🟢 Легко** |

## Следующие шаги

После успешного переноса:

1. ✅ Включить Vercel Analytics
2. ✅ Настроить уведомления в Slack/Discord
3. ✅ Добавить GitHub Actions для CI/CD
4. ✅ Оптимизировать изображения (WebP)
5. ✅ Настроить Branch Protection
6. ✅ Отключить VPS (через неделю)

---

**Вопросы?** Проверьте [полное руководство](./VERCEL_MIGRATION_GUIDE.md)


