# Настройка переменных окружения

## Создайте файл `.env.local` в корне проекта со следующим содержимым:

```bash
# Supabase Configuration (из OGPx проекта)
# Замените на ваши реальные значения из OGPx
NEXT_PUBLIC_SUPABASE_URL=your-ogpx-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-ogpx-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-ogpx-service-role-key

# UploadThing Configuration (новый способ с токеном)
# Получите токен на uploadthing.com в разделе API Keys
UPLOADTHING_TOKEN=your-uploadthing-token

# Feature Flags
ENABLE_ADMIN=true
```

## Шаги для получения UploadThing токенов:

### 1. Перейдите на https://uploadthing.com
### 2. Создайте аккаунт (можно через GitHub)
### 3. Создайте новое приложение:
   - **Name:** OG Lab Menu Admin
   - **Description:** Logo uploads for OG Lab website

### 4. Получите токен:
   - Перейдите в раздел **API Keys** в вашем UploadThing приложении
   - Создайте новый токен или скопируйте существующий
   - Токен выглядит как: `ut_...` (начинается с ut_)
   - Вставьте его в `.env.local` как `UPLOADTHING_TOKEN`

### 5. Замените Supabase переменные:
   - Используйте URL, ANON_KEY и SERVICE_ROLE_KEY из вашего OGPx проекта
   - Эти же переменные используются в OGPx

### 6. Перезапустите приложение:
```bash
# Остановите текущий процесс (Ctrl+C)
# Затем запустите снова:
npm run dev
```

## Проверка настройки:

После настройки переменных:
1. Откройте http://localhost:3001/admin/login
2. Войдите под пользователем ceo@oglab.com
3. Перейдите в /admin/theme
4. Попробуйте загрузить SVG логотип

## Важные замечания:

- **Порт 3001:** Приложение запущено на порту 3001, не 3000
- **UploadThing обязателен:** Без него не будет работать загрузка логотипов
- **Supabase из OGPx:** Используйте те же переменные, что и в OGPx проекте
