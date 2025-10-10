# Руководство по системе вариаций товаров

## Обзор

Система вариаций товаров позволяет создавать различные варианты одного товара с разными цветами, размерами, материалами и ценами. Это особенно полезно для текстильных товаров, где один и тот же продукт может иметь множество вариантов.

## Структура базы данных

### Таблица `product_variants`

```sql
CREATE TABLE product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT,
  color TEXT,
  material TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  sku TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Обновленная таблица `order_items`

```sql
ALTER TABLE order_items ADD COLUMN variant_id TEXT REFERENCES product_variants(id);
ALTER TABLE order_items ADD COLUMN selected_color TEXT;
ALTER TABLE order_items ADD COLUMN selected_size TEXT;
```

## API Endpoints

### Управление вариациями товара

#### GET `/api/admin/products/[slug]/variants`
Получить все вариации товара

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "variant_id",
      "productId": "product_id",
      "size": "50x70",
      "color": "Белый",
      "material": "Хлопок",
      "price": 1500.00,
      "stock": 10,
      "sku": "PROD-50x70-WHITE",
      "isActive": true
    }
  ]
}
```

#### POST `/api/admin/products/[slug]/variants`
Создать новую вариацию

**Тело запроса:**
```json
{
  "size": "50x70",
  "color": "Белый",
  "material": "Хлопок",
  "price": 1500.00,
  "stock": 10,
  "sku": "PROD-50x70-WHITE",
  "isActive": true
}
```

#### PUT `/api/admin/products/[slug]/variants/[variantId]`
Обновить вариацию

#### DELETE `/api/admin/products/[slug]/variants/[variantId]`
Удалить вариацию

### Получение товара с вариациями

#### GET `/api/products/[slug]`
Получить товар с вариациями (для публичного API)

**Ответ включает:**
```json
{
  "success": true,
  "data": {
    "id": "product_id",
    "title": "Название товара",
    "price": 1000.00,
    "variants": [
      {
        "id": "variant_id",
        "size": "50x70",
        "color": "Белый",
        "price": 1500.00,
        "stock": 10,
        "sku": "PROD-50x70-WHITE",
        "isActive": true
      }
    ]
  }
}
```

## Frontend компоненты

### ProductVariants

Компонент для выбора вариаций товара на странице товара.

**Использование:**
```tsx
import ProductVariants from '@/components/product/product-variants';

<ProductVariants
  variants={product.variants}
  basePrice={Number(product.price)}
  onVariantChange={(variant, price) => {
    setSelectedVariant(variant);
    setCurrentPrice(price);
  }}
/>
```

**Функциональность:**
- Автоматический выбор первого доступного варианта
- Фильтрация размеров по выбранному цвету
- Фильтрация цветов по выбранному размеру
- Отображение цен с учетом вариаций
- Показ наличия товара
- Блокировка недоступных вариантов

### ProductVariantsManager

Компонент для управления вариациями в админ-панели.

**Использование:**
```tsx
import ProductVariantsManager from '@/components/admin/product-variants-manager';

<ProductVariantsManager
  productSlug={product.slug}
  initialVariants={variants}
  onVariantsUpdate={setVariants}
/>
```

**Функциональность:**
- Просмотр всех вариаций товара
- Добавление новых вариаций
- Редактирование существующих вариаций
- Удаление вариаций
- Валидация данных

## Импорт данных из WordPress

### Скрипт импорта

Используйте скрипт `scripts/import-wordpress-variants.ts` для импорта вариаций из WordPress XML.

**Запуск:**
```bash
npx tsx scripts/import-wordpress-variants.ts
```

**Что делает скрипт:**
1. Парсит XML файлы WordPress в корне проекта
2. Извлекает данные о товарах, цветах, размерах и ценах
3. Группирует товары по названию
4. Создает основные товары и их вариации
5. Обновляет общие остатки товаров

