/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId');

    if (!tenantId) {
      return NextResponse.json({ error: 'Missing tenantId' }, { status: 400 });
    }

    const orders = await prisma.order.findMany({
      where: { tenantId },
      orderBy: { orderDate: 'asc' },
      select: {
        orderDate: true,
        totalPrice: true,
        orderNumber: true,
      },
    });

    // Group by date
    const ordersByDate = orders.reduce((acc: any, order) => {
      const date = order.orderDate.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, count: 0, revenue: 0 };
      }
      acc[date].count += 1;
      acc[date].revenue += order.totalPrice;
      return acc;
    }, {});

    const chartData = Object.values(ordersByDate);

    return NextResponse.json({ data: chartData });
  } catch (error: any) {
    console.error('Orders by date error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}