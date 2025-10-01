# Architecture Decision Records (ADR)

## ADR-002: Admin panel for Menu pricing and Design theme

Status: Implemented

Date: 2025-09-19
Updated: 2025-09-20

Context

We need an authenticated admin UI to:
- edit Menu items/prices directly in a table-like interface
- optionally adjust design theme (brand colors) used by the site
- remain compatible with our current stack and deployment model
- integrate with existing OGPx infrastructure to avoid additional costs

Current stack
- Next.js App Router (15.x), TypeScript, React Server/Client components
- Tailwind CSS for styling
- Data source for menu: migrating from Google Sheets to Supabase (OGPx database)
- Hosting: Next.js build (static prerender of pages with ISR), Nginx in front
- Auth: existing OGPx Supabase Auth with role-based access control

Forces
- Keep content owners workflow simple (table editing)
- Minimize operational overhead; reuse existing OGPx infrastructure
- Preserve static performance for public pages (ISR) while supporting timely updates
- Security: protect admin behind authentication and restrict access
- Cost efficiency: avoid additional Supabase subscriptions by using existing OGPx database

Options considered
1) Build admin on top of Google Sheets only (no backend):
   - Pros: fastest; Sheets already store data
   - Cons: auth/sharing model of Sheets is separate; editing UI not branded; hard to constrain edits; no theme controls

2) Create separate Supabase project for menu admin:
   - Pros: isolated environment; full control over schema
   - Cons: additional monthly costs; separate user management; data duplication

3) Integrate with existing OGPx Supabase database:
   - Pros: cost-effective; unified user management; existing audit system; proven security
   - Cons: need to extend existing schema; coordinate with OGPx development

Decision

We will integrate with the existing OGPx Supabase database, extending it with menu management tables and using the existing authentication system with a new `weedmenu` role.

Rationale:
- Cost-effective: no additional Supabase subscription needed
- Unified user management: leverage existing OGPx user base and role system
- Proven security: use established authentication and RLS policies
- Existing audit system: integrate with OGPx audit_logs table
- Operational efficiency: single database to maintain

High-level design
- Routes: `/admin` (protected)
- Auth: OGPx Supabase Auth with existing user management. New role `weedmenu` added for menu administrators. Client uses Supabase JS with anon key; server uses service role for privileged operations.
- Permissions: roles `weedmenu` and `admin` have access to menu management
- Data editing:
  - Table view connected to new Supabase tables (menu_items, menu_layout, theme)
  - Server Actions using `SUPABASE_SERVICE_ROLE_KEY` for validated writes/transactions
  - Optimistic UI, validation of types/prices
  - After successful write — on-demand revalidate for `/menu`
- Theme editing:
  - Form for primary/secondary colors and logo upload
  - Persist to `theme` table in Supabase
  - Dynamic CSS variables applied to public pages
- Security:
  - Admin pages protected by middleware checking `weedmenu` or `admin` role
  - API routes / server actions verify user role via profiles table
  - Integration with existing OGPx audit system

Impact on current site
- Public pages remain static/ISR. After changes in Supabase, trigger revalidate for `/menu` — updates within seconds.
- Extends existing OGPx Supabase database with menu-specific tables
- Google Sheets remains available for data migration/import only

Integration with OGPx
- Uses existing OGPx Supabase project (same URL, keys, users)
- Extends existing `profiles.role` constraint to include `weedmenu`
- Integrates with existing `audit_logs` table for change tracking
- Leverages existing RLS policies and security model

Plan (MVP) - COMPLETED
1) ✅ Extend OGPx database with menu tables; access to `/admin` only for users with `weedmenu` or `admin` role.
2) ✅ Build `/admin/menu` page: fetch rows from Supabase, editable grid, validation, save via server action, then revalidate.
3) ✅ Build `/admin/theme` page: preview + save colors/logo; persist to theme table; apply dynamically on public pages.
4) ✅ Security: middleware protection, RLS policies, integration with existing OGPx audit system.

