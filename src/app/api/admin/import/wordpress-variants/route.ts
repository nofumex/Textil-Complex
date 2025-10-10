import { NextRequest, NextResponse } from 'next/server';
import { WPVariantsImporter, WPImportOptions } from '@/lib/wp-variants-import';
import { verifyRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyRole(request, ['ADMIN', 'MANAGER']);

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Parse options from form data
    const options: WPImportOptions = {
      defaultCurrency: formData.get('defaultCurrency') as string || 'RUB',
      updateExisting: formData.get('updateExisting') === 'true',
      skipInvalid: formData.get('skipInvalid') === 'true',
      autoCreateCategories: formData.get('autoCreateCategories') === 'true',
      createAllVariants: formData.get('createAllVariants') === 'true',
    };

    // Parse category mapping if provided
    const categoryMappingStr = formData.get('categoryMapping') as string;
    if (categoryMappingStr) {
      try {
        options.categoryMapping = JSON.parse(categoryMappingStr);
      } catch (e) {
        return NextResponse.json(
          { success: false, error: 'Invalid category mapping JSON' },
          { status: 400 }
        );
      }
    }

    const importer = new WPVariantsImporter();
    const xmlContents: string[] = [];

    // Read all XML files
    for (const file of files) {
      if (file.type !== 'text/xml' && file.type !== 'application/xml' && !file.name.endsWith('.xml')) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.name}. Expected XML file.` },
          { status: 400 }
        );
      }

      const content = await file.text();
      xmlContents.push(content);
    }

    // Import products with variants
    const result = await importer.importFromXML(xmlContents, options);

    return NextResponse.json({
      success: result.success,
      data: {
        processed: result.processed,
        created: result.created,
        updated: result.updated,
        variantsCreated: result.variantsCreated,
        errors: result.errors,
        warnings: result.warnings,
      },
      message: `Импорт завершен. Обработано: ${result.processed}, создано: ${result.created}, обновлено: ${result.updated}, вариаций создано: ${result.variantsCreated}`,
    });

  } catch (error: any) {
    console.error('Import error:', error);
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return NextResponse.json(
        { success: false, error: error.message || 'Unauthorized' },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'WordPress variants import endpoint',
    usage: {
      method: 'POST',
      contentType: 'multipart/form-data',
      fields: {
        files: 'XML file(s) to import (required)',
        defaultCurrency: 'Default currency (default: RUB)',
        updateExisting: 'Update existing products (default: false)',
        skipInvalid: 'Skip invalid products (default: false)',
        autoCreateCategories: 'Auto-create categories (default: true)',
        createAllVariants: 'Create all variant combinations (default: true)',
        categoryMapping: 'JSON mapping of category names to IDs (optional)',
      },
    },
  });
}
