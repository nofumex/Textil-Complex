import { NextRequest, NextResponse } from 'next/server';
import { verifyRole } from '@/lib/auth';
import { exportProductsToCSV } from '@/lib/csv-import';
import { exportProductsToWXR } from '@/lib/wp-export';
import { productFiltersSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    // Verify admin/manager role
    await verifyRole(request, ['ADMIN', 'MANAGER']);

    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Parse filters
    const filters: any = {};
    
    if (params.category) {
      filters.categoryObj = {
        slug: params.category,
      };
    }

    if (params.isActive !== undefined) {
      filters.isActive = params.isActive === 'true';
    }

    if (params.visibility) {
      filters.visibility = params.visibility;
    }

    if (params.inStock !== undefined) {
      filters.isInStock = params.inStock === 'true';
    }

    if (params.productCategory) {
      filters.category = params.productCategory;
    }

    if (params.dateFrom || params.dateTo) {
      filters.createdAt = {};
      if (params.dateFrom) filters.createdAt.gte = new Date(params.dateFrom);
      if (params.dateTo) filters.createdAt.lte = new Date(params.dateTo);
    }

    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'csv').toLowerCase();
    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'xml') {
      const xml = await exportProductsToWXR(filters);
      const filename = `products_export_${timestamp}.xml`;
      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      });
    }

    const csvContent = await exportProductsToCSV(filters);
    const filename = `products_export_${timestamp}.csv`;
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('Export error:', error);
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return NextResponse.json({ success: false, error: error.message || 'Недостаточно прав' }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: 'Ошибка при экспорте данных' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin/manager role
    await verifyRole(request, ['ADMIN', 'MANAGER']);

    const body = await request.json();
    const { productIds, format = 'csv' } = body;

    // Build filters for selected products
    const filters: any = {};
    
    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      filters.id = {
        in: productIds,
      };
    }

    const timestamp = new Date().toISOString().split('T')[0];
    if (format === 'xml') {
      const xml = await exportProductsToWXR(filters);
      const filename = `selected_products_${timestamp}.xml`;
      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      });
    }

    const csvContent = await exportProductsToCSV(filters);
    const filename = `selected_products_${timestamp}.csv`;
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('Export selected error:', error);
    if (error?.statusCode === 401 || error?.statusCode === 403) {
      return NextResponse.json({ success: false, error: error.message || 'Недостаточно прав' }, { status: error.statusCode });
    }
    return NextResponse.json(
      { success: false, error: 'Ошибка при экспорте выбранных товаров' },
      { status: 500 }
    );
  }
}


