import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRole } from '@/lib/auth';
import { settingsSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    // Verify admin role
    await verifyRole(request, ['ADMIN']);

    const settings = await db.setting.findMany({
      orderBy: { key: 'asc' },
    });

    // Convert to key-value object
    const settingsObject = settings.reduce((acc, setting) => {
      let value: any = setting.value;
      
      // Parse value based on type
      switch (setting.type) {
        case 'NUMBER':
          value = Number(value);
          break;
        case 'BOOLEAN':
          value = value === 'true';
          break;
        case 'JSON':
          try {
            value = JSON.parse(value);
          } catch {
            value = value;
          }
          break;
        default:
          value = value;
      }
      
      acc[setting.key] = value;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: settingsObject,
    });

  } catch (error) {
    console.error('Get settings error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Ошибка получения настроек' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin role
    await verifyRole(request, ['ADMIN']);

    const body = await request.json();
    
    // Validate settings data
    const validatedData = settingsSchema.parse(body);

    // Update settings
    const updatePromises = Object.entries(validatedData).map(async ([key, value]) => {
      let stringValue: string;
      let type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON' = 'STRING';

      // Determine type and convert to string
      if (typeof value === 'number') {
        stringValue = value.toString();
        type = 'NUMBER';
      } else if (typeof value === 'boolean') {
        stringValue = value.toString();
        type = 'BOOLEAN';
      } else if (typeof value === 'object') {
        stringValue = JSON.stringify(value);
        type = 'JSON';
      } else {
        stringValue = value.toString();
        type = 'STRING';
      }

      return db.setting.upsert({
        where: { key },
        update: { value: stringValue, type },
        create: { key, value: stringValue, type },
      });
    });

    await Promise.all(updatePromises);

    // Get updated settings
    const settings = await db.setting.findMany({
      orderBy: { key: 'asc' },
    });

    const settingsObject = settings.reduce((acc, setting) => {
      let value: any = setting.value;
      
      switch (setting.type) {
        case 'NUMBER':
          value = Number(value);
          break;
        case 'BOOLEAN':
          value = value === 'true';
          break;
        case 'JSON':
          try {
            value = JSON.parse(value);
          } catch {
            value = value;
          }
          break;
        default:
          value = value;
      }
      
      acc[setting.key] = value;
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      data: settingsObject,
      message: 'Настройки обновлены успешно',
    });

  } catch (error) {
    console.error('Update settings error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Некорректные данные настроек' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Ошибка обновления настроек' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin role
    await verifyRole(request, ['ADMIN']);

    const body = await request.json();
    const { key, value, type = 'STRING' } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'Ключ и значение обязательны' },
        { status: 400 }
      );
    }

    // Check if setting already exists
    const existingSetting = await db.setting.findUnique({
      where: { key }
    });

    if (existingSetting) {
      return NextResponse.json(
        { success: false, error: 'Настройка с таким ключом уже существует' },
        { status: 409 }
      );
    }

    // Create setting
    const setting = await db.setting.create({
      data: {
        key,
        value: value.toString(),
        type: type as 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON',
      },
    });

    return NextResponse.json({
      success: true,
      data: setting,
      message: 'Настройка создана успешно',
    }, { status: 201 });

  } catch (error) {
    console.error('Create setting error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Ошибка создания настройки' },
      { status: 500 }
    );
  }
}
