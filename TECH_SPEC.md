# OG Lab Site - Техническая спецификация

## 🛠️ Технический стек

### Frontend
- **Next.js 15.5.3** - React фреймворк с App Router
- **React 19.1.0** - UI библиотека
- **TypeScript 5** - типизированный JavaScript
- **Tailwind CSS 3.4.17** - utility-first CSS фреймворк
- **PostCSS 8.5.6** - CSS процессор

### Backend & Data
- **Google Sheets API** - источник данных для меню
- **googleapis 159.0.0** - официальная библиотека Google API
- **ISR (Incremental Static Regeneration)** - автообновление данных каждые 15 минут

### Deployment & Infrastructure
- **PM2** - процесс-менеджер для продакшн
- **Nginx** - веб-сервер и reverse proxy
- **Node.js** - серверная среда выполнения

### Development Tools
- **ESLint 9** - линтер кода
- **Autoprefixer** - автоматические CSS префиксы

## 📁 Структура проекта

```
oglab-site/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx           # Главная страница
│   │   ├── menu/page.tsx      # Страница меню
│   │   ├── layout.tsx         # Корневой layout
│   │   └── globals.css        # Глобальные стили
│   ├── components/            # React компоненты
│   │   ├── AutoRefresh.tsx    # Автообновление страницы
│   │   ├── BreathingController.tsx # Контроллер анимации дыхания
│   │   ├── MenuTime.tsx       # Компонент времени
│   │   └── PacmanTrail.tsx    # Анимация пакмана
│   └── lib/                   # Утилиты и хелперы
│       ├── google.ts          # Google Sheets API
│       └── menu-helpers.ts    # Хелперы для меню
├── public/                    # Статические файлы
│   └── assets/images/         # Изображения и иконки
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

### 1. Автоматическое обновление данных
**Файлы**: `src/lib/google.ts`, `src/app/menu/page.tsx`

- **ISR**: `export const revalidate = 900` (15 минут)
- **Fallback данные**: при ошибках API показываются mock данные
- **Переменные окружения**: 
  - `GS_CLIENT_EMAIL` - email сервисного аккаунта
  - `GS_PRIVATE_KEY` - приватный ключ
  - `GS_SHEET_ID` - ID Google таблицы

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

### 5. Интеграция с Google Sheets
**Файл**: `src/lib/google.ts`

#### Структура данных:
```typescript
interface MenuRow {
  Category: string | null;
  Name: string | null;
  THC?: number | null;
  CBG?: number | null;
  Price_1pc?: number | null;
  Price_1g?: number | null;
  Price_5g?: number | null;
  Price_20g?: number | null;
  Type?: string | null;
  Our?: boolean | null;
}
```

#### Обработка ошибок:
- **Graceful degradation**: fallback на mock данные
- **Детальное логирование**: для отладки API
- **Валидация ключей**: проверка формата PEM

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
Создать файл `.env.production` на сервере:
```bash
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
- При отсутствии Google Sheets API показываются mock данные
- **Индикаторы**: OG Kush, White Widow и др.
- **Проверка**: логи в консоли браузера

### 3. ISR кеширование
- Данные обновляются максимум раз в 15 минут
- **Принудительное обновление**: через автообновление страницы
- **Разработка**: используйте `npm run dev` для мгновенных обновлений

### 4. CSS приоритеты и переопределения
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
1. **Google Sheets**: изменения в таблице
2. **Автоматически**: через 15 минут (ISR)
3. **Принудительно**: перезапуск PM2 или ожидание автообновления

---

*Документ создан: $(date)*
*Версия проекта: 1.0.0*
*Последнее обновление: декабрь 2024*
