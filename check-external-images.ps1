# Скрипт для проверки реальных URL'ов изображений в БД
Write-Host "=== Проверка URL'ов изображений в базе данных ===" -ForegroundColor Green

# Проверяем подключение к базе данных
Write-Host "`n1. Проверка подключения к базе данных..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "npg_sHufI5Smi6Qk"
    $dbQuery = "SELECT COUNT(*) as total_products FROM products;"
    $result = psql -h ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d textil_kompleks -t -c $dbQuery
    Write-Host "✅ Подключение к БД успешно. Всего товаров: $($result.Trim())" -ForegroundColor Green
} catch {
    Write-Host "❌ Ошибка подключения к БД: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Проверьте переменные окружения DATABASE_URL" -ForegroundColor Yellow
    exit 1
}

# Проверяем примеры URL'ов изображений
Write-Host "`n2. Примеры URL'ов изображений в БД:" -ForegroundColor Yellow
try {
    $imagesQuery = "SELECT id, title, images FROM products WHERE array_length(images, 1) > 0 LIMIT 5;"
    $productsWithImages = psql -h ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d textil_kompleks -t -c $imagesQuery
    Write-Host "Товары с изображениями:" -ForegroundColor Cyan
    Write-Host $productsWithImages -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при получении товаров с изображениями" -ForegroundColor Red
}

# Проверяем конкретные URL'ы изображений
Write-Host "`n3. Проверка доступности внешних изображений:" -ForegroundColor Yellow
try {
    $urlQuery = "SELECT unnest(images) as image_url FROM products WHERE array_length(images, 1) > 0 LIMIT 3;"
    $imageUrls = psql -h ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d textil_kompleks -t -c $urlQuery
    
    $urls = $imageUrls -split "`n" | Where-Object { $_.Trim() -ne "" }
    
    foreach ($url in $urls) {
        $cleanUrl = $url.Trim()
        if ($cleanUrl) {
            Write-Host "`nПроверяем: $cleanUrl" -ForegroundColor Cyan
            try {
                $response = Invoke-WebRequest -Uri $cleanUrl -Method Head -TimeoutSec 10
                Write-Host "✅ Доступно: $($response.StatusCode)" -ForegroundColor Green
            } catch {
                Write-Host "❌ Недоступно: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
} catch {
    Write-Host "❌ Ошибка при проверке URL'ов изображений" -ForegroundColor Red
}

# Проверяем hero изображения
Write-Host "`n4. Проверка hero изображений:" -ForegroundColor Yellow
try {
    $heroQuery = "SELECT id, url, alt FROM hero_images WHERE is_active = true ORDER BY `"order`";"
    $heroImages = psql -h ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d textil_kompleks -t -c $heroQuery
    Write-Host "Hero изображения:" -ForegroundColor Cyan
    Write-Host $heroImages -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при получении hero изображений" -ForegroundColor Red
}

# Проверяем вариации товаров с изображениями
Write-Host "`n5. Проверка вариаций товаров с изображениями:" -ForegroundColor Yellow
try {
    $variantsQuery = "SELECT pv.id, p.title, pv.image_url FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE pv.image_url IS NOT NULL LIMIT 5;"
    $variantsWithImages = psql -h ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d textil_kompleks -t -c $variantsQuery
    Write-Host "Вариации с изображениями:" -ForegroundColor Cyan
    Write-Host $variantsWithImages -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при получении вариаций с изображениями" -ForegroundColor Red
}

Write-Host "`n=== Проверка завершена ===" -ForegroundColor Green
Write-Host "Если внешние изображения недоступны, нужно настроить nginx для проксирования" -ForegroundColor Yellow
