import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { leadSchema, paginationSchema } from '@/lib/validations';
import { verifyRole } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = leadSchema.parse(body);

    const lead = await db.lead.create({
      data: {
        name: validated.name,
        phone: validated.phone,
        email: validated.email,
        company: validated.company,
        message: validated.message,
        source: validated.source || 'website',
      },
    });

    return NextResponse.json({ success: true, data: lead }, { status: 201 });
  } catch (error: any) {
    const message = error?.message || 'Ошибка создания заявки';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    await verifyRole(request, ['ADMIN', 'MANAGER']);

    const { searchParams } = new URL(request.url);
    const { page, limit } = paginationSchema.parse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    });
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      db.lead.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.lead.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Ошибка получения заявок' }, { status: 500 });
  }
}



