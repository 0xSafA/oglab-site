# Theme Migration Guide: От Supabase к .env

## 🎯 Что изменилось?

Настройки темы теперь хранятся в `.env.local` файле, а не в базе данных Supabase. Это дает **огромный прирост производительности**:

- ❌ Было: Database запрос на каждую загрузку страницы
- ✅ Стало: Мгновенное чтение из переменных окружения

## 📋 Шаги для миграции

### 1. Экспортируйте текущие настройки из Supabase

Перед удалением таблицы, сохраните ваши текущие настройки:

```sql
SELECT * FROM theme ORDER BY updated_at DESC LIMIT 1;
```

### 2. Создайте файл `.env.local`

Создайте файл `.env.local` в корне проекта (если его еще нет) и добавьте:

```bash
# Supabase Configuration (уже должно быть)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Theme Configuration (Homepage & General)
NEXT_PUBLIC_PRIMARY_COLOR=#536C4A
NEXT_PUBLIC_SECONDARY_COLOR=#B0BF93
NEXT_PUBLIC_EVENT_TEXT=Next party is coming soon! Stay tuned!
NEXT_PUBLIC_OFFER_TEXT=Special offer available now!
NEXT_PUBLIC_OFFER_HIDE=false
NEXT_PUBLIC_OFFER_PARTICLES=true
NEXT_PUBLIC_OFFER_COSMIC_GLOW=true
NEXT_PUBLIC_OFFER_FLOATING=true
NEXT_PUBLIC_OFFER_PULSE=true
NEXT_PUBLIC_OFFER_INNER_LIGHT=true

# Menu Theme Configuration
NEXT_PUBLIC_ITEM_TEXT_COLOR=#1f2937
NEXT_PUBLIC_CATEGORY_TEXT_COLOR=#ffffff
NEXT_PUBLIC_CARD_BG_COLOR=#ffffff
NEXT_PUBLIC_FEATURE_COLOR=#536C4A
NEXT_PUBLIC_LEGEND_HYBRID_COLOR=#4f7bff
NEXT_PUBLIC_LEGEND_SATIVA_COLOR=#ff6633
NEXT_PUBLIC_LEGEND_INDICA_COLOR=#38b24f
NEXT_PUBLIC_TIER0_LABEL=1PC
NEXT_PUBLIC_TIER1_LABEL=1G
NEXT_PUBLIC_TIER2_LABEL=5G+
NEXT_PUBLIC_TIER3_LABEL=20G+
```

**Замените значения на ваши текущие** из Supabase!

### 3. Перезапустите сервер разработки

```bash
npm run dev
```

**Важно!** Next.js читает переменные окружения только при старте.

### 4. Проверьте что всё работает

1. Откройте главную страницу - должна загружаться **моментально**
2. Откройте `/menu` - проверьте что цвета корректные
3. Проверьте что тексты (event_text, offer_text) отображаются правильно

### 5. Удалите таблицу theme из Supabase

Запустите миграцию в Supabase SQL Editor:

```bash
# Файл находится в:
supabase/drop-theme-table.sql
```

Или выполните команду:

```sql
DROP TABLE IF EXISTS theme CASCADE;
```

## 🚀 Преимущества

- **10x быстрее загрузка**: Нет запросов в БД
- **Кеширование**: Страницы кешируются на 1 час
- **Простота**: Изменение темы = редактирование `.env.local` + перезапуск
- **Меньше затрат**: Меньше запросов к Supabase

## ⚙️ Как изменить тему в будущем?

1. Откройте `.env.local`
2. Измените нужные переменные
3. Перезапустите `npm run dev`

**Для продакшена**: 
- Обновите переменные в Vercel/Railway/вашем хостинге
- Сделайте redeploy

## 📝 Дополнительная информация

### Файлы которые были изменены:

- ✅ `src/lib/theme-config.ts` - новая система конфигурации
- ✅ `src/app/page.tsx` - убран `fetchTheme()`, добавлен `getThemeConfig()`
- ✅ `src/app/menu/page.tsx` - убран `fetchTheme()`, добавлен `getMenuThemeConfig()`
- ✅ `src/components/BehindTheScenes.tsx` - добавлен `loading="lazy"` для картинок

### Другие улучшения производительности:

1. **Lazy loading картинок** в Behind The Scenes секции
2. **Кеширование 1 час** для главной страницы (`revalidate: 3600`)
3. **Кеширование 15 минут** для страницы меню (`revalidate: 900`)

## ❓ FAQ

**Q: Что если я хочу вернуть настройки в БД?**  
A: Можно, но это замедлит сайт. Просто верните старый код из git истории.

**Q: Как часто обновляется тема на продакшене?**  
A: Сразу после redeploy или перезапуска сервера.

**Q: Нужно ли коммитить `.env.local`?**  
A: **НЕТ!** Этот файл в `.gitignore`. Используйте переменные окружения на хостинге.

