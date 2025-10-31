# Скрипт для диагностики проблем с изображениями
Write-Host "=== Диагностика проблем с изображениями ===" -ForegroundColor Green

# Проверяем Docker контейнеры
Write-Host "`n1. Проверка Docker контейнеров:" -ForegroundColor Yellow
docker ps

# Проверяем volumes
Write-Host "`n2. Проверка Docker volumes:" -ForegroundColor Yellow
docker volume ls

# Проверяем содержимое папки uploads в контейнере
Write-Host "`n3. Проверка содержимого папки uploads в контейнере app:" -ForegroundColor Yellow
docker exec -it tk-deploy-app-1 ls -la /app/public/uploads/ 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Контейнер app не найден или не запущен" -ForegroundColor Red
    Write-Host "Попробуйте запустить: docker-compose up -d" -ForegroundColor Yellow
}

# Проверяем содержимое папки uploads в контейнере nginx
Write-Host "`n4. Проверка содержимого папки uploads в контейнере nginx:" -ForegroundColor Yellow
docker exec -it tk-deploy-nginx-1 ls -la /app/public/uploads/ 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Контейнер nginx не найден или не запущен" -ForegroundColor Red
}

# Проверяем права доступа
Write-Host "`n5. Проверка прав доступа к папке uploads:" -ForegroundColor Yellow
docker exec -it tk-deploy-app-1 ls -la /app/public/ 2>$null

# Проверяем конфигурацию nginx
Write-Host "`n6. Проверка конфигурации nginx:" -ForegroundColor Yellow
docker exec -it tk-deploy-nginx-1 cat /etc/nginx/nginx.conf | Select-String -Pattern "uploads" -Context 2

# Проверяем доступность изображений через HTTP
Write-Host "`n7. Проверка доступности изображений через HTTP:" -ForegroundColor Yellow
$testImage = "http://89.223.122.38/uploads/1761037043711_ust46i5jju.jpg"
try {
    $response = Invoke-WebRequest -Uri $testImage -Method Head -TimeoutSec 10
    Write-Host "Изображение доступно: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Изображение недоступно: $($_.Exception.Message)" -ForegroundColor Red
}

# Проверяем логи nginx
Write-Host "`n8. Последние логи nginx:" -ForegroundColor Yellow
docker logs tk-deploy-nginx-1 --tail 20

# Проверяем логи app
Write-Host "`n9. Последние логи app:" -ForegroundColor Yellow
docker logs tk-deploy-app-1 --tail 20

Write-Host "`n=== Диагностика завершена ===" -ForegroundColor Green
Write-Host "Если изображения все еще не загружаются, попробуйте:" -ForegroundColor Yellow
Write-Host "1. docker-compose down" -ForegroundColor Cyan
Write-Host "2. docker-compose up -d --build" -ForegroundColor Cyan
Write-Host "3. Проверьте, что папка uploads существует и содержит файлы" -ForegroundColor Cyan
