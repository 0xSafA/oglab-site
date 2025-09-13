# Настройка Nginx для OG Lab Site

## Установка и настройка

### 1. Копирование конфигурации
```bash
# Скопировать файл конфигурации
sudo cp nginx.conf /etc/nginx/sites-available/oglab-site

# Создать символическую ссылку
sudo ln -s /etc/nginx/sites-available/oglab-site /etc/nginx/sites-enabled/

# Удалить дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default
```

### 2. Настройка SSL сертификатов

#### Использование Let's Encrypt (рекомендуется)
```bash
# Установить certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Получить сертификат
sudo certbot --nginx -d oglab.co -d www.oglab.co

# Автообновление сертификатов
sudo crontab -e
# Добавить строку:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Настройка директорий

```bash
# Создать директории для сайта
sudo mkdir -p /var/www/oglab-site
sudo chown -R $USER:www-data /var/www/oglab-site
sudo chmod -R 755 /var/www/oglab-site

# Создать директории для логов
sudo mkdir -p /var/log/nginx
sudo touch /var/log/nginx/oglab-site.access.log
sudo touch /var/log/nginx/oglab-site.error.log
sudo chown www-data:www-data /var/log/nginx/oglab-site.*
```

### 4. Деплой приложения

```bash
# Перейти в директорию сайта
cd /var/www/oglab-site

# Клонировать репозиторий
git clone https://github.com/yourusername/oglab-site.git .

# Установить зависимости
npm install

# Собрать проект
npm run build

# Запустить с PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### 5. Проверка и запуск

```bash
# Проверить конфигурацию Nginx
sudo nginx -t

# Перезапустить Nginx
sudo systemctl restart nginx

# Проверить статус
sudo systemctl status nginx
```

## Важные настройки в конфигурации

### Безопасность
- SSL/TLS шифрование
- HSTS заголовки
- Rate limiting для API и общих запросов
- Защита от XSS и clickjacking
- Запрет доступа к служебным файлам

### Производительность
- Gzip сжатие
- Кеширование статических файлов
- Проксирование с буферизацией
- Keep-alive соединения

### Статические файлы
- Next.js статика (`/_next/static/`) - кеш на 1 год
- Изображения и ассеты (`/assets/`) - кеш на 1 год
- Favicon и robots.txt - кеш на 1 день

## Мониторинг

### Логи
```bash
# Просмотр логов доступа
sudo tail -f /var/log/nginx/oglab-site.access.log

# Просмотр логов ошибок
sudo tail -f /var/log/nginx/oglab-site.error.log

# Логи Nginx
sudo tail -f /var/log/nginx/error.log
```

### Статус PM2
```bash
# Статус приложения
pm2 status

# Логи приложения
pm2 logs oglab-site

# Мониторинг ресурсов
pm2 monit
```

## Настройки для продакшена

### Перед запуском замените:
1. `oglab.co` на ваш реальный домен
2. Пути к SSL сертификатам
3. Путь к директории сайта (`/var/www/oglab-site`)
4. Настройки upstream серверов при необходимости

### Дополнительные оптимизации:
- Настройка CDN для статических файлов
- Мониторинг с помощью Prometheus/Grafana
- Backup стратегия
- Firewall настройки (ufw/iptables)
