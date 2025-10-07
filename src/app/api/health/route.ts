import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: NextRequest) {
  try {
    const settings = await db.setting.findMany({ orderBy: { key: 'asc' } });

    const raw = settings.reduce((acc, s) => {
      let v: any = s.value;
      if (s.type === 'NUMBER') v = Number(v);
      else if (s.type === 'BOOLEAN') v = v === 'true';
      else if (s.type === 'JSON') {
        try { v = JSON.parse(v); } catch {}
      }
      acc[s.key] = v;
      return acc;
    }, {} as Record<string, any>);

    const normalized = {
      contactEmail: raw.contactEmail || raw.contact_email || '',
      contactPhone: raw.contactPhone || raw.contact_phone || '',
      address: raw.address || '',
      socialLinks: Array.isArray(raw.socialLinks) ? raw.socialLinks : [],
      extraContacts: Array.isArray(raw.extraContacts) ? raw.extraContacts : [],
    };

    return NextResponse.json({ success: true, data: normalized });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Ошибка получения настроек' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}


