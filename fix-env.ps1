# Скрипт для исправления переменных окружения
Write-Host "Исправление переменных окружения..." -ForegroundColor Green

# Создаем резервную копию
Copy-Item ".env" ".env.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# Обновляем .env файл
$envContent = @"
# Database
DATABASE_URL="postgresql://neondb_owner:npg_sHufI5Smi6Qk@ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech/textil_kompleks?sslmode=require&channel_binding=require"
DIRECT_URL="postgresql://neondb_owner:npg_sHufI5Smi6Qk@ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech/textil_kompleks?sslmode=require&channel_binding=require"

# NextAuth
NEXTAUTH_SECRET="textil-kompleks-secret-key-2024-min-32-chars"
NEXTAUTH_URL="http://89.223.122.38:3000"

# Site Configuration
SITE_URL="http://89.223.122.38:3000"
SITE_NAME="Текстиль Комплекс"
NODE_ENV=production

# JWT
JWT_SECRET="textil-kompleks-jwt-secret-key-2024-min-32"
JWT_REFRESH_SECRET="textil-kompleks-refresh-secret-key-2024-min-32"

# Admin
ADMIN_EMAIL="za-bol@yandex.ru"
ADMIN_PASSWORD="mFskc,wAkgDjw)dHA(AF;79lYmu2"

# Upload
UPLOAD_DIR="./public/uploads"
MAX_FILE_SIZE=5242880

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
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8

Write-Host "Переменные окружения обновлены!" -ForegroundColor Green
Write-Host "Теперь перезапустите приложение:" -ForegroundColor Yellow
Write-Host "pm2 restart textil-kompleks" -ForegroundColor Cyan
