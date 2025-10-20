# 🚀 ИНСТРУКЦИЯ ПО ДЕПЛОЮ - ТЕКСТИЛЬ КОМПЛЕКС

## 📦 БЫСТРЫЙ СТАРТ

### 1. Подготовка сервера
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Установка PM2 для управления процессами
sudo npm install -g pm2
```

### 2. Настройка базы данных
```bash
# Подключение к PostgreSQL
sudo -u postgres psql

# Создание базы данных
CREATE DATABASE textil_kompleks;
CREATE USER textil_user WITH PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE textil_kompleks TO textil_user;
\q
```

### 3. Загрузка проекта
```bash
# Создание директории
mkdir -p /var/www/textil-kompleks
cd /var/www/textil-kompleks

# Распаковка архива (замените на ваш архив)
# unzip textil-kompleks-production.zip

# Установка зависимостей
npm install --production
```

### 4. Настройка переменных окружения
```bash
# Копирование файла настроек
cp env.production .env

# Редактирование настроек
nano .env
```

**ОБЯЗАТЕЛЬНО ИЗМЕНИТЬ В .env:**
```env
# База данных
DATABASE_URL="postgresql://textil_user:your_strong_password@localhost:5432/textil_kompleks"
DIRECT_URL="postgresql://textil_user:your_strong_password@localhost:5432/textil_kompleks"

# Секреты (сгенерируйте сильные!)
JWT_SECRET="your_strong_jwt_secret_32_chars_min"
JWT_REFRESH_SECRET="your_strong_refresh_secret_32_chars_min"
NEXTAUTH_SECRET="your_strong_nextauth_secret_32_chars_min"

# Сайт
SITE_URL="https://yourdomain.com"
NEXTAUTH_URL="https://yourdomain.com"
ALLOWED_ORIGINS="https://yourdomain.com"
```

### 5. Инициализация базы данных
```bash
# Генерация Prisma клиента
npm run db:generate

# Применение миграций
npm run db:migrate

# Наполнение тестовыми данными (опционально)
npm run db:seed
```

### 6. Сборка и запуск
```bash
# Сборка проекта
npm run build

# Запуск через PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔧 НАСТРОЙКА NGINX

### 1. Установка Nginx
```bash
sudo apt install nginx -y
```

### 2. Создание конфигурации
```bash
sudo nano /etc/nginx/sites-available/textil-kompleks
```

### 3. Конфигурация Nginx
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Статические файлы
    location /uploads/ {
        alias /var/www/textil-kompleks/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 4. Активация сайта
```bash
sudo ln -s /etc/nginx/sites-available/textil-kompleks /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 НАСТРОЙКА SSL (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx -y

# Получение сертификата
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Автообновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 МОНИТОРИНГ

### PM2 команды
```bash
pm2 status          # Статус процессов
pm2 logs            # Логи
pm2 restart all     # Перезапуск
pm2 stop all        # Остановка
pm2 delete all      # Удаление
```

### Логи приложения
```bash
pm2 logs textil-kompleks
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

## 🔄 ОБНОВЛЕНИЕ ПРОЕКТА

```bash
# Остановка
pm2 stop textil-kompleks

# Обновление кода
git pull origin main  # или загрузка нового архива

# Установка зависимостей
npm install --production

# Миграции БД (если есть)
npm run db:migrate

# Сборка
npm run build

# Запуск
pm2 start textil-kompleks
```

## 🛡️ БЕЗОПАСНОСТЬ

### 1. Настройка файрвола
```bash
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Резервное копирование БД
```bash
# Создание бэкапа
pg_dump -U textil_user -h localhost textil_kompleks > backup_$(date +%Y%m%d).sql

# Восстановление
psql -U textil_user -h localhost textil_kompleks < backup_20240101.sql
```

### 3. Мониторинг ресурсов
```bash
# Установка htop
sudo apt install htop -y
htop

# Мониторинг диска
df -h
du -sh /var/www/textil-kompleks
```

## 🆘 РЕШЕНИЕ ПРОБЛЕМ

### Проблемы с базой данных
```bash
# Проверка статуса PostgreSQL
sudo systemctl status postgresql

# Перезапуск PostgreSQL
sudo systemctl restart postgresql
```

### Проблемы с приложением
```bash
# Проверка логов
pm2 logs textil-kompleks --lines 100

# Перезапуск приложения
pm2 restart textil-kompleks
```

### Проблемы с Nginx
```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl restart nginx
```

## 📞 ПОДДЕРЖКА

При возникновении проблем:
1. Проверьте логи: `pm2 logs textil-kompleks`
2. Проверьте статус: `pm2 status`
3. Проверьте базу данных: `sudo systemctl status postgresql`
4. Проверьте Nginx: `sudo nginx -t`

---
**Удачного деплоя! 🚀**

