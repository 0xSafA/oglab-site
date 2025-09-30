# OG Lab Menu Admin Panel - Интеграция с OGPx

## Обзор

Данное руководство поможет интегрировать админ панель меню OG Lab с существующей базой данных проекта OGPx. Мы будем использовать существующую систему аутентификации и ролей, добавив новую роль `weedmenu` для управления меню.

## Преимущества интеграции с OGPx

✅ **Единая база пользователей** - используем существующих пользователей  
✅ **Общая система ролей** - расширяем существующую ролевую модель  
✅ **Аудит логи** - используем существующую таблицу `audit_logs`  
✅ **Экономия** - не нужна отдельная подписка Supabase  
✅ **Безопасность** - проверенная система авторизации  

## Шаг 1: Подготовка базы данных

### 1.1 Выполнить миграцию

В Supabase SQL Editor выполните скрипт `ogpx-migration.sql`:

```sql
-- Скрипт создаст:
-- ✅ Роль 'weedmenu' в таблице profiles
-- ✅ Таблицы menu_items, menu_layout, theme
-- ✅ RLS политики для безопасности
-- ✅ Триггеры для audit_logs
-- ✅ Индексы для производительности
```

### 1.2 Добавить пользователей с ролью weedmenu

Используйте скрипт `add-weedmenu-users.sql` для добавления пользователей:

```sql
-- Пример: обновить существующих пользователей
UPDATE public.profiles 
SET role = 'weedmenu' 
WHERE email IN (
  'ceo@oglab.com',
  'manager@oglab.com'
);
```

## Шаг 2: Настройка переменных окружения

Создайте файл `.env.local` с переменными из вашего проекта OGPx:

```bash
# Supabase Configuration (из OGPx проекта)
NEXT_PUBLIC_SUPABASE_URL=your-ogpx-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-ogpx-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-ogpx-service-role-key

# UploadThing Configuration
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id

# Feature Flags
ENABLE_ADMIN=true

# Legacy Google Sheets (для миграции данных, если нужно)
GS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GS_SHEET_ID=your-google-sheet-id
GS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

## Шаг 3: Ролевая система

### Существующие роли в OGPx:
- `store` - магазины
- `doctor` - врачи  
- `admin` - администраторы
- `provider` - поставщики услуг
- `patient` - пациенты

### Новая роль:
- `weedmenu` - **администраторы меню** (доступ к админ панели меню)

### Права доступа:

| Роль | Доступ к админ панели | Управление меню | Управление темой | Миграция данных |
|------|---------------------|----------------|-----------------|----------------|
| `admin` | ✅ | ✅ | ✅ | ✅ |
| `weedmenu` | ✅ | ✅ | ✅ | ❌ |
| Остальные | ❌ | ❌ | ❌ | ❌ |

## Шаг 4: Тестирование

### 4.1 Запуск приложения

```bash
npm install
npm run dev
```

### 4.2 Проверка доступа

1. Перейдите на `http://localhost:3000/admin/login`
2. Войдите под пользователем с ролью `weedmenu` или `admin`
3. Проверьте доступ к:
   - Dashboard: `/admin`
   - Управление меню: `/admin/menu`
   - Управление темой: `/admin/theme`

### 4.3 Проверка безопасности

- Попробуйте войти под пользователем с другой ролью - должен быть редирект на `/auth/unauthorized`
- Проверьте, что изменения логируются в таблице `audit_logs`

## Шаг 5: Миграция данных (опционально)

Если у вас есть данные в Google Sheets, можете их перенести:

### 5.1 API для миграции

```bash
# POST /api/migrate
{
  "action": "migrate"
}
```

### 5.2 Проверка миграции

```bash
# POST /api/migrate  
{
  "action": "validate"
}
```

**Важно:** Миграция доступна только пользователям с ролью `admin`!

## Шаг 6: Особенности интеграции

### 6.1 Аудит логи

Все изменения в меню автоматически записываются в существующую таблицу `audit_logs`:

```sql
SELECT 
  al.ts,
  p.email,
  al.entity,
  al.action,
  al.diff
FROM audit_logs al
JOIN profiles p ON al.user_id = p.id
WHERE al.entity IN ('menu_items', 'theme')
ORDER BY al.ts DESC;
```

### 6.2 Множественные роли

В текущей реализации у пользователя может быть только одна роль. Если нужны множественные роли, можно:

1. Изменить поле `role` на `roles` (JSONB array)
2. Обновить все политики RLS
3. Обновить проверки в коде

### 6.3 Организации

Если нужна привязка к организациям (таблица `organizations`), можно добавить поле `org_id` в таблицы меню и фильтровать данные по организациям.

## Шаг 7: Производственное развертывание

### 7.1 Переменные окружения

Установите те же переменные окружения в продакшене, что и в OGPx проекте.

### 7.2 Безопасность

- RLS политики уже настроены
- Аудит логи включены
- Проверка ролей на всех уровнях

### 7.3 Мониторинг

Используйте существующие инструменты мониторинга OGPx для отслеживания:
- Активности пользователей
- Изменений в меню
- Ошибок авторизации

## Управление пользователями

### Добавить пользователя с доступом к меню:

```sql
-- Если пользователь уже существует
UPDATE public.profiles 
SET role = 'weedmenu' 
WHERE email = 'user@example.com';

-- Если нужно создать нового пользователя
-- 1. Создайте пользователя в Supabase Auth
-- 2. Затем добавьте профиль:
INSERT INTO public.profiles (id, email, full_name, role) 
VALUES (
  'user-uuid-from-auth',
  'user@example.com',
  'Menu Administrator',
  'weedmenu'
);
```

### Убрать доступ к меню:

```sql
UPDATE public.profiles 
SET role = 'store'  -- или другая подходящая роль
WHERE email = 'user@example.com';
```

### Проверить доступ:

```sql
SELECT 
  email,
  role,
  CASE 
    WHEN role IN ('weedmenu', 'admin') THEN 'Есть доступ к меню'
    ELSE 'Нет доступа к меню'
  END as menu_access
FROM public.profiles 
WHERE email = 'user@example.com';
```

## Поддержка

### Логи для отладки:

```sql
-- Проверить последние изменения в меню
SELECT * FROM audit_logs 
WHERE entity IN ('menu_items', 'theme') 
ORDER BY ts DESC LIMIT 10;

-- Проверить пользователей с доступом к меню
SELECT email, role, created_at 
FROM profiles 
WHERE role IN ('weedmenu', 'admin');

-- Проверить RLS политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('menu_items', 'menu_layout', 'theme');
```

### Частые проблемы:

1. **"Unauthorized"** - проверьте роль пользователя в таблице `profiles`
2. **"Forbidden"** - убедитесь, что RLS политики применены корректно
3. **Не загружаются данные** - проверьте переменные окружения Supabase

## Заключение

Интеграция с OGPx позволяет:
- Использовать единую базу пользователей
- Экономить на подписках
- Обеспечить консистентность данных
- Использовать проверенную систему безопасности

Все готово к использованию! 🚀
