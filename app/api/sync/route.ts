import { NextRequest, NextResponse } from 'next/server';
import { syncShopifyData } from '@/lib/shopify-sync';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { tenantId } = await request.json();

    if (!tenantId) {
      // Sync all tenants
      const tenants = await prisma.tenant.findMany();
      
      for (const tenant of tenants) {
        await syncShopifyData(tenant.id);
      }

      return NextResponse.json({ 
        success: true, 
        message: `Synced ${tenants.length} tenants` 
      });
    }

    await syncShopifyData(tenantId);

    return NextResponse.json({ success: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}