# Скрипт для диагностики проблем с аутентификацией
Write-Host "🔍 Диагностика аутентификации админ-панели..." -ForegroundColor Green

Write-Host "`n1. Проверка переменных окружения..." -ForegroundColor Yellow
Write-Host "NODE_ENV: $env:NODE_ENV"
Write-Host "SITE_URL: $env:SITE_URL"
Write-Host "NEXTAUTH_URL: $env:NEXTAUTH_URL"
Write-Host "JWT_SECRET: $(if($env:JWT_SECRET) {'установлен'} else {'НЕ УСТАНОВЛЕН'})"
Write-Host "JWT_REFRESH_SECRET: $(if($env:JWT_REFRESH_SECRET) {'установлен'} else {'НЕ УСТАНОВЛЕН'})"

Write-Host "`n2. Проверка файлов аутентификации..." -ForegroundColor Yellow
$authFiles = @(
    "src/app/api/auth/login/route.ts",
    "src/app/api/auth/refresh/route.ts",
    "src/app/api/auth/me/route.ts",
    "src/lib/auth.ts",
    "src/components/admin/admin-layout.tsx",
    "src/store/auth.ts"
)

foreach ($file in $authFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file - существует" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - НЕ НАЙДЕН!" -ForegroundColor Red
    }
}

Write-Host "`n3. Проверка синтаксиса TypeScript..." -ForegroundColor Yellow
try {
    npx tsc --noEmit --skipLibCheck 2>&1 | Out-String | Write-Host
    Write-Host "✅ Синтаксис TypeScript корректен" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибки в TypeScript коде:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}

Write-Host "`n4. Проверка подключения к API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://89.223.122.38:3000/api/health" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API сервер доступен" -ForegroundColor Green
    } else {
        Write-Host "⚠️ API сервер отвечает с кодом: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ API сервер недоступен: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5. Проверка аутентификации..." -ForegroundColor Yellow
try {
    $authResponse = Invoke-WebRequest -Uri "http://89.223.122.38:3000/api/auth/me" -Method GET -TimeoutSec 10
    Write-Host "Статус /api/auth/me: $($authResponse.StatusCode)" -ForegroundColor $(if($authResponse.StatusCode -eq 200) {'Green'} else {'Yellow'})
} catch {
    Write-Host "❌ Ошибка проверки /api/auth/me: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n6. Рекомендации:" -ForegroundColor Cyan
Write-Host "- Убедитесь, что сервер перезапущен: pm2 restart textil-kompleks"
Write-Host "- Проверьте логи: pm2 logs textil-kompleks --lines 50"
Write-Host "- Очистите кэш браузера (Ctrl+Shift+R)"
Write-Host "- Проверьте cookies в DevTools (F12 -> Application -> Cookies)"

Write-Host "`n7. Команды для исправления:" -ForegroundColor Cyan
Write-Host "pm2 restart textil-kompleks"
Write-Host "pm2 logs textil-kompleks --lines 50"
Write-Host "npm run build"
