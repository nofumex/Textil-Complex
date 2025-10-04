# Текстиль Комплекс - Интернет-магазин постельных принадлежностей

Современный интернет-магазин для продажи постельных принадлежностей с админ-панелью.

## 🚀 Технологии

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **UI**: Lucide React, Custom Components

## 📋 Возможности

- 🛍️ Каталог товаров с фильтрацией
- 🛒 Корзина покупок
- 👤 Система пользователей и регистрации
- 🔐 Админ-панель для управления
- 📊 Аналитика и отчеты
- 📱 Адаптивный дизайн

## 🛠️ Установка и запуск

### Предварительные требования

- Node.js 18+ 
- PostgreSQL 14+
- npm или yarn

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-username/tekstil-complex.git
cd tekstil-complex
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка базы данных

Создайте файл `.env` на основе `.env.example`:

```bash
cp env.example .env
```

Отредактируйте `.env` файл:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/textil_kompleks"
DIRECT_URL="postgresql://username:password@localhost:5432/textil_kompleks"
NEXTAUTH_SECRET="your-secret-key"
JWT_SECRET="your-jwt-secret"
```

### 4. Создание и наполнение базы данных

```bash
# Применить миграции
npx prisma migrate dev

# Заполнить тестовыми данными
npx tsx src/lib/seed.ts
```

### 5. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## 👥 Тестовые аккаунты

После выполнения seed скрипта будут созданы:

- **Администратор**: admin@textil-kompleks.ru / admin123
- **Клиент**: customer@example.com / customer123

## 📁 Структура проекта

```
src/
├── app/                 # Next.js App Router
│   ├── admin/          # Админ-панель
│   ├── api/            # API endpoints
│   └── (pages)/        # Публичные страницы
├── components/         # React компоненты
├── lib/               # Утилиты и конфигурация
├── store/             # Zustand store
└── types/             # TypeScript типы
```

## 🗄️ База данных

Проект использует PostgreSQL с Prisma ORM. Схема базы данных определена в `prisma/schema.prisma`.

### Основные таблицы:
- `users` - пользователи
- `products` - товары
- `categories` - категории
- `orders` - заказы
- `reviews` - отзывы

## 🚀 Деплой

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Подключите базу данных (Vercel Postgres)

### Другие платформы

- **Railway**: Автоматический деплой с PostgreSQL
- **Render**: Бесплатный хостинг с БД
- **DigitalOcean**: VPS с собственной БД

## 📝 Скрипты

```bash
npm run dev          # Запуск в режиме разработки
npm run build        # Сборка для продакшена
npm run start        # Запуск продакшен версии
npm run lint         # Проверка кода
npm run test         # Запуск тестов
```

## 🤝 Участие в разработке

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

MIT License

## 📞 Контакты

- Email: info@textil-kompleks.ru
- Телефон: +7 (495) 123-45-67