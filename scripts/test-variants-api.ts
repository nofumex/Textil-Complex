import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testVariantsAPI() {
  console.log('🧪 Тестирование API вариаций товаров...\n');

  try {
    // 1. Находим товар с вариациями
    const productWithVariants = await prisma.product.findFirst({
      where: {
        variants: {
          some: {}
        }
      },
      include: {
        variants: true
      }
    });

    if (!productWithVariants) {
      console.log('❌ Товары с вариациями не найдены. Сначала запустите импорт.');
      return;
    }

    console.log(`📦 Тестируем товар: ${productWithVariants.title}`);
    console.log(`   Slug: ${productWithVariants.slug}`);
    console.log(`   Вариаций: ${productWithVariants.variants.length}`);

    // 2. Тестируем API endpoint для получения товара
    console.log('\n🔍 Тестирование API получения товара:');
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const productUrl = `${baseUrl}/api/products/${productWithVariants.slug}`;
    
    try {
      const productResponse = await fetch(productUrl);
      const productData = await productResponse.json();
      
      if (productData.success) {
        console.log('✅ Товар получен успешно');
        console.log(`   Название: ${productData.data.title}`);
        console.log(`   Вариаций: ${productData.data.variants?.length || 0}`);
      } else {
        console.log('❌ Ошибка получения товара:', productData.error);
      }
    } catch (error) {
      console.log('❌ Ошибка запроса:', error);
    }

    // 3. Тестируем API endpoint для получения вариации
    console.log('\n🎨 Тестирование API получения вариации:');
    
    const variants = productWithVariants.variants;
    if (variants.length > 0) {
      const testVariant = variants[0];
      const variantUrl = `${baseUrl}/api/products/${productWithVariants.slug}/variant`;
      
      // Тестируем с цветом
      if (testVariant.color) {
        try {
          const colorUrl = `${variantUrl}?color=${encodeURIComponent(testVariant.color)}`;
          const colorResponse = await fetch(colorUrl);
          const colorData = await colorResponse.json();
          
          if (colorData.success) {
            console.log(`✅ Вариация с цветом "${testVariant.color}" найдена`);
            console.log(`   Цена: ${colorData.data.price} руб.`);
            console.log(`   Склад: ${colorData.data.stock} шт.`);
          } else {
            console.log(`❌ Вариация с цветом "${testVariant.color}" не найдена`);
          }
        } catch (error) {
          console.log('❌ Ошибка запроса вариации по цвету:', error);
        }
      }

      // Тестируем с размером
      if (testVariant.size) {
        try {
          const sizeUrl = `${variantUrl}?size=${encodeURIComponent(testVariant.size)}`;
          const sizeResponse = await fetch(sizeUrl);
          const sizeData = await sizeResponse.json();
          
          if (sizeData.success) {
            console.log(`✅ Вариация с размером "${testVariant.size}" найдена`);
            console.log(`   Цена: ${sizeData.data.price} руб.`);
            console.log(`   Склад: ${sizeData.data.stock} шт.`);
          } else {
            console.log(`❌ Вариация с размером "${testVariant.size}" не найдена`);
          }
        } catch (error) {
          console.log('❌ Ошибка запроса вариации по размеру:', error);
        }
      }

      // Тестируем с цветом и размером
      if (testVariant.color && testVariant.size) {
        try {
          const fullUrl = `${variantUrl}?color=${encodeURIComponent(testVariant.color)}&size=${encodeURIComponent(testVariant.size)}`;
          const fullResponse = await fetch(fullUrl);
          const fullData = await fullResponse.json();
          
          if (fullData.success) {
            console.log(`✅ Вариация с цветом "${testVariant.color}" и размером "${testVariant.size}" найдена`);
            console.log(`   Цена: ${fullData.data.price} руб.`);
            console.log(`   Склад: ${fullData.data.stock} шт.`);
            console.log(`   SKU: ${fullData.data.sku}`);
          } else {
            console.log(`❌ Вариация с цветом "${testVariant.color}" и размером "${testVariant.size}" не найдена`);
          }
        } catch (error) {
          console.log('❌ Ошибка запроса полной вариации:', error);
        }
      }
    }

    // 4. Тестируем несуществующие комбинации
    console.log('\n🚫 Тестирование несуществующих комбинаций:');
    
    try {
      const invalidUrl = `${baseUrl}/api/products/${productWithVariants.slug}/variant?color=НесуществующийЦвет&size=НесуществующийРазмер`;
      const invalidResponse = await fetch(invalidUrl);
      const invalidData = await invalidResponse.json();
      
      if (!invalidData.success) {
        console.log('✅ Несуществующая вариация корректно не найдена');
      } else {
        console.log('❌ Несуществующая вариация неожиданно найдена');
      }
    } catch (error) {
      console.log('❌ Ошибка запроса несуществующей вариации:', error);
    }

    // 5. Статистика по вариациям
    console.log('\n📊 Статистика вариаций:');
    
    const totalVariants = await prisma.productVariant.count();
    const activeVariants = await prisma.productVariant.count({
      where: { isActive: true }
    });
    const variantsWithStock = await prisma.productVariant.count({
      where: { stock: { gt: 0 } }
    });
    const variantsWithColor = await prisma.productVariant.count({
      where: { color: { not: null } }
    });
    const variantsWithSize = await prisma.productVariant.count({
      where: { size: { not: null } }
    });

    console.log(`   Всего вариаций: ${totalVariants}`);
    console.log(`   Активных: ${activeVariants}`);
    console.log(`   В наличии: ${variantsWithStock}`);
    console.log(`   С цветом: ${variantsWithColor}`);
    console.log(`   С размером: ${variantsWithSize}`);

    console.log('\n✅ Тестирование API завершено!');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testVariantsAPI();