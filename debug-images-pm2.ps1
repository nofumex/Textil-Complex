# Скрипт для диагностики проблем с изображениями в PM2
Write-Host "=== Диагностика проблем с изображениями (PM2) ===" -ForegroundColor Green

# Проверяем статус PM2
Write-Host "`n1. Статус PM2:" -ForegroundColor Yellow
pm2 status

# Проверяем логи PM2
Write-Host "`n2. Последние логи PM2:" -ForegroundColor Yellow
pm2 logs --lines 10

# Проверяем права доступа к папке uploads
Write-Host "`n3. Проверка папки uploads:" -ForegroundColor Yellow
if (Test-Path "public/uploads") {
    Write-Host "✅ Папка public/uploads существует" -ForegroundColor Green
    $files = Get-ChildItem "public/uploads" -File
    Write-Host "📁 Файлов в папке: $($files.Count)" -ForegroundColor Cyan
    foreach ($file in $files) {
        Write-Host "  - $($file.Name) ($($file.Length) bytes)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Папка public/uploads не найдена!" -ForegroundColor Red
}

# Проверяем права доступа
Write-Host "`n4. Права доступа к папке uploads:" -ForegroundColor Yellow
if (Test-Path "public/uploads") {
    $acl = Get-Acl "public/uploads"
    Write-Host "Права доступа:" -ForegroundColor Cyan
    $acl.Access | ForEach-Object {
        Write-Host "  $($_.IdentityReference): $($_.FileSystemRights)" -ForegroundColor Gray
    }
}

# Проверяем конфигурацию nginx
Write-Host "`n5. Проверка nginx:" -ForegroundColor Yellow
try {
    $nginxStatus = Get-Service nginx -ErrorAction SilentlyContinue
    if ($nginxStatus) {
        Write-Host "✅ Nginx статус: $($nginxStatus.Status)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Nginx не найден как Windows сервис" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Nginx не установлен или не запущен" -ForegroundColor Yellow
}

# Проверяем доступность через HTTP
Write-Host "`n6. Проверка доступности изображений:" -ForegroundColor Yellow
$testImage = "http://89.223.122.38/uploads/1761037043711_ust46i5jju.jpg"
try {
    $response = Invoke-WebRequest -Uri $testImage -Method Head -TimeoutSec 10
    Write-Host "✅ Изображение доступно: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content-Type: $($response.Headers['Content-Type'])" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Изображение недоступно: $($_.Exception.Message)" -ForegroundColor Red
}

# Проверяем доступность через localhost
Write-Host "`n7. Проверка через localhost:" -ForegroundColor Yellow
$testImageLocal = "http://localhost:3000/uploads/1761037043711_ust46i5jju.jpg"
try {
    $response = Invoke-WebRequest -Uri $testImageLocal -Method Head -TimeoutSec 5
    Write-Host "✅ Localhost доступен: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Localhost недоступен: $($_.Exception.Message)" -ForegroundColor Red
}

# Проверяем переменные окружения
Write-Host "`n8. Переменные окружения:" -ForegroundColor Yellow
Write-Host "NODE_ENV: $($env:NODE_ENV)" -ForegroundColor Cyan
Write-Host "PORT: $($env:PORT)" -ForegroundColor Cyan

Write-Host "`n=== Диагностика завершена ===" -ForegroundColor Green
Write-Host "Возможные решения:" -ForegroundColor Yellow
Write-Host "1. Проверьте, что nginx настроен правильно" -ForegroundColor Cyan
Write-Host "2. Убедитесь, что папка uploads существует и содержит файлы" -ForegroundColor Cyan
Write-Host "3. Проверьте права доступа к папке uploads" -ForegroundColor Cyan
Write-Host "4. Перезапустите nginx: sudo systemctl restart nginx" -ForegroundColor Cyan
