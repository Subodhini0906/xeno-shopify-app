import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 });
    }

    const totalCustomers = await prisma.customer.count({
      where: { tenantId },
    });

    const totalOrders = await prisma.order.count({
      where: { tenantId },
    });

    const orders = await prisma.order.findMany({
      where: { tenantId },
      select: { totalPrice: true },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const totalProducts = await prisma.product.count({
      where: { tenantId },
    });

    return NextResponse.json({
      totalCustomers,
      totalOrders,
      totalRevenue,
      averageOrderValue,
      totalProducts,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}