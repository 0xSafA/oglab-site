# Настройка управления анимациями плашки

## Описание
Добавлена возможность управления анимациями плашки Offer через админку. Теперь можно включать/отключать каждую анимацию отдельно.

## Что добавлено

### 🎛️ Настройки анимаций в админке:
- **Flying Particles ✨** - Летающие частицы вокруг плашки
- **Cosmic Glow 🌟** - Космическое многоцветное свечение
- **Floating Movement 🎈** - Плавающее движение вверх-вниз
- **Magic Pulse 💫** - Магическая пульсация размера
- **Inner Light 💡** - Золотое свечение изнутри

## Установка

### 1. Применить SQL миграцию
Выполните SQL команды из файла `add-offer-animations.sql` в вашей базе данных Supabase:

```sql
-- Add animation settings to theme table
ALTER TABLE theme ADD COLUMN IF NOT EXISTS offer_enable_particles BOOLEAN DEFAULT true;
ALTER TABLE theme ADD COLUMN IF NOT EXISTS offer_enable_cosmic_glow BOOLEAN DEFAULT true;
ALTER TABLE theme ADD COLUMN IF NOT EXISTS offer_enable_floating BOOLEAN DEFAULT true;
ALTER TABLE theme ADD COLUMN IF NOT EXISTS offer_enable_pulse BOOLEAN DEFAULT true;
ALTER TABLE theme ADD COLUMN IF NOT EXISTS offer_enable_inner_light BOOLEAN DEFAULT true;
```

### 2. Перезапустить приложение
После применения миграции перезапустите Next.js приложение для применения изменений.

## Использование

1. Зайдите в **Админку** → **Theme**
2. Найдите секцию **"Offer Pill Animations"**
3. Включите/отключите нужные анимации галочками
4. Нажмите **"Save Animations"**
5. Изменения применятся на главной странице сразу после сохранения

## Технические детали

### Файлы изменены:
- `src/lib/supabase-client.ts` - добавлены поля в интерфейс Theme
- `src/app/admin/theme/page.tsx` - добавлена секция управления анимациями
- `src/app/page.tsx` - добавлена логика условного отображения анимаций
- `add-offer-animations.sql` - SQL миграция для базы данных

### Поля в базе данных:
- `offer_enable_particles` - включить летающие частицы
- `offer_enable_cosmic_glow` - включить космическое свечение
- `offer_enable_floating` - включить плавающее движение
- `offer_enable_pulse` - включить пульсацию
- `offer_enable_inner_light` - включить внутреннее свечение

### Значения по умолчанию:
Все анимации включены по умолчанию (`true`), чтобы сохранить текущее поведение.

## Совместимость
- ✅ Next.js 15.5.3
- ✅ Supabase
- ✅ Все существующие функции сохранены
- ✅ Обратная совместимость