**Формат XML (пример):**
```xml
<item>
  <title><![CDATA[Полотенце махровое Baldric!]]></title>
  <wp:post_id>1519</wp:post_id>
  <category domain="pa_razmer" nicename="70x130"><![CDATA[70x130]]></category>
  <category domain="pa_cvet" nicename="%d1%81%d0%b8%d0%bd%d0%b8%d0%b9"><![CDATA[Синий]]></category>
  <wp:postmeta><wp:meta_key><![CDATA[_sku]]></wp:meta_key><wp:meta_value><![CDATA[772]]></wp:meta_value></wp:postmeta>
  <wp:postmeta><wp:meta_key><![CDATA[_price]]></wp:meta_key><wp:meta_value><![CDATA[64]]></wp:meta_value></wp:postmeta>
</item>
```

## Работа с корзиной

### Добавление товара с вариацией в корзину

```tsx
const handleAddToCart = () => {
  const itemToAdd = {
    ...product,
    price: selectedVariant ? Number(selectedVariant.price) : Number(product.price),
    variantId: selectedVariant?.id,
    selectedColor: selectedVariant?.color,
    selectedSize: selectedVariant?.size,
  };
  
  addItem(itemToAdd, 1);
};
```

### Структура элемента корзины

```typescript
interface CartItem {
  id: string;
  productId: string;
  variantId?: string;        // ID вариации
  quantity: number;
  price: number;             // Цена с учетом вариации
  product: Product;
  selectedColor?: string;    // Выбранный цвет
  selectedSize?: string;     // Выбранный размер
}
```

## Создание заказов

### API создания заказа

При создании заказа система автоматически:
1. Проверяет наличие выбранной вариации
2. Использует цену вариации вместо базовой цены товара
3. Обновляет остатки вариации
4. Сохраняет информацию о выбранных атрибутах

**Формат товара в заказе:**
```json
{
  "productId": "product_id",
  "variantId": "variant_id",      // Опционально
  "quantity": 2,
  "selectedColor": "Белый",       // Опционально
  "selectedSize": "50x70"         // Опционально
}
```

## Тестирование

### Скрипты для тестирования

1. **`scripts/test-variants.ts`** - Тестирует базовую функциональность вариаций
2. **`scripts/check-imported-products.ts`** - Проверяет импортированные товары
3. **`scripts/test-variants-system.ts`** - Комплексное тестирование системы

**Запуск тестов:**
```bash
npx tsx scripts/test-variants-system.ts
```

## Лучшие практики

### 1. Создание вариаций

- Используйте уникальные SKU для каждой вариации
- Группируйте вариации логически (по цвету, затем по размеру)
- Устанавливайте разумные цены с учетом базовой цены товара

### 2. Управление остатками

- Регулярно обновляйте остатки вариаций
- Используйте автоматическое обновление общего остатка товара
- Отслеживайте товары с нулевыми остатками

### 3. UX для пользователей

- Показывайте доступные варианты в зависимости от выбора
- Отображайте цены с учетом вариаций
- Блокируйте недоступные варианты
- Предоставляйте четкую информацию о наличии

### 4. Администрирование

- Используйте админ-панель для управления вариациями
- Регулярно проверяйте корректность данных
- Создавайте резервные копии перед массовыми изменениями

## Устранение неполадок

### Частые проблемы

1. **Вариации не отображаются на странице товара**
   - Проверьте, что `isActive: true` для вариаций
   - Убедитесь, что товар имеет вариации в базе данных

2. **Цены не обновляются при выборе вариации**
   - Проверьте функцию `onVariantChange` в компоненте
   - Убедитесь, что цена вариации корректно передается

3. **Ошибки при создании заказа с вариацией**
   - Проверьте наличие вариации в базе данных
   - Убедитесь, что остаток вариации больше 0

4. **Проблемы с импортом из WordPress**
   - Проверьте формат XML файла
   - Убедитесь, что все необходимые поля присутствуют
   - Проверьте кодировку файла (должна быть UTF-8)

### Логи и отладка

Включите логирование в Prisma для отслеживания запросов:
```typescript
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

## Заключение

Система вариаций товаров полностью интегрирована в ваш интернет-магазин и готова к использованию. Она поддерживает:

- ✅ Создание и управление вариациями товаров
- ✅ Импорт данных из WordPress
- ✅ Динамическое изменение цен
- ✅ Управление остатками по вариациям
- ✅ Интеграцию с корзиной и заказами
- ✅ Админ-панель для управления
- ✅ Адаптивный интерфейс для пользователей

Система протестирована и готова к продакшену.
