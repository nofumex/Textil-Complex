# Скрипт для исправления CORS проблем
Write-Host "🔧 Исправление CORS проблем..." -ForegroundColor Green

Write-Host "`n1. Проблема найдена:" -ForegroundColor Red
Write-Host "CORS настройки указывают на старый домен: http://xn----itbbkjcbecjvntkbd6o.xn--p1ai/"
Write-Host "А должны указывать на: http://89.223.122.38:3000"

Write-Host "`n2. Решение:" -ForegroundColor Yellow
Write-Host "Нужно обновить переменные окружения на сервере:"
Write-Host "SITE_URL=http://89.223.122.38:3000"
Write-Host "NEXTAUTH_URL=http://89.223.122.38:3000"

Write-Host "`n3. Команды для исправления на сервере:" -ForegroundColor Cyan
Write-Host "export SITE_URL=http://89.223.122.38:3000"
Write-Host "export NEXTAUTH_URL=http://89.223.122.38:3000"
Write-Host "pm2 restart tk-site"

Write-Host "`n4. Или обновите файл .env на сервере:" -ForegroundColor Cyan
Write-Host "SITE_URL=http://89.223.122.38:3000"
Write-Host "NEXTAUTH_URL=http://89.223.122.38:3000"

Write-Host "`n5. После обновления переменных:" -ForegroundColor Green
Write-Host "- Перезапустите приложение: pm2 restart tk-site"
Write-Host "- Очистите кэш браузера (Ctrl+Shift+R)"
Write-Host "- Попробуйте войти в админ-панель снова"