Logo upload (SVG) - IMPLEMENTED
- Storage: UploadThing CDN
- Auth: server-side validation; calls only from authenticated `weedmenu`/`admin` sessions
- UI: integrated in `/admin/theme` with drag-and-drop upload
- Validation: accepts only `image/svg+xml`, max 200KB, basic sanitization
- Caching/CDN: UploadThing CDN URL stored in theme table; applied dynamically on public pages
- Rollback: previous URLs tracked in OGPx audit_logs for rollback capability

OGPx Database Integration - IMPLEMENTED
- Env vars (from existing OGPx project):
  - `NEXT_PUBLIC_SUPABASE_URL` (OGPx project URL)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (OGPx anon key)
  - `SUPABASE_SERVICE_ROLE_KEY` (OGPx service role key)
- Auth & Roles:
  - Uses existing OGPx Supabase Auth and profiles table
  - Extended `profiles.role` constraint to include `weedmenu` role
  - Access to admin routes checked via existing profiles table
- Schema additions to OGPx database:
  - `menu_items` (id, category, name, type, thc, cbg, price_1g, price_5g, price_20g, our, updated_at, updated_by)
  - `menu_layout` (id, column1 text[], column2 text[], column3 text[])
  - `theme` (id, primary_color, secondary_color, logo_url)
- RLS Policies:
  - Public (anon) — read-only select on menu tables
  - `weedmenu` and `admin` roles — full CRUD on menu tables
  - Service role — for server-side batch operations
- Audit Integration:
  - All menu changes logged to existing `audit_logs` table
  - Maintains consistency with OGPx audit trail

Status tracking - COMPLETED
- ✅ Feature implemented and ready for production
- ✅ Integration with OGPx database completed
- ✅ Role-based access control with `weedmenu` role
- ✅ All security measures implemented
- Target: deploy with feature flag `ENABLE_ADMIN=true`

# OG Lab Site - Техническая спецификация

## 🛠️ Технический стек

### Frontend
- **Next.js 15.5.3** - React фреймворк с App Router
- **React 19.1.0** - UI библиотека
- **TypeScript 5** - типизированный JavaScript
- **Tailwind CSS 3.4.17** - utility-first CSS фреймворк
- **PostCSS 8.5.6** - CSS процессор

### Backend & Data
- **OGPx Supabase Database** - основной источник данных для меню (Postgres)
- **Supabase Client 2.x** - клиент для работы с базой данных и аутентификацией
- **Google Sheets API** - опциональный источник для миграции данных (legacy)
- **ISR (Incremental Static Regeneration)** - автообновление данных + on-demand revalidation

### Deployment & Infrastructure
- **PM2** - процесс-менеджер для продакшн
- **Nginx** - веб-сервер и reverse proxy
- **Node.js** - серверная среда выполнения

### Development Tools
- **ESLint 9** - линтер кода
- **Autoprefixer** - автоматические CSS префиксы

### Admin Panel & File Upload
- **UploadThing** - сервис для загрузки SVG логотипов
- **Role-based Access Control** - интеграция с ролевой системой OGPx

## 📁 Структура проекта

