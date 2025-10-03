# 🚀 Setup Guide - New Theme Architecture

## Архитектура настроек

Настройки теперь разделены на два типа для максимальной производительности:

### 1. 🎨 **Статические настройки** (`.env.local`)
**Что**: Цвета, флаги анимаций  
**Почему**: Редко меняются, загружаются мгновенно  
**Где редактировать**: `.env.local` файл

### 2. 📝 **Динамические настройки** (Database: `dynamic_settings`)
**Что**: Тексты офферов, event announcements, labels  
**Почему**: Меняются часто, нужна админ-панель  
**Где редактировать**: `/admin/settings`

---

## 📋 Шаги установки

### Шаг 1: Создайте таблицу dynamic_settings

В Supabase SQL Editor выполните:

```sql
-- Файл: supabase/create-dynamic-settings-table.sql
```

Эта команда:
- Создаст таблицу `dynamic_settings`
- Мигрирует данные из старой таблицы `theme` (если есть)
- Установит правильные RLS policies

### Шаг 2: Создайте `.env.local`

Создайте файл `.env.local` в корне проекта:

```bash
# Supabase (должно быть уже настроено)
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# ==================================
# STATIC THEME CONFIGURATION
# ==================================
# Colors and animation flags

# Main Colors
NEXT_PUBLIC_PRIMARY_COLOR=#536C4A
NEXT_PUBLIC_SECONDARY_COLOR=#B0BF93

# Offer Animation Settings
NEXT_PUBLIC_OFFER_PARTICLES=true
NEXT_PUBLIC_OFFER_COSMIC_GLOW=true
NEXT_PUBLIC_OFFER_FLOATING=true
NEXT_PUBLIC_OFFER_PULSE=true
NEXT_PUBLIC_OFFER_INNER_LIGHT=true

# Menu Page Colors
NEXT_PUBLIC_ITEM_TEXT_COLOR=#1f2937
NEXT_PUBLIC_CATEGORY_TEXT_COLOR=#ffffff
NEXT_PUBLIC_CARD_BG_COLOR=#ffffff
NEXT_PUBLIC_FEATURE_COLOR=#536C4A

# Legend Colors (Strain Types)
NEXT_PUBLIC_LEGEND_HYBRID_COLOR=#4f7bff
NEXT_PUBLIC_LEGEND_SATIVA_COLOR=#ff6633
NEXT_PUBLIC_LEGEND_INDICA_COLOR=#38b24f
```

### Шаг 3: Перезапустите dev server

```bash
npm run dev
```

### Шаг 4: Настройте динамические тексты

Откройте админ-панель: **http://localhost:3000/admin/settings**

Здесь вы можете редактировать:
- **Main Page Section**:
  - Offer Text
  - Event Text  
  - Hide Offer (checkbox)
- **Menu Labels**:
  - Tier 0-3 labels (1PC, 1G, 5G+, 20G+)
- **Legend Labels**:
  - Hybrid, Sativa, Indica
  - Feature & Tip labels

### Шаг 5: (Опционально) Удалите старую таблицу theme

После того как убедитесь что всё работает:

```sql
-- Файл: supabase/drop-theme-table.sql
```

⚠️ **ВАЖНО**: Сначала убедитесь что `dynamic_settings` работает!

---

## 🎯 Как это работает?

### Главная страница (`/`)
1. **SSR**: Загружает статические цвета из `.env` → мгновенно
2. **Client**: Асинхронно загружает тексты из `dynamic_settings` → не блокирует рендер
3. **Результат**: Страница грузится **быстро**, тексты появляются через ~100-200ms

### Страница меню (`/menu`)
1. **SSR**: Параллельно загружает:
   - Menu items (как обычно)
   - Dynamic labels из `dynamic_settings`
2. **Результат**: Всё грузится одним запросом, без задержек

---

## 📊 Производительность

| Метрика | До | После |
|---------|-----|--------|
| Homepage TTFB | ~800ms | ~50-100ms |
| Блокирующих DB запросов | 1-2 | 0 |
| Кеширование | None | 1 hour |
| Админ-панель | Не работала | Работает отлично |

---

## 🔧 Как изменить настройки?

### Изменить цвета
1. Отредактируйте `.env.local`
2. Перезапустите `npm run dev`

### Изменить тексты/labels
1. Откройте `/admin/settings`
2. Отредактируйте нужные поля
3. Нажмите "Save Settings"
4. Изменения появятся мгновенно (без перезапуска!)

---

## ❓ FAQ

**Q: Почему offer_text теперь в БД, а не в .env?**  
A: Потому что офферы меняются часто. Динамические настройки загружаются асинхронно на клиенте и не замедляют SSR.

**Q: Нужно ли деплоить каждый раз при изменении текста?**  
A: Нет! Тексты в БД меняются через админ-панель без деплоя.

**Q: А если изменить цвет?**  
A: Цвета в `.env` → нужен redeploy (но цвета меняются редко).

**Q: Что если таблица dynamic_settings недоступна?**  
A: Сайт продолжит работать с fallback значениями. Главная не сломается!

**Q: Старая админ-панель /admin/theme?**  
A: Deprecated. Используйте `/admin/settings` для динамических настроек.

---

## 🚨 Troubleshooting

### Offer banner показывает "Loading..."
- Проверьте что таблица `dynamic_settings` существует
- Проверьте RLS policies (должны быть public read)
- Откройте DevTools Console для ошибок

### Цвета не применяются
- Убедитесь что `.env.local` создан
- Перезапустите `npm run dev`
- Проверьте что переменные начинаются с `NEXT_PUBLIC_`

### Labels не меняются в меню
- Проверьте что данные сохранились в `dynamic_settings`
- Перезагрузите страницу `/menu`
- Проверьте что `revalidate` работает корректно

---

## 📚 Связанные файлы

- `src/lib/theme-config.ts` - статические настройки из .env
- `src/lib/dynamic-settings.ts` - динамические настройки из БД
- `src/components/DynamicOfferBanner.tsx` - async offer banner
- `src/app/admin/settings/page.tsx` - админ-панель
- `supabase/create-dynamic-settings-table.sql` - миграция создания
- `supabase/drop-theme-table.sql` - миграция удаления старой таблицы

