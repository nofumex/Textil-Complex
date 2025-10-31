# Скрипт для исправления проблем с изображениями
Write-Host "=== Исправление проблем с изображениями ===" -ForegroundColor Green

# Останавливаем контейнеры
Write-Host "`n1. Остановка контейнеров..." -ForegroundColor Yellow
docker-compose down

# Удаляем старые volumes (осторожно!)
Write-Host "`n2. Очистка старых volumes..." -ForegroundColor Yellow
docker volume rm tk-deploy_uploads 2>$null
Write-Host "Volume uploads удален (если существовал)" -ForegroundColor Green

# Создаем папку uploads локально
Write-Host "`n3. Создание локальной папки uploads..." -ForegroundColor Yellow
if (!(Test-Path "public/uploads")) {
    New-Item -ItemType Directory -Path "public/uploads" -Force
    Write-Host "Папка public/uploads создана" -ForegroundColor Green
} else {
    Write-Host "Папка public/uploads уже существует" -ForegroundColor Green
}

# Копируем существующие изображения
Write-Host "`n4. Копирование существующих изображений..." -ForegroundColor Yellow
if (Test-Path "public/uploads") {
    $files = Get-ChildItem "public/uploads" -File
    Write-Host "Найдено файлов в uploads: $($files.Count)" -ForegroundColor Cyan
    foreach ($file in $files) {
        Write-Host "  - $($file.Name)" -ForegroundColor Gray
    }
} else {
    Write-Host "Папка uploads пуста" -ForegroundColor Yellow
}

# Пересобираем и запускаем контейнеры
Write-Host "`n5. Пересборка и запуск контейнеров..." -ForegroundColor Yellow
docker-compose up -d --build

# Ждем запуска
Write-Host "`n6. Ожидание запуска сервисов..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Проверяем статус
Write-Host "`n7. Проверка статуса контейнеров..." -ForegroundColor Yellow
docker ps

# Проверяем доступность изображений
Write-Host "`n8. Проверка доступности изображений..." -ForegroundColor Yellow
$testImage = "http://89.223.122.38/uploads/1761037043711_ust46i5jju.jpg"
try {
    $response = Invoke-WebRequest -Uri $testImage -Method Head -TimeoutSec 10
    Write-Host "✅ Изображение доступно: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Изображение недоступно: $($_.Exception.Message)" -ForegroundColor Red
}

# Проверяем содержимое папки uploads в контейнере
Write-Host "`n9. Проверка содержимого папки uploads в контейнере..." -ForegroundColor Yellow
docker exec -it tk-deploy-app-1 ls -la /app/public/uploads/ 2>$null

Write-Host "`n=== Исправление завершено ===" -ForegroundColor Green
Write-Host "Если проблемы остались, запустите debug-images.ps1 для диагностики" -ForegroundColor Yellow
