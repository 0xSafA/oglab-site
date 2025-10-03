# 🚀 Быстрый старт: Очеловеченный дизайн

## Что сделано

✅ Создана тестовая страница `/test-humanized` с новым дизайном
✅ Добавлены 5 секций для "живого" контента:
  - Hero с фоновым видео
  - Карусель фотографий (ферма, продукты, клиенты)
  - Секция команды (4 сотрудника)
  - Видео-тур фермы
  - Галерея "за кулисами" (8 фото)

## Запуск за 3 минуты

### 1. Запустите dev-сервер
```bash
npm run dev
```

### 2. Откройте тестовую страницу
```
http://localhost:3000/test-humanized
```

### 3. Посмотрите дизайн с placeholder-контентом
Сейчас вместо реальных фото показаны эмодзи-плейсхолдеры:
- 🌿 вместо фото фермы
- 😊 вместо фото клиентов
- 👨‍🌾 вместо фото команды

## Что нужно для "живого" запуска

### Минимальный набор (15 файлов):

#### 📹 Видео (2 файла):
```bash
public/videos/farm-tour.mp4        # 20-30 сек, hero background
public/videos/full-tour.mp4        # 3-5 мин, полный тур (или YouTube)
```

#### 📸 Фотографии (13 файлов):
```bash
# Карусель (3 фото):
public/photos/farm-1.jpg           # Плантация
public/photos/products-1.jpg       # Продукты/витрина
public/photos/customers-1.jpg      # Довольные клиенты

# Команда (4 фото):
public/photos/team-alex.jpg        # Агроном
public/photos/team-maria.jpg       # Менеджер
public/photos/team-david.jpg       # Контроль качества
public/photos/team-sophie.jpg      # Гид

# За кулисами (6 фото минимум):
public/photos/behind-1.jpg         # Рассада
public/photos/behind-2.jpg         # Полив
public/photos/behind-3.jpg         # Обрезка
public/photos/behind-4.jpg         # Тестирование
public/photos/behind-5.jpg         # Упаковка
public/photos/behind-6.jpg         # Диспенсари
```

## Пошаговая инструкция

### Шаг 1: Создайте папки
```bash
mkdir -p public/videos public/photos
```

### Шаг 2: Загрузите медиа-файлы
Скопируйте ваши фото/видео в соответствующие папки.

**Требования:**
- Видео: MP4, 1080p минимум
- Фото: JPG, 1920x1080 минимум
- Фото команды: квадратные (1:1), 800x800 минимум

### Шаг 3: Активируйте видео
Откройте файл `/src/app/test-humanized/page.tsx` и раскомментируйте:

**Для hero video (строка ~65):**
```tsx
// Найдите и раскомментируйте:
<video autoPlay loop muted playsInline className="...">
  <source src="/videos/farm-tour.mp4" type="video/mp4" />
</video>
```

**Для full tour (строка ~180):**
```tsx
// Опция 1: Локальное видео
<video controls className="..." src="/videos/full-tour.mp4" />

// Опция 2: YouTube
<iframe
  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
  ...
/>
```

### Шаг 4: Активируйте фото
В том же файле замените placeholders:

**Для карусели (PhotoCard компонент):**
```tsx
// Раскомментируйте:
<Image src={imageUrl} alt={title} fill className="object-cover" />
```

**Для команды (TeamMember компонент):**
```tsx
// Раскомментируйте:
<Image src={imageUrl} alt={name} fill className="object-cover" />
```

**Для галереи (BehindScenesCard компонент):**
```tsx
// Раскомментируйте:
<Image src={imageUrl} alt={title} fill className="object-cover" />
```

### Шаг 5: Перезагрузите страницу
Обновите браузер и наслаждайтесь результатом! 🎉

## Оптимизация медиа

### Сжатие видео (ffmpeg):
```bash
# Hero video (целевой размер: 5-10MB)
ffmpeg -i input.mp4 -vcodec h264 -acodec aac \
  -b:v 800k -b:a 128k \
  public/videos/farm-tour.mp4

# Full tour video (целевой размер: 20-30MB)
ffmpeg -i input.mp4 -vcodec h264 -acodec aac \
  -b:v 1500k -b:a 192k \
  public/videos/full-tour.mp4
```

### Оптимизация фото:
```bash
# Установите imagemagick
brew install imagemagick

# Оптимизация одного фото
convert input.jpg -resize 1920x1080^ -quality 85 output.jpg

# Массовая оптимизация
for img in *.jpg; do
  convert "$img" -resize 1920x1080^ -quality 85 "optimized/$img"
done
```

## Переключение на production

Когда все готово:

### 1. Бэкап старой страницы
```bash
cp src/app/page.tsx src/app/page-OLD-backup.tsx
```

### 2. Замена главной страницы
```bash
cp src/app/test-humanized/page.tsx src/app/page.tsx
```

### 3. Удаление тестовой страницы
```bash
rm -rf src/app/test-humanized
```

### 4. Коммит изменений
```bash
git add .
git commit -m "feat: добавлен очеловеченный дизайн главной страницы"
git push origin main
```

## Чеклист перед запуском

### Обязательно:
- [ ] Hero video загружено и автовоспроизводится
- [ ] 3 фото карусели на месте
- [ ] 4 фото команды с улыбками!
- [ ] Все фото оптимизированы (< 500KB каждое)
- [ ] Hero video сжато (< 10MB)

### Желательно:
- [ ] Full tour video (или YouTube embed)
- [ ] 8 фото "behind the scenes"
- [ ] Проверено на мобильных
- [ ] Проверено на планшетах

### Опционально:
- [ ] Добавлены реальные имена команды
- [ ] Добавлены реальные должности
- [ ] Настроен Google Analytics
- [ ] Протестирована скорость загрузки

## Troubleshooting

### Видео не воспроизводится:
1. Проверьте формат (должен быть MP4 H.264)
2. Убедитесь, что файл в `/public/videos/`
3. Проверьте размер (< 10MB для hero)
4. Попробуйте другой браузер

### Фото не загружаются:
1. Проверьте путь (`/public/photos/`)
2. Проверьте имена файлов (регистр важен!)
3. Убедитесь, что формат JPG
4. Проверьте права доступа

### Страница тормозит:
1. Сожмите видео (см. команды выше)
2. Оптимизируйте фото (< 500KB каждое)
3. Используйте YouTube для long video
4. Добавьте lazy loading

## Полезные ссылки

📖 [Полный гид по дизайну](./HUMANIZED_DESIGN_GUIDE.md)
📐 [Визуальная схема](./HUMANIZED_LAYOUT.md)

## Помощь

Если что-то не работает:
1. Проверьте консоль браузера (F12)
2. Проверьте логи Next.js в терминале
3. Убедитесь, что все файлы на месте
4. Перезапустите dev-сервер

**Удачи!** 🎉

