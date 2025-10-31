# Скрипт для проверки изображений в базе данных
Write-Host "=== Проверка изображений в базе данных ===" -ForegroundColor Green

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
}

# Проверяем товары с изображениями
Write-Host "`n2. Проверка товаров с изображениями..." -ForegroundColor Yellow
try {
    $imagesQuery = "SELECT id, title, images FROM products WHERE array_length(images, 1) > 0 LIMIT 10;"
    $productsWithImages = psql -h ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d textil_kompleks -t -c $imagesQuery
    Write-Host "Товары с изображениями:" -ForegroundColor Cyan
    Write-Host $productsWithImages -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при получении товаров с изображениями" -ForegroundColor Red
}

# Проверяем товары без изображений
Write-Host "`n3. Проверка товаров без изображений..." -ForegroundColor Yellow
try {
    $noImagesQuery = "SELECT COUNT(*) as no_images FROM products WHERE images IS NULL OR array_length(images, 1) IS NULL;"
    $noImagesCount = psql -h ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d textil_kompleks -t -c $noImagesQuery
    Write-Host "Товаров без изображений: $($noImagesCount.Trim())" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Ошибка при проверке товаров без изображений" -ForegroundColor Red
}

# Проверяем hero изображения
Write-Host "`n4. Проверка hero изображений..." -ForegroundColor Yellow
try {
    $heroQuery = "SELECT id, url, alt FROM hero_images WHERE is_active = true ORDER BY \"order\";"
    $heroImages = psql -h ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d textil_kompleks -t -c $heroQuery
    Write-Host "Hero изображения:" -ForegroundColor Cyan
    Write-Host $heroImages -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при получении hero изображений" -ForegroundColor Red
}

# Проверяем вариации товаров с изображениями
Write-Host "`n5. Проверка вариаций товаров с изображениями..." -ForegroundColor Yellow
try {
    $variantsQuery = "SELECT pv.id, p.title, pv.image_url FROM product_variants pv JOIN products p ON pv.product_id = p.id WHERE pv.image_url IS NOT NULL LIMIT 10;"
    $variantsWithImages = psql -h ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d textil_kompleks -t -c $variantsQuery
    Write-Host "Вариации с изображениями:" -ForegroundColor Cyan
    Write-Host $variantsWithImages -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при получении вариаций с изображениями" -ForegroundColor Red
}

# Проверяем примеры путей к изображениям
Write-Host "`n6. Примеры путей к изображениям в БД..." -ForegroundColor Yellow
try {
    $sampleQuery = "SELECT images FROM products WHERE array_length(images, 1) > 0 LIMIT 5;"
    $sampleImages = psql -h ep-misty-grass-a1p36e6k-pooler.ap-southeast-1.aws.neon.tech -U neondb_owner -d textil_kompleks -t -c $sampleQuery
    Write-Host "Примеры путей:" -ForegroundColor Cyan
    Write-Host $sampleImages -ForegroundColor Gray
} catch {
    Write-Host "❌ Ошибка при получении примеров изображений" -ForegroundColor Red
}

Write-Host "`n=== Проверка завершена ===" -ForegroundColor Green
Write-Host "Если изображения есть в БД, но не отображаются, проблема в настройках nginx или путях" -ForegroundColor Yellow
