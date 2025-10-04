import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyRole } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin/manager role
    await verifyRole(request, ['ADMIN', 'MANAGER']);

    const user = await db.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        role: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
        addresses: true,
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    title: true,
                    sku: true,
                    images: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        reviews: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            addresses: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Ошибка получения пользователя' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin role
    await verifyRole(request, ['ADMIN']);

    const body = await request.json();
    
    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Check if email is being changed and if it's already taken
    if (body.email && body.email !== existingUser.email) {
      const emailTaken = await db.user.findUnique({
        where: { email: body.email.toLowerCase() }
      });

      if (emailTaken) {
        return NextResponse.json(
          { success: false, error: 'Пользователь с таким email уже существует' },
          { status: 409 }
        );
      }
    }

    // Update user
    const user = await db.user.update({
      where: { id: params.id },
      data: {
        ...body,
        email: body.email ? body.email.toLowerCase() : undefined,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        role: true,
        isBlocked: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: 'Пользователь обновлён успешно',
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Ошибка обновления пользователя' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin role
    await verifyRole(request, ['ADMIN']);

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { id: params.id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    // Don't allow deleting admin users
    if (existingUser.role === 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Нельзя удалить администратора' },
        { status: 403 }
      );
    }

    // Delete user (cascade will handle related records)
    await db.user.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Пользователь удалён успешно',
    });

  } catch (error) {
    console.error('Delete user error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Ошибка удаления пользователя' },
      { status: 500 }
    );
  }
}
