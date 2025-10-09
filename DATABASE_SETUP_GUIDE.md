# 🗄️ Инструкция по подключению базы данных PostgreSQL

## 📋 Содержание
1. [Установка PostgreSQL](#установка-postgresql)
2. [Создание базы данных](#создание-базы-данных)
3. [Настройка переменных окружения](#настройка-переменных-окружения)
4. [Запуск миграций](#запуск-миграций)
5. [Наполнение данными](#наполнение-данными)
6. [Проверка подключения](#проверка-подключения)
7. [Решение проблем](#решение-проблем)

---

## 🚀 Установка PostgreSQL

### Вариант 1: Установка PostgreSQL локально (Рекомендуется)

1. **Скачайте PostgreSQL** с официального сайта:
   - Перейдите на https://www.postgresql.org/download/windows/
   - Скачайте последнюю версию для Windows

2. **Установите PostgreSQL**:
   - Запустите установщик
   - Выберите компоненты: PostgreSQL Server, pgAdmin, Stack Builder
   - Установите пароль для пользователя `postgres` (запомните его!)
   - Порт по умолчанию: `5432`

3. **Проверьте установку**:
   ```bash
   psql --version
   ```

### Вариант 2: Использование Docker (Альтернатива)

1. **Установите Docker Desktop**:
   - Скачайте с https://www.docker.com/products/docker-desktop/
   - Установите и запустите Docker Desktop

2. **Запустите PostgreSQL в Docker**:
   ```bash
   docker run --name postgres-textil -e POSTGRES_PASSWORD=textilcomplex111 -e POSTGRES_DB=textil_kompleks -p 5432:5432 -d postgres:15
   ```

---

## 🗃️ Создание базы данных

### Если используете локальную установку PostgreSQL:

1. **Откройте pgAdmin** или подключитесь через командную строку:
   ```bash
   psql -U postgres -h localhost
   ```

2. **Создайте базу данных**:
   ```sql
   CREATE DATABASE textil_kompleks;
   ```

3. **Создайте пользователя (опционально)**:
   ```sql
   CREATE USER textil_user WITH PASSWORD 'textilcomplex111';
   GRANT ALL PRIVILEGES ON DATABASE textil_kompleks TO textil_user;
   ```

### Если используете Docker:
База данных создается автоматически при запуске контейнера.

---

## ⚙️ Настройка переменных окружения

1. **Создайте файл `.env`** в корне проекта (рядом с `package.json`):

```env
# Database
DATABASE_URL="postgresql://postgres:textilcomplex111@localhost:5432/textil_kompleks"
DIRECT_URL="postgresql://postgres:textilcomplex111@localhost:5432/textil_kompleks"

# NextAuth
NEXTAUTH_SECRET="textil-kompleks-secret-key-2024-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# JWT
JWT_SECRET="textil-kompleks-jwt-secret-key-2024-min-32"
JWT_REFRESH_SECRET="textil-kompleks-refresh-secret-key-2024-min-32"

# Admin
ADMIN_EMAIL="admin@textil-kompleks.ru"
ADMIN_PASSWORD="admin123"

# Upload
UPLOAD_DIR="./public/uploads"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Analytics (optional)
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"
FACEBOOK_PIXEL_ID="000000000000000"

# External APIs (optional)
SENTRY_DSN="https://your-sentry-dsn"
```

2. **Замените данные подключения** на ваши:
   - `postgres` - имя пользователя
   - `textilcomplex111` - ваш пароль
   - `localhost` - хост (если база на другом сервере, укажите IP)
   - `5432` - порт
   - `textil_kompleks` - имя базы данных

---

## 🔄 Запуск миграций

1. **Откройте терминал** в папке проекта

2. **Сгенерируйте Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Примените миграции**:
   ```bash
   npx prisma db push
   ```
   или
   ```bash
   npx prisma migrate deploy
   ```

4. **Проверьте схему базы**:
   ```bash
   npx prisma db pull
   ```

---

## 📊 Наполнение данными

1. **Запустите seed скрипт**:
   ```bash
   npm run db:seed
   ```

2. **Если данные уже есть**, очистите базу и заполните заново:
   ```bash
   npx prisma db push --force-reset
   npm run db:seed
   ```

---

## ✅ Проверка подключения

1. **Откройте Prisma Studio**:
   ```bash
   npx prisma studio
   ```
   Откроется веб-интерфейс на http://localhost:5555

2. **Запустите проект**:
   ```bash
   npm run dev
   ```

3. **Проверьте API**:
   - Откройте http://localhost:3000/api/products
   - Должны вернуться данные о товарах

---

## 🔧 Решение проблем

### Ошибка "Environment variable not found: DATABASE_URL"
- Убедитесь, что файл `.env` создан в корне проекта
- Проверьте, что в файле нет лишних пробелов
- Перезапустите сервер разработки

### Ошибка подключения к базе данных
- Проверьте, что PostgreSQL запущен
- Убедитесь в правильности данных подключения в `.env`
- Проверьте, что порт 5432 не занят другим приложением

### Ошибка "Unique constraint failed"
- База данных уже содержит данные
- Очистите базу: `npx prisma db push --force-reset`
- Или пропустите seed, если данные уже есть

### Ошибка "Permission denied"
- Убедитесь, что пользователь имеет права на базу данных
- Проверьте пароль в `.env` файле

---

## 📝 Полезные команды

```bash
# Просмотр схемы базы данных
npx prisma db pull

# Сброс базы данных
npx prisma db push --force-reset

# Генерация нового клиента
npx prisma generate

# Открытие Prisma Studio
npx prisma studio

# Просмотр логов базы данных
npx prisma db execute --stdin
```

---

## 🆘 Если ничего не работает

1. **Проверьте статус PostgreSQL**:
   - Windows: Services → PostgreSQL
   - Docker: `docker ps`

2. **Проверьте подключение**:
   ```bash
   psql -U postgres -h localhost -d textil_kompleks
   ```

3. **Проверьте логи**:
   - В консоли браузера (F12)
   - В терминале Next.js
   - В логах PostgreSQL

4. **Обратитесь за помощью** с описанием ошибки и скриншотом

---

## 🎯 Быстрый старт

Если у вас уже установлен PostgreSQL:

1. Создайте базу: `CREATE DATABASE textil_kompleks;`
2. Создайте `.env` файл с вашими данными
3. Запустите: `npx prisma db push`
4. Заполните данными: `npm run db:seed`
5. Запустите проект: `npm run dev`

**Готово!** 🎉 Ваша база данных подключена к проекту.
