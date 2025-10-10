# Руководство по импорту товаров с вариациями

## Обзор

Система импорта товаров с вариациями позволяет автоматически создавать все комбинации цветов и размеров из WordPress XML экспорта.

## Поддерживаемые форматы

- **WordPress XML (WXR)** - основной формат для импорта с вариациями
- **CSV** - для простого импорта без вариаций

## Структура данных WordPress

### Атрибуты вариаций

Система автоматически распознает следующие атрибуты:

- `pa_cvet` - цвета товара
- `pa_razmer` - размеры товара
- `product_type` - тип товара (variable для товаров с вариациями)

### Пример XML структуры

```xml
<item>
  <title>Полотенце махровое Baldric</title>
  <category domain="product_type" nicename="variable">variable</category>
  <category domain="pa_cvet" nicename="белый">Белый</category>
  <category domain="pa_cvet" nicename="синий">Синий</category>
  <category domain="pa_razmer" nicename="100x150">100x150</category>
  <category domain="pa_razmer" nicename="50x90">50x90</category>
  <wp:postmeta>
    <wp:meta_key>_sku</wp:meta_key>
    <wp:meta_value>772</wp:meta_value>
  </wp:postmeta>
  <wp:postmeta>
    <wp:meta_key>_price</wp:meta_key>
    <wp:meta_value>64</wp:meta_value>
  </wp:postmeta>
</item>
```

## Как использовать

### 1. Через админ-панель

1. Перейдите в **Админка → Товары → Импорт с вариациями**
2. Загрузите XML файл(ы) экспорта WordPress
3. Настройте параметры импорта:
   - **Валюта по умолчанию**: RUB
   - **Обновлять существующие**: да/нет
   - **Пропускать некорректные**: да/нет
   - **Автоматически создавать категории**: да/нет
   - **Создавать все комбинации вариаций**: да/нет
4. Нажмите **"Начать импорт"**

### 2. Через API

```bash
curl -X POST http://localhost:3000/api/admin/import/wordpress-variants \
  -F "files=@export.xml" \
  -F "defaultCurrency=RUB" \
  -F "updateExisting=true" \
  -F "createAllVariants=true"
```

### 3. Программно

```typescript
import { WPVariantsImporter } from '@/lib/wp-variants-import';

const importer = new WPVariantsImporter();
const result = await importer.importFromXML(xmlContent, {
  defaultCurrency: 'RUB',
  updateExisting: true,
  createAllVariants: true,
  autoCreateCategories: true,
});
```

## Результат импорта

### Создание вариаций

Для товара с:
- **10 цветов** (Белый, Бирюза, Голубой, Лиловый, Персик, Розовый, Салатовый, Серый, Синий, Сиреневый)
- **5 размеров** (100x150, 30x30, 30x60, 50x90, 70x130)

Система автоматически создаст **50 вариаций** (10 × 5 = все комбинации).

### Структура в базе данных

```sql
-- Основной товар
INSERT INTO products (sku, title, price, ...) VALUES ('772', 'Полотенце махровое Baldric', 64, ...);

-- Вариации товара
INSERT INTO product_variants (product_id, color, size, sku, price, ...) VALUES 
('product_id', 'Белый', '100x150', '772-белый-100x150', 64, ...),
('product_id', 'Белый', '30x30', '772-белый-30x30', 64, ...),
-- ... и так далее для всех 50 комбинаций
```

## Настройки импорта

### WPImportOptions

```typescript
interface WPImportOptions {
  defaultCurrency?: string;        // Валюта по умолчанию (RUB)
  updateExisting?: boolean;        // Обновлять существующие товары
  skipInvalid?: boolean;          // Пропускать некорректные товары
  categoryMapping?: Record<string, string>; // Сопоставление категорий
  autoCreateCategories?: boolean;  // Автоматически создавать категории
  createAllVariants?: boolean;     // Создавать все комбинации вариаций
}
```

### Результат импорта

```typescript
interface ImportResult {
  success: boolean;              // Успешность операции
  processed: number;             // Количество обработанных товаров
  created: number;               // Количество созданных товаров
  updated: number;               // Количество обновленных товаров
  variantsCreated: number;       // Количество созданных вариаций
  errors: string[];             // Ошибки
  warnings: string[];            // Предупреждения
}
```

## Примеры использования

### Простой импорт

```typescript
const importer = new WPVariantsImporter();
const result = await importer.importFromXML(xmlContent);

console.log(`Создано товаров: ${result.created}`);
console.log(`Создано вариаций: ${result.variantsCreated}`);
```

### Импорт с обновлением

```typescript
const result = await importer.importFromXML(xmlContent, {
  updateExisting: true,
  createAllVariants: true,
  autoCreateCategories: true,
});
```

### Импорт с сопоставлением категорий

```typescript
const result = await importer.importFromXML(xmlContent, {
  categoryMapping: {
    'Полотенце махровое': 'category-id-1',
    'Постельное белье': 'category-id-2',
  },
});
```

## Устранение неполадок

### Частые ошибки

1. **"Категория не найдена"**
   - Включите `autoCreateCategories: true`
   - Или создайте категории заранее

2. **"Некорректная цена"**
   - Проверьте формат цен в XML
   - Используйте точку как разделитель десятичных

3. **"Дублирование SKU"**
   - Включите `updateExisting: true`
   - Или проверьте уникальность SKU в исходных данных

### Логи и отладка

```typescript
const result = await importer.importFromXML(xmlContent);

if (!result.success) {
  console.error('Ошибки импорта:', result.errors);
}

if (result.warnings.length > 0) {
  console.warn('Предупреждения:', result.warnings);
}
```

## Производительность

- **Рекомендуемый размер файла**: до 20MB
- **Время импорта**: ~1-2 секунды на 100 товаров
- **Память**: ~50MB на 1000 товаров с вариациями

## Безопасность

- Все операции требуют прав администратора
- Валидация всех входящих данных
- Защита от SQL-инъекций через Prisma ORM
- Ограничение размера файлов

## Поддержка

При возникновении проблем:

1. Проверьте логи в консоли браузера
2. Убедитесь в корректности XML структуры
3. Проверьте права доступа к базе данных
4. Обратитесь к разработчику с описанием ошибки