```
oglab-site/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Главная страница
│   │   ├── menu/page.tsx      # Страница меню
│   │   ├── admin/             # Админ панель
│   │   │   ├── layout.tsx     # Layout для админки
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── menu/page.tsx  # Управление меню
│   │   │   └── theme/page.tsx # Управление темой
│   │   ├── auth/              # Страницы аутентификации
│   │   │   ├── login/page.tsx # Страница входа
│   │   │   └── unauthorized/page.tsx # Ошибка доступа
│   │   ├── api/               # API роуты
│   │   │   ├── revalidate/    # On-demand revalidation
│   │   │   ├── migrate/       # Миграция данных
│   │   │   └── uploadthing/   # Загрузка файлов
│   │   ├── layout.tsx         # Корневой layout
│   │   └── globals.css        # Глобальные стили
│   ├── components/            # React компоненты
│   │   ├── AdminNav.tsx       # Навигация админки
│   │   ├── AutoRefresh.tsx    # Автообновление страницы
│   │   ├── BreathingController.tsx # Контроллер анимации дыхания
│   │   ├── MenuTime.tsx       # Компонент времени
│   │   └── PacmanTrail.tsx    # Анимация пакмана
│   └── lib/                   # Утилиты и хелперы
│       ├── supabase.ts        # Supabase конфигурация
│       ├── supabase-data.ts   # Функции для работы с данными
│       ├── migrate-data.ts    # Утилиты миграции
│       ├── uploadthing.ts     # UploadThing конфигурация
│       ├── google.ts          # Google Sheets API (legacy)
│       └── menu-helpers.ts    # Хелперы для меню
├── public/                    # Статические файлы
│   └── assets/images/         # Изображения и иконки
├── middleware.ts              # Middleware для защиты админ роутов
├── ogpx-migration.sql         # SQL скрипт для интеграции с OGPx
├── add-weedmenu-users.sql     # Скрипт для добавления пользователей
├── OGPX_INTEGRATION_GUIDE.md  # Руководство по интеграции
├── ecosystem.config.js        # Конфигурация PM2
├── nginx.conf                 # Конфигурация Nginx
└── package.json              # Зависимости проекта
```

## 🎨 Дизайн система

### CSS Архитектура
- **Основной подход**: Tailwind CSS utility-first
- **Кастомные стили**: `src/app/globals.css` для специфичных компонентов
- **CSS переменные**: определены в `:root` для консистентности
- **Приоритет стилей**: CSS классы > inline стили > CSS переменные

#### CSS переменные (`globals.css`)
```css
:root {
  --color-primary: #536C4A;        /* Основной зеленый */
  --color-primary-light: #B0BF93;  /* Светлый зеленый */
}
```

#### Кастомные CSS классы
- `.farm-leaf` - стилизация farm-grown иконок
- `.breathe` - анимация дыхания кружочков
- `.menu-container` - специфичные стили меню
- `.pacman-*` - стили для анимации пакмана

### Цветовая палитра
- **Основной зеленый**: `#536C4A` (темно-зеленый)
- **Светлый зеленый**: `#B0BF93` (светло-зеленый)
- **Farm-grown**: `#b0bf93` (светло-зеленый для farm-grown иконок)
- **Градиенты**: `from-[#536C4A] to-[#B0BF93]`

### Типы каннабиса (цветовое кодирование)
- **Hybrid**: `#4f7bff` (синий)
- **Sativa**: `#ff6633` (оранжевый)  
- **Indica**: `#38b24f` (зеленый)

### Responsive Design
- **Mobile-first** подход
- **Breakpoints**: sm, md, lg (стандартные Tailwind)
- **Адаптивные отступы**: разные для мобильных и десктопа

### Стилизация компонентов
- **Приоритет Tailwind**: основные стили через utility классы
- **Кастомный CSS**: только для сложных анимаций и специфичных элементов
- **Inline стили**: избегаем, используем только для динамических значений (цвета типов каннабиса)

## 🔧 Ключевые функции и решения

### 1. Интеграция с OGPx Database
**Файлы**: `src/lib/supabase.ts`, `src/lib/supabase-data.ts`, `src/app/menu/page.tsx`

- **База данных**: OGPx Supabase Postgres с расширенными таблицами для меню
- **Аутентификация**: существующая система OGPx с ролью `weedmenu`
- **ISR**: `export const revalidate = 900` (15 минут) + on-demand revalidation
- **Fallback данные**: при ошибках API показываются пустые данные с уведомлением
- **Переменные окружения** (из OGPx проекта): 
  - `NEXT_PUBLIC_SUPABASE_URL` - URL проекта OGPx
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - анонимный ключ OGPx
  - `SUPABASE_SERVICE_ROLE_KEY` - сервисный ключ OGPx

### 2. Автоматическое обновление страницы
**Файл**: `src/components/AutoRefresh.tsx`

