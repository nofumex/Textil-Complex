# Система вариаций товаров

## Обзор

Система вариаций товаров позволяет создавать товары с различными цветами, размерами и ценами. Каждая вариация может иметь свой SKU, цену и количество на складе.

## Структура базы данных

### Таблица `product_variants`

```sql
CREATE TABLE product_variants (
  id VARCHAR PRIMARY KEY,
  product_id VARCHAR NOT NULL REFERENCES products(id),
  color VARCHAR,
  size VARCHAR,
  material VARCHAR,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  sku VARCHAR UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Импорт из WordPress

### Поддерживаемые атрибуты

Система автоматически извлекает следующие атрибуты из WordPress XML:

- **Цвет**: `pa_cvet` (product attribute color)
- **Размер**: `pa_razmer` (product attribute size)
- **Материал**: `pa_material` (product attribute material)

### Пример XML структуры

```xml
<item>
  <title><![CDATA[Полотенце махровое Baldric!]]></title>
  <wp:post_id>1519</wp:post_id>
  <category domain="pa_razmer" nicename="70x130"><![CDATA[70x130]]></category>
  <category domain="pa_cvet" nicename="%d1%81%d0%b8%d0%bd%d0%b8%d0%b9"><![CDATA[Синий]]></category>
  <wp:postmeta><wp:meta_key><![CDATA[_sku]]></wp:meta_key><wp:meta_value><![CDATA[772]]></wp:meta_value></wp:postmeta>
  <wp:postmeta><wp:meta_key><![CDATA[_price]]></wp:meta_key><wp:meta_value><![CDATA[64]]></wp:meta_value></wp:postmeta>
  <wp:postmeta><wp:meta_key><![CDATA[_stock]]></wp:meta_key><wp:meta_value><![CDATA[10]]></wp:meta_value></wp:postmeta>
</item>
```

## API Endpoints

### Получение товара с вариациями

```
GET /api/products/{slug}
```

Возвращает товар со всеми активными вариациями.

### Получение информации о вариации

```
GET /api/products/{slug}/variant?color={color}&size={size}
```

Параметры:
- `color` (опционально) - цвет вариации
- `size` (опционально) - размер вариации

Возвращает информацию о конкретной вариации: цену, наличие, SKU.

## Frontend компоненты

### ProductVariants

Компонент для выбора цвета и размера товара.

```tsx
<ProductVariants
  variants={product.variants}
  basePrice={product.price}
  productSlug={product.slug}
  onVariantChange={handleVariantChange}
/>
```

### ProductActions

Компонент для добавления товара в корзину с учетом выбранной вариации.

```tsx
<ProductActions
  product={product}
  selectedVariant={selectedVariant}
  selectedColor={selectedColor}
  selectedSize={selectedSize}
/>
```

## Использование

### 1. Импорт товаров с вариациями

```bash
# Запуск импорта из WordPress XML
npm run import:wordpress

# Или через скрипт
npx tsx scripts/import-wordpress-variants.ts
```

### 2. Тестирование системы

```bash
# Тестирование системы вариаций
npx tsx scripts/test-variants-system.ts

# Тестирование API
npx tsx scripts/test-variants-api.ts
```

### 3. Проверка данных

```bash
# Проверка импортированных товаров
npx tsx scripts/check-imported-products.ts
```

## Особенности

### Фильтрация цветов

Система автоматически фильтрует цвета, исключая категорийные значения:

- "пестротканное"
- "пестротканые" 
- "гладкокрашеное"
- "гладкокрашеные"

### Динамическое обновление цены

При выборе цвета или размера цена обновляется автоматически через API без перезагрузки страницы.

### Корзина с вариациями

Корзина поддерживает товары с вариациями, отображая выбранный цвет и размер для каждого товара.

### Проверка наличия

Система проверяет наличие товара для выбранной комбинации цвета и размера, показывая статус "В наличии" или "Нет в наличии".

## Администрирование

### Создание вариаций через админку

1. Перейдите в админку: `/admin/products`
2. Выберите товар для редактирования
3. В разделе "Вариации" добавьте новые варианты
4. Укажите цвет, размер, цену и количество на складе

### Массовое управление вариациями

```bash
# Очистка некорректных цветов
npx tsx scripts/clean-variant-colors.ts

# Исправление цветов
npx tsx scripts/fix-variant-colors.ts
```

## Troubleshooting

### Проблемы с импортом

1. Убедитесь, что XML файл содержит правильную структуру
2. Проверьте кодировку файла (должна быть UTF-8)
3. Убедитесь, что атрибуты имеют правильные домены (`pa_cvet`, `pa_razmer`)

### Проблемы с отображением

1. Проверьте, что товар имеет активные вариации
2. Убедитесь, что API endpoint работает корректно
3. Проверьте консоль браузера на наличие ошибок JavaScript

### Проблемы с корзиной

1. Убедитесь, что выбранная вариация существует
2. Проверьте, что товар в наличии
3. Убедитесь, что SKU вариации уникален

## Мониторинг

### Логи

Система логирует все операции с вариациями:
- Создание новых вариаций
- Обновление существующих
- Ошибки импорта
- API запросы

### Метрики

Отслеживайте следующие метрики:
- Количество товаров с вариациями
- Количество активных вариаций
- Популярные цвета и размеры
- Конверсия по вариациям