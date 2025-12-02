/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const shop = searchParams.get('shop');
    const state = searchParams.get('state');

    if (!code || !shop) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      `https://${shop}/admin/oauth/access_token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.SHOPIFY_API_KEY,
          client_secret: process.env.SHOPIFY_API_SECRET,
          code: code,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('No access token received');
    }

    // Save tenant to database
    const tenant = await prisma.tenant.upsert({
      where: { shopifyDomain: shop },
      update: {
        shopifyToken: accessToken,
        updatedAt: new Date(),
      },
      create: {
        shopifyDomain: shop,
        shopifyToken: accessToken,
        storeName: shop.replace('.myshopify.com', ''),
        email: `admin@${shop}`,
      },
    });

    console.log('✅ Tenant saved:', tenant.shopifyDomain);

    // Redirect to dashboard with tenant ID
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('tenantId', tenant.id);
    
    return NextResponse.redirect(dashboardUrl);
  } catch (error: any) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      {
        error: 'Authentication failed',
        details: error.message,
      },
      { status: 500 }
    );
  }
}