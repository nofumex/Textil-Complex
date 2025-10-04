import { NextRequest, NextResponse } from 'next/server';
import { verifyRole } from '@/lib/auth';
import { CSVImporter, validateCSVStructure, generateSampleCSV } from '@/lib/csv-import';

export async function POST(request: NextRequest) {
  try {
    // Verify admin/manager role
    await verifyRole(request, ['ADMIN', 'MANAGER']);

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const validateOnly = formData.get('validateOnly') === 'true';
    const updateExisting = formData.get('updateExisting') === 'true';
    const skipInvalid = formData.get('skipInvalid') === 'true';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Файл не выбран' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { success: false, error: 'Поддерживаются только CSV файлы' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Размер файла не должен превышать 10MB' },
        { status: 400 }
      );
    }

    // Read file content
    const csvContent = await file.text();

    // Validate CSV structure
    const validation = validateCSVStructure(csvContent);
    if (!validation.isValid) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Некорректная структура CSV файла',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Parse category mapping if provided
    let categoryMapping: Record<string, string> = {};
    const mappingData = formData.get('categoryMapping');
    if (mappingData && typeof mappingData === 'string') {
      try {
        categoryMapping = JSON.parse(mappingData);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: 'Некорректное сопоставление категорий' },
          { status: 400 }
        );
      }
    }

    // Import CSV
    const importer = new CSVImporter();
    const result = await importer.importFromCSV(csvContent, {
      validateOnly,
      updateExisting,
      skipInvalid,
      categoryMapping,
    });

    return NextResponse.json({
      success: result.success,
      data: result,
      message: validateOnly 
        ? 'Валидация завершена' 
        : result.success 
          ? 'Импорт завершён успешно' 
          : 'Импорт завершён с ошибками'
    });

  } catch (error) {
    console.error('Import error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Ошибка при импорте данных' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin/manager role
    await verifyRole(request, ['ADMIN', 'MANAGER']);

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'sample') {
      // Generate sample CSV
      const sampleCSV = generateSampleCSV();
      
      return new NextResponse(sampleCSV, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="sample_products.csv"',
        },
      });
    }

    if (action === 'validate') {
      // Return validation info
      return NextResponse.json({
        success: true,
        data: {
          requiredColumns: ['sku', 'title', 'category', 'price', 'stock'],
          optionalColumns: [
            'product_id', 'currency', 'old_price', 'description', 'material',
            'size', 'dimensions', 'weight', 'tags', 'images', 'seo_title',
            'seo_description', 'slug', 'visibility'
          ],
          supportedFormats: ['.csv'],
          maxFileSize: '10MB',
          encoding: 'UTF-8',
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Неизвестное действие' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Import GET error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}


