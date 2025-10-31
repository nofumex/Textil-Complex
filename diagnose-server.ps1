# Диагностический скрипт для проверки состояния сервера
Write-Host "🔍 Диагностика проблем с админ-панелью..." -ForegroundColor Green

Write-Host "`n1. Проверка переменных окружения..." -ForegroundColor Yellow
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "SITE_URL: $env:SITE_URL"
Write-Host "NEXTAUTH_URL: $env:NEXTAUTH_URL"

Write-Host "`n2. Проверка файлов..." -ForegroundColor Yellow
$files = @(
    "src/app/api/auth/login/route.ts",
    "src/app/api/auth/refresh/route.ts", 
    "src/app/api/orders/route.ts",
    "src/lib/auth.ts",
    "next.config.js"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file - существует" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - НЕ НАЙДЕН!" -ForegroundColor Red
    }
}

Write-Host "`n3. Проверка синтаксиса TypeScript..." -ForegroundColor Yellow
try {
    npx tsc --noEmit --skipLibCheck
    Write-Host "✅ Синтаксис TypeScript корректен" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибки в TypeScript коде:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n4. Проверка подключения к базе данных..." -ForegroundColor Yellow
try {
    npx prisma db pull --preview-feature
    Write-Host "✅ Подключение к БД работает" -ForegroundColor Green
} catch {
    Write-Host "❌ Проблемы с подключением к БД:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n5. Рекомендации по исправлению:" -ForegroundColor Cyan
Write-Host "- Убедитесь, что сервер перезапущен после замены файлов"
Write-Host "- Проверьте логи сервера: pm2 logs textil-kompleks"
Write-Host "- Очистите кэш браузера (Ctrl+Shift+R)"
Write-Host "- Проверьте, что все переменные окружения установлены правильно"

Write-Host "`n6. Команды для перезапуска:" -ForegroundColor Cyan
Write-Host "pm2 restart textil-kompleks"
Write-Host "pm2 logs textil-kompleks --lines 50"