- **Интервал**: каждые 15 минут (синхронно с ISR)
- **Функция**: сброс анимации пакмана и обновление UI
- **Уведомления**: опциональные browser notifications

### 3. Анимация "дыхания" кружочков
**Файлы**: `src/components/BreathingController.tsx`, `src/app/globals.css`

#### Параметры анимации:
- **Длительность группы**: 12 секунд
- **Пауза между группами**: 6 секунд
- **Финальная пауза**: 15 секунд
- **Полный цикл**: 63 секунды

#### Последовательность:
1. Hybrid (синие) - 12с дыхания + 6с пауза
2. Sativa (оранжевые) - 12с дыхания + 6с пауза  
3. Indica (зеленые) - 12с дыхания + 15с пауза
4. Повтор цикла

#### Технические детали:
- **CSS анимация**: `@keyframes breathe` (3с на цикл)
- **Количество вдохов**: 4 за 12 секунд
- **Селекторы**: `body.breathing-{type} .dot-{type}`
- **Синхронизация**: между легендой и пунктами меню

### 4. Анимация Pacman
**Файл**: `src/components/PacmanTrail.tsx`

- **Canvas-based** рендеринг следа
- **SVG** для самого пакмана
- **Маршрут**: предопределенный путь по экрану
- **След**: плавное исчезновение с opacity

### 5. Админ панель для управления меню
**Файлы**: `src/app/admin/`, `src/components/AdminNav.tsx`

#### Функции админ панели:
- **Dashboard** (`/admin`) - обзор системы и статистика
- **Управление меню** (`/admin/menu`) - CRUD операции с товарами
- **Управление темой** (`/admin/theme`) - изменение цветов и логотипа
- **Безопасность**: middleware защита, проверка ролей, аудит логи

#### Структура данных (Supabase):
```typescript
interface MenuItem {
  id: string;
  category: string;
  name: string;
  type?: 'hybrid' | 'sativa' | 'indica' | null;
  thc?: number | null;
  cbg?: number | null;
  price_1pc?: number | null;
  price_1g?: number | null;
  price_5g?: number | null;
  price_20g?: number | null;
  our?: boolean | null;
  created_at: string;
  updated_at: string;
  updated_by?: string | null;
}
```

#### Безопасность и аудит:
- **RLS политики**: доступ только для ролей `weedmenu` и `admin`
- **Аудит логи**: интеграция с существующей таблицей `audit_logs` OGPx
- **Middleware защита**: проверка аутентификации на уровне роутов

## 🎯 UI/UX особенности

### Главная страница (`src/app/page.tsx`)
- **Градиентный фон**: темно-зеленый к светло-зеленому
- **Стеклянный эффект**: `backdrop-blur-lg` на белом контейнере
- **Рамка**: увеличенная зеленая рамка (3px на мобильных, 2px на десктопе)
- **Отступы**: увеличенные сверху для большего зеленого фона

### Страница меню (`src/app/menu/page.tsx`)
- **Трехколоночная сетка**: адаптивная под разные экраны
- **Цветные индикаторы**: кружочки для типов каннабиса
- **Легенда**: в footer с объяснением цветов
- **Hover эффекты**: на карточках категорий

### Социальные иконки
- **Уменьшенные отступы**: `gap-4` вместо `gap-5` (-20%)
- **Hover анимации**: `hover:scale-125`
- **Поддерживаемые платформы**: Instagram, Telegram, WhatsApp, Facebook, TripAdvisor

## 🚀 Deployment

### PM2 конфигурация (`ecosystem.config.js`)
```javascript
{
  name: 'oglab-site',
  script: 'npm',
  args: 'start',
  instances: 1,
  exec_mode: 'fork',
  env: {
    NODE_ENV: 'production',
    PORT: 3001,
    NODE_OPTIONS: '--no-deprecation'
  },
  autorestart: true
}
```

