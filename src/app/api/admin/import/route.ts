import { NextRequest, NextResponse } from 'next/server';
import { verifyRole } from '@/lib/auth';
import { CSVImporter, validateCSVStructure, generateSampleCSV } from '@/lib/csv-import';
import { WPXMLImporter } from '@/lib/wp-import';

export async function POST(request: NextRequest) {
  try {
    // Verify admin/manager role
    await verifyRole(request, ['ADMIN', 'MANAGER']);

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const validateOnly = formData.get('validateOnly') === 'true';
    const updateExisting = formData.get('updateExisting') === 'true';
    const skipInvalid = formData.get('skipInvalid') === 'true';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Файл не выбран' },
        { status: 400 }
      );
    }

    // Check file type
    const first = files[0];
    const isCSV = first.name.toLowerCase().endsWith('.csv');
    const isXML = first.name.toLowerCase().endsWith('.xml');
    if (!isCSV && !isXML) {
      return NextResponse.json(
        { success: false, error: 'Поддерживаются только CSV или XML (WordPress WXR) файлы' },
        { status: 400 }
      );
    }

    // Check file size (max 10MB)
    const totalSize = files.reduce((s, f) => s + f.size, 0);
    if (totalSize > 20 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'Суммарный размер файлов не должен превышать 20MB' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContents = await Promise.all(files.map(f => f.text()));

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

    let result;
    if (isCSV) {
      // Validate CSV structure
      const validation = validateCSVStructure(fileContents[0]);
      if (!validation.isValid) {
        return NextResponse.json(
          { success: false, error: 'Некорректная структура CSV файла', details: validation.errors },
          { status: 400 }
        );
      }

      const importer = new CSVImporter();
      result = await importer.importFromCSV(fileContents[0], {
        validateOnly,
        updateExisting,
        skipInvalid,
        categoryMapping,
      });
    } else {
      const importer = new WPXMLImporter();
      result = await importer.importFromXML(fileContents, {
        updateExisting,
        skipInvalid,
        categoryMapping,
        autoCreateCategories: true,
      });
    }

    return NextResponse.json({
      success: result.success,
      data: result,
      message: validateOnly 
        ? 'Валидация завершена' 
        : result.success 
          ? 'Импорт завершён успешно' 
          : 'Импорт завершён с ошибками'
    });

  } catch (error: any) {
    console.error('Import error:', error);
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return NextResponse.json({ success: false, error: error.message || 'Недостаточно прав' }, { status: error.statusCode });
    }
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

  } catch (error: any) {
    console.error('Import GET error:', error);
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return NextResponse.json({ success: false, error: error.message || 'Недостаточно прав' }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}


