# Инструкция по развертыванию Текстиль Комплекс

## 🚀 Быстрый старт для разработки

### 1. Подготовка окружения

```bash
# Клонирование репозитория
git clone <repository-url>
cd textil-kompleks

# Установка зависимостей
npm install

# Настройка переменных окружения
cp env.example .env.local
```

### 2. Настройка базы данных

Создайте PostgreSQL базу данных:

```sql
CREATE DATABASE textil_kompleks;
CREATE USER textil_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE textil_kompleks TO textil_user;
```

Настройте `.env.local`:

```env
DATABASE_URL="postgresql://textil_user:your_password@localhost:5432/textil_kompleks"
DIRECT_URL="postgresql://textil_user:your_password@localhost:5432/textil_kompleks"
```

### 3. Инициализация

```bash
# Генерация Prisma клиента
npm run db:generate

# Применение миграций
npm run db:migrate

# Наполнение тестовыми данными
npm run db:seed

# Запуск разработки
npm run dev
```

## 🏗 Развертывание в production

### Vercel (рекомендуемый)

1. **Подключение к Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **Переменные окружения в Vercel**
   - `DATABASE_URL` - URL PostgreSQL базы данных
   - `DIRECT_URL` - Прямой URL к базе данных
   - `NEXTAUTH_SECRET` - Случайная строка (32+ символов)
   - `JWT_SECRET` - JWT секрет (32+ символов)
   - `JWT_REFRESH_SECRET` - Refresh token секрет
   - `SITE_URL` - URL вашего сайта

3. **База данных**
   - Используйте Vercel Postgres или внешний провайдер
   - Выполните миграции после первого деплоя:
     ```bash
     vercel env pull .env.production.local
     npm run db:migrate
     npm run db:seed
     ```

### Railway

1. **Создание проекта**
   ```bash
   npm install -g @railway/cli
   railway login
   railway new
   ```

2. **Добавление PostgreSQL**
   ```bash
   railway add postgresql
   ```

3. **Деплой**
   ```bash
   railway up
   ```

### Heroku

1. **Создание приложения**
   ```bash
   heroku create textil-kompleks
   heroku addons:create heroku-postgresql:hobby-dev
   ```

2. **Настройка переменных**
   ```bash
   heroku config:set NEXTAUTH_SECRET="your-secret"
   heroku config:set JWT_SECRET="your-jwt-secret"
   heroku config:set SITE_URL="https://your-app.herokuapp.com"
   ```

3. **Деплой**
   ```bash
   git push heroku main
   heroku run npm run db:migrate
   heroku run npm run db:seed
   ```

### VPS/Dedicated Server

1. **Подготовка сервера**
   ```bash
   # Установка Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Установка PostgreSQL
   sudo apt-get install postgresql postgresql-contrib

   # Установка PM2
   npm install -g pm2
   ```

2. **Деплой приложения**
   ```bash
   git clone <repository-url>
   cd textil-kompleks
   npm install
   npm run build

   # Настройка переменных окружения
   cp env.example .env.production

   # Миграции
   npm run db:migrate
   npm run db:seed

   # Запуск с PM2
   pm2 start ecosystem.config.js --env production
   pm2 startup
   pm2 save
   ```

3. **Настройка Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
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
   }
   ```

## 🐳 Docker развертывание

### Простой запуск

```bash
# Сборка образа
docker build -t textil-kompleks .

# Запуск с PostgreSQL
docker run -d --name postgres \
  -e POSTGRES_DB=textil_kompleks \
  -e POSTGRES_USER=textil_user \
  -e POSTGRES_PASSWORD=your_password \
  postgres:15

# Запуск приложения
docker run -d --name textil-kompleks \
  --link postgres:db \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://textil_user:your_password@db:5432/textil_kompleks" \
  textil-kompleks
```

### Docker Compose

```bash
# Запуск всего стека
docker-compose up -d

# Миграции
docker-compose exec app npm run db:migrate
docker-compose exec app npm run db:seed
```

## 🔧 Настройка переменных окружения

### Обязательные переменные

```env
# База данных
DATABASE_URL="postgresql://user:password@host:5432/database"
DIRECT_URL="postgresql://user:password@host:5432/database"

# Аутентификация
NEXTAUTH_SECRET="random-string-min-32-chars"
JWT_SECRET="jwt-secret-min-32-chars"
JWT_REFRESH_SECRET="refresh-secret-min-32-chars"

# Сайт
SITE_URL="https://your-domain.com"
NEXTAUTH_URL="https://your-domain.com"
```

### Опциональные переменные

```env
# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
FROM_EMAIL="noreply@your-domain.com"

# Аналитика
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
FACEBOOK_PIXEL_ID="1234567890"

# Загрузки
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

# Проверка поисковиков
GOOGLE_SITE_VERIFICATION="verification-code"
YANDEX_VERIFICATION="verification-code"
```

## 📊 Мониторинг и логи

### Health Check

Эндпоинт здоровья приложения: `/api/health`

```bash
curl https://your-domain.com/api/health
```

### Логи PM2

```bash
# Просмотр логов
pm2 logs textil-kompleks

# Мониторинг
pm2 monit

# Перезапуск
pm2 restart textil-kompleks
```

### Логи Docker

```bash
# Просмотр логов контейнера
docker logs textil-kompleks

# Следить за логами
docker logs -f textil-kompleks
```

## 🔄 Обновление приложения

### Vercel

Обновление происходит автоматически при push в main ветку.

### VPS с PM2

```bash
cd /path/to/textil-kompleks
git pull origin main
npm install
npm run build
npm run db:migrate
pm2 restart textil-kompleks
```

### Docker

```bash
# Пересборка образа
docker build -t textil-kompleks .

# Остановка старого контейнера
docker stop textil-kompleks
docker rm textil-kompleks

# Запуск нового
docker run -d --name textil-kompleks \
  --link postgres:db \
  -p 3000:3000 \
  textil-kompleks

# Миграции при необходимости
docker exec textil-kompleks npm run db:migrate
```

## 🚨 Решение проблем

### База данных недоступна

```bash
# Проверка соединения
npx prisma db pull

# Сброс и пересоздание
npx prisma migrate reset
npm run db:seed
```

### Ошибки сборки

```bash
# Очистка кэша
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Проблемы с SSL

```bash
# Проверка сертификата
openssl s_client -connect your-domain.com:443

# Обновление Let's Encrypt (если используется)
sudo certbot renew
```

## 📧 Настройка email

### Gmail

1. Включите двухфакторную аутентификацию
2. Создайте пароль приложения
3. Используйте пароль приложения в `SMTP_PASSWORD`

### SendGrid

```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASSWORD="your-sendgrid-api-key"
```

### Mailgun

```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT=587
SMTP_USER="your-mailgun-username"
SMTP_PASSWORD="your-mailgun-password"
```

## 🔐 Безопасность

### SSL/TLS

- Используйте только HTTPS в production
- Настройте HTTP -> HTTPS редирект
- Используйте HSTS заголовки

### Firewall

```bash
# Базовая настройка UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Резервное копирование

```bash
# Бэкап базы данных
pg_dump -h host -U user -d database > backup.sql

# Восстановление
psql -h host -U user -d database < backup.sql
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи приложения
2. Убедитесь в правильности переменных окружения
3. Проверьте доступность базы данных
4. Обратитесь к документации или создайте Issue

---

**Удачного развертывания! 🚀**
