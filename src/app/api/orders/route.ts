import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { verifyAuth, verifyRole } from '@/lib/auth';
import { checkoutSchema, orderFiltersSchema } from '@/lib/validations';
import { generateOrderNumber } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const {
      page,
      limit,
      status,
      dateFrom,
      dateTo,
      userId,
      search,
    } = orderFiltersSchema.parse(params);

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // If not admin/manager, only show user's own orders
    if (payload.role !== 'ADMIN' && payload.role !== 'MANAGER') {
      where.userId = payload.userId;
    } else if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    if (search) {
      where.OR = [
        {
          orderNumber: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          firstName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Get orders
    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
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
          address: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    const pages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages,
      },
    });

  } catch (error) {
    console.error('Get orders error:', error);
    
    return NextResponse.json(
      { success: false, error: 'Ошибка получения заказов' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await verifyAuth(request);
    const body = await request.json();
    
    const validatedData = checkoutSchema.parse(body);
    const items = body?.items;
    const {
      firstName,
      lastName,
      company,
      phone,
      email,
      notes,
      deliveryType,
      addressId,
      promoCode,
    } = validatedData;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Корзина пуста' },
        { status: 400 }
      );
    }

    // Validate items shape
    for (const item of items) {
      if (!item?.productId || typeof item.productId !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Некорректный формат товаров в корзине' },
          { status: 400 }
        );
      }
      if (!Number.isInteger(item?.quantity) || item.quantity <= 0) {
        return NextResponse.json(
          { success: false, error: 'Количество товара должно быть больше 0' },
          { status: 400 }
        );
      }
    }

    // Ensure user exists
    const user = await db.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Пользователь не найден' },
        { status: 401 }
      );
    }

    // If addressId provided, ensure it belongs to user
    if (addressId) {
      const address = await db.address.findFirst({ where: { id: addressId, userId: user.id } });
      if (!address) {
        return NextResponse.json(
          { success: false, error: 'Адрес доставки не найден' },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.isActive || !product.isInStock) {
        return NextResponse.json(
          { success: false, error: `Товар ${product?.title || item.productId} недоступен` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { success: false, error: `Недостаточно товара ${product.title} на складе` },
          { status: 400 }
        );
      }

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: Number(product.price),
        total: itemTotal,
      });
    }

    // Apply promo code (simplified)
    let discount = 0;
    if (promoCode) {
      // Add promo code logic here
    }

    // Calculate delivery (simplified)
    let delivery = 0;
    if (deliveryType === 'COURIER') {
      delivery = subtotal >= 3000 ? 0 : 500; // Free delivery over 3000 RUB
    } else if (deliveryType === 'TRANSPORT') {
      delivery = 1000; // Fixed transport price
    }

    const total = subtotal + delivery - discount;

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Create order with retry on order number collision
    let order: any = null;
    let attempts = 0;
    let currentOrderNumber = orderNumber;
    while (!order && attempts < 3) {
      try {
        order = await db.order.create({
          data: {
            orderNumber: currentOrderNumber,
            userId: payload.userId,
            status: 'NEW',
            total,
            subtotal,
            delivery,
            discount,
            firstName,
            lastName,
            company,
            phone,
            email,
            notes,
            deliveryType,
            addressId,
            promoCode,
            items: {
              create: orderItems,
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: true,
            address: true,
          },
        });
      } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002' && (e.meta as any)?.target?.includes('orderNumber')) {
          // Regenerate order number and retry
          currentOrderNumber = generateOrderNumber();
          attempts += 1;
          continue;
        }
        throw e;
      }
    }

    // Update product stock
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Create order log
    await db.orderLog.create({
      data: {
        orderId: order.id,
        status: 'NEW',
        comment: 'Заказ создан',
        createdBy: payload?.userId || null,
      },
    });

    // TODO: Send email notification

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Заказ создан успешно',
    }, { status: 201 });

  } catch (error) {
    console.error('Create order error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Некорректные данные' },
        { status: 400 }
      );
    }

    if ((error as any)?.statusCode === 401 || (error as any)?.name === 'AuthError') {
      return NextResponse.json(
        { success: false, error: 'Авторизуйтесь для оформления заказа' },
        { status: 401 }
      );
    }

    // Prisma known errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'Конфликт уникальности данных заказа' },
          { status: 409 }
        );
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { success: false, error: 'Нарушение внешнего ключа. Проверьте адрес/товары' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Ошибка базы данных при создании заказа' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: false, error: 'Ошибка создания заказа' }, { status: 500 });
  }
}