### Переменные окружения
Создать файл `.env.production` на сервере (используя переменные из OGPx проекта):
```bash
# OGPx Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-ogpx-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-ogpx-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-ogpx-service-role-key

# UploadThing для загрузки логотипов
UPLOADTHING_SECRET=your-uploadthing-secret
UPLOADTHING_APP_ID=your-uploadthing-app-id

# Feature Flags
ENABLE_ADMIN=true

# Legacy Google Sheets (только для миграции данных)
GS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GS_SHEET_ID=your-google-sheet-id
GS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

NODE_ENV=production
PORT=3001
```

### Команды развертывания
```bash
# Остановка
pm2 stop oglab-site

# Запуск
pm2 start ecosystem.config.js

# Перезапуск
pm2 restart oglab-site

# Логи
pm2 logs oglab-site
```

## 🐛 Известные особенности

### 1. Конфликт контроллеров
- **PulseController** и **BreathingController** могут конфликтовать
- **Решение**: используются разные селекторы и классы
- **Мониторинг**: через console.log в браузере

### 2. Fallback данные
- При отсутствии подключения к OGPx Supabase показываются пустые данные
- **Индикаторы**: уведомления об ошибках в админ панели
- **Проверка**: логи в консоли браузера и Supabase Dashboard

### 3. ISR кеширование + On-demand revalidation
- Данные обновляются максимум раз в 15 минут (ISR)
- **Мгновенное обновление**: через on-demand revalidation после изменений в админке
- **Принудительное обновление**: через автообновление страницы
- **Разработка**: используйте `npm run dev` для мгновенных обновлений

### 4. Интеграция с OGPx
- **Общие пользователи**: используются существующие аккаунты OGPx
- **Ролевая система**: расширена роль `weedmenu` для доступа к меню
- **Аудит логи**: все изменения записываются в общую таблицу `audit_logs`
- **База данных**: единая база данных для обоих проектов

### 5. CSS приоритеты и переопределения
- **Проблема**: CSS классы в `globals.css` могут переопределять inline стили
- **Пример**: `.farm-leaf { fill: var(--color-primary) }` переопределяет `fill="#b0bf93"`
- **Решение**: изменять CSS классы, а не только inline стили
- **Места проверки**:
  - `src/app/globals.css` - кастомные CSS классы
  - CSS переменные в `:root`
  - Tailwind конфигурация в `tailwind.config.js`

## 📈 Производительность

### Оптимизации
- **Next.js Image**: оптимизированные изображения
- **CSS-in-JS**: минимальный, только Tailwind
- **Code splitting**: автоматический в Next.js
- **ISR**: статическая генерация с инкрементальным обновлением

### Мониторинг
- **Google Analytics**: интегрирован (G-SF3PJN87G9)
- **Console logging**: для отладки анимаций и API
- **PM2 monitoring**: для серверных метрик

## 🔄 Процессы обновления

### Добавление новых функций
1. **Разработка**: локально с `npm run dev`
2. **Тестирование**: проверка на разных устройствах
3. **Деплой**: обновление на сервере через PM2
4. **Мониторинг**: проверка логов и работоспособности

### Обновление данных меню
1. **Админ панель**: изменения через `/admin/menu` интерфейс
2. **Мгновенно**: on-demand revalidation после сохранения
3. **Автоматически**: через 15 минут (ISR) как fallback
4. **Принудительно**: перезапуск PM2 или ожидание автообновления

### Управление пользователями с доступом к меню
1. **Добавить пользователя**: 
   ```sql
   UPDATE public.profiles SET role = 'weedmenu' WHERE email = 'user@example.com';
   ```
2. **Убрать доступ**: 
   ```sql
   UPDATE public.profiles SET role = 'store' WHERE email = 'user@example.com';
   ```
3. **Проверить доступ**: через OGPx админ панель или SQL запросы

---

*Документ создан: сентябрь 2024*
*Версия проекта: 2.0.0 (с админ панелью и интеграцией OGPx)*
*Последнее обновление: сентябрь 2025*
*Интеграция с OGPx: реализована*
